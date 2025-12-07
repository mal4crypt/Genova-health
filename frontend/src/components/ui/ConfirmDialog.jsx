import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger' // 'danger', 'warning', 'info'
}) => {
    const variantStyles = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        info: 'bg-primary hover:bg-primary-600'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                    {message}
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${variantStyles[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
