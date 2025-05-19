import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    
    try {
      // Call backend API (replace with your actual API endpoint)
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prevMessages => [...prevMessages, { text: data.message, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prevMessages => [...prevMessages, { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'bot' 
      }]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Candidate Engagement Chatbot</h1>
      </header>
      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <p>Welcome! How can I help you today?</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))
          )}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;