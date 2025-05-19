import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConversationService } from './services/ConversationService';
import { LlmService } from './services/LlmService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not set in environment variables');
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize services
const llmService = new LlmService(GEMINI_API_KEY || '');
const conversationService = new ConversationService(llmService);

// Routes
app.post('/api/conversations', (req, res) => {
  try {
    const { jobId } = req.body;
    const conversation = conversationService.createConversation(jobId);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/conversations/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = conversationService.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    
    console.log(`Received message for conversation ${conversationId}:`, content);
    
    // Add user message
    await conversationService.addMessage(conversationId, content, 'user');
    
    // Generate bot response
    await conversationService.generateResponse(conversationId);
    
    // Return updated conversation
    const conversation = conversationService.getConversation(conversationId);
    console.log("Sending conversation back to client:", conversation);
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/conversations/:conversationId/profile', (req, res) => {
  try {
    const { conversationId } = req.params;
    const profile = conversationService.getCandidateProfile(conversationId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
