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
      console.log("Starting to generate response with Gemini API");
      
      // Get the Gemini model
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Format conversation history for the LLM
      const systemPrompt = `You are a helpful recruitment assistant for ${jobDescription.company}. 
        Your job is to answer questions about the ${jobDescription.title} position.
        Be concise, friendly, and informative. Only answer questions related to the job.
        Job details: ${JSON.stringify(jobDescription)}`;
      
      console.log("Conversation history:", JSON.stringify(conversation.messages));
      
      // Get the latest user message
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      console.log("Latest message:", latestMessage.content);
      
      // For simplicity, let's try a direct generation instead of chat history
      const prompt = `${systemPrompt}\n\nConversation history:\n${conversation.messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')}\n\nUser: ${latestMessage.content}\nAssistant:`;
      
      console.log("Sending prompt to Gemini:", prompt);
      
      // Generate response
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log("Generated response from Gemini:", responseText);
      return responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `I apologize, but I'm having trouble generating a response right now. Can you please try again? Error: ${(error as Error).message}`;
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
        
        Return ONLY a valid JSON object with the extracted fields and confidence scores (0.0-1.0).
        Format: { "extractions": [{ "field": "skills", "value": ["JavaScript", "React"], "confidence": 0.9 }] }
        Do not include markdown formatting, code blocks, or any text outside the JSON object.
      `;
      
      // Generate response
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      console.log("Raw LLM response:", content);
      
      // Clean up the response to handle markdown formatting
      let cleanedContent = content;
      if (content.includes('```json')) {
        cleanedContent = content.replace(/```json\s*|\s*```/g, '');
      }
      
      // Parse the JSON response
      try {
        const parsedResponse = JSON.parse(cleanedContent);
        const extractions = parsedResponse.extractions || [];
        
        // Add source to each extraction
        return extractions.map((extraction: any) => ({
          ...extraction,
          source: message.content
        }));
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        console.error('Cleaned content was:', cleanedContent);
        return [];
      }
    } catch (error) {
      console.error('Error calling Gemini API for extraction:', error);
      return [];
    }
  }
}
