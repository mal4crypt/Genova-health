import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Activity, Package, TrendingUp, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import { SkeletonCard } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const EnhancedAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const toast = useToast();

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, [selectedRole]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            toast?.error('Failed to load statistics');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const role = selectedRole === 'all' ? 'patient' : selectedRole;
            const response = await fetch(`http://localhost:5000/api/admin/users/${role}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data.users || []);
        } catch (error) {
            toast?.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyProvider = async (providerId, providerType, verified) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/admin/verify/${providerType}/${providerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verified })
            });
            toast?.success(`Provider ${verified ? 'verified' : 'unverified'} successfully`);
            fetchUsers();
        } catch (error) {
            toast?.error('Failed to update verification status');
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, color = 'primary' }) => (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
                    <Icon className={`w-8 h-8 text-${color}-500`} />
                </div>
            </div>
        </Card>
    );

    const UserTable = ({ users, role }) => {
        const filteredUsers = users.filter(user =>
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (loading) {
            return <SkeletonCard />;
        }

        if (filteredUsers.length === 0) {
            return <EmptyState title={`No ${role} found`} description="No users match your search criteria" />;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            {(role === 'doctors' || role === 'nurses') && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Verification
                                </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {user.full_name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={user.is_verified ? 'success' : 'warning'}>
                                        {user.is_verified ? 'Active' : 'Pending'}
                                    </Badge>
                                </td>
                                {(role === 'doctors' || role === 'nurses') && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() =>
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    title: `${user.is_verified ? 'Unverify' : 'Verify'} Provider`,
                                                    message: `Are you sure you want to ${user.is_verified ? 'unverify' : 'verify'} this ${role === 'doctors' ? 'doctor' : 'nurse'}?`,
                                                    onConfirm: () => handleVerifyProvider(
                                                        user.id,
                                                        role === 'doctors' ? 'doctor' : 'nurse',
                                                        !user.is_verified
                                                    )
                                                })
                                            }
                                            className={`px-3 py-1 rounded text-sm ${user.is_verified
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                } transition-colors`}
                                        >
                                            {user.is_verified ? 'Unverify' : 'Verify'}
                                        </button>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-primary hover:text-primary-600 font-medium">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage users, monitor activity, and oversee platform operations
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    <StatCard
                        icon={Users}
                        label="Total Users"
                        value={stats?.totalUsers || 0}
                        trend="+12% this month"
                        color="primary"
                    />
                    <StatCard
                        icon={UserCheck}
                        label="Verified Providers"
                        value={stats?.verifiedProviders || 0}
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
                        label="Pending Deliveries"
                        value={stats?.pendingDeliveries || 0}
                        color="warning"
                    />
                </div>

                {/* Search */}
                <SearchBar
                    placeholder="Search users by name or email..."
                    onSearch={setSearchQuery}
                    className="mb-6"
                />

                {/* User Management Tabs */}
                <Card>
                    <Tabs
                        defaultTab={0}
                        tabs={[
                            {
                                label: 'Patients',
                                count: stats?.patientCount,
                                content: <UserTable users={users} role="patients" />
                            },
                            {
                                label: 'Doctors',
                                count: stats?.doctorCount,
                                content: <UserTable users={users} role="doctors" />
                            },
                            {
                                label: 'Nurses',
                                count: stats?.nurseCount,
                                content: <UserTable users={users} role="nurses" />
                            },
                            {
                                label: 'Drivers',
                                count: stats?.driverCount,
                                content: <UserTable users={users} role="drivers" />
                            }
                        ]}
                    />
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </div>
    );
};

export default EnhancedAdminDashboard;
