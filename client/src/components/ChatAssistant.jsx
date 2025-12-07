import React, { useState, useEffect, useRef } from 'react';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Namaste! Main hoon aapka fitness coach. Bataiye aaj kya khaya ya koi sawaal hai?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const systemPrompt = `
        You are a friendly and knowledgeable fitness coach.
        
        CRITICAL INSTRUCTIONS:
        1. **LANGUAGE**: You MUST reply in **Hinglish** (Hindi written in English script). Example: "Haan bhai, protein toh zaruri hai."
        2. **TONE**: Motivational, bro-to-bro, helpful.
        3. **FOOD LOGGING**: If the user mentions food (e.g., "maine 2 roti khayi"), estimate calories/macros and output a JSON block at the end.
        
        JSON Format (Strictly at the end):
        |||JSON_START|||
        {
          "food": "Summary of food",
          "calories": 150, // MUST be a number (integer). No text like "approx" or "kcal".
          "protein": 10, // MUST be a number (grams).
          "carbs": 20, // MUST be a number (grams).
          "fats": 5 // MUST be a number (grams).
        }
        |||JSON_END|||
        
        IMPORTANT: 
        - If a range is estimated (e.g., 100-150), pick the AVERAGE (e.g., 125).
        - Do NOT include units (g, kcal) in the values. ONLY NUMBERS.
        
        EXAMPLES:
        User: "I ate 2 eggs"
        Assistant: "Great choice! Eggs are rich in protein. |||JSON_START||| { \"food\": \"2 eggs\", \"calories\": 140, \"protein\": 12, \"carbs\": 1, \"fats\": 10 } |||JSON_END|||"
        
        User: "Maine 1 roti aur dal khayi"
        Assistant: "Badhiya bhai! Ghar ka khana best hai. |||JSON_START||| { \"food\": \"1 Roti + Dal\", \"calories\": 180, \"protein\": 8, \"carbs\": 30, \"fats\": 4 } |||JSON_END|||"
      `;

            const conversation = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
            const fullPrompt = `${systemPrompt}\n\nChat History:\n${conversation}\nUser: ${userMessage.content}\nAssistant:`;

            const response = await fetch('/api/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                }),
            });

            if (!response.ok) throw new Error('AI Connection Failed');

            const data = await response.json();
            let aiText = data.response;

            const jsonMatch = aiText.match(/\|\|\|JSON_START\|\|\|([\s\S]*?)\|\|\|JSON_END\|\|\|/);

            if (jsonMatch) {
                try {
                    const foodData = JSON.parse(jsonMatch[1]);

                    // Save to JSON Server
                    // Save to DB
                    await fetch('/api/logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: String(Date.now()),
                            date: new Date().toLocaleDateString(),
                            ...foodData
                        })
                    });

                    aiText = aiText.replace(jsonMatch[0], '').trim();

                    // Refresh Dashboard (if implemented via context/event, or just rely on next fetch)
                    // For now, simple reload or event dispatch if needed.
                    window.dispatchEvent(new Event('db-update'));

                } catch (e) {
                    console.error("Failed to parse/save food JSON", e);
                }
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Bhai, connection error aa raha hai. Server check kar lo!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-glow flex items-center justify-center z-50 hover:scale-110 transition-transform"
            >
                {isOpen ? (
                    <span className="text-darker text-2xl font-bold">✕</span>
                ) : (
                    <span className="text-darker text-2xl">💬</span>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-card border border-gray-800 rounded-2xl shadow-luxury flex flex-col z-50 overflow-hidden animate-fade-in-up">
                    <div className="bg-darker p-4 border-b border-gray-800 flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="font-bold text-primary">Fitness Coach</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-darker/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-darker font-bold rounded-tr-none'
                                        : 'bg-card text-gray-300 rounded-tl-none border border-gray-700'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-card p-3 rounded-xl rounded-tl-none border border-gray-700">
                                    <span className="text-gray-500 text-xs animate-pulse">Typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-darker border-t border-gray-800">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Likho yahan..."
                                className="flex-1 bg-card border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-white"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-primary text-darker p-2 rounded-lg hover:bg-opacity-80 disabled:opacity-50"
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
