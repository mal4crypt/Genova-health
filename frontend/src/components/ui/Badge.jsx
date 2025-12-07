import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-light text-primary',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        pending: 'bg-orange-100 text-orange-800',
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-600'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span className={`
            inline-flex items-center rounded-full font-medium
            ${variants[variant] || variants.default}
            ${sizes[size]}
        `}>
            {children}
        </span>
    );
};

export default Badge;
