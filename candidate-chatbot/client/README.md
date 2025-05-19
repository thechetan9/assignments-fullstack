# Candidate Chatbot - Client

This directory contains the React frontend for the Candidate Engagement Chatbot application.

## Technical Architecture

### Component Structure

- **App.tsx**: Main application component that sets up the layout and providers
- **components/**: Contains all React components
  - **ChatWindow.tsx**: Manages the chat interface and message display
  - **ChatMessage.tsx**: Individual message component with styling based on sender
  - **MessageInput.tsx**: Form for user to input and send messages
  - **CandidateProfile.tsx**: Displays extracted candidate information
  - **ProfileItem.tsx**: Individual profile data item with appropriate formatting

### State Management

The application uses React Context API for state management:

- **ConversationContext.tsx**: Provides conversation state and methods to all components
  - Manages the active conversation
  - Handles sending/receiving messages
  - Updates the candidate profile as information is extracted

### Data Flow

1. User enters a message in the `MessageInput` component
2. The message is sent to the server via the `api.ts` service
3. `ConversationContext` updates the local state with the user message
4. When the server responds, the bot message is added to the conversation
5. The `ChatWindow` component re-renders to display the new messages
6. If candidate information was extracted, the `CandidateProfile` component updates

### API Integration

The `services/api.ts` file handles all communication with the backend:

- **createConversation**: Initializes a new conversation
- **sendMessage**: Sends a user message and receives the bot response
- **getConversation**: Retrieves the current state of a conversation

### Styling

- CSS modules are used for component-specific styling
- Global styles are defined in `App.css`
- The design uses a responsive layout that works on both desktop and mobile devices

## Technical Decisions

1. **React Hooks vs Class Components**: The application uses functional components with hooks for better readability and performance

2. **Context API vs Redux**: Context API was chosen for simplicity since the application has a relatively simple state structure

3. **CSS Modules vs Styled Components**: CSS modules provide scoped styling without the overhead of a CSS-in-JS library

4. **Fetch API vs Axios**: The native Fetch API is used for HTTP requests to minimize dependencies

## Code Organization

```
src/
├── components/           # React components
├── context/              # Context providers
├── services/             # API and utility services
├── types/                # TypeScript interfaces
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── App.css               # Global styles
```

## Performance Considerations

- Messages are rendered efficiently using keys and memoization
- API calls include error handling and loading states
- The UI updates optimistically before server responses to feel responsive