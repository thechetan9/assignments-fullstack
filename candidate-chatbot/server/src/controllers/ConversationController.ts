import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';

export class ConversationController {
  private conversationService: ConversationService;
  
  constructor(conversationService: ConversationService) {
    this.conversationService = conversationService;
  }
  
  startConversation = (req: Request, res: Response): void => {
    const { jobId } = req.body;
    
    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }
    
    const conversation = this.conversationService.createConversation(jobId);
    res.status(201).json({ conversationId: conversation.id });
  }
  
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { conversationId, message } = req.body;
    
    if (!conversationId || !message) {
      res.status(400).json({ error: 'Conversation ID and message are required' });
      return;
    }
    
    try {
      // Add user message
      await this.conversationService.addMessage(conversationId, message, 'user');
      
      // Generate bot response
      const botMessage = await this.conversationService.generateResponse(conversationId);
      
      res.status(200).json({ message: botMessage });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
  
  getConversation = (req: Request, res: Response): void => {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID is required' });
      return;
    }
    
    const conversation = this.conversationService.getConversation(conversationId);
    
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    
    res.status(200).json({ conversation });
  }
  
  getCandidateProfile = (req: Request, res: Response): void => {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      res.status(400).json({ error: 'Conversation ID is required' });
      return;
    }
    
    try {
      const conversation = this.conversationService.getConversation(conversationId);
      res.status(200).json({ profile: conversation.candidateProfile });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }
}
