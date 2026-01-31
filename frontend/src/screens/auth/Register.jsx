import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SignupPatient from './SignupPatient';
import SignupDoctor from './SignupDoctor';
import SignupDriver from './SignupDriver';
import SignupNurse from './SignupNurse';
import { User, Stethoscope, Truck, HeartPulse, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const { role: urlRole } = useParams();
    const [role, setRole] = useState(urlRole || 'patient');

    useEffect(() => {
        if (urlRole) {
            setRole(urlRole);
        }
    }, [urlRole]);

    const roleConfigs = {
        patient: {
            icon: <User className="w-5 h-5" />,
            color: 'primary'
        },
        doctor: {
            icon: <Stethoscope className="w-5 h-5" />,
            color: 'secondary'
        },
        nurse: {
            icon: <HeartPulse className="w-5 h-5" />,
            color: 'rose-500'
        },
        driver: {
            icon: <Truck className="w-5 h-5" />,
            color: 'orange-500'
        }
    };

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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <div className="p-2 rounded-full bg-muted group-hover:bg-card transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                        Back to Login
                    </Link>
                </motion.div>

                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-foreground mb-4">Create your account</h1>
                    <p className="text-muted-foreground text-lg">Join Genova Health and experience the future of care.</p>
                </div>

                <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-10 overflow-x-auto no-scrollbar max-w-md mx-auto">
                    {Object.entries(roleConfigs).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setRole(key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${role === key
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                                }`}
                        >
                            {cfg.icon}
                            <span className="hidden sm:inline capitalize">{key}</span>
                        </button>
                    ))}
                </div>

                <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderSignup()}
                </motion.div>

                <p className="mt-12 text-center text-sm text-muted-foreground">
                    Already have an account? {' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
