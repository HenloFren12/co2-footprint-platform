import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NudgeCard, NudgeData } from './NudgeCard';

// Explicitly defining the mock object for isolated testing
const mockNudge: NudgeData = {
  id: 'nudge_flight_01',
  message: 'Your Delhi to Mumbai flight = 147kg CO2. The Vande Bharat Express emits 91% less.',
  co2SavedKg: 134,
  alternativeLabel: 'Take the train'
};

describe('NudgeCard', () => {
  // Use fake timers to reliably test the 650ms CSS animation timeout
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('adds the ripple-active class to the accept button on click', () => {
    render(
      <NudgeCard 
        nudge={mockNudge} 
        currentFootprintKg={150} 
        onAccept={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );
    
    const acceptButton = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptButton);
    
    expect(acceptButton).toHaveClass('ripple-active');
  });

  it('removes the ripple-active class after 650ms to match the CSS animation', async () => {
    render(
      <NudgeCard 
        nudge={mockNudge} 
        currentFootprintKg={150} 
        onAccept={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );
    
    const acceptButton = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptButton);
    
    // Fast-forward time past the 650ms timeout
    jest.advanceTimersByTime(700); 
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /accepted/i })).not.toHaveClass('ripple-active');
    });
  });

  it('disables the accept button after it is clicked once to prevent duplicate triggers', () => {
    render(
      <NudgeCard 
        nudge={mockNudge} 
        currentFootprintKg={150} 
        onAccept={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );
    
    const acceptButton = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptButton);
    
    expect(screen.getByRole('button', { name: /accepted/i })).toBeDisabled();
  });

  it('the aria-live output element is present for screen reader announcements', () => {
    render(
      <NudgeCard 
        nudge={mockNudge} 
        currentFootprintKg={150} 
        onAccept={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );
    
    // Checks that the footprint counter is accessible
    const counterOutput = screen.getByRole('status') || screen.getByText(/150kg/i).closest('output');
    expect(counterOutput).toHaveAttribute('aria-live', 'polite');
  });

  it('the dismiss button does not trigger the ripple animation', () => {
    render(
      <NudgeCard 
        nudge={mockNudge} 
        currentFootprintKg={150} 
        onAccept={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /maybe later/i }));
    const acceptButton = screen.getByRole('button', { name: /accept/i });
    
    expect(acceptButton).not.toHaveClass('ripple-active');
  });
});