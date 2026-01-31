import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';
import { User, Mail, Lock, Phone, Calendar as CalendarIcon, Droplets, Activity, Weight, Height } from 'lucide-react';

const SignupPatient = (props) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        bloodGroup: '',
        genotype: '',
        height: '',
        weight: '',
        allergies: '',
        phone: '',
        email: '',
        password: ''
    });

    const { addToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register({ ...formData, role: 'patient' });
            addToast('Account created successfully!', 'success');
            navigate('/patient/dashboard');
        } catch (error) {
            console.error(error);
            addToast(error.response?.data?.message || 'Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input id="fullName" placeholder="John Doe Bianca" className="pl-10 h-12 rounded-xl" value={formData.fullName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <div className="relative group">
                                    <CalendarIcon className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="age" type="number" placeholder="25" className="pl-10 h-12 rounded-xl" value={formData.age} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bloodGroup">Blood Group</Label>
                                <div className="relative group">
                                    <Droplets className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="bloodGroup" placeholder="O+" className="pl-10 h-12 rounded-xl" value={formData.bloodGroup} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="genotype">Genotype</Label>
                                <div className="relative group">
                                    <Activity className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="genotype" placeholder="AA" className="pl-10 h-12 rounded-xl" value={formData.genotype} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="phone" type="tel" placeholder="+234..." className="pl-10 h-12 rounded-xl" value={formData.phone} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <div className="relative group">
                                    <Height className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="height" type="number" placeholder="180" className="pl-10 h-12 rounded-xl" value={formData.height} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <div className="relative group">
                                    <Weight className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input id="weight" type="number" placeholder="75" className="pl-10 h-12 rounded-xl" value={formData.weight} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input id="email" type="email" placeholder="john@example.com" className="pl-10 h-12 rounded-xl" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SignupPatient;
