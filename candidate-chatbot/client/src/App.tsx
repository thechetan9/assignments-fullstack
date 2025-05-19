import React from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import CandidateProfile from './components/CandidateProfile';
import { ConversationProvider } from './context/ConversationContext';

// For demo purposes, we're using a hardcoded job ID
// In a real app, this might come from a route parameter
const JOB_ID = 'sample-job-id';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Candidate Engagement Chatbot</h1>
      </header>
      <main className="App-main">
        <ConversationProvider jobId={JOB_ID}>
          <div className="chat-container">
            <ChatWindow />
          </div>
          <div className="profile-container">
            <CandidateProfile />
          </div>
        </ConversationProvider>
      </main>
    </div>
  );
}

export default App;
