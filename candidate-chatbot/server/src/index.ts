import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ConversationService } from './services/ConversationService';
import { LlmService } from './services/LlmService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const LLM_API_KEY = process.env.LLM_API_KEY || ''; // Optional for demo

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface CandidateProfile {
  name?: string;
  email?: string;
  currentRole?: string;
  yearsOfExperience?: number;
  skills?: string[];
  education?: string;
  location?: string;
  expectedSalary?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  jobId: string;
  messages: Message[];
  candidateProfile: CandidateProfile;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for conversations
const conversations = new Map<string, Conversation>();

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

// Function to extract candidate information from message
function extractCandidateInfo(message: string, currentProfile: CandidateProfile): CandidateProfile {
  const profile = { ...currentProfile };
  const lowerMessage = message.toLowerCase();
  
  // Extract name
  const nameMatch = message.match(/my name is ([A-Za-z\s]+)/i) || 
                    message.match(/I am ([A-Za-z\s]+)/i) ||
                    message.match(/I'm ([A-Za-z\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    if (name.length > 2 && !name.toLowerCase().includes('looking') && !name.toLowerCase().includes('interested')) {
      profile.name = name;
    }
  }
  
  // Extract email
  const emailMatch = message.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  if (emailMatch && emailMatch[1]) {
    profile.email = emailMatch[1];
  }
  
  // Extract current role
  const roleMatch = message.match(/(?:I am|I'm|I work as|my role is|my position is) (?:an?|the) ([^,.]+)/i);
  if (roleMatch && roleMatch[1]) {
    profile.currentRole = roleMatch[1].trim();
  }
  
  // Extract years of experience
  const expMatch = message.match(/(\d+)(?:\+)? years? (?:of )?experience/i);
  if (expMatch && expMatch[1]) {
    profile.yearsOfExperience = parseInt(expMatch[1]);
  }
  
  // Extract skills
  const skills = profile.skills || [];
  const techSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'SQL', 'NoSQL',
    'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'HTML', 'CSS', 'SASS', 'LESS', 'Redux', 'GraphQL', 'REST'
  ];
  
  for (const skill of techSkills) {
    if (lowerMessage.includes(skill.toLowerCase()) && !skills.includes(skill)) {
      skills.push(skill);
    }
  }
  
  if (skills.length > 0) {
    profile.skills = skills;
  }
  
  // Extract education
  const eduMatch = message.match(/(?:I have|with|earned|completed|hold) a ([^,.]+) (?:degree|in|from)/i);
  if (eduMatch && eduMatch[1]) {
    profile.education = eduMatch[1].trim();
  }
  
  // Extract location
  const locationMatch = message.match(/(?:I live in|I am from|I'm from|based in|located in) ([^,.]+)/i);
  if (locationMatch && locationMatch[1]) {
    profile.location = locationMatch[1].trim();
  }
  
  // Extract expected salary
  const salaryMatch = message.match(/(?:expecting|looking for|salary|compensation) (?:of|around|about)? (?:\$|USD|EUR)?(\d+[kK]?)/i);
  if (salaryMatch && salaryMatch[1]) {
    profile.expectedSalary = salaryMatch[1];
  }
  
  return profile;
}

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
    candidateProfile: {},
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
  const userMessage: Message = {
    id: uuidv4(),
    role: 'user', // Now TypeScript knows this is specifically 'user'
    content,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(userMessage);
  
  // Extract candidate information
  conversation.candidateProfile = extractCandidateInfo(content, conversation.candidateProfile);
  
  // Generate bot response based on user message
  let botResponse = '';
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('salary') || lowerContent.includes('pay') || lowerContent.includes('compensation')) {
    botResponse = `The ${sampleJobDescription.title} position offers a competitive salary along with benefits like ${sampleJobDescription.benefits.join(', ')}.`;
  } else if (lowerContent.includes('requirement') || lowerContent.includes('skill') || lowerContent.includes('qualification')) {
    botResponse = `For the ${sampleJobDescription.title} role, we're looking for candidates with: ${sampleJobDescription.requirements.join(', ')}.`;
  } else if (lowerContent.includes('location') || lowerContent.includes('remote') || lowerContent.includes('office')) {
    botResponse = `This position is ${sampleJobDescription.location}.`;
  } else if (lowerContent.includes('company') || lowerContent.includes('about')) {
    botResponse = `${sampleJobDescription.company} is an innovative tech company focused on creating cutting-edge solutions.`;
  } else if (lowerContent.includes('hello') || lowerContent.includes('hi') || lowerContent.includes('hey')) {
    botResponse = `Hello! I'm the ${sampleJobDescription.company} recruitment assistant. How can I help you with the ${sampleJobDescription.title} position today?`;
  } else if (lowerContent.includes('experience') || lowerContent.includes('background')) {
    botResponse = `Thanks for sharing about your experience. For the ${sampleJobDescription.title} role, we're particularly interested in candidates with experience in ${sampleJobDescription.requirements.slice(0, 3).join(', ')}. Can you tell me more about your background with these technologies?`;
  } else if (lowerContent.includes('education') || lowerContent.includes('degree') || lowerContent.includes('university')) {
    botResponse = `Thank you for sharing your educational background. While we value education, we're equally interested in practical experience with ${sampleJobDescription.requirements[0]} and ${sampleJobDescription.requirements[1]}. Could you share more about your hands-on experience?`;
  } else if (lowerContent.includes('interview') || lowerContent.includes('process') || lowerContent.includes('next step')) {
    botResponse = `Our interview process for the ${sampleJobDescription.title} role typically involves an initial technical screening, followed by a coding assignment and then final interviews with the team. Would you like more details about any specific part of this process?`;
  } else {
    botResponse = `Thanks for your interest in the ${sampleJobDescription.title} position at ${sampleJobDescription.company}. Is there anything specific you'd like to know about the role or the company?`;
  }
  
  // Add bot message
  const botMessage: Message = {
    id: uuidv4(),
    role: 'assistant', // Now TypeScript knows this is specifically 'assistant'
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

app.get('/api/conversations/:conversationId/profile', (req, res) => {
  const { conversationId } = req.params;
  const conversation = conversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.status(200).json(conversation.candidateProfile);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
