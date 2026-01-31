import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, Stethoscope, HeartPulse, Truck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';

const Login = () => {
    const { role: urlRole } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(urlRole || 'patient');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const roleConfigs = {
        patient: {
            title: 'Patient Login',
            description: 'Access your personalized health dashboard',
            icon: <User className="w-6 h-6" />,
            color: 'primary'
        },
        doctor: {
            title: 'Doctor Login',
            description: 'Manage your patients and consultations',
            icon: <Stethoscope className="w-6 h-6" />,
            color: 'secondary'
        },
        nurse: {
            title: 'Nurse Login',
            description: 'Update records and view home care tasks',
            icon: <HeartPulse className="w-6 h-6" />,
            color: 'rose-500'
        },
        driver: {
            title: 'Driver Login',
            description: 'View transport and delivery requests',
            icon: <Truck className="w-6 h-6" />,
            color: 'orange-500'
        }
    };

    const currentRole = roleConfigs[role] || roleConfigs.patient;

    const { addToast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.login(email, password, role);
            addToast('Login successful! Redirecting...', 'success');
            navigate(`/${role}/dashboard`);
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <motion.div
                        key={role}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex p-4 rounded-3xl bg-card border border-border shadow-2xl shadow-primary/5 mb-6"
                    >
                        <div className={`p-4 rounded-2xl bg-${currentRole.color === 'primary' ? 'primary' : currentRole.color === 'secondary' ? 'secondary' : currentRole.color}/10 text-${currentRole.color}`}>
                            {currentRole.icon}
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-2">Genova Health</h1>
                    <p className="text-muted-foreground">Healthcare reimagined with AI</p>
                </div>

                <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-8 overflow-x-auto no-scrollbar">
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

                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pt-8 px-8 pb-4">
                        <CardTitle className="text-2xl">{currentRole.title}</CardTitle>
                        <CardDescription>{currentRole.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 py-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-md font-semibold mt-4 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="pb-8 px-8 flex flex-col items-center gap-4">
                        <div className="w-full h-px bg-border/50" />
                        <p className="text-sm text-muted-foreground">
                            Don't have an account? {' '}
                            <Link to={`/auth/${role}/signup`} className="text-primary font-semibold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </CardFooter>
                </Card>

                <p className="mt-8 text-center text-xs text-muted-foreground/60">
                    By continuing, you agree to Genova's Terms of Service and Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
