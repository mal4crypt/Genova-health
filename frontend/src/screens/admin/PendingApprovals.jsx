import React, { useState, useEffect } from 'react';
import { UserCheck, XCircle, CheckCircle, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { SkeletonCard } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const PendingApprovals = () => {
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const toast = useToast();

    useEffect(() => {
        fetchPendingProviders();
    }, []);

    const fetchPendingProviders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [docRes, nurseRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/users/doctor', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/admin/users/nurse', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const docData = await docRes.json();
            const nurseData = await nurseRes.json();

            // Filter for unverified only
            setDoctors(docData.users.filter(u => !u.is_verified));
            setNurses(nurseData.users.filter(u => !u.is_verified));
        } catch (error) {
            toast?.error('Failed to load pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, type) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/admin/verify/${type}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verified: true })
            });
            toast?.success('Provider approved successfully');
            fetchPendingProviders();
        } catch (error) {
            toast?.error('Failed to approve provider');
        }
    };

    const ApprovalCard = ({ user, type }) => (
        <Card className="p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full h-fit">
                        <UserCheck className="text-gray-600 dark:text-gray-400" size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg">{user.full_name}</h4>
                        <p className="text-sm text-gray-500 mb-1">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                        <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2">
                                <strong>Email:</strong> {user.email}
                            </span>
                            {user.license_number && (
                                <span className="flex items-center gap-2">
                                    <strong>License:</strong> {user.license_number}
                                </span>
                            )}
                            {user.specialty && (
                                <span className="flex items-center gap-2">
                                    <strong>Specialty:</strong> {user.specialty}
                                </span>
                            )}
                            {user.hospital && (
                                <span className="flex items-center gap-2">
                                    <strong>Hospital:</strong> {user.hospital}
                                </span>
                            )}
                        </div>
                        <div className="mt-3">
                            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                <FileText size={14} /> View Documents
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setConfirmDialog({
                            isOpen: true,
                            title: 'Approve Provider',
                            message: `Are you sure you want to approve ${user.full_name} as a ${type}? They will be able to access the platform.`,
                            onConfirm: () => handleVerify(user.id, type)
                        })}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                        <CheckCircle size={16} /> Approve
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        <XCircle size={16} /> Reject
                    </button>
                </div>
            </div>
        </Card>
    );

    if (loading) return <SkeletonCard />;

    // Combine lists
    const hasPending = doctors.length > 0 || nurses.length > 0;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">Pending Approvals</h2>

            {!hasPending ? (
                <EmptyState
                    title="All Caught Up!"
                    description="There are no pending provider approvals at this time."
                    icon={UserCheck}
                />
            ) : (
                <div className="space-y-6">
                    {doctors.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Doctors ({doctors.length})</h3>
                            <div className="grid gap-4">
                                {doctors.map(doc => <ApprovalCard key={doc.id} user={doc} type="doctor" />)}
                            </div>
                        </div>
                    )}

                    {nurses.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Nurses ({nurses.length})</h3>
                            <div className="grid gap-4">
                                {nurses.map(nurse => <ApprovalCard key={nurse.id} user={nurse} type="nurse" />)}
                            </div>
                        </div>
                    )}
                </div>
            )}

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

export default PendingApprovals;
