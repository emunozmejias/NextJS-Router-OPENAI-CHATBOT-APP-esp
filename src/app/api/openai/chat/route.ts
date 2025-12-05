import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { ModelType } from "@/lib/types";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant. You provide clear, accurate, and well-structured responses. When appropriate, you use markdown formatting to enhance readability, including:
- Code blocks with syntax highlighting for code snippets
- Bullet points and numbered lists for organized information
- Headers for longer responses
- Bold and italic text for emphasis

You're conversational but professional, and you always aim to be helpful while being honest about your limitations.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model = 'gpt-4o' } = body as {
      messages: Array<{ role: string; content: string }>;
      model?: ModelType;
    };

    // Validate model selection
    const validModels: ModelType[] = ['gpt-4o', 'gpt-3.5-turbo'];
    const selectedModel = validModels.includes(model) ? model : 'gpt-4o';

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required and cannot be empty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await streamText({
      model: openai(selectedModel),
      messages: convertToCoreMessages(messages),
      system: SYSTEM_PROMPT,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({ error: 'API key configuration error. Please check your OpenAI API key.' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request. Please try again.' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
