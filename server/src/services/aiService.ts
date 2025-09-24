import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSummary(description: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an insurance claim assistant. Summarize the following claim description in exactly 2 sentences."
        },
        {
          role: "user",
          content: description
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });
    
    return response.choices[0].message.content || 'Summary unavailable';
  } catch (error) {
    console.error('AI Summary failed:', error);
    return 'Unable to generate summary at this time.';
  }
}