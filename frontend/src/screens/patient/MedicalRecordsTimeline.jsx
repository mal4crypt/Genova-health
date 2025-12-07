import React, { useState, useEffect } from 'react';
import { FileText, Activity, Pill, Syringe, Download, Plus, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';

const MedicalRecordsTimeline = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, prescriptions, lab_results, vaccinations
    const toast = useToast();

    const [newRecord, setNewRecord] = useState({
        type: 'lab_result',
        title: '',
        description: '',
        file: null
    });

    useEffect(() => {
        fetchRecords();
    }, [filter]);

    const fetchRecords = async () => {
        try {
            // Mock data - replace with actual API call
            const mockRecords = [
                {
                    id: 1,
                    type: 'prescription',
                    title: 'Amoxicillin 500mg',
                    description: 'Bacterial infection treatment',
                    date: '2024-12-01',
                    doctor: 'Dr. Sarah Johnson',
                    icon: Pill
                },
                {
                    id: 2,
                    type: 'lab_result',
                    title: 'Blood Test Results',
                    description: 'Complete Blood Count - All values normal',
                    date: '2024-11-28',
                    doctor: 'Dr. Michael Chen',
                    icon: Activity
                },
                {
                    id: 3,
                    type: 'vaccination',
                    title: 'COVID-19 Booster',
                    description: 'Pfizer-BioNTech vaccine booster dose',
                    date: '2024-11-15',
                    doctor: 'Nurse Emily Brown',
                    icon: Syringe
                }
            ];

            const filtered = filter === 'all'
                ? mockRecords
                : mockRecords.filter(r => r.type === filter);

            setRecords(filtered);
        } catch (error) {
            toast?.error('Failed to load medical records');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            // TODO: Implement file upload and API call
            toast?.success('Medical record added successfully');
            setShowAddModal(false);
            setNewRecord({ type: 'lab_result', title: '', description: '', file: null });
            fetchRecords();
        } catch (error) {
            toast?.error('Failed to add record');
        }
    };

    const downloadRecord = (recordId) => {
        // TODO: Implement download functionality
        toast?.success('Download started');
    };

    const exportAllRecords = () => {
        // TODO: Implement  PDF export of all records
        toast?.success('Exporting all records as PDF...');
    };

    const getTypeIcon = (type) => {
        const icons = {
            prescription: Pill,
            lab_result: Activity,
            vaccination: Syringe,
            consultation: FileText
        };
        return icons[type] || FileText;
    };

    const getTypeBadge = (type) => {
        const variants = {
            prescription: 'primary',
            lab_result: 'info',
            vaccination: 'success',
            consultation: 'warning'
        };
        const labels = {
            prescription: 'Prescription',
            lab_result: 'Lab Result',
            vaccination: 'Vaccination',
            consultation: 'Consultation'
        };
        return <Badge variant={variants[type]}>{labels[type]}</Badge>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                <div className="max-w-5xl mx-auto">
                    <SkeletonList count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Medical Records
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your complete health history and documentation
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={exportAllRecords} className="bg-gray-600 hover:bg-gray-700">
                            <Download className="w-4 h-4 mr-2" />
                            Export All
                        </Button>
                        <Button onClick={() => setShowAddModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Record
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'prescription', 'lab_result', 'vaccination', 'consultation'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`
                                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors capitalize
                                ${filter === type
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                {records.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No medical records"
                        description="Your medical records will appear here as you receive treatment."
                        action={() => setShowAddModal(true)}
                        actionLabel="Add Record"
                    />
                ) : (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />

                        {/* Records */}
                        <div className="space-y-6">
                            {records.map((record, index) => {
                                const Icon = getTypeIcon(record.type);
                                const isLast = index === records.length - 1;

                                return (
                                    <div key={record.id} className="relative">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-8 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-gray-900 -translate-x-1/2 hidden md:block" />

                                        {/* Content */}
                                        <Card className={`md:ml-16 p-6 hover:shadow-md transition-shadow ${!isLast ? 'mb-6' : ''}`}>
                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                {/* Icon */}
                                                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg flex-shrink-0">
                                                    <Icon className="w-6 h-6 text-primary" />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                                                {record.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                by {record.doctor}
                                                            </p>
                                                        </div>
                                                        {getTypeBadge(record.type)}
                                                    </div>

                                                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                                                        {record.description}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <Button
                                                            onClick={() => downloadRecord(record.id)}
                                                            size="sm"
                                                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Add Record Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Medical Record"
                    size="md"
                >
                    <form onSubmit={handleAddRecord} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Record Type
                            </label>
                            <select
                                value={newRecord.type}
                                onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="lab_result">Lab Result</option>
                                <option value="vaccination">Vaccination</option>
                                <option value="consultation">Consultation Notes</option>
                                <option value="prescription">Prescription</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={newRecord.title}
                                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                                placeholder="e.g., Blood Test Results"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newRecord.description}
                                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                placeholder="Brief description..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload File (Optional)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
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
                                Add Record
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default MedicalRecordsTimeline;
