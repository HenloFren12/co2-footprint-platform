import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/shared/Layout';
import { useUserStore } from '../store';
import { calculateEmission } from '../lib/calculateEmission';
import styles from '../styles/onboarding.module.css';

const STEPS = [
  // Step 0 - Intro
  null,
  // Step 1
  {
    question: "How far do you commute daily?",
    activityType: "car_petrol_medium_km",
    options: [
      { label: "Under 5km", value: 5 },
      { label: "5–20km", value: 12 },
      { label: "20–50km", value: 35 },
      { label: "Over 50km", value: 70 },
    ]
  },
  // Step 2
  {
    question: "What best describes your diet?",
    activityType: "beef_herd_kg",
    options: [
      { label: "Mostly plant-based", value: 1 },
      { label: "Some meat weekly", value: 3 },
      { label: "Meat daily", value: 7 },
      { label: "Mostly beef", value: 14 },
    ]
  },
  // Step 3
  {
    question: "How much electricity does your home use monthly?",
    activityType: "electricity_kwh_IN",
    options: [
      { label: "Under 100kWh", value: 80 },
      { label: "100–300kWh", value: 200 },
      { label: "300–600kWh", value: 450 },
      { label: "Over 600kWh", value: 750 },
    ]
  },
  // Step 4
  {
    question: "How often do you buy new goods?",
    activityType: "car_petrol_medium_km", // Proxy as specified
    options: [
      { label: "Rarely", value: 1 },
      { label: "Monthly", value: 3 },
      { label: "Weekly", value: 7 },
      { label: "Very frequently", value: 14 },
    ]
  }
];

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const navigate = useNavigate();
  const setBaselineFootprintKg = useUserStore(state => state.setBaselineFootprintKg);
  const setOnboardingComplete = useUserStore(state => state.setOnboardingComplete);

  const handleNext = () => {
    if (stepIndex === 0) {
      setStepIndex(1);
      return;
    }

    if (selectedValue !== null) {
      const newAnswers = { ...answers, [stepIndex]: selectedValue };
      setAnswers(newAnswers);
      setSelectedValue(null);

      if (stepIndex < 4) {
        setStepIndex(stepIndex + 1);
      } else {
        let total = 0;
        for (let i = 1; i <= 4; i++) {
          const activity = STEPS[i]!.activityType;
          total += calculateEmission(activity, newAnswers[i]);
        }
        setBaselineFootprintKg(total);
        setOnboardingComplete(true);
        navigate('/dashboard');
      }
    }
  };

  const progressPercent = (stepIndex / 4) * 100;

  return (
    <div className={styles.onboardingWrapper}>
      <div 
        className={styles.progressBarContainer}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.logo}>footprint.</div>

      <Layout backgroundImage="/backgrounds/fern-jungle.jpg">
        <div className={styles.contentArea}>
          <div className={styles.sliderWindow}>
            <div 
              className={styles.sliderStrip} 
              style={{ transform: `translateX(-${stepIndex * 20}%)` }}
            >
              {/* Step 0 - Intro */}
              <div className={styles.slide} aria-hidden={stepIndex !== 0}>
                <div className={styles.card}>
                  <h1 className={styles.heroHeading}>Your journey starts here.</h1>
                  <p className={styles.bodyText}>
                    Stewardship through intention. Begin to track, understand, and reduce your impact within the quiet rhythm of nature.
                  </p>
                  <button 
                    className={styles.primaryButton} 
                    onClick={handleNext}
                    tabIndex={stepIndex === 0 ? 0 : -1}
                  >
                    Begin Stewardship &rarr;
                  </button>
                </div>
              </div>

              {/* Steps 1-4 */}
              {STEPS.slice(1).map((step, idx) => {
                const realIndex = idx + 1;
                const isCurrent = realIndex === stepIndex;
                
                return (
                  <div key={realIndex} className={styles.slide} aria-hidden={!isCurrent}>
                    <div className={styles.card}>
                      <span className={styles.eyebrow}>STEP {realIndex} OF 4</span>
                      <h2 className={styles.cardHeading}>{step!.question}</h2>
                      
                      <div className={styles.optionsList}>
                        {step!.options.map(opt => {
                          const isSelected = selectedValue === opt.value;
                          return (
                            <button
                              key={opt.label}
                              className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                              aria-pressed={isSelected}
                              onClick={() => setSelectedValue(opt.value)}
                              tabIndex={isCurrent ? 0 : -1}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      <button 
                        className={styles.primaryButton} 
                        onClick={handleNext}
                        disabled={selectedValue === null}
                        tabIndex={isCurrent ? 0 : -1}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
