import React from 'react';
import { AlertTriangle, FileText, CheckCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';

const EmptyState = ({
    icon: Icon = FileText,
    title = 'No data available',
    description = 'There are no items to display at the moment.',
    action,
    actionLabel = 'Add New',
    variant = 'default'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            <div className="relative mb-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="relative z-10 bg-muted/50 backdrop-blur-xl rounded-[2rem] p-8 border border-border/50 shadow-inner"
                >
                    <Icon className="w-16 h-16 text-muted-foreground/60" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 -z-0" />
            </div>

            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-muted-foreground mb-10 max-w-sm leading-relaxed text-sm font-medium">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action}
                    className="rounded-2xl px-10 h-14 shadow-lg shadow-primary/20 gap-2 text-base"
                >
                    <Plus className="w-5 h-5" />
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
};

// Pre-configured variants
export const EmptyPrescriptions = ({ onAdd }) => (
    <EmptyState
        icon={FileText}
        title="No Clinical Records"
        description="Your digital prescription vault is empty. Once a doctor issues a prescription, it will appear here instantly."
        action={onAdd}
        actionLabel="New Request"
    />
);

export const EmptyAppointments = ({ onBook }) => (
    <EmptyState
        icon={CheckCircle}
        title="Clear Schedule"
        description="You have no upcoming appointments. Staying on top of your health starts with a simple checkup."
        action={onBook}
        actionLabel="Find a Doctor"
    />
);

export const EmptyDeliveries = () => (
    <EmptyState
        icon={AlertTriangle}
        title="No Assignments"
        description="Your delivery queue is currently empty. New patient requests will appear here as they come in."
    />
);

export const EmptyChat = () => (
    <EmptyState
        icon={FileText}
        title="Quiet for now"
        description="Select a contact or professional to start a secure conversation and get the care you need."
    />
);

export default EmptyState;
