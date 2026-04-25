import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the layout and navigation', async () => {
    render(<App />);
    const elements = await screen.findAllByText(/ElectraGuide/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
