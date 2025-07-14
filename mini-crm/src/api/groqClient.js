import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true, 
});

const groqClient = {
    getChatCompletion: async (messages) => {
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: 'llama3-8b-8192',
            });
            return chatCompletion.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Error calling Groq API:", error);
            return "I'm sorry, I'm having trouble connecting to the AI. Please try again later.";
        }
    },
};

export default groqClient;
