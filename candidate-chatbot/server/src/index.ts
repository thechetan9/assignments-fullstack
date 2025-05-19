import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for conversations
const conversations = new Map();

// Sample job description
const sampleJobDescription = {
  id: 'sample-job-id',
  title: 'Full Stack Developer',
  company: 'Tech Innovations Inc.',
  location: 'Remote',
  description: 'We are looking for a skilled Full Stack Developer to join our team.',
  requirements: [
    'Proficiency in JavaScript/TypeScript',
    'Experience with React',
    'Experience with Node.js',
    'Understanding of RESTful APIs',
    'Database knowledge (SQL, NoSQL)'
  ],
  benefits: [
    'Competitive salary',
    'Remote work options',
    'Health insurance',
    'Professional development budget'
  ]
};

// Routes
app.post('/api/conversations', (req, res) => {
  const { jobId } = req.body;
  
  if (!jobId) {
    return res.status(400).json({ error: 'Job ID is required' });
  }
  
  const conversationId = uuidv4();
  conversations.set(conversationId, {
    id: conversationId,
    jobId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  res.status(201).json({ conversationId });
});

app.post('/api/conversations/:conversationId/messages', (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }
  
  const conversation = conversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  // Add user message
  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(userMessage);
  
  // Generate bot response based on user message
  let botResponse = '';
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('salary') || lowerContent.includes('pay')) {
    botResponse = `The ${sampleJobDescription.title} position offers a competitive salary along with benefits like ${sampleJobDescription.benefits.join(', ')}.`;
  } else if (lowerContent.includes('requirement') || lowerContent.includes('skill') || lowerContent.includes('qualification')) {
    botResponse = `For the ${sampleJobDescription.title} role, we're looking for candidates with: ${sampleJobDescription.requirements.join(', ')}.`;
  } else if (lowerContent.includes('location') || lowerContent.includes('remote') || lowerContent.includes('office')) {
    botResponse = `This position is ${sampleJobDescription.location}.`;
  } else if (lowerContent.includes('company') || lowerContent.includes('about')) {
    botResponse = `${sampleJobDescription.company} is an innovative tech company focused on creating cutting-edge solutions.`;
  } else if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
    botResponse = `Hello! I'm the ${sampleJobDescription.company} recruitment assistant. How can I help you with the ${sampleJobDescription.title} position today?`;
  } else {
    botResponse = `Thanks for your interest in the ${sampleJobDescription.title} position at ${sampleJobDescription.company}. Is there anything specific you'd like to know about the role?`;
  }
  
  // Add bot message
  const botMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: botResponse,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(botMessage);
  conversation.updatedAt = new Date().toISOString();
  
  res.status(200).json(conversation);
});

app.get('/api/conversations/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const conversation = conversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.status(200).json(conversation);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
