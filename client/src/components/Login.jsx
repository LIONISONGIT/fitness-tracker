import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            localStorage.setItem('token', data.token);
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-darker flex items-center justify-center p-4">
            <div className="card w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary">Login</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Username</label>
                        <input
                            type="text"
                            className="input-field w-full"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field w-full"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                        {loading ? "Logging in..." : "Enter"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
