import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '' || disabled) return;
    
    await onSendMessage(message);
    setMessage('');
  };

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        disabled={disabled}
        aria-label="Message input"
      />
      <button 
        type="submit" 
        disabled={disabled || message.trim() === ''}
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;


















