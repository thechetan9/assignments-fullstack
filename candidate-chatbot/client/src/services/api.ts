import { Conversation, CandidateProfile } from '../types';

const API_URL = 'http://localhost:3001/api';

export const startConversation = async (jobId: string): Promise<Conversation> => {
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

  return response.json();
};

export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Conversation> => {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

export const getConversation = async (
  conversationId: string
): Promise<Conversation> => {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`);

  if (!response.ok) {
    throw new Error('Failed to get conversation');
  }

  return response.json();
};

export const getCandidateProfile = async (
  conversationId: string
): Promise<CandidateProfile> => {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/profile`
  );

  if (!response.ok) {
    throw new Error('Failed to get candidate profile');
  }

  return response.json();
};
