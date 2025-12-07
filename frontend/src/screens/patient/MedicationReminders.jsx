import React, { useState, useEffect } from 'react';
import { Bell, Plus, Clock, Pill, Trash2, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/Loading';

const MedicationReminders = () => {
    const [medications, setMedications] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [todaysDoses, setTodaysDoses] = useState([]);
    const toast = useToast();

    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        times: ['09:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: ''
    });

    useEffect(() => {
        fetchMedications();
        checkDueReminders();

        // Check for due medications every minute
        const interval = setInterval(checkDueReminders, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMedications = async () => {
        // Mock data - replace with API call
        const mockMedications = [
            {
                id: 1,
                name: 'Amoxicillin',
                dosage: '500mg',
                frequency: '3 times daily',
                times: ['09:00', '14:00', '21:00'],
                startDate: '2024-12-01',
                endDate: '2024-12-08',
                instructions: 'Take with food',
                adherence: 85
            },
            {
                id: 2,
                name: 'Vitamin D',
                dosage: '1000 IU',
                frequency: 'Once daily',
                times: ['09:00'],
                startDate: '2024-11-01',
                endDate: null, // Ongoing
                instructions: 'Take with breakfast',
                adherence: 92
            }
        ];

        setMedications(mockMedications);
        generateTodaysDoses(mockMedications);
    };

    const generateTodaysDoses = (meds) => {
        const today = new Date().toISOString().split('T')[0];
        const doses = [];

        meds.forEach(med => {
            med.times.forEach(time => {
                doses.push({
                    id: `${med.id}-${time}`,
                    medicationId: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    time: time,
                    taken: false, // Would come from backend
                    due: isPastTime(time)
                });
            });
        });

        setTodaysDoses(doses.sort((a, b) => a.time.localeCompare(b.time)));
    };

    const isPastTime = (timeString) => {
        const now = new Date();
        const [hours, minutes] = timeString.split(':');
        const timeToCheck = new Date();
        timeToCheck.setHours(parseInt(hours), parseInt(minutes), 0);
        return now > timeToCheck;
    };

    const checkDueReminders = () => {
        medications.forEach(med => {
            med.times.forEach(time => {
                const now = new Date();
                const [hours, minutes] = time.split(':');

                if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes)) {
                    showNotification(med, time);
                }
            });
        });
    };

    const showNotification = (medication, time) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('💊 Medication Reminder', {
                body: `Time to take ${medication.name} ${medication.dosage}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: `med-${medication.id}-${time}`,
                requireInteraction: true,
                actions: [
                    { action: 'taken', title: 'Mark as Taken' },
                    { action: 'snooze', title: 'Snooze 15min' }
                ]
            });
        }

        toast?.warning(`Time to take ${medication.name} ${medication.dosage}`);
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast?.success('Notifications enabled!');
            }
        }
    };

    const markDoseAsTaken = (doseId) => {
        setTodaysDoses(doses =>
            doses.map(dose =>
                dose.id === doseId ? { ...dose, taken: true } : dose
            )
        );
        toast?.success('Dose marked as taken');
    };

    const addMedication = async (e) => {
        e.preventDefault();
        try {
            // TODO: API call
            await requestNotificationPermission();
            toast?.success('Medication reminder added');
            setShowAddModal(false);
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                times: ['09:00'],
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                instructions: ''
            });
            fetchMedications();
        } catch (error) {
            toast?.error('Failed to add medication');
        }
    };

    const deleteMedication = (id) => {
        setMedications(meds => meds.filter(m => m.id !== id));
        toast?.success('Medication reminder removed');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Medication Reminders
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Never miss a dose with automated reminders
                        </p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                    </Button>
                </div>

                {/* Today's Schedule */}
                {todaysDoses.length > 0 && (
                    <Card className="p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Today's Schedule
                        </h2>
                        <div className="space-y-3">
                            {todaysDoses.map(dose => (
                                <div key={dose.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${dose.taken ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary-50 dark:bg-primary-900/20'}`}>
                                            {dose.taken ? (
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <Pill className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                {dose.name} - {dose.dosage}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {dose.time} {dose.due && !dose.taken && '• Overdue'}
                                            </p>
                                        </div>
                                    </div>
                                    {!dose.taken && (
                                        <Button
                                            onClick={() => markDoseAsTaken(dose.id)}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Mark Taken
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Medications List */}
                {medications.length === 0 ? (
                    <EmptyState
                        icon={Pill}
                        title="No medications"
                        description="Add your medications to set up automatic reminders and track adherence."
                        action={() => setShowAddModal(true)}
                        actionLabel="Add Medication"
                    />
                ) : (
                    <div className="grid gap-4">
                        {medications.map(med => (
                            <Card key={med.id} className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                                            <Pill className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                                                {med.name} - {med.dosage}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                {med.frequency}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {med.times.map((time, i) => (
                                                    <Badge key={i} variant="primary">
                                                        <Bell className="w-3 h-3 mr-1" />
                                                        {time}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {med.instructions && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    💡 {med.instructions}
                                                </p>
                                            )}

                                            <div className="mb-2">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Adherence</span>
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{med.adherence}%</span>
                                                </div>
                                                <ProgressBar progress={med.adherence} showPercentage={false} />
                                            </div>

                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {med.startDate} {med.endDate && `- ${med.endDate}`}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => deleteMedication(med.id)}
                                        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add Medication Modal */}
                <Modal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    title="Add Medication Reminder"
                    size="lg"
                >
                    <form onSubmit={addMedication} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Medication Name
                                </label>
                                <input
                                    type="text"
                                    value={newMedication.name}
                                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                                    placeholder="e.g., Amoxicillin"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dosage
                                </label>
                                <input
                                    type="text"
                                    value={newMedication.dosage}
                                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                    placeholder="e.g., 500mg"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Frequency
                            </label>
                            <input
                                type="text"
                                value={newMedication.frequency}
                                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                placeholder="e.g., 3 times daily"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Reminder Times
                            </label>
                            <div className="flex gap-2">
                                {newMedication.times.map((time, index) => (
                                    <input
                                        key={index}
                                        type="time"
                                        value={time}
                                        onChange={(e) => {
                                            const newTimes = [...newMedication.times];
                                            newTimes[index] = e.target.value;
                                            setNewMedication({ ...newMedication, times: newTimes });
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                ))}
                                <Button
                                    type="button"
                                    onClick={() => setNewMedication({
                                        ...newMedication,
                                        times: [...newMedication.times, '09:00']
                                    })}
                                    className="bg-gray-200 text-gray-700"
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={newMedication.startDate}
                                    onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={newMedication.endDate}
                                    onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Instructions
                            </label>
                            <textarea
                                value={newMedication.instructions}
                                onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                                placeholder="e.g., Take with food"
                                rows={2}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
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
                                Add Reminder
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default MedicationReminders;
