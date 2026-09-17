import Anthropic from '@anthropic-ai/sdk';
import type { Note } from './types';

const client = new Anthropic();

export type Summary = { summary: string; key_points: string[] };

export async function summarizeNote(note: Note): Promise<Summary> {
  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4096,
    temperature: 1.0,
    messages: [
      {
        role: 'user',
        content: `Here is some data:\n${JSON.stringify(note)}\n\nProcess this.`,
      },
    ],
  });

  const block = response.content[0];
  return JSON.parse(block.type === 'text' ? block.text : '');
}
