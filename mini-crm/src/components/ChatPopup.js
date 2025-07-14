import React, { useState, useEffect, useRef } from 'react';
import groqClient from '../api/groqClient';

const ChatPopup = ({ lead, onClose }) => {
    const [isLlmMode, setIsLlmMode] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    
    useEffect(() => {
        const initialMessage = isLlmMode
            ? `Hello! I am your advanced AI assistant. I can provide detailed summaries, suggest outreach strategies, or even draft an email for ${lead.name}. How can I help?`
            : `Hello! I'm your CRM assistant. You can ask me about lead details or request a follow-up suggestion for ${lead.name}.`;
        setMessages([{ sender: 'bot', text: initialMessage }]);
    }, [isLlmMode, lead.name]);

    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInputValue('');
        setIsTyping(true);

        let botResponse = '';
        const query = userMessage.toLowerCase();

        if (isLlmMode) {
            let systemMessage = `You are a helpful CRM assistant. Your responses should be concise and directly answer the user's query based on the provided lead information.
Current lead details: Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}.`;
            
            if (query.includes('follow-up') || query.includes('follow up')) {
                systemMessage += ` The user is asking for a follow-up suggestion. Respond with "Email ${lead.name} at ${lead.email}."`;
            } else if (query.includes('lead details') || query.includes('details')) {
                systemMessage += ` The user is asking for lead details. Respond with "Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}."`;
            } else {
                systemMessage += ` The user's query is not directly about follow-up or lead details. Respond with a generic message: "Ask about follow-up or details."`;
            }

            const chatHistoryForGroq = [
                { role: 'system', content: systemMessage },
                ...messages.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                })),
                { role: 'user', content: userMessage }
            ];

            try {
                botResponse = await groqClient.getChatCompletion(chatHistoryForGroq);
            } catch (error) {
                botResponse = "I'm sorry, I couldn't connect to the AI. Please check your API key or try again later.";
            }
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);

        } else {
            
            if (query.includes('follow-up') || query.includes('follow up')) {
                botResponse = `Email ${lead.name} at ${lead.email}.`;
            } else if (query.includes('lead details') || query.includes('details')) {
                botResponse = `Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}.`;
            } else {
                botResponse = "Ask about follow-up or details.";
            }
            
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
            }, 1200);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[90vh] max-h-[700px] flex flex-col font-sans">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Chat with Assistant</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Simulated</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isLlmMode} onChange={() => setIsLlmMode(!isLlmMode)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <span className="text-sm text-gray-500">LLM</span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <i className="fa fa-times fa-lg"></i>
                        </button>
                    </div>
                </div>
                
                <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            <div className={`rounded-lg p-3 max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex items-start">
                            <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                        <button onClick={handleSendMessage} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <i className="fa fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
