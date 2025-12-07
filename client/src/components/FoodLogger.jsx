import React, { useState, useEffect } from 'react';

const FoodLogger = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs');
            if (res.ok) {
                const data = await res.json();
                // Filter for today's logs if that's the intent, or show all. 
                // The UI says "Today's Logs", so we filter client-side for now.
                const today = new Date().toLocaleDateString();
                setLogs(data.filter(l => l.date === today));
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
        }
    };

    const analyzeFood = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const prompt = `
        You are a nutritionist API. Analyze the following food text and return a JSON object with the estimated calories and macros. 
        Format: {"food": "Food Name", "calories": 0, "protein": 0, "carbs": 0, "fats": 0}.
        Only return the JSON, no other text.
        Input: "${input}"
      `;

            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const data = await response.json();
            const result = JSON.parse(data.response);

            const newLogPayload = {
                id: String(Date.now()), // ensure string id
                date: new Date().toLocaleDateString(),
                ...result
            };

            // Save to DB
            const saveRes = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLogPayload)
            });

            if (saveRes.ok) {
                const savedLog = await saveRes.json();
                setLogs([savedLog, ...logs]);
            } else {
                setError('Failed to save log to database');
            }

            setInput('');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Could not analyze food. Make sure Ollama is running.');
        } finally {
            setLoading(false);
        }
    };

    const deleteLog = async (id) => {
        try {
            await fetch(`/api/logs/${id}`, { method: 'DELETE' });
            setLogs(logs.filter(log => log.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary">AI Food Logger</h2>

            <form onSubmit={analyzeFood} className="mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., I ate 2 eggs and a slice of toast"
                        className="input-field pr-24"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-1 top-1 bottom-1 btn-primary !py-1 !px-3 text-sm"
                    >
                        {loading ? 'Analyzing...' : 'Log Food'}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Today's Logs</h3>

                {logs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No food logged yet.</p>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 bg-dark rounded-lg border border-gray-800 flex justify-between items-center animate-fade-in">
                                <div>
                                    <p className="font-bold text-white text-lg">{log.food}</p>
                                    <p className="text-sm text-gray-400">
                                        <span className="text-primary">{log.calories} kcal</span> •
                                        P: {log.protein}g • C: {log.carbs}g • F: {log.fats}g
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteLog(log.id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodLogger;
