import { CandidateProfile, ProfileExtraction } from '../models/CandidateProfile';
import { Conversation, Message } from '../models/Conversation';
import { JobDescription } from '../models/JobDescription';

export class LlmService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateResponse(conversation: Conversation, jobDescription: JobDescription): Promise<string> {
    // In a real implementation, this would call an LLM API like OpenAI
    // For this demo, we'll simulate the response
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    // Simple response logic based on keywords
    if (lastMessage.content.toLowerCase().includes('salary')) {
      return `The ${jobDescription.title} position offers a competitive salary along with ${jobDescription.benefits.join(', ').toLowerCase()}.`;
    }
    
    if (lastMessage.content.toLowerCase().includes('requirements')) {
      return `For the ${jobDescription.title} role, we're looking for candidates with: ${jobDescription.requirements.join(', ')}.`;
    }
    
    // Default response
    return `Thanks for your interest in the ${jobDescription.title} position at ${jobDescription.company}. How can I help you with more specific information about the role?`;
  }
  
  async extractCandidateInfo(message: Message): Promise<ProfileExtraction[]> {
    // In a real implementation, this would use an LLM to extract structured information
    // For this demo, we'll use simple pattern matching
    
    const extractions: ProfileExtraction[] = [];
    const content = message.content.toLowerCase();
    
    // Simple extraction examples
    if (content.includes('experience') && /\d+\s+years?/.test(content)) {
      const years = parseInt(content.match(/(\d+)\s+years?/)?.[1] || '0');
      extractions.push({
        field: 'yearsOfExperience',
        value: years,
        confidence: 0.8,
        source: message.content
      });
    }
    
    if (content.includes('react') || content.includes('node') || content.includes('typescript')) {
      const skills = [];
      if (content.includes('react')) skills.push('React');
      if (content.includes('node')) skills.push('Node.js');
      if (content.includes('typescript')) skills.push('TypeScript');
      
      extractions.push({
        field: 'skills',
        value: skills,
        confidence: 0.7,
        source: message.content
      });
    }
    
    return extractions;
  }
}