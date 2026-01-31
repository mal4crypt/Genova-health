import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import { SkeletonCard } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import { API_URL } from '../../config';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('patient');
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const toast = useToast();

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/users/${selectedRole}`, {
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
            await fetch(`${API_URL}/admin/verify/${providerType}/${providerId}`, {
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

    const UserTable = () => {
        const filteredUsers = users.filter(user =>
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (loading) {
            return <SkeletonCard />;
        }

        if (filteredUsers.length === 0) {
            return <EmptyState title={`No ${selectedRole}s found`} description="No users match your search criteria" />;
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
                            {(selectedRole === 'doctor' || selectedRole === 'nurse') && (
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
                                {(selectedRole === 'doctor' || selectedRole === 'nurse') && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() =>
                                                setConfirmDialog({
                                                    isOpen: true,
                                                    title: `${user.is_verified ? 'Unverify' : 'Verify'} Provider`,
                                                    message: `Are you sure you want to ${user.is_verified ? 'unverify' : 'verify'} this ${selectedRole}?`,
                                                    onConfirm: () => handleVerifyProvider(
                                                        user.id,
                                                        selectedRole,
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
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {['patient', 'doctor', 'nurse', 'driver'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedRole === role
                                    ? 'bg-white dark:bg-gray-700 shadow text-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {role.charAt(0).toUpperCase() + role.slice(1)}s
                            </button>
                        ))}
                    </div>
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <UserTable />
            </Card>

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

export default UserManagement;
