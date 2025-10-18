
import React from 'react';

export type SpriteMood = 'idle' | 'talking' | 'happy' | 'thinking';

interface SpriteProps {
    mood: SpriteMood;
}

export const Sprite: React.FC<SpriteProps> = ({ mood }) => {
    const eyeClass = "transition-all duration-300";
    const mouthClass = "transition-all duration-300 fill-slate-700";

    let eyeTransform = "";
    let mouthPath = "M 40 78 Q 50 78 60 78"; // Neutral

    switch (mood) {
        case 'talking':
            mouthPath = "M 42 78 Q 50 82 58 78"; // Slightly open
            break;
        case 'happy':
            mouthPath = "M 40 76 Q 50 86 60 76"; // Big smile
            break;
        case 'thinking':
            eyeTransform = "translate(8, -2)";
            mouthPath = "M 45 78 L 55 78"; // Flat line
            break;
        case 'idle':
        default:
            break;
    }

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <defs>
                <radialGradient id="grad-body" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
                </radialGradient>
                 <radialGradient id="grad-eye" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                    <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
                </radialGradient>
            </defs>
            
            {/* Body */}
            <path d="M 50 10 C 20 10, 10 40, 10 60 C 10 90, 40 95, 50 95 C 60 95, 90 90, 90 60 C 90 40, 80 10, 50 10 Z" fill="url(#grad-body)" />
            
            {/* Eyes */}
            <g transform={eyeTransform} className={eyeClass}>
                <circle cx="35" cy="55" r="10" fill="url(#grad-eye)" />
                <circle cx="65" cy="55" r="10" fill="url(#grad-eye)" />
                <circle cx="37" cy="56" r="4" fill="#1e293b" className="animate-pulse" />
                <circle cx="63" cy="56" r="4" fill="#1e293b" className="animate-pulse" />
            </g>

            {/* Mouth */}
            <path d={mouthPath} stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" className={mouthClass}/>

        </svg>
    );
};
