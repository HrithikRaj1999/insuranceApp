import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'wer-api-key-here',
});

export async function generateSummary(description: string): Promise<string> {
  try {

    if (!process.env.OPENAI_API_KEY) {
      return `Summary: ${description.substring(0, 100)}... This is a mock summary for development.`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'we are an insurance claim assistant. Summarize the following claim description in exactly 2 clear, concise sentences.',
        },
        {
          role: 'user',
          content: description,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error generating summary:', error);
    return `Claim summary: ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}`;
  }
}