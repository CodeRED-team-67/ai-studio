import React from 'react';

// A simple, friendly robot sprite to add some personality.
export const Sprite: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="crispEdges"
        >
            {/* Head */}
            <rect x="25" y="20" width="50" height="40" rx="10" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="2" />
            {/* Antenna */}
            <line x1="50" y1="20" x2="50" y2="10" stroke="#BDBDBD" strokeWidth="2" />
            <circle cx="50" cy="8" r="3" fill="#64B5F6" />
            {/* Eyes */}
            <circle cx="40" cy="40" r="5" fill="white" />
            <circle cx="60" cy="40" r="5" fill="white" />
            <circle cx="41" cy="41" r="2" fill="black" />
            <circle cx="61" cy="41" r="2" fill="black" />
            {/* Body */}
            <rect x="30" y="60" width="40" height="30" rx="5" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="2" />
             {/* Smile */}
            <path d="M 40 50 Q 50 55 60 50" stroke="#757575" strokeWidth="2" fill="none" />
        </svg>
    );
};