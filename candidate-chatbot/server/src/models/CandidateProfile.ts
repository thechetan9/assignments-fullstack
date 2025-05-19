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

export interface ProfileExtraction {
  field: keyof CandidateProfile;
  value: any;
  confidence: number;
  source: string; // The message that provided this information
}