import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, HeartPulse, Truck } from 'lucide-react';
import Card from '../../components/ui/Card';

const RoleSelect = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'patient',
            title: 'Patient',
            description: 'I need health support',
            icon: <User className="w-8 h-8 text-primary" />,
            path: '/auth/patient/login'
        },
        {
            id: 'doctor',
            title: 'Doctor',
            description: 'I am a medical doctor',
            icon: <Stethoscope className="w-8 h-8 text-secondary" />,
            path: '/auth/doctor/login'
        },
        {
            id: 'nurse',
            title: 'Nurse',
            description: 'I am a registered nurse',
            icon: <HeartPulse className="w-8 h-8 text-highlight" />,
            path: '/auth/nurse/login'
        },
        {
            id: 'driver',
            title: 'Emergency Driver',
            description: 'I drive an ambulance',
            icon: <Truck className="w-8 h-8 text-error" />,
            path: '/auth/driver/login'
        }
    ];

    return (
        <div className="min-h-screen bg-background p-6 flex flex-col justify-center">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Select your role</h1>
                <p className="text-gray-600">How will you use Genova Health?</p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto w-full">
                {roles.map((role) => (
                    <Card
                        key={role.id}
                        onClick={() => navigate(role.path)}
                        className="cursor-pointer hover:border-primary hover:shadow-md transition-all flex items-center gap-4 active:scale-98"
                    >
                        <div className="p-3 rounded-full bg-gray-50">
                            {role.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{role.title}</h3>
                            <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RoleSelect;
