import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Clock,
    Video,
    FileText,
    Settings,
    AlertCircle,
    CheckCircle,
    Bell,
    ChevronRight,
    TrendingUp,
    MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());

    if (!user) {
        navigate('/auth/doctor/login');
        return null;
    }

    if (!user.isVerified) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent">
                <Card className="max-w-md w-full text-center p-8 border-yellow-500/20 bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                        <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">Verification Pending</h2>
                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                        Precision takes time. Our medical board is currently reviewing your credentials. This typically takes 24-48 hours.
                    </p>
                    <div className="bg-muted/50 rounded-2xl p-5 text-left text-sm mb-8 border border-border/50">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">License ID:</span>
                            <span className="font-bold">{user.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-yellow-600 font-bold">In Review</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full rounded-2xl h-12" onClick={() => { authService.logout(); navigate('/'); }}>
                        Secure Logout
                    </Button>
                </Card>
            </div>
        );
    }

    const stats = [
        { label: "Today's Visits", value: '8', icon: Calendar, color: 'primary' },
        { label: 'Total Patients', value: '142', icon: Users, color: 'secondary' },
        { label: 'Pending Calls', value: '3', icon: Video, color: 'rose-500' },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            {/* Professional Header */}
            <div className="relative overflow-hidden bg-secondary px-6 pt-12 pb-24 rounded-b-[3rem] shadow-2xl shadow-secondary/20">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 border-2 border-white/20 shadow-xl">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Dr${user.fullName}`} />
                            <AvatarFallback className="bg-white/10 text-white font-bold">DR</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-white/70 text-sm font-medium">Head of Practice</p>
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">Dr. {user.fullName}</h2>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 cursor-pointer text-white">
                            <Bell className="w-6 h-6" />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 cursor-pointer text-white" onClick={() => { authService.logout(); navigate('/'); }}>
                            <Settings className="w-6 h-6" />
                        </motion.div>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg"
                        >
                            <div className={`p-2 bg-${stat.color === 'primary' ? 'primary' : stat.color}/20 rounded-xl w-fit mb-3`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-white/60">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="p-6 -mt-12 space-y-6 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Appointments List */}
                    <Card className="lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                            <Button variant="ghost" size="sm" className="text-secondary font-bold" onClick={() => navigate('/doctor/appointments')}>
                                Full Schedule <ChevronRight className="ml-1 w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-4 bg-muted/40 rounded-[1.5rem] border border-transparent hover:border-secondary/20 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/30 flex items-center justify-center font-bold text-secondary">
                                            {i}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">Patient Case #{4020 + i}</h3>
                                            <p className="text-xs text-muted-foreground">General Consultation • 20m remaining</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-black text-secondary">10:{(i * 15).toString().padStart(2, '0')} AM</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Virtual</p>
                                        </div>
                                        <Button size="sm" className="rounded-xl px-4 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/10" onClick={() => navigate('/doctor/chat')}>
                                            Join
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Access Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Quick Tools</h3>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-border/50 hover:bg-secondary/5 group" onClick={() => navigate('/doctor/appointments')}>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-secondary" />
                                        <span className="font-bold">My Schedule</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-border/50 hover:bg-primary/5 group" onClick={() => navigate('/doctor/prescriptions')}>
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-primary" />
                                        <span className="font-bold">New Rx Case</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-border/50 hover:bg-rose-500/5 group">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-rose-500" />
                                        <span className="font-bold">Emergency Kit</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-secondary to-secondary/80 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20">
                            <TrendingUp className="w-10 h-10 mb-4 opacity-50" />
                            <h3 className="text-xl font-black mb-1 italic">Weekly Performance</h3>
                            <p className="text-white/70 text-sm mb-6">You've reached 92% of your patient satisfaction target.</p>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorDashboard;
