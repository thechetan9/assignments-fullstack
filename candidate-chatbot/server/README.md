# Candidate Chatbot - Server

This directory contains the Node.js/Express backend for the Candidate Engagement Chatbot application.

## Technical Architecture

### Core Components

- **index.ts**: Entry point that sets up the Express server and routes
- **services/**: Contains the main business logic
  - **ConversationService.ts**: Manages conversation state and history
  - **LlmService.ts**: Handles interactions with the Gemini API
- **models/**: Contains TypeScript interfaces and sample data
  - **Conversation.ts**: Defines conversation and message structures
  - **CandidateProfile.ts**: Defines candidate profile structure
  - **JobDescription.ts**: Defines job description structure and sample data

### Data Flow

1. Client sends a message to the `/api/conversations/:id/messages` endpoint
2. `ConversationService` adds the message to the conversation history
3. `ConversationService` calls `LlmService` to generate a response
4. `LlmService` uses the Gemini API to:
   - Generate a contextually relevant response based on the job description
   - Extract candidate information from the message
5. `ConversationService` updates the conversation with the bot response
6. The updated conversation is returned to the client

### LLM Integration

The `LlmService` class handles all interactions with the Gemini API:

- **generateResponse**: Creates a response based on conversation history and job details
- **extractCandidateInfo**: Analyzes user messages to extract structured profile data
- **mergeProfileData**: Combines newly extracted information with existing profile data

### State Management

- Conversations are stored in-memory using a Map data structure
- Each conversation contains:
  - Messages (user and bot)
  - Candidate profile information
  - Metadata (creation time, update time)

## Technical Decisions

1. **In-memory Storage vs Database**: In-memory storage was chosen for simplicity, though a production application would use a database

2. **Express vs NestJS**: Express was chosen for its simplicity and flexibility

3. **Google Gemini vs OpenAI**: Gemini was selected for its strong performance in structured data extraction

4. **TypeScript vs JavaScript**: TypeScript provides type safety and better developer experience

## API Endpoints

- **POST /api/conversations**: Create a new conversation
- **GET /api/conversations/:id**: Get a conversation by ID
- **POST /api/conversations/:id/messages**: Add a user message and get a bot response
- **GET /api/health**: Check server health
- **GET /api/test-gemini**: Test the Gemini API connection

## Prompt Engineering

The LLM prompts are carefully designed to:

1. **Maintain context**: Include relevant conversation history
2. **Stay on topic**: Focus on the specific job description
3. **Extract information**: Identify candidate qualifications without explicit questions
4. **Structure data**: Return extracted information in a consistent JSON format

## Error Handling

- API endpoints use try/catch blocks to handle exceptions
- LLM service includes fallback responses for API failures
- Input validation prevents malformed requests

## Performance Considerations

- Requests to the Gemini API are asynchronous
- Response generation is optimized to minimize latency
- The server can handle multiple concurrent conversations