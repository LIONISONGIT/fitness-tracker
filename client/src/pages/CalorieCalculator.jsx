import React, { useState } from 'react';

const CalorieCalculator = () => {
    const [formData, setFormData] = useState({
        gender: 'male',
        age: '',
        height: '',
        weight: '',
        activity: '1.2'
    });
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateCalories = (e) => {
        e.preventDefault();
        const { gender, age, height, weight, activity } = formData;

        // Mifflin-St Jeor Equation
        let bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        const tdee = Math.round(bmr * parseFloat(activity));
        setResult({ bmr: Math.round(bmr), tdee });
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary">Daily Calorie Calculator</h2>
            <form onSubmit={calculateCalories} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-muted">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-muted">Age (years)</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} required className="input-field" placeholder="25" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-muted">Height (cm)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} required className="input-field" placeholder="180" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-text-muted">Weight (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} required className="input-field" placeholder="75" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-text-muted">Activity Level</label>
                    <select name="activity" value={formData.activity} onChange={handleChange} className="input-field">
                        <option value="1.2">Sedentary (little or no exercise)</option>
                        <option value="1.375">Lightly active (light exercise 1-3 days/week)</option>
                        <option value="1.55">Moderately active (moderate exercise 3-5 days/week)</option>
                        <option value="1.725">Very active (hard exercise 6-7 days/week)</option>
                        <option value="1.9">Super active (very hard exercise & physical job)</option>
                    </select>
                </div>

                <button type="submit" className="btn-primary w-full mt-4">Calculate</button>
            </form>

            {result && (
                <div className="mt-8 p-4 bg-darker/50 rounded-lg border border-text/10 animate-fade-in shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-center text-text">Your Results</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-card rounded-lg border border-text/5">
                            <p className="text-sm text-text-muted">BMR (Basal Metabolic Rate)</p>
                            <p className="text-2xl font-bold text-secondary">{result.bmr} <span className="text-sm font-normal text-text-muted">kcal</span></p>
                        </div>
                        <div className="p-3 bg-card rounded-lg border border-primary/30 shadow-sm shadow-primary/10">
                            <p className="text-sm text-text-muted">Maintenance Calories (TDEE)</p>
                            <p className="text-2xl font-bold text-primary">{result.tdee} <span className="text-sm font-normal text-text-muted">kcal</span></p>
                        </div>
                    </div>
                    <p className="text-xs text-center mt-4 text-text-muted">
                        To lose weight, aim for {result.tdee - 500} kcal/day. To gain, aim for {result.tdee + 500} kcal/day.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CalorieCalculator;
