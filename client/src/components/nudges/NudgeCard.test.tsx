import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NudgeCard, NudgeData } from './NudgeCard';

/**
 * components/nudges/NudgeCard.test.tsx
 *
 * Matched exactly to the real implementation:
 *   - article role="region" aria-label="Carbon nudge suggestion"
 *   - counter is an <output> with aria-live="polite", shows
 *     `${displayedFootprint.toFixed(1)}kg CO₂ today`
 *   - accept button gets classes: ripple-origin, acceptButton,
 *     'accepted' (after click), 'ripple-active' (for 650ms)
 *   - accept button is disabled once accepted=true
 *   - dismiss button is also disabled once accepted=true
 *   - handleAccept is a no-op guard if already accepted (if (accepted) return)
 */

const mockNudge: NudgeData = {
  id: 'nudge_flight_01',
  message: 'Your flight = significant CO₂. The train emits 91% less.',
  co2SavedKg: 134,
  alternativeLabel: 'Take the train',
};

describe('NudgeCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders as a region with the correct aria-label', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(
      screen.getByRole('region', { name: 'Carbon nudge suggestion' })
    ).toBeInTheDocument();
  });

  it('renders the nudge message text', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText(mockNudge.message)).toBeInTheDocument();
  });

  it('the counter output has aria-live="polite" and shows the current footprint with one decimal', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const counter = screen.getByRole('status');
    expect(counter).toHaveAttribute('aria-live', 'polite');
    expect(counter).toHaveTextContent('150.0kg CO₂ today');
  });

  it('the accept button label includes the alternativeLabel before being accepted', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(
      screen.getByRole('button', { name: /accept lower-emission alternative: take the train/i })
    ).toHaveTextContent('Accept: Take the train');
  });

  it('clicking accept adds the ripple-active class to the button', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const acceptButton = screen.getByRole('button', { name: /accept lower-emission/i });
    fireEvent.click(acceptButton);
    expect(acceptButton).toHaveClass('ripple-active');
  });

  it('removes the ripple-active class after 650ms, matching the CSS transition duration', async () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const acceptButton = screen.getByRole('button', { name: /accept lower-emission/i });
    fireEvent.click(acceptButton);
    expect(acceptButton).toHaveClass('ripple-active');

    vi.advanceTimersByTime(700);

    await waitFor(() => {
      expect(acceptButton).not.toHaveClass('ripple-active');
    });
  });

  it('disables the accept button and changes its label to "Accepted ✓" after clicking once', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const acceptButton = screen.getByRole('button', { name: /accept lower-emission/i });
    fireEvent.click(acceptButton);

    expect(screen.getByRole('button', { name: /accept lower-emission/i })).toBeDisabled();
    expect(screen.getByText('Accepted ✓')).toBeInTheDocument();
  });

  it('calls onAccept exactly once with the nudge object when accept is clicked', () => {
    const onAccept = vi.fn();
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={onAccept}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /accept lower-emission/i }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept).toHaveBeenCalledWith(mockNudge);
  });

  it('a second click on an already-accepted button does not call onAccept again (guard clause)', () => {
    const onAccept = vi.fn();
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={onAccept}
        onDismiss={vi.fn()}
      />
    );
    const acceptButton = screen.getByRole('button', { name: /accept lower-emission/i });
    fireEvent.click(acceptButton);
    fireEvent.click(acceptButton); // disabled, but verifying handler guard too

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('the dismiss button calls onDismiss when clicked and never triggers ripple', () => {
    const onDismiss = vi.fn();
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /dismiss this nudge/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    const acceptButton = screen.getByRole('button', { name: /accept lower-emission/i });
    expect(acceptButton).not.toHaveClass('ripple-active');
  });

  it('the dismiss button becomes disabled once a nudge has been accepted', () => {
    render(
      <NudgeCard
        nudge={mockNudge}
        currentFootprintKg={150}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /accept lower-emission/i }));
    expect(screen.getByRole('button', { name: /dismiss this nudge/i })).toBeDisabled();
  });

  it('the counter never goes below 0 even if co2SavedKg exceeds currentFootprintKg', async () => {
    render(
      <NudgeCard
        nudge={{ ...mockNudge, co2SavedKg: 999 }}
        currentFootprintKg={5}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /accept lower-emission/i }));

    vi.advanceTimersByTime(900);

    await waitFor(() => {
      const counter = screen.getByRole('status');
      expect(counter.textContent).toContain('0.0kg CO₂ today');
    });
  });
});