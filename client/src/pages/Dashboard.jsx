import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        caloriesConsumed: 0,
        logsCount: 0
    });
    const [chartData, setChartData] = useState([]);
    const [macroData, setMacroData] = useState([]);

    const COLORS = ['#d4c5a5', '#90ee90', '#60a5fa']; // Protein (Beige), Carbs (Light Green), Fats (Blue)

    useEffect(() => {
        fetchData();
    }, []);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/logs', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const logs = await response.json();

            // Calculate today's stats
            // Fix: Use YYYY-MM-DD for consistent comparison across devices
            const today = new Date().toISOString().split('T')[0];
            const todaysLogs = logs.filter(log => {
                // Determine if log.date matches today. 
                // Handle legacy data (M/D/YYYY) vs new data (YYYY-MM-DD)
                // We will try to normalize log.date to YYYY-MM-DD for comparison if possible, or just strict match if we migrate everything.
                // For now, strict match assuming new logs will be YYYY-MM-DD.
                // To be safe for mixed data during transition:
                return log.date === today || new Date(log.date).toISOString().split('T')[0] === today;
            });
            const calories = todaysLogs.reduce((acc, log) => acc + (log.calories || 0), 0);

            // Prepare Chart Data (Last 7 entries/days)
            // Group by date for a real chart
            const grouped = logs.reduce((acc, log) => {
                // Notify: Grouping might need normalization too if mixed formats exist
                const dateKey = log.date;
                acc[dateKey] = (acc[dateKey] || 0) + log.calories;
                return acc;
            }, {});

            const data = Object.keys(grouped).map(date => ({
                name: date, // Keep full date for now, or format cleanly
                calories: grouped[date]
            })).slice(-7); // Last 7 days

            // Prepare Macro Data
            const macros = todaysLogs.reduce((acc, log) => {
                acc.protein += log.protein || 0;
                acc.carbs += log.carbs || 0;
                acc.fats += log.fats || 0;
                return acc;
            }, { protein: 0, carbs: 0, fats: 0 });

            const pieData = [
                { name: 'Protein', value: macros.protein },
                { name: 'Carbs', value: macros.carbs },
                { name: 'Fats', value: macros.fats },
            ];

            setStats({
                caloriesConsumed: calories,
                logsCount: logs.length
            });
            setChartData(data);
            setMacroData(pieData);
            setError(null);

        } catch (error) {
            console.error("Failed to fetch data", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                    Error loading data: {error}
                </div>
            )}
            {loading && <div className="text-center text-primary animate-pulse">Loading dashboard...</div>}
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-l-4 border-l-primary bg-gradient-to-br from-card to-darker">
                    <h3 className="text-secondary text-xs font-bold uppercase tracking-widest">Calories Today</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">{stats.caloriesConsumed}</span>
                        <span className="text-sm text-text-muted">kcal</span>
                    </div>
                    <div className="mt-4 w-full bg-darker/50 rounded-full h-1">
                        <div
                            className="bg-primary h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((stats.caloriesConsumed / 2500) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="card border-l-4 border-l-secondary bg-gradient-to-br from-card to-darker">
                    <h3 className="text-secondary text-xs font-bold uppercase tracking-widest">Total Logs</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-text">{stats.logsCount}</span>
                        <span className="text-sm text-text-muted">entries</span>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Consistent tracking is key.</p>
                </div>

                <div className="card border-l-4 border-l-text/10 bg-gradient-to-br from-card to-darker flex flex-col justify-center items-center text-center">
                    <h3 className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Status</h3>
                    <span className="text-green-500 font-bold tracking-wider text-sm">● ACTIVE</span>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Area Chart */}
                <div className="card h-[350px]">
                    <h3 className="text-lg font-bold mb-6 text-text">Calorie Trend</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-muted)" strokeOpacity={0.2} vertical={false} />
                            <XAxis dataKey="name" stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--color-text-muted)" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-text-muted)', borderRadius: '8px', color: 'var(--color-text)' }}
                                itemStyle={{ color: 'var(--color-primary)' }}
                            />
                            <Area type="monotone" dataKey="calories" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="card h-[350px]">
                    <h3 className="text-lg font-bold mb-6 text-text">Today's Macros</h3>
                    <div className="flex items-center justify-center h-[85%]">
                        {stats.caloriesConsumed > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={macroData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {macroData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-text-muted)', borderRadius: '8px', color: 'var(--color-text)' }}
                                        itemStyle={{ color: 'var(--color-text)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-text-muted text-sm">Log food to see breakdown</div>
                        )}
                    </div>
                    {stats.caloriesConsumed > 0 && (
                        <div className="flex justify-center gap-4 text-xs text-text-muted mt-[-20px]">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[0] }}></span> Protein</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[1] }}></span> Carbs</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[2] }}></span> Fats</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
