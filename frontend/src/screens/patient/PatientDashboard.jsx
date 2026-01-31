import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageCircle, User, Activity, Bell, Bot, FileText, ChevronRight, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());

    const quickActions = [
        { icon: Bot, label: 'AI Symptom Checker', desc: '✨ Gemini powered', path: '/patient/symptom-checker', color: 'primary' },
        { icon: Calendar, label: 'Book Appointment', desc: 'Find doctors', path: '/patient/book-doctor', color: 'secondary' },
        { icon: FileText, label: 'Prescriptions', desc: 'View & order', path: '/patient/prescriptions', color: 'rose-500' },
        { icon: Activity, label: 'Fitness Tracker', desc: 'Track progress', path: '/patient/fitness', color: 'orange-500' },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            {/* Premium Header */}
            <div className="relative overflow-hidden bg-primary px-6 pt-12 pb-24 rounded-b-[3rem] shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/20 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-xl">
                                <AvatarImage src={user?.profile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.profile?.full_name || 'User'}`} />
                                <AvatarFallback className="bg-white/10 text-white font-bold">
                                    {user?.profile?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </motion.div>
                        <div>
                            <p className="text-white/70 text-sm font-medium">Welcome back,</p>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">{user?.profile?.full_name || 'Patient'}</h2>
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 cursor-pointer"
                    >
                        <Bell className="w-6 h-6 text-white" />
                        <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-primary rounded-full" />
                    </motion.div>
                </div>

                {/* Quick Actions Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-4">
                    {quickActions.map((action, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl text-left border border-white/10 hover:bg-white/20 transition-all shadow-lg"
                        >
                            <div className={`bg-${action.color === 'primary' ? 'primary' : action.color}/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="font-bold text-white text-sm">{action.label}</p>
                            <p className="text-xs text-white/60 mt-0.5">{action.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 -mt-12 space-y-6 relative z-20">
                {/* Upcoming Appointments */}
                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                            <CardDescription>Don't miss your next visit</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/patient/book-doctor')} className="text-primary font-bold">
                            View All <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-muted/50 p-6 rounded-3xl border border-border/50 text-center"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="font-bold text-foreground">No appointments yet</h4>
                            <p className="text-sm text-muted-foreground mt-2 mb-4">Start your journey to better health by booking a consultation with our top specialists.</p>
                            <Button onClick={() => navigate('/patient/book-doctor')} className="rounded-2xl px-8 shadow-lg shadow-primary/20">
                                Book Now
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>

                {/* Health Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="p-5 border-border/50 bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold opacity-70">Daily Activity</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-black">2.4k</h3>
                            <span className="text-xs text-muted-foreground mb-1">steps/10k</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '24%' }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    </Card>

                    <Card className="p-5 border-border/50 bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-bold opacity-70">Health Score</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-black">82</h3>
                            <span className="text-xs text-muted-foreground mb-1">/100</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '82%' }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </Card>
                </div>

                {/* Recent Experience */}
                <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
                    <h3 className="text-lg font-bold mb-4">Security & Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/patient/records')}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <FileText className="w-5 h-5 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Medical History</p>
                                    <p className="text-xs text-muted-foreground">Updated 2 days ago</p>
                                </div>
                            </div>
                            <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/20 transition-colors">
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/patient/medications')}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-muted rounded-2xl group-hover:bg-secondary/10 transition-colors">
                                    <Activity className="w-5 h-5 group-hover:text-secondary transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Smart Reminders</p>
                                    <p className="text-xs text-muted-foreground">3 active reminders</p>
                                </div>
                            </div>
                            <div className="p-2 rounded-xl bg-muted group-hover:bg-secondary/20 transition-colors">
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PatientDashboard;
