import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useConversation } from '../context/ConversationContext';

const ChatWindow: React.FC = (): React.ReactElement => {
  const { conversation, loading, sendMessage } = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {conversation?.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={sendMessage} disabled={loading} />
    </div>
  );
};

export default ChatWindow;
