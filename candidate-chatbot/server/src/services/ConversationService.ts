import { v4 as uuidv4 } from 'uuid';
import { CandidateProfile } from '../models/CandidateProfile';
import { Conversation, Message } from '../models/Conversation';
import { JobDescription, sampleJobDescription } from '../models/JobDescription';
import { LlmService } from './LlmService';

export class ConversationService {
  private conversations: Map<string, Conversation> = new Map();
  private llmService: LlmService;
  private jobDescriptions: Map<string, JobDescription> = new Map();
  
  constructor(llmService: LlmService) {
    this.llmService = llmService;
    
    // Add sample job description
    const jobId = uuidv4();
    this.jobDescriptions.set(jobId, sampleJobDescription);
  }
  
  createConversation(jobId: string): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      messages: [],
      candidateProfile: {},
      extractions: [],
      jobId
    };
    
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }
  
  async addMessage(conversationId: string, content: string, role: 'user' | 'assistant'): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    conversation.messages.push(message);
    
    // If this is a user message, extract candidate information
    if (role === 'user') {
      const extractions = await this.llmService.extractCandidateInfo(message);
      conversation.extractions.push(...extractions);
      
      // Update candidate profile with new information
      this.updateCandidateProfile(conversation);
    }
    
    return message;
  }
  
  async generateResponse(conversationId: string): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const jobDescription = this.jobDescriptions.get(conversation.jobId);
    if (!jobDescription) {
      throw new Error(`Job description ${conversation.jobId} not found`);
    }
    
    const responseContent = await this.llmService.generateResponse(conversation, jobDescription);
    return this.addMessage(conversationId, responseContent, 'assistant');
  }
  
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }
  
  getCandidateProfile(conversationId: string): CandidateProfile | undefined {
    const conversation = this.conversations.get(conversationId);
    return conversation?.candidateProfile;
  }
  
  private updateCandidateProfile(conversation: Conversation): void {
    // Merge extractions into the candidate profile
    for (const extraction of conversation.extractions) {
      if (extraction.field === 'skills') {
        // Handle arrays specially
        const currentSkills = conversation.candidateProfile.skills || [];
        const newSkills = extraction.value.filter(
          (skill: string) => !currentSkills.includes(skill)
        );
        conversation.candidateProfile.skills = [...currentSkills, ...newSkills];
      } else {
        // For simple fields, just update if confidence is high enough
        if (extraction.confidence > 0.6) {
          (conversation.candidateProfile as any)[extraction.field] = extraction.value;
        }
      }
    }
  }
}