import { v4 as uuidv4 } from 'uuid';
import { CandidateProfile } from '../models/CandidateProfile';
import { Conversation, Message } from '../models/Conversation';
import { JobDescription, sampleJobDescription } from '../models/JobDescription';
import { LlmService } from './LlmService';

export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();
  private jobDescriptions: Map<string, JobDescription> = new Map();
  private llmService: LlmService;

  constructor(llmService: LlmService) {
    this.llmService = llmService;
    
    const jobId = "sample-job-id";
    this.jobDescriptions.set(jobId, sampleJobDescription);
  }
  
  createConversation(jobId: string): Conversation {
    if (!this.jobDescriptions.has(jobId)) {
      jobId = "sample-job-id";
    }
    
    const conversation: Conversation = {
      id: uuidv4(),
      messages: [],
      candidateProfile: {},
      extractions: [],
      jobId
    };
    
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `Hello! I'm the recruitment assistant for ${sampleJobDescription.company}. I can answer your questions about the ${sampleJobDescription.title} position. How can I help you today?`,
      timestamp: new Date()
    };
    
    conversation.messages.push(welcomeMessage);
    this.conversations.set(conversation.id, conversation);
    
    return conversation;
  }
  
  getConversation(id: string): Conversation {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation ${id} not found`);
    }
    return conversation;
  }
  
  async addMessage(conversationId: string, content: string, role: 'user' | 'assistant'): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found`);
    }
    
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    conversation.messages.push(message);
    
    if (role === 'user') {
      try {
        const extractions = await this.llmService.extractCandidateInfo(message);
        conversation.extractions.push(...extractions);
        
        this.updateCandidateProfile(conversation);
      } catch (error) {
        console.error('Error extracting candidate info:', error);
        // Continue even if extraction fails
      }
    }
    
    return message;
  }
  
  async generateResponse(conversationId: string): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    let jobDescription = this.jobDescriptions.get(conversation.jobId);
    if (!jobDescription) {
      jobDescription = sampleJobDescription;
    }
    
    const responseContent = await this.llmService.generateResponse(conversation, jobDescription);
    
    return this.addMessage(conversationId, responseContent, 'assistant');
  }
  
  getJobDescriptions(): Map<string, JobDescription> {
    return this.jobDescriptions;
  }
  
  private updateCandidateProfile(conversation: Conversation): void {
    const updatedProfile: CandidateProfile = { ...conversation.candidateProfile };
    
    for (const extraction of conversation.extractions) {
      const { field, value, confidence } = extraction;
      
      if (confidence < 0.6) continue;
      
      if (field === 'skills') {
        const currentSkills = updatedProfile.skills || [];
        const newSkills = Array.isArray(value) 
          ? value.filter(skill => !currentSkills.includes(skill))
          : [];
        updatedProfile.skills = [...currentSkills, ...newSkills];
      } 
      else if (field === 'yearsOfExperience') {
        if (!updatedProfile.yearsOfExperience || confidence > 0.8) {
          updatedProfile.yearsOfExperience = Number(value);
        }
      }
      else {
        const existingConfidence = this.getExtractionConfidence(conversation, field);
        if (existingConfidence === 0 || confidence > existingConfidence) {
          (updatedProfile as any)[field] = value;
        }
      }
    }
    
    conversation.candidateProfile = updatedProfile;
  }
  
  private getExtractionConfidence(conversation: Conversation, field: string): number {
    const relevantExtractions = conversation.extractions.filter(e => e.field === field);
    if (relevantExtractions.length === 0) return 0;
    
    return Math.max(...relevantExtractions.map(e => e.confidence));
  }
}
