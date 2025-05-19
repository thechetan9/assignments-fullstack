import React, { useRef, useEffect, useState } from 'react';
import { useConversation } from '../context/ConversationContext';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC = () => {
  const { conversation, loading, sendMessage } = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check server connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/test-gemini');
        if (!response.ok) {
          const errorData = await response.json();
          setConnectionError(`Server error: ${errorData.error || response.statusText}`);
        } else {
          setConnectionError(null);
        }
      } catch (error) {
        setConnectionError('Cannot connect to server. Please make sure the server is running on port 3001.');
      }
    };
    
    checkConnection();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation.messages]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {connectionError ? (
          <div className="error-message">
            <p>{connectionError}</p>
            <p>Please check your server connection and refresh the page.</p>
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome to the candidate chatbot!</p>
            <p>Type a message below to start the conversation.</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} disabled={loading || !!connectionError} />
    </div>
  );
};

export default ChatWindow;
