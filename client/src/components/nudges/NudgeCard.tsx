import React, { useState } from 'react';
import { useCounterAnimation } from '../../hooks/useCounterAnimation';

export interface NudgeData {
  id: string;
  message: string;
  co2SavedKg: number;
  alternativeLabel: string;
}

interface NudgeCardProps {
  nudge: NudgeData;
  currentFootprintKg: number;
  onAccept: (nudge: NudgeData) => void;
  onDismiss: () => void;
}

export const NudgeCard: React.FC<NudgeCardProps> = ({ 
  nudge, 
  currentFootprintKg, 
  onAccept, 
  onDismiss 
}) => {
  const [rippleActive, setRippleActive] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const targetFootprint = accepted
    ? Math.max(0, currentFootprintKg - nudge.co2SavedKg)
    : currentFootprintKg;

  const displayedFootprint = useCounterAnimation(targetFootprint);

  const handleAccept = () => {
    if (accepted) return;
    setAccepted(true);
    setRippleActive(true);
    onAccept(nudge);
    
    // Remove class after animation completes (matches CSS 600ms + buffer)
    setTimeout(() => setRippleActive(false), 650); 
  };

  return (
    <article role="region" aria-label="Carbon nudge suggestion" className="p-6 border rounded-lg bg-white shadow-sm">
      <p className="mb-4 text-slate-700">{nudge.message}</p>

      <output 
        aria-live="polite" 
        aria-label="Updated daily footprint in kilograms"
        className="block mb-6 text-3xl font-bold text-slate-900"
      >
        {displayedFootprint}kg CO₂ today
      </output>

      <div className="flex gap-4">
        <button
          className={`ripple-origin px-6 py-2 rounded-md font-medium transition-colors ${
            accepted ? 'bg-green-100 text-green-800' : 'bg-green-600 text-white hover:bg-green-700'
          } ${rippleActive ? 'ripple-active' : ''}`}
          onClick={handleAccept}
          aria-label={`Accept lower-emission alternative: ${nudge.alternativeLabel}`}
          disabled={accepted}
        >
          {accepted ? 'Accepted' : `Accept: ${nudge.alternativeLabel}`}
        </button>

        <button 
          onClick={onDismiss} 
          aria-label="Dismiss this nudge"
          className="px-6 py-2 rounded-md font-medium text-slate-600 hover:bg-slate-100"
          disabled={accepted}
        >
          Maybe later
        </button>
      </div>
    </article>
  );
};