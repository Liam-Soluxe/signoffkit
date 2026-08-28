import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('SignoffKit workspace', () => {
  it('loads the synthetic demo and exposes export actions', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /load synthetic demo/i }));
    expect(screen.getByDisplayValue('Demo: Northstar Studio website')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export json/i })).toBeEnabled();
    expect(screen.getByText(/flagged blocker/i)).toBeInTheDocument();
  });

  it('shows privacy and terms views without leaving the app', async () => {
    render(<App />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Privacy' })[0]);
    expect(screen.getByRole('heading', { name: 'Privacy' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /back to workspace/i }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Terms' })[0]);
    expect(screen.getByRole('heading', { name: 'Terms of use' })).toBeInTheDocument();
  });
});
