import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CandidateProfile {
  name?: string;
  email?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  skills?: string[];
  education?: string;
  location?: string;
  expectedSalary?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string | null;
  messages: Message[];
}

interface ConversationContextType {
  candidateProfile: CandidateProfile | null;
  conversation: Conversation;
  loading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: ReactNode;
  jobId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children, jobId }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [loading, setLoading] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to start conversation');
        }
        
        const data = await response.json();
        setConversationId(data.conversationId);
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };
    
    initConversation();
  }, [jobId]);

  // Fetch profile when conversation updates
  useEffect(() => {
    const fetchProfile = async () => {
      if (!conversationId) return;
      
      try {
        const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/profile`);
        
        if (response.ok) {
          const data = await response.json();
          setCandidateProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [messages, conversationId]);

  const sendMessage = async (content: string) => {
    if (content.trim() === '' || !conversationId || loading) return;
    
    // Add user message to chat
    const userMessage = { text: content, sender: 'user' as const };
    setMessages([...messages, userMessage]);
    setLoading(true);
    
    try {
      // Send the message to the conversation
      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const conversation = await response.json();
      const botMessage = conversation.messages[conversation.messages.length - 1];
      
      // Add bot response to chat
      setMessages(prevMessages => [...prevMessages, { 
        text: botMessage.content, 
        sender: 'bot' as const
      }]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message
      setMessages(prevMessages => [...prevMessages, { 
        text: 'Sorry, there was an error processing your request. ' + (error as Error).message, 
        sender: 'bot' as const
      }]);
    } finally {
      setLoading(false);
    }
  };

  const contextValue: ConversationContextType = {
    candidateProfile,
    conversation: {
      id: conversationId,
      messages: messages.map((msg, index) => ({
        id: index.toString(),
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: new Date().toISOString()
      }))
    },
    loading,
    sendMessage
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
};
