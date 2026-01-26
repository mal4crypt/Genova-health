import React, { useState, useEffect } from 'react';
import { Package, Navigation, MapPin, Phone, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { EmptyDeliveries } from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const DriverDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, in_transit, delivered
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const toast = useToast();

    useEffect(() => {
        fetchDeliveries();
    }, [filter]);

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all'
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/deliveries/driver`
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/deliveries/driver?status=${filter}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDeliveries(data.deliveries || []);
        } catch (error) {
            toast?.error('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryStatus = async (deliveryId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast?.success(`Delivery status updated to ${newStatus}`);
                fetchDeliveries();
            } else {
                toast?.error('Failed to update delivery status');
            }
        } catch (error) {
            toast?.error('An error occurred');
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            assigned: 'info',
            picked_up: 'info',
            in_transit: 'primary',
            delivered: 'success',
            cancelled: 'error'
        };
        const labels = {
            pending: 'Pending',
            assigned: 'Assigned',
            picked_up: 'Picked Up',
            in_transit: 'In Transit',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            assigned: 'picked_up',
            picked_up: 'in_transit',
            in_transit: 'delivered'
        };
        return statusFlow[currentStatus];
    };

    const getNextStatusLabel = (currentStatus) => {
        const labels = {
            assigned: 'Mark as Picked Up',
            picked_up: 'Start Delivery',
            in_transit: 'Mark as Delivered'
        };
        return labels[currentStatus];
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
                        My Deliveries
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your assigned deliveries and update status
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`
                                px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors
                                ${filter === status
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            {status.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Deliveries List */}
                {deliveries.length === 0 ? (
                    <EmptyDeliveries />
                ) : (
                    <div className="grid gap-4">
                        {deliveries.map((delivery) => (
                            <Card key={delivery.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col gap-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                                                <Package className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    Delivery #{delivery.id}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {delivery.medication} - {delivery.dosage}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(delivery.status)}
                                    </div>

                                    {/* Patient Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Patient</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {delivery.patient_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                            <a
                                                href={`tel:${delivery.patient_phone}`}
                                                className="font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {delivery.patient_phone}
                                            </a>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Delivery Address</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 flex items-start gap-2">
                                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                                {delivery.delivery_address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pharmacy Info */}
                                    {delivery.pharmacy_name && (
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pickup From</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {delivery.pharmacy_name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {delivery.pharmacy_address}
                                            </p>
                                        </div>
                                    )}

                                    {/* Delivery Fee */}
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Delivery Fee
                                        </span>
                                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                            ₦{Number(delivery.delivery_fee).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                                            <>
                                                <Button
                                                    onClick={() =>
                                                        setConfirmDialog({
                                                            isOpen: true,
                                                            title: 'Update Delivery Status',
                                                            message: `Are you sure you want to ${getNextStatusLabel(delivery.status)}?`,
                                                            onConfirm: () => updateDeliveryStatus(
                                                                delivery.id,
                                                                getNextStatus(delivery.status)
                                                            )
                                                        })
                                                    }
                                                    className="flex-1"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {getNextStatusLabel(delivery.status)}
                                                </Button>
                                                <Button
                                                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(delivery.delivery_address)}`, '_blank')}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Navigation className="w-4 h-4 mr-2" />
                                                    Navigate
                                                </Button>
                                            </>
                                        )}
                                        {delivery.status === 'delivered' && (
                                            <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                                <p className="text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-5 h-5" />
                                                    Delivered Successfully
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timestamps */}
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        {delivery.assigned_at && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Assigned: {new Date(delivery.assigned_at).toLocaleString()}
                                            </div>
                                        )}
                                        {delivery.picked_up_at && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Picked up: {new Date(delivery.picked_up_at).toLocaleString()}
                                            </div>
                                        )}
                                        {delivery.delivered_at && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Delivered: {new Date(delivery.delivered_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant="info"
            />
        </div>
    );
};

export default DriverDeliveries;
