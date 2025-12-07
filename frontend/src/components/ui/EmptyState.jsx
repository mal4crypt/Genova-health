import React from 'react';
import { AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const EmptyState = ({
    icon: Icon = FileText,
    title = 'No data available',
    description = 'There are no items to display at the moment.',
    action,
    actionLabel = 'Add New'
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
                <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                {description}
            </p>
            {action && (
                <button
                    onClick={action}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

// Pre-configured variants
export const EmptyPrescriptions = ({ onAdd }) => (
    <EmptyState
        icon={FileText}
        title="No prescriptions yet"
        description="You haven't created any prescriptions. Click the button below to create your first prescription."
        action={onAdd}
        actionLabel="Create Prescription"
    />
);

export const EmptyAppointments = ({ onBook }) => (
    <EmptyState
        icon={CheckCircle}
        title="No appointments scheduled"
        description="You don't have any upcoming appointments. Book a consultation with a healthcare provider."
        action={onBook}
        actionLabel="Book Appointment"
    />
);

export const EmptyDeliveries = () => (
    <EmptyState
        icon={AlertTriangle}
        title="No deliveries assigned"
        description="You don't have any active deliveries at the moment. Check back later for new assignments."
    />
);

export const EmptyChat = () => (
    <EmptyState
        icon={FileText}
        title="No conversations"
        description="Start a conversation with a healthcare provider to get assistance."
    />
);

export default EmptyState;
