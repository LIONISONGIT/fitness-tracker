import React, { useState, useEffect } from 'react';

const JourneyTracker = () => {
    const [entries, setEntries] = useState([]);
    const [weight, setWeight] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('fitness-journey');
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    const addEntry = (e) => {
        e.preventDefault();
        if (!weight) return;

        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            weight: parseFloat(weight)
        };

        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem('fitness-journey', JSON.stringify(updatedEntries));
        setWeight('');
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear your history?')) {
            setEntries([]);
            localStorage.removeItem('fitness-journey');
        }
    }

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-secondary">Fitness Journey Tracker</h2>

            <form onSubmit={addEntry} className="flex gap-4 mb-8">
                <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Current Weight (kg)"
                    className="input-field flex-1"
                    step="0.1"
                />
                <button type="submit" className="btn-secondary whitespace-nowrap">Log Weight</button>
            </form>

            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-text">History</h3>
                    {entries.length > 0 && (
                        <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-400 font-medium">Clear History</button>
                    )}
                </div>

                {entries.length === 0 ? (
                    <p className="text-text-muted text-center py-8">No entries yet. Start tracking today!</p>
                ) : (
                    <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {entries.map((entry) => (
                            <div key={entry.id} className="flex justify-between items-center p-3 bg-darker/50 rounded-lg border border-text/10 hover:border-text/20 transition-colors">
                                <span className="text-text-muted">{entry.date}</span>
                                <span className="font-bold text-text">{entry.weight} kg</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JourneyTracker;
