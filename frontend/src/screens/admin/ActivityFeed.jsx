import React, { useState, useEffect } from 'react';
import { Pill, Truck, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { SkeletonCard } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const ActivityFeed = () => {
    const [activities, setActivities] = useState({ prescriptions: [], deliveries: [], chats: [] });
    const [allActivities, setAllActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/activity`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            setActivities(data);

            // Merge and sort all activities by created_at
            const merged = [
                ...data.prescriptions.map(p => ({ ...p, type: 'prescription', icon: Pill, color: 'blue' })),
                ...data.deliveries.map(d => ({ ...d, type: 'delivery', icon: Truck, color: 'orange' })),
                ...data.chats.map(c => ({ ...c, type: 'chat', icon: MessageSquare, color: 'green' }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setAllActivities(merged);
        } catch (error) {
            toast?.error('Failed to load activity feed');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const ActivityItem = ({ item }) => {
        const Icon = item.icon;

        let title = '';
        let description = '';

        if (item.type === 'prescription') {
            title = 'New Prescription Created';
            description = `${item.doctor_name} prescribed ${item.medication} for ${item.patient_name}`;
        } else if (item.type === 'delivery') {
            title = 'Delivery Order Updated';
            description = `Delivery for ${item.patient_name} is now ${item.status.replace('_', ' ')}`;
        } else if (item.type === 'chat') {
            title = 'New Chat Session';
            description = `${item.patient_name} started a new consultation`;
        }

        return (
            <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg">
                <div className={`p-3 rounded-full h-fit bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(item.created_at)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700`}>
                            {item.status}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <SkeletonCard />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <button
                    onClick={fetchActivity}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Refresh Activity"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <Card className="p-0 overflow-hidden">
                {allActivities.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {allActivities.map((item) => (
                            <ActivityItem key={`${item.type}-${item.id}`} item={item} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Recent Activity"
                        description="System events will appear here"
                    />
                )}
            </Card>
        </div>
    );
};

export default ActivityFeed;
