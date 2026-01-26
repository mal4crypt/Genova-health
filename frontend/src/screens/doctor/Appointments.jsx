import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Calendar, Clock, User, Video, CheckCircle, XCircle } from 'lucide-react';

const Appointments = () => {
    const [appointments] = useState([
        { id: 1, patient: 'John Doe', time: '10:00 AM', type: 'Check-up', status: 'confirmed' },
        { id: 2, patient: 'Jane Smith', time: '11:00 AM', type: 'Consultation', status: 'pending' },
        { id: 3, patient: 'Robert Johnson', time: '02:00 PM', type: 'Follow-up', status: 'confirmed' },
    ]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Appointments</h1>

            <div className="grid gap-4">
                {appointments.map(apt => (
                    <Card key={apt.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{apt.patient}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {apt.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" /> {apt.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            {apt.status === 'confirmed' ? (
                                <Button variant="primary" size="sm" className="gap-2">
                                    <Video className="w-4 h-4" /> Join Call
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                                        <CheckCircle className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                        <XCircle className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}

                {appointments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No appointments scheduled for today</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Appointments;
