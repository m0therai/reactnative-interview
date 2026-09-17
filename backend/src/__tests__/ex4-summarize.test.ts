/**
 * Exercise 4 (bonus): fix the LLM summarization.
 * The Anthropic SDK is mocked. These tests check what your code sends to it and how it
 * handles what comes back.
 */
import { handle } from '../index';
import { ALICE, note, request, seed } from './helpers';

const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: class MockAnthropic {
    // Lazy so the mock is looked up per call, not when the SDK client is constructed.
    get messages() {
      return { create: (...args: unknown[]) => mockCreate(...args) };
    }
  },
}));

const LONG = 'This is important context. '.repeat(2000); // ~54k characters

beforeEach(() => {
  mockCreate.mockReset();
  seed([
    note({
      id: 'ml',
      user_id: ALICE,
      title: 'Machine Learning Overview',
      content:
        'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves.',
    }),
    note({ id: 'long', user_id: ALICE, title: 'Very Long Note', content: LONG }),
  ]);
  mockCreate.mockResolvedValue({
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          summary: 'An overview of machine learning as a subset of AI.',
          key_points: ['ML is a subset of AI', 'Systems learn from experience'],
        }),
      },
    ],
  });
});

const summarize = (id: string) => handle(request('/summarize-note', { as: ALICE, body: { id } }));

describe('Exercise 4: summarize-note', () => {
  it('uses a temperature suited to a factual task (<= 0.5)', async () => {
    await summarize('ml');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate.mock.calls[0][0].temperature).toBeLessThanOrEqual(0.5);
  });

  it('sets a sensible max_tokens for a summary (<= 1024)', async () => {
    await summarize('ml');
    expect(mockCreate.mock.calls[0][0].max_tokens).toBeLessThanOrEqual(1024);
  });

  it('sends the note content but not internal fields', async () => {
    await summarize('ml');
    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain('Machine learning');
    expect(prompt).not.toContain('created_at');
    expect(prompt).not.toContain('user_alice');
    expect(prompt).not.toContain('"id"');
  });

  it('tells the model to summarize and asks for JSON', async () => {
    await summarize('ml');
    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt).toMatch(/summar/i);
    expect(prompt).toMatch(/json/i);
  });

  it('returns summary and key_points', async () => {
    const res = await summarize('ml');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('summary');
    expect(Array.isArray(body.key_points)).toBe(true);
  });

  it('recovers when the model returns plain text instead of JSON', async () => {
    mockCreate
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'Here is a summary of the note about machine learning...' }] })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify({ summary: 'ML overview', key_points: ['ML is a subset of AI'] }) }],
      });
    const res = await summarize('ml');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('key_points');
  });

  it('does not send a 54k-character note to the model unchanged', async () => {
    await summarize('long');
    const prompt: string = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt.length).toBeLessThan(20000);
    expect(prompt).toContain('This is important context');
  });
});
