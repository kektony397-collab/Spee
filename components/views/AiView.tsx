
import React, { useState } from 'react';
import { speak } from '../../services/geminiService';

interface AiViewProps {
    onGetAdvice: () => void;
    advice: string;
    isLoading: boolean;
    isTracking: boolean;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-400 animate-bounce"></div>
    </div>
);

export const AiView: React.FC<AiViewProps> = ({ onGetAdvice, advice, isLoading, isTracking }) => {
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    
    const handleSpeak = () => {
        if (advice) {
            speak(advice);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-4 bg-slate-800/50 rounded-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-cyan-400">AI Mileage Coach</h2>
            <p className="text-center text-slate-400">
                After a trip, get personalized advice from Gemini to improve your fuel efficiency.
            </p>

            <button
                onClick={onGetAdvice}
                disabled={isLoading || isTracking}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-full transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    'Analyzing...'
                ) : (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Analyze My Last Trip
                    </>
                )}
            </button>
            
            {isTracking && (
                <p className="text-xs text-yellow-400 text-center">Stop tracking to analyze your trip.</p>
            )}

            <div className="w-full min-h-[150px] bg-slate-900/50 p-4 rounded-lg">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <LoadingSpinner />
                        <p className="mt-4">Gemini is thinking...</p>
                    </div>
                ) : advice ? (
                    <div className="prose prose-invert prose-sm text-slate-300 whitespace-pre-wrap">
                       {advice.split('\n').map((line, index) => <p key={index} className="my-1">{line}</p>)}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center flex items-center justify-center h-full">
                        Your mileage advice will appear here.
                    </p>
                )}
            </div>
            
            {advice && !isLoading && (
                 <button 
                    onClick={handleSpeak}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 2a1 1 0 00-1 1v1a1 1 0 002 0V6a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v1a1 1 0 002 0V6a1 1 0 00-1-1zM6 8a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 2a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm3-3a1 1 0 100 2h.01a1 1 0 100-2H11zm2 2a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4 10a6 6 0 1112 0 6 6 0 01-12 0z" clipRule="evenodd" />
                    </svg>
                    Read Aloud
                </button>
            )}

        </div>
    );
};
