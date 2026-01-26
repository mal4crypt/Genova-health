import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    ClipboardList,
    MapPin,
    CheckCircle,
    Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { authService } from '../../services/authService';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());

    if (!user) {
        navigate('/auth/nurse/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-highlight/10 flex items-center justify-center text-highlight font-bold">
                            NS
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Nurse {user.fullName}</h1>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {user.facility || 'General Ward'}
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
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Assigned Patients</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Tasks</p>
                            <p className="text-2xl font-bold">5</p>
                        </div>
                    </Card>

                    <Card className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Completed Visits</p>
                            <p className="text-2xl font-bold">3</p>
                        </div>
                    </Card>

                    {/* Patient List */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned Patients</h2>
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div>
                                            <h3 className="font-bold text-gray-900">Patient {i}</h3>
                                            <p className="text-sm text-gray-500">Post-op Care • Ward 3B</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => navigate('/nurse/assigned-patients')}>View Vitals</Button>
                                        <Button size="sm" onClick={() => navigate('/nurse/home-care-tasks')}>Log Visit</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Tasks</h2>
                        <div className="space-y-3">
                            {[
                                { task: 'Check vitals for Patient 1', time: '10:00 AM', priority: 'high' },
                                { task: 'Administer medication - Ward 3', time: '11:30 AM', priority: 'medium' },
                                { task: 'Update shift report', time: '2:00 PM', priority: 'low' },
                            ].map((item, idx) => (
                                <Card key={idx} className="p-4 border-l-4 border-l-highlight">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.priority.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.time}
                                        </span>
                                    </div>
                                    <p className="font-medium text-gray-900">{item.task}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NurseDashboard;
