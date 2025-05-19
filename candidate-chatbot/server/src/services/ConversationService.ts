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
    
    // Add initial greeting message
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
    
    console.log(`Generating response for conversation ${conversationId}`);
    
    const responseContent = await this.llmService.generateResponse(conversation, jobDescription);
    console.log(`Generated response: ${responseContent}`);
    
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
    // Create a new profile object to avoid direct mutation
    const updatedProfile: CandidateProfile = { ...conversation.candidateProfile };
    
    // Process each extraction
    for (const extraction of conversation.extractions) {
      const { field, value, confidence } = extraction;
      
      // Only update if confidence is high enough
      if (confidence < 0.6) continue;
      
      // Handle array fields specially
      if (field === 'skills') {
        const currentSkills = updatedProfile.skills || [];
        // Filter out duplicates
        const newSkills = Array.isArray(value) 
          ? value.filter(skill => !currentSkills.includes(skill))
          : [];
        updatedProfile.skills = [...currentSkills, ...newSkills];
      } 
      // Handle numeric fields
      else if (field === 'yearsOfExperience') {
        // Only update if the new value is more specific or higher confidence
        if (!updatedProfile.yearsOfExperience || confidence > 0.8) {
          updatedProfile.yearsOfExperience = Number(value);
        }
      }
      // Handle other fields
      else {
        // Only update if field is empty or new data has higher confidence
        const existingConfidence = this.getExtractionConfidence(conversation, field);
        if (existingConfidence === 0 || confidence > existingConfidence) {
          (updatedProfile as any)[field] = value;
        }
      }
    }
    
    // Update the conversation's candidate profile
    conversation.candidateProfile = updatedProfile;
  }
  
  // Helper to find the highest confidence for a given field
  private getExtractionConfidence(conversation: Conversation, field: string): number {
    const relevantExtractions = conversation.extractions.filter(e => e.field === field);
    if (relevantExtractions.length === 0) return 0;
    
    return Math.max(...relevantExtractions.map(e => e.confidence));
  }
}
