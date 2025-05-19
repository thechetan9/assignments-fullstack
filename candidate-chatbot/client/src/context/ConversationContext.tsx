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
        // First check if server is running
        try {
          await fetch('http://localhost:3001/api/health');
        } catch (error) {
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
          throw new Error(`Failed to start conversation: ${response.status}`);
        }
        
        const data = await response.json();
        setConversationId(data.id);
        
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
        // Add error message
        setMessages([{ 
          text: 'Sorry, there was an error initializing the conversation. Please refresh the page.', 
          sender: 'bot' as const 
        }]);
      }
    };
    
    initConversation();
  }, [jobId]);

  const sendMessage = async (content: string) => {
    if (content.trim() === '' || !conversationId || loading) return;
    
    // Add user message to chat immediately
    const userMessage = { text: content, sender: 'user' as const };
    setMessages(prevMessages => [...prevMessages, userMessage]);
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
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const conversation = await response.json();
      
      if (!conversation.messages || conversation.messages.length === 0) {
        throw new Error('No messages returned from server');
      }
      
      // Update candidate profile from the conversation response
      if (conversation.candidateProfile) {
        setCandidateProfile(conversation.candidateProfile);
      }
      
      // Find the latest bot message
      const botMessages = conversation.messages.filter((msg: { role: string; }) => msg.role === 'assistant');
      const botMessage = botMessages[botMessages.length - 1];
      
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
      // Add error message
      setMessages(prevMessages => [...prevMessages, { 
        text: 'Sorry, there was an error processing your request. Please try again.', 
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
