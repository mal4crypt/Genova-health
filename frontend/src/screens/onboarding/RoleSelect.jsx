import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, HeartPulse, Truck, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { motion } from 'framer-motion';

const RoleSelect = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'patient',
            title: 'Patient',
            description: 'Get world-class care and support',
            icon: <User className="w-6 h-6" />,
            color: 'bg-primary/10 text-primary',
            path: '/auth/patient/login'
        },
        {
            id: 'doctor',
            title: 'Doctor',
            description: 'Manage your practice and patients',
            icon: <Stethoscope className="w-6 h-6" />,
            color: 'bg-secondary/10 text-secondary',
            path: '/auth/doctor/login'
        },
        {
            id: 'nurse',
            title: 'Nurse',
            description: 'Provide professional home care',
            icon: <HeartPulse className="w-6 h-6" />,
            color: 'bg-rose-500/10 text-rose-500',
            path: '/auth/nurse/login'
        },
        {
            id: 'driver',
            title: 'Emergency Driver',
            description: 'Rapid response medical transport',
            icon: <Truck className="w-6 h-6" />,
            color: 'bg-orange-500/10 text-orange-500',
            path: '/auth/driver/login'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="max-w-xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                        Welcome to Genova Health
                    </div>
                    <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                        Select your role
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                        Choose how you would like to use the platform to continue.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4"
                >
                    {roles.map((role) => (
                        <motion.div key={role.id} variants={itemVariants}>
                            <Card
                                onClick={() => navigate(role.path)}
                                className="group relative overflow-hidden cursor-pointer p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex items-center gap-5 active:scale-[0.99] border-border/50 bg-card/50 backdrop-blur-sm"
                            >
                                <div className={`p-4 rounded-2xl ${role.color} transition-transform group-hover:scale-110 duration-300`}>
                                    {role.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground mb-0.5">{role.title}</h3>
                                    <p className="text-sm text-muted-foreground">{role.description}</p>
                                </div>
                                <div className="p-2 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>

                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center text-sm text-muted-foreground"
                >
                    Authorized healthcare personnel only.
                </motion.p>
            </div>
        </div>
    );
};

export default RoleSelect;
