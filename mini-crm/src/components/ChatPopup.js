import React, { useState, useEffect, useRef } from 'react';

const ChatPopup = ({ lead, onClose }) => {
    const [isLlmMode, setIsLlmMode] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);

    // Set initial message based on the mode
    useEffect(() => {
        const initialMessage = isLlmMode
            ? `Hello! I am your advanced AI assistant. I can provide detailed summaries, suggest outreach strategies, or even draft an email for ${lead.name}. How can I help?`
            : `Hello! I'm your CRM assistant. You can ask me about lead details or request a follow-up suggestion for ${lead.name}.`;
        setMessages([{ sender: 'bot', text: initialMessage }]);
    }, [isLlmMode, lead.name]);

    // Auto-scroll to the bottom when new messages are added
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

        // Simulate bot response
        setTimeout(() => {
            let botResponse = '';
            const query = userMessage.toLowerCase();

            if (isLlmMode) {
                // LLM-like responses
                if (query.includes('detail') || query.includes('summary')) {
                    botResponse = `Of course. Here is a summary for ${lead.name}:\n\n- **Contact:** ${lead.email}, ${lead.phone}\n- **Status:** ${lead.status}\n- **Source:** ${lead.source}\n\nWould you like a suggestion for the next step?`;
                } else if (query.includes('follow') || query.includes('suggestion') || query.includes('strategy')) {
                    botResponse = `Based on the fact that ${lead.name}'s status is '${lead.status}', here is a suggested outreach strategy:\n\n**Action:** Send a follow-up email.\n**Tone:** Professional yet friendly.\n**Key Message:** Reiterate your value proposition and ask if they have any questions. I can help you draft this email.`;
                } else if (query.includes('draft') || query.includes('email')) {
                    botResponse = `Certainly. Here is a draft email to ${lead.name}:\n\n**Subject: Following Up**\n\nHi ${lead.name},\n\nI hope you're having a great week. I wanted to follow up on our recent interaction and see if you had any questions about our services.\n\nBest regards,\n\n[Your Name]`;
                } else {
                    botResponse = "I can provide detailed summaries, suggest outreach strategies, or draft emails. Please let me know how I can assist you.";
                }
            } else {
                // Original simulated responses
                if (query.includes('detail')) {
                    botResponse = `Here are the details for ${lead.name}: Email is ${lead.email}, Phone is ${lead.phone}, and current status is ${lead.status}.`;
                } else if (query.includes('follow') || query.includes('suggestion')) {
                    botResponse = lead.status === 'New'
                        ? `Suggestion: Send a personalized welcome email to ${lead.email}.`
                        : `Suggestion: Follow up with ${lead.name} at ${lead.email}.`;
                } else {
                    botResponse = "I can help with lead details or follow-up suggestions. What would you like to know?";
                }
            }
            
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        }, 1200);
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