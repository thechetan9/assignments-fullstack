import React, { useRef, useEffect } from 'react';
import { useConversation } from '../context/ConversationContext';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const ChatWindow: React.FC = () => {
  const { conversation, loading, sendMessage } = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {conversation.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} disabled={loading} />
    </div>
  );
};

export default ChatWindow;
