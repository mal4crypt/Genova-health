import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Activity, Package, LayoutDashboard, ClipboardList } from 'lucide-react';
import Card from '../../components/ui/Card';
import { SkeletonCard } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

// Sub-components
import UserManagement from './UserManagement';
import ActivityFeed from './ActivityFeed';
import PendingApprovals from './PendingApprovals';

const EnhancedAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const toast = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats', error);
        }
    };

    const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
                    <Icon className={`w-8 h-8 text-${color}-500`} />
                </div>
            </div>
        </Card>
    );

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'approvals', label: 'Pending Approvals', icon: UserCheck },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
            {/* Top Navigation Bar / Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Area</h1>
                        <p className="text-sm text-gray-500">System Overview & Management</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === item.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <item.icon size={16} />
                                {item.label}
                                {item.id === 'approvals' && (stats?.verified?.doctors + stats?.verified?.nurses < stats?.totalUsers) && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">!</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard
                                icon={Users}
                                label="Total Users"
                                value={stats?.totalUsers || 0}
                                color="primary"
                            />
                            <StatCard
                                icon={UserCheck}
                                label="Verified Staff"
                                value={(stats?.verified?.doctors || 0) + (stats?.verified?.nurses || 0)}
                                color="success"
                            />
                            <StatCard
                                icon={Activity}
                                label="Active Chats"
                                value={stats?.activeChats || 0}
                                color="info"
                            />
                            <StatCard
                                icon={Package}
                                label="Active Deliveries"
                                value={stats?.activeDeliveries || 0}
                                color="warning"
                            />
                        </div>

                        {/* Recent Activity Section */}
                        <ActivityFeed />
                    </div>
                )}

                {activeTab === 'users' && (
                    <UserManagement />
                )}

                {activeTab === 'approvals' && (
                    <PendingApprovals />
                )}
            </div>
        </div>
    );
};

export default EnhancedAdminDashboard;
