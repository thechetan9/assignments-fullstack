# Candidate Engagement Chatbot

A specialized chatbot that engages job applicants with contextually relevant information while qualifying their fit.

## Features

- Chat interface for candidates to ask questions about a job
- Contextually relevant responses based on job description
- Automatic extraction of candidate information during conversation
- Profile summary showing what the system learned about the candidate

## Technical Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express and TypeScript
- **State Management**: React Context API
- **LLM Integration**: Simulated for demo purposes (can be replaced with OpenAI, Anthropic, etc.)

## Conversation Design Approach

The chatbot is designed to:

1. **Provide job information**: Answer candidate questions about the role, requirements, benefits, etc.
2. **Extract candidate information**: Analyze candidate messages to extract relevant qualifications
3. **Maintain context**: Keep track of the conversation flow and previously discussed topics
4. **Generate a profile**: Build a structured candidate profile from unstructured conversation

## Information Extraction Approach

The system extracts candidate information by:

1. Analyzing each message for relevant information (skills, experience, education, etc.)
2. Assigning confidence scores to extracted information
3. Building a candidate profile incrementally as the conversation progresses
4. Updating the profile when new information with higher confidence is detected

## Technical Decisions and Tradeoffs

- **React Context API vs Redux**: Used Context API for simplicity, though Redux would offer better scalability for larger applications
- **Simulated LLM vs Real API**: Used a simulated LLM for demo purposes to avoid API costs and dependencies
- **In-memory Storage vs Database**: Used in-memory storage for simplicity, though a real application would use a database
- **Simple Pattern Matching vs NLP**: Used simple pattern matching for extraction, though a real application would use more sophisticated NLP

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/candidate-chatbot.git
   cd candidate-chatbot
   ```

2. Install dependencies for both client and server:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```
   PORT=3001
   LLM_API_KEY=your_api_key_here  # Not needed for demo
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Future Enhancements

With more time, the following enhancements could be made:

1. Integration with a real LLM API (OpenAI, Anthropic, etc.)
2. Database storage for conversations and candidate profiles
3. More sophisticated information extraction using NLP
4. Multi-job support with job-specific training
5. Authentication and user management
6. Analytics dashboard for recruiters
7. Integration with ATS (Applicant Tracking System)