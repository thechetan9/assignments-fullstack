import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, CandidateProfile } from '../types';
import * as api from '../services/api';

interface ConversationContextType {
  conversation: Conversation | null;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  candidateProfile: CandidateProfile | null;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: ReactNode;
  jobId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children, jobId }) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoading(true);
        const conversationId = await api.startConversation(jobId);
        const conversationData = await api.getConversation(conversationId);
        setConversation(conversationData);
        setError(null);
      } catch (err) {
        setError('Failed to initialize conversation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    initConversation();
  }, [jobId]);
  
  const sendMessage = async (message: string) => {
    if (!conversation) return;
    
    try {
      setLoading(true);
      
      // Optimistically update UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      
      setConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, tempMessage],
        };
      });
      
      // Send to API
      const botMessage = await api.sendMessage(conversation.id, message);
      
      // Update with real data
      setConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages.filter(m => m.id !== tempMessage.id), tempMessage, botMessage],
        };
      });
      
      // Update candidate profile
      const profile = await api.getCandidateProfile(conversation.id);
      setCandidateProfile(profile);
      
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ConversationContext.Provider
      value={{
        conversation,
        loading,
        error,
        sendMessage,
        candidateProfile,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};