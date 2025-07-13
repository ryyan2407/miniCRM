# miniCRM

miniCRM is a simplified Customer Relationship Management (CRM) application designed to manage leads and automate workflows.

## Features
*   **AI-Powered Lead Extraction:** Upload a PDF or image, and the backend's OCR model will automatically read, parse, and extract lead information (name, email, phone).
*   **Lead Management:** Add, delete, and update lead information.
*   **Document Uploader:** Import leads from documents.
*   **Chat Popup:** Interact with a simulated CRM assistant.
*   **Workflow Designer:**
    *   Visually design workflows with "Lead Created" triggers and "Send Email" or "Update Status" actions.
    *   Add up to three nodes.
    *   Connect nodes via clicks.
    *   Visual simulation of workflow execution with highlighting nodes and edges.
    *   Toast notifications for workflow actions.


---

## Prerequisites

Before you begin, ensure you have the following:

-   **Node.js & npm:** [https://nodejs.org/](https://nodejs.org/) (LTS version recommended).
-   **Python 3.11+** and `pip`.
-   **Git** for cloning the repository.
-   **Hugging Face Account:** A free account to get an access token for the OCR model.
-   **Groq API Account:** A free account to get an API key for fast text parsing.
-   **Rented GPU Server:** Access to a server with an NVIDIA GPU (e.g., T4, A10G) and a public IP address.

---

## Setup & Installation

Follow these steps to get the entire application running.

### 1. Backend Setup (on your Rented GPU Server)

First, set up the Python backend on your remote server.

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd <repository_name>
    ```

2.  **Create a Project Directory & Navigate:**
    ```bash
    mkdir crm-backend
    cd crm-backend
    # (Move the backend-specific files like main.py here)
    ```

3.  **Create a Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

4.  **Install Dependencies:**
    Create a `requirements.txt` file and run:
    ```bash
    pip install -r requirements.txt
    ```

5.  **Configure Environment Variables:**
    Create a file named `.env` in the `crm-backend` directory. **Do not commit this file to Git.**
    ```env
    # .env

    # Your Hugging Face token with read access
    HF_TOKEN="hf_..."

    # Your Groq API key
    GROQ_API_KEY="gsk_..."

    # A secret key for your own API (can be anything you want)
    CRM_API_KEY="my_super_secret_crm_key_12345"
    ```

6.  **Open Firewall Port:** In your cloud provider's dashboard, **allow incoming TCP traffic on port 8000** for your server. This step is crucial.

### 2. Frontend Setup (on your Local Machine)

Now, set up the React frontend on your local computer.

1.  **Navigate to the Frontend Directory:**
    From the root of the cloned repository, navigate to the frontend folder.
    ```bash
    cd mini-crm # Or whatever your frontend folder is named
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the root of your `mini-crm` (frontend) directory.
    ```env
    # .env

    # The public IP of your GPU server, with the port
    REACT_APP_API_BASE_URL=http://<YOUR_SERVER_PUBLIC_IP>:8000

    # This MUST match the CRM_API_KEY on your backend
    REACT_APP_API_KEY="my_super_secret_crm_key_12345"
    ```

---

## Running the Full Application

You must start the backend first.

### 1. Start the Backend Server

On your **rented GPU server**, inside the `crm-backend` directory (with the virtual environment activated):

```bash
python main.py
```

The server will start, load the ML model into memory, and begin listening for requests on port 8000. It will run continuously until you stop it with `Ctrl+C`.

### 2. Start the Frontend Application

On your **local machine**, inside the `mini-crm` directory:

```bash
npm start
```

The application will open in your browser, typically at `http://localhost:3000`. It is now connected to your live backend and ready to use.
