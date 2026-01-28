import { useState, useCallback } from 'react';
import WelcomeStep from './WelcomeStep';
import NameStep from './NameStep';
import BirthDateStep from './BirthDateStep';
import GenderStep from './GenderStep';
import WeightStep from './WeightStep';
import HeightStep from './HeightStep';
import GoalStep from './GoalStep';
import ExperienceStep from './ExperienceStep';
import ConditionsStep from './ConditionsStep';
import SummaryStep from './SummaryStep';

const STEPS = [
  { id: 'welcome', component: WelcomeStep, title: 'Benvenuto' },
  { id: 'name', component: NameStep, title: 'Nome' },
  { id: 'birthDate', component: BirthDateStep, title: 'Data di nascita' },
  { id: 'gender', component: GenderStep, title: 'Genere' },
  { id: 'weight', component: WeightStep, title: 'Peso' },
  { id: 'height', component: HeightStep, title: 'Altezza' },
  { id: 'goal', component: GoalStep, title: 'Obiettivo' },
  { id: 'experience', component: ExperienceStep, title: 'Esperienza' },
  { id: 'conditions', component: ConditionsStep, title: 'Condizioni' },
  { id: 'summary', component: SummaryStep, title: 'Riepilogo' }
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    weight: '',
    height: '',
    goal: '',
    experience: '',
    conditions: []
  });

  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const StepComponent = STEPS[currentStep].component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const goToNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    const profileData = {
      ...formData,
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };
    onComplete(profileData);
  }, [formData, onComplete]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Progress bar */}
      {!isFirstStep && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-[var(--border)]">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              {currentStep + 1} di {totalSteps}
            </span>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className={`flex-1 ${!isFirstStep ? 'pt-16' : ''}`}>
        <StepComponent
          data={formData}
          updateData={updateFormData}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onComplete={handleComplete}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </div>

      {/* Step indicators (dots) - only show on non-welcome steps */}
      {!isFirstStep && !isLastStep && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-2 pb-safe">
          {STEPS.slice(1, -1).map((step, index) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep - 1
                  ? 'bg-[var(--primary)]'
                  : index < currentStep - 1
                  ? 'bg-[var(--primary)]/50'
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
