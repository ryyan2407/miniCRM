import os
import gc
import json
from datetime import datetime
from typing import List, Dict, Any
from io import BytesIO
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
import torch
from transformers import AutoProcessor, BitsAndBytesConfig, Qwen2VLForConditionalGeneration
from PIL import Image
import fitz  # PyMuPDF
from groq import Groq

load_dotenv()
class OlmOCRProcessor:
    def __init__(self, force_gpu=True):
        print("Initializing OlmOCRProcessor...")
        if not torch.cuda.is_available() and force_gpu:
            raise RuntimeError("CUDA is not available but GPU was requested.")

        print("Loading Qwen2-VL processor...")
        self.processor = AutoProcessor.from_pretrained("Qwen/Qwen2-VL-7B-Instruct", trust_remote_code=True)

        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
        gpu_memory_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"Total GPU Memory: {gpu_memory_gb:.1f} GB")

        quantization_config = None
        if gpu_memory_gb >= 15:
            print("High memory GPU detected. Using 4-bit quantization.")
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16,
                bnb_4bit_use_double_quant=True, bnb_4bit_quant_type="nf4"
            )
        else:
            print("Standard memory GPU detected. Using 8-bit quantization.")
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)

        print("Loading olmOCR model...")
        
        hf_token = os.environ.get("HF_TOKEN")
        if not hf_token:
            raise ValueError("HF_TOKEN environment variable not set!")

        self.model = Qwen2VLForConditionalGeneration.from_pretrained(
            "allenai/olmOCR-7B-0225-preview",
            quantization_config=quantization_config,
            torch_dtype=torch.bfloat16, device_map="auto",
            trust_remote_code=True, token=hf_token
        ).eval()
        print("Model loaded successfully!")

    def pdf_to_images(self, pdf_bytes: bytes) -> List[Image.Image]:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        images = []
        for page in doc:
            pix = page.get_pixmap(dpi=200)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            images.append(img)
        doc.close()
        return images

    def extract_text_from_single_image(self, image: Image.Image) -> str:
        prompt = "Extract all text from this document section. Include all business cards and contact information."
        messages = [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image", "image": image}]}]
        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = self.processor(text=[text], images=[image], padding=True, return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            outputs = self.model.generate(**inputs, max_new_tokens=2048, do_sample=False)
        response = self.processor.decode(outputs[0], skip_special_tokens=True)
        try:
            answer_start_index = response.rfind("assistant\n") + len("assistant\n")
            return response[answer_start_index:].strip()
        except:
            return response

    def parse_leads_from_text(self, text: str) -> List[Dict[str, Any]]:
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            print("GROQ_API_KEY not found. Skipping lead parsing.")
            return []
            
        client = Groq(api_key=groq_api_key)
        system_prompt = "You are an expert at extracting contact information. Parse the text and extract ALL contacts. Return a valid JSON object where the key is 'contacts' and the value is a list of objects. Each object must have 'name', 'email', and 'phone'. Use null if a field is missing. Return ONLY the JSON object."
        user_prompt = f"Extract all contact information from this text:\n\n{text}"
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                model="llama3-8b-8192", temperature=0.0, response_format={"type": "json_object"}
            )
            data = json.loads(chat_completion.choices[0].message.content)
            for key, value in data.items():
                if isinstance(value, list):
                    print(f"Successfully parsed {len(value)} potential leads using Groq.")
                    return value
            return []
        except Exception as e:
            print(f"🔥 Groq API or parsing failed: {e}. Falling back.")
            return []

    def process_document(self, file_path: str, file_bytes: bytes) -> Dict[str, Any]:
        all_leads_raw = []
        if file_path.lower().endswith('.pdf'):
            images = self.pdf_to_images(file_bytes)
            for i, image in enumerate(images):
                print(f"Processing PDF page {i + 1}/{len(images)}...")
                page_text = self.extract_text_from_single_image(image)
                if page_text:
                    all_leads_raw.extend(self.parse_leads_from_text(page_text))
        else:
            image = Image.open(BytesIO(file_bytes)).convert("RGB")
            extracted_text = self.extract_text_from_single_image(image)
            if extracted_text:
                all_leads_raw = self.parse_leads_from_text(extracted_text)
        
        print(f"Found {len(all_leads_raw)} raw leads. Filtering for valid emails...")
        filtered_leads = [lead for lead in all_leads_raw if lead.get("email")]
        print(f"Kept {len(filtered_leads)} leads after filtering.")
        return {'leads_found': len(filtered_leads), 'leads': filtered_leads, 'processed_at': datetime.now().isoformat()}
model_store = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Server starting up...")
    print("Instantiating OlmOCRProcessor...")
    model_store["ocr_processor"] = OlmOCRProcessor(force_gpu=True)
    print("OCR Processor is ready and waiting for requests.")
    yield
    print("Server shutting down...")
    model_store.clear()
    if torch.cuda.is_available(): torch.cuda.empty_cache()
    gc.collect()

app = FastAPI(lifespan=lifespan)
API_KEY = os.environ.get("CRM_API_KEY", "my_super_secret_crm_key_12345")
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(key: str = Depends(api_key_header)):
    if key != API_KEY: raise HTTPException(status_code=403, detail="Invalid API Key")
    return key

allowed_origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.post("/api/extract-leads")
async def extract_leads_from_document(file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
    ocr_processor = model_store.get("ocr_processor")
    if not ocr_processor: raise HTTPException(status_code=503, detail="OCR Processor not initialized.")
    try:
        file_bytes = await file.read()
        print(f"Processing uploaded file: {file.filename}")
        result = ocr_processor.process_document(file.filename, file_bytes)
        return result
    except Exception as e:
        print(f"An error occurred during document processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        gc.collect()
        if torch.cuda.is_available(): torch.cuda.empty_cache()

@app.get("/")
def read_root():
    return {"status": "CRM Backend is running!"}

if __name__ == "__main__":
    print("="*50)
    print(f"Your CRM API Key is set to: {API_KEY}")
    print("="*50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
