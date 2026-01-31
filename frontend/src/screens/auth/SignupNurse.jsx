import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';
import { User, Mail, Lock, HeartPulse, Building2, CreditCard, Upload } from 'lucide-react';

const SignupNurse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        registrationNumber: '',
        facility: '',
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
            await authService.register({ ...formData, role: 'nurse', isVerified: false });
            addToast('Registration successful! Waiting for verification.', 'success');
            navigate('/nurse/dashboard');
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
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
                                <Input id="fullName" placeholder="Nurse Jane" className="pl-10 h-12 rounded-xl" value={formData.fullName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="registrationNumber">Nursing Council Reg. Number</Label>
                            <div className="relative group">
                                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
                                <Input id="registrationNumber" placeholder="RN-77777" className="pl-10 h-12 rounded-xl" value={formData.registrationNumber} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="facility">Current Facility / Hospital</Label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
                                <Input id="facility" placeholder="City Medical Center" className="pl-10 h-12 rounded-xl" value={formData.facility} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-all group">
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-rose-500 mx-auto mb-2 transition-colors" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">Upload Nursing Certificate</span>
                            <input type="file" className="hidden" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
                                <Input id="email" type="email" placeholder="jane@nurse.com" className="pl-10 h-12 rounded-xl" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-rose-500 transition-colors" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SignupNurse;
