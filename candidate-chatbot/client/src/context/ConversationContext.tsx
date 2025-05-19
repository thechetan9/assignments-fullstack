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
        console.log('Initializing conversation with job ID:', jobId);
        
        // First check if server is running
        try {
          await fetch('http://localhost:3001/api/health');
        } catch (error) {
          console.error('Server connection error:', error);
          // Add a welcome message even if server is down
          setMessages([{ 
            text: 'Welcome! I am the candidate chatbot. It seems our server is currently unavailable. Please try again later.', 
            sender: 'bot' as const 
          }]);
          return;
        }
        
        const response = await fetch('http://localhost:3001/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to start conversation: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Conversation initialized:', data);
        setConversationId(data.id); // Use data.id directly
        
        // Add welcome message from the response
        if (data.messages && data.messages.length > 0) {
          const welcomeMessage = data.messages[0];
          setMessages([{ 
            text: welcomeMessage.content, 
            sender: welcomeMessage.role === 'user' ? 'user' : 'bot' as const 
          }]);
        } else {
          setMessages([{ 
            text: 'Welcome! I am the candidate chatbot. How can I help you today?', 
            sender: 'bot' as const 
          }]);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        // Add error message
        setMessages([{ 
          text: 'Sorry, there was an error initializing the conversation. ' + (error as Error).message, 
          sender: 'bot' as const 
        }]);
      }
    };
    
    initConversation();
  }, [jobId]);

  // Fetch profile when conversation updates
  useEffect(() => {
    const fetchProfile = async () => {
      if (!conversationId) return;
      
      try {
        console.log(`Fetching profile for conversation: ${conversationId}`);
        const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/profile`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched profile data:', data);
          if (data && data.profile) {
            setCandidateProfile(data.profile);
          } else {
            console.error('Profile data is missing or invalid:', data);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch profile:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [conversationId, messages.length]); // Add messages.length as dependency to update when messages change

  const sendMessage = async (content: string) => {
    if (content.trim() === '' || !conversationId || loading) return;
    
    console.log("Starting to send message:", content);
    
    // Add user message to chat immediately
    const userMessage = { text: content, sender: 'user' as const };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setLoading(true);
    
    try {
      console.log(`Sending message to server at http://localhost:3001/api/conversations/${conversationId}/messages`);
      
      // Send the message to the conversation
      const response = await fetch(`http://localhost:3001/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }
      
      const conversation = await response.json();
      console.log("Full conversation response:", conversation);
      
      if (!conversation.messages || conversation.messages.length === 0) {
        throw new Error('No messages returned from server');
      }
      
      // Find the latest bot message
      const botMessages = conversation.messages.filter((msg: { role: string; }) => msg.role === 'assistant');
      const botMessage = botMessages[botMessages.length - 1];
      
      console.log("Latest bot message:", botMessage);
      
      if (botMessage) {
        // Add bot response to chat
        setMessages(prevMessages => [...prevMessages, { 
          text: botMessage.content, 
          sender: 'bot' as const
        }]);
      } else {
        throw new Error('No bot response found in conversation');
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
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
