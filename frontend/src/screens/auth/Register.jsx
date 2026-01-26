import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SignupPatient from './SignupPatient';
import SignupDoctor from './SignupDoctor';
import SignupDriver from './SignupDriver';
import SignupNurse from './SignupNurse';
import { User, Stethoscope, Truck, HeartPulse } from 'lucide-react';

const Register = () => {
    const { role: urlRole } = useParams();
    const [role, setRole] = useState(urlRole || 'patient');

    useEffect(() => {
        if (urlRole) {
            setRole(urlRole);
        }
    }, [urlRole]);

    const renderSignup = () => {
        switch (role) {
            case 'patient': return <SignupPatient />;
            case 'doctor': return <SignupDoctor />;
            case 'driver': return <SignupDriver />;
            case 'nurse': return <SignupNurse />;
            default: return <SignupPatient />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mb-8">
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setRole('patient')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${role === 'patient'
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <User className="w-6 h-6" />
                        <span className="text-xs font-medium">Patient</span>
                    </button>
                    <button
                        onClick={() => setRole('doctor')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${role === 'doctor'
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <Stethoscope className="w-6 h-6" />
                        <span className="text-xs font-medium">Doctor</span>
                    </button>
                    <button
                        onClick={() => setRole('nurse')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${role === 'nurse'
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <HeartPulse className="w-6 h-6" />
                        <span className="text-xs font-medium">Nurse</span>
                    </button>
                    <button
                        onClick={() => setRole('driver')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${role === 'driver'
                            ? 'bg-primary text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <Truck className="w-6 h-6" />
                        <span className="text-xs font-medium">Driver</span>
                    </button>
                </div>

                {renderSignup()}
            </div>
        </div>
    );
};

export default Register;
