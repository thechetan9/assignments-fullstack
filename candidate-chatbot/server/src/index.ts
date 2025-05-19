import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConversationService } from './services/ConversationService';
import { LlmService } from './services/LlmService';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY not set in environment variables');
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const llmService = new LlmService(GEMINI_API_KEY || '');
const conversationService = new ConversationService(llmService);

app.post('/api/conversations', (req, res) => {
  try {
    const { jobId } = req.body;
    const conversation = conversationService.createConversation(jobId);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/conversations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const conversation = conversationService.getConversation(id);
    res.status(200).json(conversation);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    await conversationService.addMessage(conversationId, content, 'user');
    const botMessage = await conversationService.generateResponse(conversationId);
    const conversation = conversationService.getConversation(conversationId);
    
    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/test-gemini', async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent("Say hello world");
    const response = result.response.text();
    
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/api/debug/jobs', (req, res) => {
  const jobDescriptions = conversationService.getJobDescriptions();
  
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
