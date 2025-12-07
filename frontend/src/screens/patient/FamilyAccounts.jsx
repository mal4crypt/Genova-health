import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, Shield, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';

const FamilyAccounts = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);
    const toast = useToast();

    const [newMember, setNewMember] = useState({
        name: '',
        relationship: '',
        dateOfBirth: '',
        email: '',
        permissions: []
    });

    useEffect(() => {
        fetchFamilyMembers();
        loadCurrentAccount();
    }, []);

    const fetchFamilyMembers = async () => {
        // Mock data
        const mockMembers = [
            {
                id: 1,
                name: 'John Doe (You)',
                relationship: 'Primary',
                age: 35,
                permissions: ['full_access'],
                isPrimary: true
            },
            {
                id: 2,
                name: 'Jane Doe',
                relationship: 'Spouse',
                age: 32,
                permissions: ['view_records', 'book_appointments'],
                isPrimary: false
            },
            {
                id: 3,
                name: 'Tommy Doe',
                relationship: 'Child',
                age: 8,
                permissions: ['view_only'],
                isPrimary: false
            }
        ];

        setFamilyMembers(mockMembers);
    };

    const loadCurrentAccount = () => {
        // Get from localStorage
        const stored = localStorage.getItem('currentFamilyAccount');
        if (stored) {
            setCurrentAccount(JSON.parse(stored));
        } else {
            setCurrentAccount({ id: 1, name: 'John Doe (You)' });
        }
    };

    const switchAccount = (member) => {
        setCurrentAccount(member);
        localStorage.setItem('currentFamilyAccount', JSON.stringify(member));
        toast?.success(`Switched to ${member.name}'s account`);
        // Reload app data for the selected member
        window.location.reload();
    };

    const addFamilMember = async (e) => {
        e.preventDefault();
        try {
            // TODO: API call
            toast?.success('Family member added successfully');
            setShowAddModal(false);
            setNewMember({
                name: '',
                relationship: '',
                dateOfBirth: '',
                email: '',
                permissions: []
            });
            fetchFamilyMembers();
        } catch (error) {
            toast?.error('Failed to add family member');
        }
    };

    const removeMember = (memberId) => {
        setFamilyMembers(members => members.filter(m => m.id !== memberId));
        toast?.success('Family member removed');
    };

    const getPermissionBadge = (permissions) => {
        if (permissions.includes('full_access')) {
            return <Badge variant="success">Full Access</Badge>;
        } else if (permissions.includes('view_records')) {
            return <Badge variant="info">Can View & Book</Badge>;
        } else {
            return <Badge variant="warning">View Only</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Family Accounts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage health records for your entire family
                        </p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>

                {/* Current Account */}
                {currentAccount && (
                    <Card className="p-6 mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-2 border-primary">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                                {currentAccount.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Currently viewing</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                    {currentAccount.name}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Family Members */}
                {familyMembers.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No family members"
                        description="Add family members to manage their health records and appointments."
                        action={() => setShowAddModal(true)}
                        actionLabel="Add Family Member"
                    />
                ) : (
                    <div className="grid gap-4">
                        {familyMembers.map((member) => (
                            <Card key={member.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-500 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                                    {member.name}
                                                </h3>
                                                {member.isPrimary && (
                                                    <Badge variant="primary">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        Primary
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                {member.relationship} • Age {member.age}
                                            </p>
                                            {getPermissionBadge(member.permissions)}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {!member.isPrimary && currentAccount?.id !== member.id && (
                                            <Button
                                                onClick={() => switchAccount(member)}
                                                className="bg-primary hover:bg-primary-600"
                                            >
                                                Switch to Account
                                            </Button>
                                        )}
                                        {currentAccount?.id === member.id && !member.isPrimary && (
                                            <Button
                                                onClick={() => switchAccount(familyMembers.find(m => m.isPrimary))}
                                                className="bg-gray-600 hover:bg-gray-700"
                                            >
                                                Switch Back
                                            </Button>
                                        )}
                                        {!member.isPrimary && (
                                            <Button
                                                onClick={() => removeMember(member.id)}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Info Card */}
                <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Permission Levels
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400">•</span>
                            <span><strong>Full Access:</strong> Can view records, book appointments, and manage account</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><strong>View & Book:</strong> Can view records and book appointments</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">•</span>
                            <span><strong>View Only:</strong> Can only view medical records</span>
                        </li>
                    </ul>
                </Card>

                {/* Add Member Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Family Member"
                    size="md"
                >
                    <form onSubmit={addFamilyMember} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                placeholder="e.g., Jane Doe"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Relationship
                                </label>
                                <select
                                    value={newMember.relationship}
                                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Child">Child</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={newMember.dateOfBirth}
                                    onChange={(e) => setNewMember({ ...newMember, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Permissions
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newMember.permissions.includes('view_records')}
                                        onChange={(e) => {
                                            const perms = e.target.checked
                                                ? [...newMember.permissions, 'view_records']
                                                : newMember.permissions.filter(p => p !== 'view_records');
                                            setNewMember({ ...newMember, permissions: perms });
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">View medical records</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newMember.permissions.includes('book_appointments')}
                                        onChange={(e) => {
                                            const perms = e.target.checked
                                                ? [...newMember.permissions, 'book_appointments']
                                                : newMember.permissions.filter(p => p !== 'book_appointments');
                                            setNewMember({ ...newMember, permissions: perms });
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Book appointments</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Add Member
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default FamilyAccounts;
