import React from 'react';

interface ProgressBarProps {
    value: number;
    label: string;
    color?: string; // e.g., 'bg-blue-600', 'bg-green-600', 'bg-red-600'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, color = 'bg-blue-600' }) => {
    // Ensure progress value is between 0 and 100.
    const progress = Math.min(Math.max(value, 0), 100);

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-white text-shadow">{label}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-white text-shadow">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 border-2 border-gray-600">
                <div 
                    className={`${color} h-full rounded-full transition-all duration-300 ease-linear`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};
