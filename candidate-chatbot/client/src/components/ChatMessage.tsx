import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  
  return (
    <div className={`message ${isBot ? 'bot' : 'user'}`}>
      <div className="message-avatar">
        {isBot ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <p>{message.content}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
};
    
export default ChatMessage;
