import React, { useState } from 'react';
import { Plus, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import EmptyState, { EmptyPrescriptions } from '../../components/ui/EmptyState';
import PatientSearch from '../../components/doctor/PatientSearch';
import Badge from '../../components/ui/Badge';

const CreatePrescription = () => {
    const [showModal, setShowModal] = useState(false);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const toast = useToast();

    const [formData, setFormData] = useState({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        diagnosis: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedPatient) {
            toast?.error('Please select a patient');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                patientId: selectedPatient.user_id // Ensure we send the correct ID type
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast?.success('Prescription created successfully');
                setShowModal(false);
                setFormData({
                    medication: '',
                    dosage: '',
                    frequency: '',
                    duration: '',
                    instructions: '',
                    diagnosis: ''
                });
                setSelectedPatient(null);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`, {
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

    const PrescriptionCard = ({ prescription }) => (
        <Card className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-primary-500">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl hidden md:block">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {prescription.medication}
                            </h3>
                            <Badge variant={prescription.status === 'active' ? 'success' : 'default'}>
                                {prescription.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-8 mb-3 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-200">Patient:</span> {prescription.patient_name}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-200">Diagnosis:</span> {prescription.diagnosis || 'N/A'}
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg grid grid-cols-3 gap-2 text-sm mb-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Dosage</span>
                                <span className="font-medium">{prescription.dosage}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Freq</span>
                                <span className="font-medium">{prescription.frequency}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Duration</span>
                                <span className="font-medium">{prescription.duration}</span>
                            </div>
                        </div>

                        {prescription.instructions && (
                            <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/20">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <p>{prescription.instructions}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    {new Date(prescription.created_at).toLocaleDateString()}
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Prescription Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Issue and track medical prescriptions for your patients
                        </p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
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
                            <PrescriptionCard key={prescription.id} prescription={prescription} />
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Write New Prescription"
                    size="lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Patient
                            </label>
                            <PatientSearch
                                selectedPatient={selectedPatient}
                                onSelect={setSelectedPatient}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Medication Name (Generic/Brand)
                                </label>
                                <Input
                                    value={formData.medication}
                                    onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                                    placeholder="e.g., Amoxicillin 500mg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dosage
                                </label>
                                <Input
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                    placeholder="e.g., 1 tablet"
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
                                    placeholder="e.g., Every 8 hours"
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Diagnosis (ICD-10 / Text)
                                </label>
                                <Input
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    placeholder="e.g., Acute Bronchitis"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Special Instructions / Notes
                            </label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Take with food, avoid alcohol, etc."
                                rows={3}
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

                        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Issue Prescription
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default CreatePrescription;
