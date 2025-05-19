export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CandidateProfile {
  name?: string;
  email?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  skills?: string[];
  education?: string;
  interests?: string[];
  availability?: string;
  expectedSalary?: string;
  location?: string;
  workAuthorization?: string;
  questions?: string[];
}

export interface Conversation {
  id: string;
  messages: Message[];
  candidateProfile: CandidateProfile;
}