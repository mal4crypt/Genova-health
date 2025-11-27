import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, Video, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const BookDoctor = () => {
    const [specialty, setSpecialty] = useState('General Practitioner');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [visitType, setVisitType] = useState('video'); // video or home

    const doctors = [
        { id: 1, name: "Dr. Chioma Adebayo", specialty: "General Practitioner", rating: 4.8, hospital: "Lagos University Teaching Hospital", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chioma" },
        { id: 2, name: "Dr. Emeka Okonkwo", specialty: "Cardiologist", rating: 4.9, hospital: "Reddington Hospital", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emeka" },
        { id: 3, name: "Dr. Sarah Musa", specialty: "Pediatrician", rating: 4.7, hospital: "First Consultant Medical Centre", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    ];

    return (
        <div className="pb-20">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Book a Doctor</h2>
                <p className="text-sm text-gray-500">Find the right specialist for you</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {['General Practitioner', 'Cardiologist', 'Pediatrician', 'Dentist', 'Optometrist'].map((spec) => (
                    <button
                        key={spec}
                        onClick={() => setSpecialty(spec)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${specialty === spec
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            {/* Doctor List */}
            <div className="space-y-4">
                {doctors.filter(d => d.specialty === specialty).map((doctor) => (
                    <Card key={doctor.id} className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full bg-gray-100" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{doctor.name}</h3>
                                        <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-xs font-bold text-yellow-700">
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        {doctor.rating}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {doctor.hospital}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setVisitType('video')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${visitType === 'video' ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-inset' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Video className="w-4 h-4" />
                                    Video Call (₦2,000)
                                </button>
                                <button
                                    onClick={() => setVisitType('home')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${visitType === 'home' ? 'bg-green-50 text-green-700 ring-2 ring-green-500 ring-inset' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Home className="w-4 h-4" />
                                    Home Visit (₦5,000)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-sm"
                                />
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            <Button className="w-full">
                                Confirm Booking
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BookDoctor;
