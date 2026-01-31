import React, { useState, useEffect } from 'react';
import { Package, Truck, FileText, Download, MapPin, ChevronRight, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { EmptyPrescriptions } from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/pharmacies/list`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/deliveries`, {
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
        return <Badge variant={variants[status] || 'default'} className="rounded-full uppercase text-[10px] px-3 font-bold tracking-wider">{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent p-6">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="h-10 w-48 bg-muted/50 rounded-xl animate-pulse" />
                    <SkeletonList count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6">
            <div className="max-w-5xl mx-auto">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
                            Digital Records
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Manage your prescriptions and order smart deliveries
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search medication..."
                                className="pl-10 h-12 bg-card/50 border-border/50 rounded-2xl"
                            />
                        </div>
                        <Button variant="outline" className="h-12 w-12 rounded-2xl p-0 border-border/50 bg-card/50">
                            <Filter className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                {/* Prescriptions List */}
                <AnimatePresence mode="wait">
                    {prescriptions.length === 0 ? (
                        <EmptyPrescriptions key="empty" />
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-6"
                        >
                            {prescriptions.map((prescription, idx) => (
                                <motion.div
                                    key={prescription.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all group rounded-[2.5rem]">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                <div className="p-8 flex-1">
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-primary/10 p-4 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                                                                <FileText className="w-8 h-8 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-1">
                                                                    <h3 className="text-xl font-black text-foreground tracking-tight">
                                                                        {prescription.medication}
                                                                    </h3>
                                                                    {getStatusBadge(prescription.status)}
                                                                </div>
                                                                <p className="text-sm font-bold text-muted-foreground">
                                                                    Prescribed by <span className="text-foreground">Dr. {prescription.doctor_name}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                                                        <div className="bg-muted/40 p-4 rounded-3xl border border-border/20">
                                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Dosage</p>
                                                            <p className="font-bold text-foreground">{prescription.dosage}</p>
                                                        </div>
                                                        <div className="bg-muted/40 p-4 rounded-3xl border border-border/20">
                                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Frequency</p>
                                                            <p className="font-bold text-foreground">{prescription.frequency}</p>
                                                        </div>
                                                        <div className="bg-muted/40 p-4 rounded-3xl border border-border/20">
                                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">Duration</p>
                                                            <p className="font-bold text-foreground">{prescription.duration}</p>
                                                        </div>
                                                    </div>

                                                    {prescription.instructions && (
                                                        <div className="flex items-start gap-3 p-5 bg-primary/5 border border-primary/10 rounded-3xl">
                                                            <div className="bg-primary/10 p-2 rounded-xl">
                                                                <Bot className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm text-foreground font-medium leading-relaxed">
                                                                <strong className="block text-primary text-[10px] uppercase tracking-widest mb-1">Doctor's Note</strong>
                                                                {prescription.instructions}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="bg-muted/20 lg:w-72 p-8 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-col justify-center gap-3">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedPrescription(prescription);
                                                            setShowDeliveryModal(true);
                                                        }}
                                                        className="w-full rounded-2xl h-14 shadow-lg shadow-primary/10 transition-all active:scale-95"
                                                        disabled={prescription.status === 'delivered'}
                                                    >
                                                        <Truck className="w-5 h-5 mr-3" />
                                                        Smart Delivery
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-2xl h-14 border-border/50 bg-card hover:bg-muted transition-all"
                                                    >
                                                        <Download className="w-5 h-5 mr-3" />
                                                        Save PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delivery Request Modal */}
                <Modal
                    isOpen={showDeliveryModal}
                    onClose={() => setShowDeliveryModal(false)}
                    title="Smart Home Delivery"
                    size="lg"
                >
                    {selectedPrescription && (
                        <form onSubmit={handleRequestDelivery} className="space-y-6 pt-4">
                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem]">
                                <h4 className="font-black text-xl text-foreground mb-1 tracking-tight">
                                    {selectedPrescription.medication}
                                </h4>
                                <p className="text-sm font-bold text-muted-foreground">
                                    {selectedPrescription.dosage} • {selectedPrescription.frequency}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                            Select Pharmacy
                                        </label>
                                        <select
                                            value={deliveryForm.pharmacyId}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, pharmacyId: e.target.value })}
                                            className="w-full h-14 px-4 rounded-2xl border border-border/50 bg-muted/30 text-foreground font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            required
                                        >
                                            <option value="">Choose a location...</option>
                                            {pharmacies.map((pharmacy) => (
                                                <option key={pharmacy.id} value={pharmacy.id}>
                                                    {pharmacy.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                            Contact Phone
                                        </label>
                                        <Input
                                            type="tel"
                                            value={deliveryForm.deliveryPhone}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryPhone: e.target.value })}
                                            placeholder="+234..."
                                            className="h-14 rounded-2xl border-border/50 bg-muted/30 font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                        Delivery Address
                                    </label>
                                    <textarea
                                        value={deliveryForm.deliveryAddress}
                                        onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })}
                                        placeholder="Enter full street address..."
                                        rows={3}
                                        className="w-full p-4 rounded-2xl border border-border/50 bg-muted/30 text-foreground font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                        Special Instructions
                                    </label>
                                    <textarea
                                        value={deliveryForm.notes}
                                        onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                                        placeholder="Any notes for the driver? (Optional)"
                                        rows={2}
                                        className="w-full p-4 rounded-2xl border border-border/50 bg-muted/30 text-foreground font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 font-bold text-emerald-600">
                                    <MapPin className="w-5 h-5" />
                                    <span>Estimated Delivery</span>
                                </div>
                                <span className="font-black text-emerald-600">₦1,500.00</span>
                            </motion.div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowDeliveryModal(false)}
                                    className="flex-1 h-14 rounded-2xl font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">
                                    <Package className="w-5 h-5 mr-3" />
                                    Confirm Order
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
