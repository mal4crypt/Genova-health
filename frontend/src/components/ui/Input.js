import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`
          flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-error focus:ring-error' : ''}
        `}
                {...props}
            />
            {error && (
                <span className="text-xs text-error">{error}</span>
            )}
        </div>
    );
};

export default Input;
