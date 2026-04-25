import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Assistant from './pages/Assistant';

// Mock the Groq module so tests don't make real API calls
vi.mock('./lib/groq', () => ({
  getGroqChatResponse: vi.fn().mockResolvedValue('This is a **test** AI response.'),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// DOMPurify needs a real DOM — jsdom provides it, but sanitize can be a no-op
vi.mock('dompurify', () => ({ default: { sanitize: (s) => s } }));

describe('Assistant Component', () => {
  it('renders the chat interface with initial greeting', () => {
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /ai election assistant/i })).toBeTruthy();
    expect(screen.getByText(/hello/i)).toBeTruthy();
  });

  it('shows suggestion chips before first user message', () => {
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    expect(screen.getByText(/how do elections work in india/i)).toBeTruthy();
  });

  it('allows the user to type and submit a message', async () => {
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    const input = screen.getByLabelText(/ask a question about elections/i);
    await userEvent.type(input, 'What is an EVM?');
    expect(input.value).toBe('What is an EVM?');
  });

  it('send button is disabled when input is empty', () => {
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn.disabled).toBe(true);
  });

  it('send button is enabled when input has text', async () => {
    render(<MemoryRouter><Assistant /></MemoryRouter>);
    const input = screen.getByLabelText(/ask a question about elections/i);
    await userEvent.type(input, 'Hello');
    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn.disabled).toBe(false);
  });
});
