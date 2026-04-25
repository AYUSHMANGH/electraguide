import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Eligibility from './pages/Eligibility';

// Stub framer-motion to avoid animation issues in jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Eligibility Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Eligibility />
      </MemoryRouter>
    );
  });

  it('renders the eligibility form', () => {
    expect(screen.getByLabelText(/what is your age/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeTruthy();
  });

  it('shows eligible result for a valid voter', async () => {
    const ageInput = screen.getByLabelText(/what is your age/i);
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '25');

    // citizenship=yes and residency=yes are defaults — just submit
    const submitBtn = screen.getByRole('button', { name: /check eligibility/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/you are eligible/i)).toBeTruthy();
    });
  });

  it('shows ineligible result for under-18', async () => {
    const ageInput = screen.getByLabelText(/what is your age/i);
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '16');

    await userEvent.click(screen.getByRole('button', { name: /check eligibility/i }));

    await waitFor(() => {
      expect(screen.getByText(/not eligible yet/i)).toBeTruthy();
    });
  });

  it('shows warning for non-resident voter', async () => {
    const ageInput = screen.getByLabelText(/what is your age/i);
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '30');

    // Click residency = No
    const noResidencyLabel = screen.getAllByText('No')[1]; // second "No" is residency
    await userEvent.click(noResidencyLabel);

    await userEvent.click(screen.getByRole('button', { name: /check eligibility/i }));

    await waitFor(() => {
      expect(screen.getByText(/further action required/i)).toBeTruthy();
    });
  });
});
