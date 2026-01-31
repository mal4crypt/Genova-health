import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';
import { User, Mail, Lock, Stethoscope, Building2, Briefcase, Award, Upload } from 'lucide-react';

const SignupDoctor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        specialty: '',
        hospital: '',
        experience: '',
        licenseNumber: '',
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
            // Doctor starts as pending verification
            await authService.register({ ...formData, role: 'doctor', isVerified: false });
            addToast('Registration successful! Waiting for verification.', 'success');
            navigate('/doctor/dashboard');
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
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input id="fullName" placeholder="Dr. John Doe" className="pl-10 h-12 rounded-xl" value={formData.fullName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialty">Medical Specialty</Label>
                            <div className="relative group">
                                <Stethoscope className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input id="specialty" placeholder="Cardiologist" className="pl-10 h-12 rounded-xl" value={formData.specialty} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospital">Hospital / Clinic</Label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input id="hospital" placeholder="Genova Central Hospital" className="pl-10 h-12 rounded-xl" value={formData.hospital} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="experience">Years of Exp.</Label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                    <Input id="experience" type="number" placeholder="10" className="pl-10 h-12 rounded-xl" value={formData.experience} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License No.</Label>
                                <div className="relative group">
                                    <Award className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                    <Input id="licenseNumber" placeholder="MD-12345" className="pl-10 h-12 rounded-xl" value={formData.licenseNumber} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-all group">
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-secondary mx-auto mb-2 transition-colors" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">Upload Medical License</span>
                            <input type="file" className="hidden" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input id="email" type="email" placeholder="dr.john@example.com" className="pl-10 h-12 rounded-xl" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SignupDoctor;
