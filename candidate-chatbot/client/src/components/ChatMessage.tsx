import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }): React.ReactElement => {
  const isBot = message.role === 'assistant';
  
  return (
    <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
      <div className="message-avatar">
        {isBot ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <p>{message.content}</p>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
    
export default ChatMessage;
