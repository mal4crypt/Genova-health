import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Clock,
    Video,
    FileText,
    Settings,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { authService } from '../../services/authService';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.getCurrentUser());

    if (!user) {
        navigate('/auth/doctor/login');
        return null;
    }

    if (!user.isVerified) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
                    <p className="text-gray-600 mb-6">
                        Your medical license is currently being verified by our team. This process usually takes 24-48 hours.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-500 mb-6">
                        <p><strong>License Number:</strong> {user.licenseNumber}</p>
                        <p><strong>Submitted:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline" onClick={() => { authService.logout(); navigate('/'); }}>
                        Logout
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                            DR
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Dr. {user.fullName}</h1>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                Verified Practitioner
                            </div>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { authService.logout(); navigate('/'); }}>
                        Logout
                    </Button>
                </div>
            </header>

            <main className="p-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats */}
                    <Card className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Today's Appointments</p>
                            <p className="text-2xl font-bold">8</p>
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Patients</p>
                            <p className="text-2xl font-bold">142</p>
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Consults</p>
                            <p className="text-2xl font-bold">3</p>
                        </div>
                    </Card>

                    {/* Upcoming Appointments */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Patient Name {i}</h3>
                                            <p className="text-sm text-gray-500">General Checkup • Video Call</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">10:00 AM</p>
                                        <Button size="sm" className="mt-1" onClick={() => navigate('/doctor/chat')}>Join Call</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/doctor/appointments')}>
                                <Calendar className="w-4 h-4" /> Manage Schedule
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/doctor/prescriptions')}>
                                <FileText className="w-4 h-4" /> Create Prescription
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => alert('Profile settings coming soon!')}>
                                <Settings className="w-4 h-4" /> Profile Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
