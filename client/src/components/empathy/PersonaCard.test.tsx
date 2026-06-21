import { render, screen, fireEvent } from '@testing-library/react';
import PersonaCard from './PersonaCard';
import { Persona } from '../../lib/personaNarrative';

/**
 * components/empathy/PersonaCard.test.tsx
 *
 * Matched exactly to the real implementation:
 *   - portrait <img> has loading="lazy", decoding="async", width=480, height=480
 *   - onError sets portraitError -> swaps to a <div role="img"> fallback
 *   - fallback shows persona.name.charAt(0) as the initial
 *   - narrative <p> has aria-live="polite"
 *   - article has aria-label="Climate persona: {name}"
 *   - action chip has role="note" and aria-label with weeklyAction
 */

const mockPersona: Persona = {
  id: 'arjun',
  name: 'Arjun',
  age: 44,
  occupation: 'rice farmer',
  location: 'Bihar, India',
  climateImpact: 'Monsoon unpredictability causing crop failure',
  portraitBackground: 'Cracked dry paddy field',
  impactMetric: 'unpredictable monsoon',
  impactDescription: 'crop failure across Bihar',
  closingLine: 'Every choice you make ripples here to Bihar.',
  weeklyAction: 'Skip one meat meal this week',
};

describe('PersonaCard', () => {
  it('renders the article with the correct aria-label naming the persona', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    expect(
      screen.getByRole('article', { name: 'Climate persona: Arjun' })
    ).toBeInTheDocument();
  });

  it('renders the portrait img tag with loading="lazy" before any error occurs', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    const img = screen.getByRole('img', { name: /Arjun, rice farmer/i });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders explicit width and height of 480 to prevent layout shift', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    const img = screen.getByRole('img', { name: /Arjun, rice farmer/i });
    expect(img).toHaveAttribute('width', '480');
    expect(img).toHaveAttribute('height', '480');
  });

  it('builds the portrait src from the persona id as /personas/{id}.webp', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    const img = screen.getByRole('img', { name: /Arjun, rice farmer/i });
    expect(img).toHaveAttribute('src', '/personas/arjun.webp');
  });

  it('swaps to the initials fallback avatar when the portrait image fires onError', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={0}
      />
    );
    const img = screen.getByRole('img', { name: /Arjun, rice farmer/i });
    fireEvent.error(img);

    // The <img> is gone, replaced by a role="img" div with the initial
    expect(screen.queryByRole('img', { name: /Arjun, rice farmer/i })).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('fallback avatar div carries the same descriptive aria-label as the original img', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={0}
      />
    );
    const img = screen.getByRole('img', { name: /Arjun, rice farmer/i });
    fireEvent.error(img);

    const fallback = screen.getByRole('img', {
      name: 'Arjun, rice farmer from Bihar, India',
    });
    expect(fallback.tagName).toBe('DIV');
  });

  it('the narrative paragraph has aria-live="polite" for screen reader announcements', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    const narrative = screen.getByText(/Arjun here/i);
    expect(narrative).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the generated narrative text using the real generatePersonaNarrative output', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    expect(
      screen.getByText(
        'Arjun here. Your 14kg saved this week means one less day of unpredictable monsoon. Every choice you make ripples here to Bihar.'
      )
    ).toBeInTheDocument();
  });

  it('renders the weekly action chip with role="note" and a descriptive aria-label', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    const chip = screen.getByRole('note', {
      name: 'Suggested action: Skip one meat meal this week',
    });
    expect(chip).toHaveTextContent('Skip one meat meal this week');
  });

  it('does not crash and shows the contributing narrative when co2SavedThisWeek is negative', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="beef_kg"
        co2SavedThisWeek={-5}
      />
    );
    expect(screen.getByText(/directly contribute/i)).toBeInTheDocument();
  });

  it('the eyebrow label "FACES OF IMPACT" is always present', () => {
    render(
      <PersonaCard
        persona={mockPersona}
        userTopEmissionType="flight_domestic_km"
        co2SavedThisWeek={14}
      />
    );
    expect(screen.getByText('FACES OF IMPACT')).toBeInTheDocument();
  });
});