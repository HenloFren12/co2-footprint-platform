// components/shared/EmissionLogForm.tsx
import { useState, useCallback, useRef } from 'react';
import EMISSION_FACTORS from '../../lib/emissionFactors.json';
import styles from './EmissionLogForm.module.css';

interface EmissionLogFormProps {
  onSubmit: (activityType: string, quantity: number) => void;
}

export default function EmissionLogForm({
  onSubmit,
}: EmissionLogFormProps) {
  const [activityType, setActivityType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  // Debounce ref — 300ms per Ideation PDF memory rules
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQuantity(val);
      }, 300);
    },
    []
  );

  const handleSubmit = () => {
    // Safely removed DOMPurify! A simple trim is perfect for a dropdown select.
    const cleanType = activityType.trim();
    const parsed = parseFloat(quantity);

    if (!cleanType) {
      setError('Please select an activity type.');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (parsed > Number.MAX_SAFE_INTEGER) {
      setError(
        'Quantity is too large. Please enter a realistic value.'
      );
      return;
    }
    if (
      !(cleanType in (EMISSION_FACTORS as Record<string, number>))
    ) {
      setError('Unrecognized activity type.');
      return;
    }

    setError('');
    onSubmit(cleanType, parsed);

    // Reset form after successful submit
    setActivityType('');
    setQuantity('');
  };

  return (
    <div
      role="form"
      aria-label="Log a carbon activity"
      className={styles.formWrapper}
    >
      {/* Activity Type Select */}
      <div className={styles.fieldGroup}>
        <label
          htmlFor="activity-type"
          className={styles.label}
        >
          Activity type
        </label>
        <select
          id="activity-type"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          aria-describedby={error ? 'form-error' : undefined}
          className={styles.select}
        >
          <option value="">Select an activity</option>
          {Object.keys(
            EMISSION_FACTORS as Record<string, number>
          ).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Input */}
      <div className={styles.fieldGroup}>
        <label
          htmlFor="quantity"
          className={styles.label}
        >
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min="0"
          defaultValue=""
          onChange={handleQuantityChange}
          aria-describedby={error ? 'form-error' : undefined}
          className={styles.input}
          placeholder="Enter amount"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p
          id="form-error"
          role="alert"
          aria-live="assertive"
          className={styles.error}
        >
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        className={styles.submitButton}
        aria-label="Log this carbon activity"
      >
        Log activity
      </button>
    </div>
  );
}