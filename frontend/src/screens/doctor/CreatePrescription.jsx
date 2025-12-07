import React, { useState } from 'react';
import { Plus, FileText, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import EmptyState, { EmptyPrescriptions } from '../../components/ui/EmptyState';

const CreatePrescription = () => {
    const [showModal, setShowModal] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const toast = useToast();

    const [formData, setFormData] = useState({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        diagnosis: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast?.success('Prescription created successfully');
                setShowModal(false);
                setFormData({
                    patientId: '',
                    medication: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: '',
                    diagnosis: ''
                });
                fetchPrescriptions();
            } else {
                toast?.error('Failed to create prescription');
            }
        } catch (error) {
            toast?.error('An error occurred');
        }
    };

    const fetchPrescriptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/prescriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPrescriptions(data.prescriptions || []);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    React.useEffect(() => {
        fetchPrescriptions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Prescriptions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Create and manage patient prescriptions
                        </p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="w-full md:w-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        New Prescription
                    </Button>
                </div>

                {/* Prescriptions List */}
                {prescriptions.length === 0 ? (
                    <EmptyPrescriptions onAdd={() => setShowModal(true)} />
                ) : (
                    <div className="grid gap-4">
                        {prescriptions.map((prescription) => (
                            <Card key={prescription.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                {prescription.medication}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                Patient: {prescription.patient_name}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>Dosage: {prescription.dosage}</span>
                                                <span>Frequency: {prescription.frequency}</span>
                                                <span>Duration: {prescription.duration}</span>
                                            </div>
                                            {prescription.diagnosis && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                    Diagnosis: {prescription.diagnosis}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(prescription.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Create Prescription"
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Patient ID
                            </label>
                            <Input
                                type="number"
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                placeholder="Enter patient ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Medication Name
                            </label>
                            <Input
                                value={formData.medication}
                                onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                                placeholder="e.g., Amoxicillin"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dosage
                                </label>
                                <Input
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    placeholder="e.g., 500mg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Frequency
                                </label>
                                <Input
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    placeholder="e.g., 3 times daily"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration
                                </label>
                                <Input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g., 7 days"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Diagnosis
                            </label>
                            <Input
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                placeholder="e.g., Bacterial infection"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Instructions
                            </label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Additional instructions for the patient..."
                                rows={4}
                                className="
                                    w-full px-4 py-3 rounded-lg
                                    border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-800
                                    text-gray-900 dark:text-gray-100
                                    focus:ring-2 focus:ring-primary focus:border-transparent
                                    resize-none
                                "
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Prescription
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default CreatePrescription;
