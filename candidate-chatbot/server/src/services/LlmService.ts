import { CandidateProfile, ProfileExtraction } from '../models/CandidateProfile';
import { Conversation, Message } from '../models/Conversation';
import { JobDescription } from '../models/JobDescription';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class LlmService {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  
  async generateResponse(conversation: Conversation, jobDescription: JobDescription): Promise<string> {
    try {
      // Get the Gemini model
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Format conversation history for the LLM
      const systemPrompt = `You are a helpful recruitment assistant for ${jobDescription.company}. 
        Your job is to answer questions about the ${jobDescription.title} position.
        Be concise, friendly, and informative. Only answer questions related to the job.
        Job details: ${JSON.stringify(jobDescription)}`;
      
      console.log("Generating response for conversation:", conversation.id);
      
      // Format the conversation history
      const chatHistory = conversation.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      // Start a chat session
      const chat = model.startChat({
        history: chatHistory.slice(0, -1), // Exclude the latest message
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });
      
      // Get the latest user message
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      console.log("Latest message:", latestMessage.content);
      
      // Generate response
      const result = await chat.sendMessage(
        `${systemPrompt}\n\nUser message: ${latestMessage.content}`
      );
      
      const responseText = result.response.text();
      console.log("Generated response:", responseText);
      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `I apologize, but I'm having trouble generating a response right now. Can you please try again?`;
    }
  }
  
  async extractCandidateInfo(message: Message): Promise<ProfileExtraction[]> {
    try {
      // Get the Gemini model
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Prepare the prompt for information extraction
      const prompt = `
        Extract the following information from the candidate's message if present:
        - name
        - email
        - currentRole
        - yearsOfExperience (as a number)
        - skills (as an array of strings)
        - education
        - location
        - expectedSalary
        
        Message: "${message.content}"
        
        Return ONLY a JSON object with the extracted fields and confidence scores (0.0-1.0).
        Example: { "extractions": [{ "field": "skills", "value": ["JavaScript", "React"], "confidence": 0.9 }] }
      `;
      
      // Generate response
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      // Parse the JSON response
      try {
        const parsedResponse = JSON.parse(content);
        const extractions = parsedResponse.extractions || [];
        
        // Add source to each extraction
        return extractions.map((extraction: any) => ({
          ...extraction,
          source: message.content
        }));
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error calling Gemini API for extraction:', error);
      return [];
    }
  }
}
