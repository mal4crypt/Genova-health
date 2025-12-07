import React from 'react';

// Skeleton Components for Loading States
export const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="skeleton h-6 w-3/4 rounded mb-4"></div>
        <div className="skeleton h-4 w-full rounded mb-2"></div>
        <div className="skeleton h-4 w-5/6 rounded mb-4"></div>
        <div className="flex gap-2 mt-4">
            <div className="skeleton h-10 w-24 rounded"></div>
            <div className="skeleton h-10 w-24 rounded"></div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                        <div className="skeleton h-4 w-1/2 rounded mb-2"></div>
                        <div className="skeleton h-3 w-3/4 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <div key={i} className="skeleton h-4 rounded"></div>
                ))}
            </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700 p-4 last:border-0">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <div key={colIndex} className="skeleton h-4 rounded"></div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

// Spinner Component
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`${sizes[size]} ${className}`}>
            <svg
                className="animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
        </div>
    );
};

// Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        </div>
    </div>
);

// Progress Bar
export const ProgressBar = ({ progress = 0, showPercentage = true, className = '' }) => (
    <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-2">
            {showPercentage && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(progress)}%
                </span>
            )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    </div>
);

// Pulse Dot (for live indicators)
export const PulseDot = ({ color = 'green', size = 'sm' }) => {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    const colors = {
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500'
    };

    return (
        <span className="relative flex">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full ${sizes[size]} ${colors[color]}`}></span>
        </span>
    );
};

export default {
    SkeletonCard,
    SkeletonList,
    SkeletonTable,
    Spinner,
    LoadingOverlay,
    ProgressBar,
    PulseDot
};
