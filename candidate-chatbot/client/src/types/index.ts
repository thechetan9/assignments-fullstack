export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CandidateProfile {
  name?: string;
  email?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  skills?: string[];
  education?: string;
  location?: string;
  expectedSalary?: string;
}

export interface Conversation {
  id: string;
  jobId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
