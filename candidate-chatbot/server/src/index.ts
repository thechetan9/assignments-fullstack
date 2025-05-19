import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LlmService } from './services/LlmService';
import { ConversationService } from './services/ConversationService';
import { ConversationController } from './controllers/ConversationController';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const llmService = new LlmService(process.env.LLM_API_KEY || '');
const conversationService = new ConversationService(llmService);
const conversationController = new ConversationController(conversationService);

// Routes
app.post('/api/conversations', conversationController.startConversation);
app.post('/api/conversations/:conversationId/messages', conversationController.sendMessage);
app.get('/api/conversations/:conversationId', conversationController.getConversation);
app.get('/api/conversations/:conversationId/profile', conversationController.getCandidateProfile);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
