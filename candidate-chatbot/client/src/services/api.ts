import { Conversation, Message, CandidateProfile } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const startConversation = async (jobId: string): Promise<string> => {
  const response = await fetch(`${API_URL}/conversations`, {
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
  return data.conversationId;
};

export const sendMessage = async (conversationId: string, message: string): Promise<Message> => {
  const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  const data = await response.json();
  return data.message;
};

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get conversation');
  }
  
  const data = await response.json();
  return data.conversation;
};

export const getCandidateProfile = async (conversationId: string): Promise<CandidateProfile> => {
  const response = await fetch(`${API_URL}/conversations/${conversationId}/profile`);
  
  if (!response.ok) {
    throw new Error('Failed to get candidate profile');
  }
  
  const data = await response.json();
  return data.profile;
};