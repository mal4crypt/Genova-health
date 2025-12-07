import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    Stethoscope,
    AlertCircle,
    Activity,
    Pill,
    Apple,
    Dumbbell,
    FileText,
    Menu,
    Bell
} from 'lucide-react';
import Card from '../../components/ui/Card';
import VirtualNurse from './VirtualNurse';
import SymptomChecker from './SymptomChecker';
import BookDoctor from './BookDoctor';
import Emergency from './Emergency';
import OrderDrugs from './OrderDrugs';
import NutritionAI from './NutritionAI';
import FitnessAI from './FitnessAI';
import HealthRecords from './HealthRecords';

import { authService } from '../../services/authService';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const userName = user?.profile?.full_name || user?.email?.split('@')[0] || 'Patient';

    const features = [
        {
            id: 'virtual-nurse',
            title: 'Virtual Nurse',
            icon: <MessageSquare className="w-6 h-6 text-white" />,
            color: 'bg-secondary',
            path: '/patient/virtual-nurse'
        },
        {
            id: 'symptom-checker',
            title: 'Symptom Checker',
            icon: <Activity className="w-6 h-6 text-white" />,
            color: 'bg-blue-500',
            path: '/patient/symptom-checker'
        },
        {
            id: 'book-doctor',
            title: 'Book Doctor',
            icon: <Stethoscope className="w-6 h-6 text-white" />,
            color: 'bg-primary',
            path: '/patient/book-doctor'
        },
        {
            id: 'order-drugs',
            title: 'Order Drugs',
            icon: <Pill className="w-6 h-6 text-white" />,
            color: 'bg-purple-500',
            path: '/patient/order-drugs'
        },
        {
            id: 'nutrition',
            title: 'Nutrition AI',
            icon: <Apple className="w-6 h-6 text-white" />,
            color: 'bg-green-600',
            path: '/patient/nutrition'
        },
        {
            id: 'fitness',
            title: 'Fitness AI',
            icon: <Dumbbell className="w-6 h-6 text-white" />,
            color: 'bg-orange-500',
            path: '/patient/fitness'
        },
        {
            id: 'records',
            title: 'Health Records',
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-teal-600',
            path: '/patient/records'
        },
        {
            id: 'emergency',
            title: 'Emergency',
            icon: <AlertCircle className="w-6 h-6 text-white" />,
            color: 'bg-error',
            path: '/patient/emergency'
        }
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            JD
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Hello, {userName}</h1>
                            <p className="text-xs text-gray-500">How are you feeling today?</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <Bell className="w-6 h-6" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-4 max-w-4xl mx-auto">
                <Routes>
                    <Route index element={
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {features.map((feature) => (
                                <Card
                                    key={feature.id}
                                    onClick={() => navigate(feature.path)}
                                    className="cursor-pointer hover:shadow-md transition-all active:scale-95 p-4 flex flex-col items-center justify-center gap-3 text-center border-none shadow-sm"
                                >
                                    <div className={`p-3 rounded-full ${feature.color} shadow-lg shadow-${feature.color}/20`}>
                                        {feature.icon}
                                    </div>
                                    <span className="font-medium text-sm text-gray-700">{feature.title}</span>
                                </Card>
                            ))}

                            {/* Daily Tip Card */}
                            <div className="col-span-2 md:col-span-4 mt-4">
                                <Card className="bg-gradient-to-r from-primary to-secondary text-white border-none">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Apple className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold mb-1">Daily Health Tip</h3>
                                            <p className="text-sm opacity-90">Drink at least 8 glasses of water today to stay hydrated and keep your energy levels up!</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    } />
                    <Route path="virtual-nurse" element={<VirtualNurse />} />
                    <Route path="symptom-checker" element={<SymptomChecker />} />
                    <Route path="book-doctor" element={<BookDoctor />} />
                    <Route path="emergency" element={<Emergency />} />
                    <Route path="order-drugs" element={<OrderDrugs />} />
                    <Route path="nutrition" element={<NutritionAI />} />
                    <Route path="fitness" element={<FitnessAI />} />
                    <Route path="records" element={<HealthRecords />} />
                </Routes>
            </main>
        </div>
    );
};

export default PatientDashboard;
