import React, { useState } from 'react';
interface ChatInputProps {
  onSendMessage: (message: string) => void;  disabled?: boolean;
}
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {  const [message, setMessage] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();    if (message.trim() && !disabled) {
      onSendMessage(message);      setMessage('');
    }  };
  return (
    <form onSubmit={handleSubmit} className="chat-input">      <input
        type="text"        value={message}
        onChange={(e) => setMessage(e.target.value)}        placeholder="Type your message here..."
        disabled={disabled}      />
      <button type="submit" disabled={disabled || !message.trim()}>        Send
      </button>    </form>
  );};

export default ChatInput;


















