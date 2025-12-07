import React, { useState } from 'react';

const TimeEstimator = () => {
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [dailyDeficit, setDailyDeficit] = useState('500');
    const [estimation, setEstimation] = useState(null);

    const calculateTime = (e) => {
        e.preventDefault();
        const current = parseFloat(currentWeight);
        const goal = parseFloat(goalWeight);
        const deficit = parseFloat(dailyDeficit);

        if (!current || !goal || !deficit) return;

        const diff = Math.abs(current - goal); // kg
        const diffLbs = diff * 2.20462;
        const totalCalories = diffLbs * 3500;
        const days = Math.ceil(totalCalories / deficit);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        setEstimation({
            days,
            weeks: (days / 7).toFixed(1),
            date: targetDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            type: current > goal ? 'Loss' : 'Gain'
        });
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary">Goal Time Estimator</h2>
            <form onSubmit={calculateTime} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Current Weight (kg)</label>
                        <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="input-field" placeholder="80" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Goal Weight (kg)</label>
                        <input type="number" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="input-field" placeholder="70" required />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Daily Calorie Deficit/Surplus</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[250, 500, 750, 1000].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setDailyDeficit(val)}
                                className={`py-2 px-3 rounded-lg border transition-all ${parseInt(dailyDeficit) === val ? 'bg-primary text-darker border-primary font-bold' : 'bg-dark border-gray-700 text-gray-400 hover:border-gray-500'}`}
                            >
                                {val} kcal
                            </button>
                        ))}
                        <input
                            type="number"
                            value={dailyDeficit}
                            onChange={(e) => setDailyDeficit(e.target.value)}
                            className="input-field sm:col-span-2"
                            placeholder="Custom amount"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">500 kcal deficit ≈ 0.5kg weight loss per week.</p>
                </div>

                <button type="submit" className="btn-primary w-full mt-4">Estimate Time</button>
            </form>

            {estimation && (
                <div className="mt-8 p-6 bg-gradient-to-br from-dark to-card rounded-xl border border-gray-700 text-center">
                    <p className="text-gray-400 mb-2">To reach your goal, it will take approximately:</p>
                    <h3 className="text-4xl font-bold text-white mb-1">{estimation.days} Days</h3>
                    <p className="text-primary font-medium mb-6">({estimation.weeks} weeks)</p>

                    <div className="border-t border-gray-700 pt-4">
                        <p className="text-sm text-gray-400">Estimated Achievement Date:</p>
                        <p className="text-lg font-semibold text-white">{estimation.date}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeEstimator;
