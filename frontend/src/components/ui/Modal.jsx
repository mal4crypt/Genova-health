import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative bg-white rounded-t-2xl md:rounded-lg shadow-xl
                w-full ${sizeClasses[size]}
                mx-0 md:mx-4
                max-h-[90vh] md:max-h-[85vh]
                overflow-y-auto
                animate-slide-up md:animate-none
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 pb-safe-bottom">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
