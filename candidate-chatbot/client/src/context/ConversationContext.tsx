import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, CandidateProfile } from '../types';
import * as api from '../services/api';

interface ConversationContextType {
  conversation: Conversation | null;
  candidateProfile: CandidateProfile | null;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: ReactNode;
  jobId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ 
  children, 
  jobId 
}): React.ReactElement => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        setLoading(true);
        const newConversation = await api.startConversation(jobId);
        setConversation(newConversation);
        setLoading(false);
      } catch (err) {
        setError('Failed to start conversation');
        setLoading(false);
      }
    };

    initConversation();
  }, [jobId]);

  // Send a message
  const sendMessage = async (content: string) => {
    if (!conversation) return;

    try {
      setLoading(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);
      
      // Send to API and get response
      const updatedConversation = await api.sendMessage(
        conversation.id,
        content
      );
      
      setConversation(updatedConversation);
      
      // Update profile
      const profile = await api.getCandidateProfile(conversation.id);
      setCandidateProfile(profile);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to send message');
      setLoading(false);
    }
  };

  return (
    <ConversationContext.Provider
      value={{
        conversation,
        candidateProfile,
        loading,
        error,
        sendMessage
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
