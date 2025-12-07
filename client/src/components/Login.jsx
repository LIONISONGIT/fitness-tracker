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
                throw new Error('Access Denied');
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
        <div className="min-h-screen bg-darker flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="card w-full max-w-md relative z-10 backdrop-blur-2xl border-opacity-30 bg-black/40 shadow-2xl animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight mb-2">
                        LION SYSTEM
                    </h1>
                    <p className="text-primary/60 text-xs tracking-[0.3em] uppercase">Secure Access Terminal</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-mono">
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                        <label className="block text-primary/80 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Identity</label>
                        <input
                            type="text"
                            className="input-field text-lg font-mono tracking-wide"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            placeholder="USERNAME"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-primary/80 text-xs font-bold uppercase tracking-wider mb-2 group-focus-within:text-white transition-colors">Passcode</label>
                        <input
                            type="password"
                            className="input-field text-lg font-mono tracking-widest"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-8 relative overflow-hidden group">
                        <span className="relative z-10 group-hover:tracking-[0.2em] transition-all">
                            {loading ? "AUTHENTICATING..." : "INITIALIZE"}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-xs font-mono">SYSTEM V.2.5 [SECURE]</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
