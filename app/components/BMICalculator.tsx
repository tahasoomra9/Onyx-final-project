import React, { useEffect, useMemo, useState } from 'react';
import { readFromStorage, writeToStorage } from '@/lib/local-storage';

interface BMICalculatorStorage {
  weight: number;
  height: number;
  submitted: {
    weight: number;
    height: number;
  };
}

const BMI_STORAGE_KEY = 'fp_bmi';

interface BMICalculatorProps {
  currentWeight: number;
  onWeightChange: (weight: number) => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ currentWeight, onWeightChange }) => {
  const initialBmiState = readFromStorage<BMICalculatorStorage>(BMI_STORAGE_KEY, {
    weight: currentWeight || 82,
    height: 182,
    submitted: { weight: currentWeight || 82, height: 182 },
  });

  const [weight, setWeight] = useState<number>(currentWeight || initialBmiState.weight);
  const [height, setHeight] = useState<number>(initialBmiState.height);
  const [submitted, setSubmitted] = useState<{ weight: number; height: number }>(initialBmiState.submitted);

  useEffect(() => {
    writeToStorage(BMI_STORAGE_KEY, { weight, height, submitted });
  }, [weight, height, submitted]);

  const panelClass = 'rounded-2xl border border-border bg-card p-6 md:p-8';
  const inputClass =
    'h-11 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground outline-none transition focus:border-ring/60 focus:ring-2 focus:ring-ring/30';

  const bmiData = useMemo(() => {
    const heightInMeters = submitted.height / 100;
    const bmi = heightInMeters > 0 ? submitted.weight / (heightInMeters * heightInMeters) : 0;

    if (bmi < 18.5) {
      return {
        bmi: bmi.toFixed(1),
        category: 'Underweight',
        accent: 'text-chart2',
        message: 'A small calorie increase and strength training can help move this up safely.',
      };
    }

    if (bmi < 25) {
      return {
        bmi: bmi.toFixed(1),
        category: 'Healthy range',
        accent: 'text-foreground',
        message: 'You are in a healthy range. Keep your current nutrition and movement routine.',
      };
    }

    if (bmi < 30) {
      return {
        bmi: bmi.toFixed(1),
        category: 'Above range',
        accent: 'text-chart1',
        message: 'A modest calorie reduction with regular activity can improve this over time.',
      };
    }

    return {
      bmi: bmi.toFixed(1),
      category: 'High range',
      accent: 'text-destructive',
      message: 'Start with simple daily habits and consistent movement to reduce health risk.',
    };
  }, [submitted]);

  const handleCalculate: NonNullable<React.ComponentProps<'form'>['onSubmit']> = (e) => {
    e.preventDefault();
    if (weight <= 0 || height <= 0) return;

    setSubmitted({ weight, height });
    onWeightChange(weight);
  };

  const bmiNumber = Number.parseFloat(bmiData.bmi);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">BMI</h2>
        <p className="text-sm text-muted-foreground">Check body mass index from your height and weight.</p>
        <p className="text-sm text-muted-foreground">
          Current profile weight: <span className="font-medium text-foreground">{currentWeight > 0 ? `${currentWeight} kg` : 'not set yet'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <form onSubmit={handleCalculate} className={`${panelClass} space-y-5 lg:col-span-5`}>
          <div>
            <label htmlFor="bmi-weight" className="mb-2 block text-xs text-muted-foreground">Weight (kg)</label>
            <input
              id="bmi-weight"
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bmi-height" className="mb-2 block text-xs text-muted-foreground">Height (cm)</label>
            <input
              id="bmi-height"
              type="number"
              min={1}
              value={height}
              onChange={(e) => setHeight(Number.parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Calculate BMI
          </button>
        </form>

        <section className={`${panelClass} space-y-5 lg:col-span-7`}>
          <p className="text-xs text-muted-foreground">Current result</p>

          <div className="flex items-end gap-3">
            <span className="text-6xl font-semibold tracking-tight text-foreground tabular-nums">{bmiData.bmi}</span>
            <span className={`text-sm font-medium ${bmiData.accent}`}>{bmiData.category}</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (bmiNumber / 40) * 100)}%` }}
            />
          </div>

          <p className="text-sm leading-6 text-muted-foreground">{bmiData.message}</p>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Underweight</p>
              <p className="mt-1 text-sm font-medium text-foreground">&lt; 18.5</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Healthy</p>
              <p className="mt-1 text-sm font-medium text-foreground">18.5 - 24.9</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Above</p>
              <p className="mt-1 text-sm font-medium text-foreground">25 - 29.9</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">High</p>
              <p className="mt-1 text-sm font-medium text-foreground">30+</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BMICalculator;
