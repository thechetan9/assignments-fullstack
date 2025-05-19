import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConversationService } from './services/ConversationService';
import { LlmService } from './services/LlmService';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Add user message
    const userMessage = await conversationService.addMessage(conversationId, content, 'user');
    console.log('Added user message:', userMessage);
    
    // Generate bot response
    const botMessage = await conversationService.generateResponse(conversationId);
    console.log('Generated bot response:', botMessage);
    
    // Return updated conversation
    const conversation = conversationService.getConversation(conversationId);
    console.log("Sending conversation back to client:", JSON.stringify(conversation));
    
    return res.status(200).json(conversation);
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ error: (error as Error).message });
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

// Test endpoint for Gemini API
app.get('/api/test-gemini', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent("Say hello world");
    const response = result.response.text();
    
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Debug endpoint to check job descriptions
app.get('/api/debug/jobs', (req, res) => {
  const jobDescriptions = conversationService.getJobDescriptions();
  
  // Convert Map to array in a more explicit way
  const jobs: Array<{id: string, title: string, company: string}> = [];
  
  jobDescriptions.forEach((job: any, id: string) => {
    jobs.push({
      id,
      title: job.title,
      company: job.company
    });
  });
  
  res.status(200).json({ jobs, count: jobs.length });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
