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
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const systemPrompt = `You are a helpful recruitment assistant for ${jobDescription.company}. 
        Your job is to answer questions about the ${jobDescription.title} position.
        Be concise, friendly, and informative. Only answer questions related to the job.
        
        Important guidelines:
        1. Provide varied responses - never repeat the exact same message twice in a row
        2. If the candidate shares information about themselves, acknowledge it and relate it to the job requirements
        3. If you've already asked how you can help, don't ask again - instead, provide specific information about the job
        4. Ask follow-up questions to gather more information about the candidate's qualifications
        5. If the candidate has shared skills or experience, mention how they align with the job requirements
        
        Job details: ${JSON.stringify(jobDescription)}
        
        Candidate profile so far: ${JSON.stringify(conversation.candidateProfile)}`;
      
      const latestMessage = conversation.messages[conversation.messages.length - 1];
      
      let previousBotMessages = conversation.messages
        .filter(msg => msg.role === 'assistant')
        .map(msg => msg.content);
      
      let avoidGenericResponse = false;
      if (previousBotMessages.length > 0) {
        const lastBotMessage = previousBotMessages[previousBotMessages.length - 1];
        avoidGenericResponse = lastBotMessage.includes("How can I help you") || 
                               lastBotMessage.includes("how can I help you");
      }
      
      let additionalContext = "";
      if (avoidGenericResponse) {
        additionalContext = "\nNote: Your previous message was a generic 'how can I help' message. " +
                            "Please provide specific information about the job or ask a specific question about the candidate's qualifications instead.";
      }
      
      const prompt = `${systemPrompt}${additionalContext}\n\nConversation history:\n${conversation.messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')}\n\nUser: ${latestMessage.content}\nAssistant:`;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return `I apologize, but I'm having trouble generating a response right now. Can you please try again? Error: ${(error as Error).message}`;
    }
  }
  
  async extractCandidateInfo(message: Message): Promise<ProfileExtraction[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
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
      
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      let cleanedContent = content;
      if (content.includes('```json')) {
        cleanedContent = content.replace(/```json\s*|\s*```/g, '');
      }
      
      try {
        const parsedResponse = JSON.parse(cleanedContent);
        const extractions = parsedResponse.extractions || [];
        
        return extractions.map((extraction: any) => ({
          ...extraction,
          source: message.content
        }));
      } catch (parseError) {
        return [];
      }
    } catch (error) {
      return [];
    }
  }
}
