import { useState, useEffect } from 'react';
import MistralAssistant from './MistralAssistant';
import './Chatbot.css';

const RobotIcon = () => (
  <svg className="chatbot-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#00bfff"/>
    <path d="M7 8.5C7 7.11929 8.11929 6 9.5 6H14.5C15.8807 6 17 7.11929 17 8.5V13.5C17 14.8807 15.8807 16 14.5 16H12.5L10 18.5V16H9.5C8.11929 16 7 14.8807 7 13.5V8.5Z" 
      fill="white"/>
    <path d="M10 11C10 11.5523 9.55228 12 9 12C8.44772 12 8 11.5523 8 11C8 10.4477 8.44772 10 9 10C9.55228 10 10 10.4477 10 11Z" 
      fill="#00bfff"/>
    <path d="M16 11C16 11.5523 15.5523 12 15 12C14.4477 12 14 11.5523 14 11C14 10.4477 14.4477 10 15 10C15.5523 10 16 10.4477 16 11Z" 
      fill="#00bfff"/>
    <path d="M9.5 13.5H14.5C14.5 14.5 13.3807 15.5 12 15.5C10.6193 15.5 9.5 14.5 9.5 13.5Z" 
      fill="#00bfff"/>
  </svg>
);

const SmallRobotIcon = () => (
  <svg className="chatbot-icon small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#00bfff"/>
    <path d="M7 8.5C7 7.11929 8.11929 6 9.5 6H14.5C15.8807 6 17 7.11929 17 8.5V13.5C17 14.8807 15.8807 16 14.5 16H12.5L10 18.5V16H9.5C8.11929 16 7 14.8807 7 13.5V8.5Z" 
      fill="white"/>
    <path d="M10 11C10 11.5523 9.55228 12 9 12C8.44772 12 8 11.5523 8 11C8 10.4477 8.44772 10 9 10C9.55228 10 10 10.4477 10 11Z" 
      fill="#00bfff"/>
    <path d="M16 11C16 11.5523 15.5523 12 15 12C14.4477 12 14 11.5523 14 11C14 10.4477 14.4477 10 15 10C15.5523 10 16 10.4477 16 11Z" 
      fill="#00bfff"/>
    <path d="M9.5 13.5H14.5C14.5 14.5 13.3807 15.5 12 15.5C10.6193 15.5 9.5 14.5 9.5 13.5Z" 
      fill="#00bfff"/>
  </svg>
);

const WelcomeRobotIcon = () => (
  <svg className="chatbot-welcome-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#00bfff"/>
    <path d="M7 8.5C7 7.11929 8.11929 6 9.5 6H14.5C15.8807 6 17 7.11929 17 8.5V13.5C17 14.8807 15.8807 16 14.5 16H12.5L10 18.5V16H9.5C8.11929 16 7 14.8807 7 13.5V8.5Z" 
      fill="white"/>
    <path d="M10 11C10 11.5523 9.55228 12 9 12C8.44772 12 8 11.5523 8 11C8 10.4477 8.44772 10 9 10C9.55228 10 10 10.4477 10 11Z" 
      fill="#00bfff"/>
    <path d="M16 11C16 11.5523 15.5523 12 15 12C14.4477 12 14 11.5523 14 11C14 10.4477 14.4477 10 15 10C15.5523 10 16 10.4477 16 11Z" 
      fill="#00bfff"/>
    <path d="M9.5 13.5H14.5C14.5 14.5 13.3807 15.5 12 15.5C10.6193 15.5 9.5 14.5 9.5 13.5Z" 
      fill="#00bfff"/>
  </svg>
);

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const assistant = new MistralAssistant();

  useEffect(() => {
    console.log("Mistral AI API Key Status:", 
      process.env.REACT_APP_MISTRAL_API_KEY ? "Loaded" : "Missing"
    );
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    const userMessage = { role: 'user', content: input };
    
    try {
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      console.log("Starting chat stream with input:", input);
      const responseStream = assistant.chatStream(input, messages);
      let fullResponse = '';
      
      setMessages(prev => [...prev, { role: 'model', content: '...' }]);
      
      for await (const chunk of responseStream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'model', 
            content: fullResponse 
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-toggle" onClick={toggleChat}>
        <RobotIcon />
      </div>

      {isChatOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3 className="chatbot-title">
              <SmallRobotIcon />
              Footy Insights Chatbot
            </h3>
            <button className="chatbot-close" onClick={toggleChat}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-welcome">
                <WelcomeRobotIcon />
                <div className="chatbot-welcome-text">Hello! How can I help you today?</div>
                <div className="chatbot-welcome-subtext">Ask me anything about football matches, teams, or players.</div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`chatbot-message ${msg.role === 'user' ? 'user' : 
                            msg.role === 'error' ? 'error' : 'bot'}`}
                >
                  <div className="chatbot-message-role">
                    {msg.role === 'user' ? 'You' : 
                     msg.role === 'error' ? 'Error' : 'Chatbot'}
                  </div>
                  <div className="chatbot-message-content">
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="chatbot-input-container">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                disabled={isLoading}
                className="chatbot-input"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="chatbot-send"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 