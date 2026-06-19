import { render, screen, fireEvent } from '@testing-library/react';
import { PersonaCard } from './PersonaCard';
import { Persona } from '../lib/personaNarrative';

// Explicitly defining the mock object for isolated testing
const mockArjun: Persona = {
  id: 'arjun',
  name: 'Arjun',
  location: 'Bihar, India',
  occupation: 'rice farmer',
  impactMetric: 'unpredictable monsoon',
  impactDescription: 'crop failure',
  closingLine: 'Every choice you make ripples here to Bihar.',
  weeklyAction: 'Commit to a plant-based lunch today.'
};

describe('PersonaCard', () => {
  it('renders the portrait img tag with loading="lazy" attribute', () => {
    render(
      <PersonaCard 
        persona={mockArjun} 
        userTopEmissionType="flight_domestic_km" 
        co2SavedThisWeek={14} 
      />
    );
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('renders explicit width and height to prevent layout shift', () => {
    render(
      <PersonaCard 
        persona={mockArjun} 
        userTopEmissionType="flight_domestic_km" 
        co2SavedThisWeek={14} 
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '480');
    expect(img).toHaveAttribute('height', '480');
  });

  it('renders initials fallback avatar when portrait returns a 404', () => {
    render(
      <PersonaCard 
        persona={mockArjun} 
        userTopEmissionType="flight_domestic_km" 
        co2SavedThisWeek={0} 
      />
    );
    // Trigger the onError event to simulate a broken image link
    fireEvent.error(screen.getByRole('img'));
    
    // Ensure the fallback initial "A" for Arjun is rendered
    expect(screen.getByText('A')).toBeInTheDocument(); 
  });

  it('aria-live region is present for dynamic narrative updates', () => {
    render(
      <PersonaCard 
        persona={mockArjun} 
        userTopEmissionType="flight_domestic_km" 
        co2SavedThisWeek={14} 
      />
    );
    // Check that the text paragraph announces updates to screen readers
    expect(screen.getByText(/Arjun here/i)).toHaveAttribute('aria-live', 'polite');
  });
});