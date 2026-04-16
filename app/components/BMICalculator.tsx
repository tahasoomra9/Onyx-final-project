import React, { useMemo, useState } from 'react';

const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState<number>(82);
  const [height, setHeight] = useState<number>(182);

  const bmiData = useMemo(() => {
    const heightInMeters = height / 100;
    const bmi = heightInMeters > 0 ? weight / (heightInMeters * heightInMeters) : 0;

    if (bmi < 18.5) {
      return {
        bmi: bmi.toFixed(1),
        category: 'UNDERWEIGHT',
        accent: 'text-chart2',
        message: 'Increase daily intake gradually while prioritizing protein and nutrient density.',
      };
    }

    if (bmi < 25) {
      return {
        bmi: bmi.toFixed(1),
        category: 'HEALTHY',
        accent: 'text-white',
        message: 'Body mass is in an optimal range. Maintain current nutrition and training cadence.',
      };
    }

    if (bmi < 30) {
      return {
        bmi: bmi.toFixed(1),
        category: 'OVERWEIGHT',
        accent: 'text-chart1',
        message: 'Slight caloric reduction plus progressive training can improve long-term markers.',
      };
    }

    return {
      bmi: bmi.toFixed(1),
      category: 'OBESE',
      accent: 'text-destructive',
      message: 'Establish a sustainable deficit and movement baseline to reduce metabolic strain.',
    };
  }, [height, weight]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="max-w-3xl">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Body-Mass Index</h2>
        <p className="text-muted-foreground mt-2 font-medium">Assess weight-to-height ratio and monitor trend category.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 glass p-8 rounded-[2.5rem] border-white/10 space-y-8">
          <div>
            <label htmlFor="bmi-weight" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              Weight (kg)
            </label>
            <input
              id="bmi-weight"
              type="number"
              min={1}
              value={weight}
              onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="bmi-height" className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
              Height (cm)
            </label>
            <input
              id="bmi-height"
              type="number"
              min={1}
              value={height}
              onChange={(e) => setHeight(Number.parseFloat(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-1 focus:ring-white"
            />
          </div>
        </div>

        <div className="lg:col-span-7 glass p-10 rounded-[3rem] border-white/10 space-y-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Current Readout</p>
          <div className="flex items-end gap-3">
            <span className="text-7xl font-black text-white tabular-nums">{bmiData.bmi}</span>
            <span className={`text-sm font-black uppercase tracking-widest ${bmiData.accent}`}>{bmiData.category}</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-700"
              style={{ width: `${Math.min(100, (Number.parseFloat(bmiData.bmi) / 40) * 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{bmiData.message}</p>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
