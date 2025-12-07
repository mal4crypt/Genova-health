import React, { useState, useEffect } from 'react';
import { Package, Truck, FileText, Download, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { EmptyPrescriptions } from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [pharmacies, setPharmacies] = useState([]);
    const toast = useToast();

    const [deliveryForm, setDeliveryForm] = useState({
        pharmacyId: '',
        deliveryAddress: '',
        deliveryPhone: '',
        notes: ''
    });

    useEffect(() => {
        fetchPrescriptions();
        fetchPharmacies();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/prescriptions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPrescriptions(data.prescriptions || []);
        } catch (error) {
            toast?.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const fetchPharmacies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/prescriptions/pharmacies/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPharmacies(data.pharmacies || []);
        } catch (error) {
            console.error('Failed to load pharmacies');
        }
    };

    const handleRequestDelivery = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/deliveries', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prescriptionId: selectedPrescription.id,
                    ...deliveryForm
                })
            });

            if (response.ok) {
                toast?.success('Delivery request submitted successfully');
                setShowDeliveryModal(false);
                setDeliveryForm({
                    pharmacyId: '',
                    deliveryAddress: '',
                    deliveryPhone: '',
                    notes: ''
                });
                fetchPrescriptions();
            } else {
                toast?.error('Failed to request delivery');
            }
        } catch (error) {
            toast?.error('An error occurred');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            ready: 'info',
            dispensed: 'success',
            delivered: 'success'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                <div className="max-w-5xl mx-auto">
                    <SkeletonList count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        My Prescriptions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View your prescriptions and request home delivery
                    </p>
                </div>

                {/* Prescriptions List */}
                {prescriptions.length === 0 ? (
                    <EmptyPrescriptions />
                ) : (
                    <div className="grid gap-4">
                        {prescriptions.map((prescription) => (
                            <Card key={prescription.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {prescription.medication}
                                                </h3>
                                                {getStatusBadge(prescription.status)}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                Prescribed by Dr. {prescription.doctor_name}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {prescription.dosage}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {prescription.frequency}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {prescription.duration}
                                                    </p>
                                                </div>
                                            </div>
                                            {prescription.instructions && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <p className="text-sm text-blue-900 dark:text-blue-200">
                                                        <strong>Instructions:</strong> {prescription.instructions}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2">
                                        <Button
                                            onClick={() => {
                                                setSelectedPrescription(prescription);
                                                setShowDeliveryModal(true);
                                            }}
                                            className="flex-1 md:flex-initial"
                                            disabled={prescription.status === 'delivered'}
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            Request Delivery
                                        </Button>
                                        <Button
                                            className="flex-1 md:flex-initial bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Delivery Request Modal */}
                <Modal
                    isOpen={showDeliveryModal}
                    onClose={() => setShowDeliveryModal(false)}
                    title="Request Home Delivery"
                    size="md"
                >
                    {selectedPrescription && (
                        <form onSubmit={handleRequestDelivery} className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {selectedPrescription.medication}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedPrescription.dosage} - {selectedPrescription.frequency}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Pharmacy
                                </label>
                                <select
                                    value={deliveryForm.pharmacyId}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, pharmacyId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                >
                                    <option value="">Choose a pharmacy</option>
                                    {pharmacies.map((pharmacy) => (
                                        <option key={pharmacy.id} value={pharmacy.id}>
                                            {pharmacy.name} - {pharmacy.address}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Delivery Address
                                </label>
                                <textarea
                                    value={deliveryForm.deliveryAddress}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })}
                                    placeholder="Enter your delivery address"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={deliveryForm.deliveryPhone}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPhone: e.target.value })}
                                    placeholder="+234 xxx xxx xxxx"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={deliveryForm.notes}
                                    onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                                    placeholder="Any special instructions for delivery..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                />
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Delivery Fee:</strong> ₦1,500.00 (Standard)
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowDeliveryModal(false)}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    <Package className="w-4 h-4 mr-2" />
                                    Request Delivery
                                </Button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default PatientPrescriptions;
