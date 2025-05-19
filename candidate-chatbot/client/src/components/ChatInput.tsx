import React, { useState } from 'react';
import { useConversation } from '../context/ConversationContext';

interface ChatInputProps {
  disabled?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
}

const ChatInput: React.FC<ChatInputProps> = ({ disabled = false, onSendMessage }) => {
  const [input, setInput] = useState('');
  const { sendMessage: contextSendMessage, loading } = useConversation();
  
  // Use the provided onSendMessage prop if available, otherwise use the context's sendMessage
  const handleSend = async () => {
    if (input.trim() === '' || disabled) return;
    
    if (onSendMessage) {
      await onSendMessage(input);
    } else {
      await contextSendMessage(input);
    }
    
    setInput('');
  };

  return (
    <div className="input-area">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message here..."
        disabled={disabled}
      />
      <button 
        onClick={handleSend} 
        disabled={disabled || !input.trim() || loading}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;


















