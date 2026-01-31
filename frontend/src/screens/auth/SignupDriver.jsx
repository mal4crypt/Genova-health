import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { useToast } from '../../components/ui/Toast';
import { User, Lock, Truck, CreditCard, Upload } from 'lucide-react';

const SignupDriver = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        driverId: '',
        plateNumber: '',
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
            await authService.register({ ...formData, role: 'driver', isVerified: false });
            addToast('Registration successful! Waiting for verification.', 'success');
            navigate('/driver/dashboard');
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
                                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                <Input id="fullName" placeholder="John Driver" className="pl-10 h-12 rounded-xl" value={formData.fullName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="driverId">Driver / Badge ID</Label>
                            <div className="relative group">
                                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                <Input id="driverId" placeholder="DRV-99999" className="pl-10 h-12 rounded-xl" value={formData.driverId} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plateNumber">Ambulance Plate Number</Label>
                            <div className="relative group">
                                <Truck className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                <Input id="plateNumber" placeholder="ABC-123-XY" className="pl-10 h-12 rounded-xl" value={formData.plateNumber} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border/50 rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/50 transition-all group">
                            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-orange-500 mx-auto mb-2 transition-colors" />
                            <span className="text-sm text-muted-foreground group-hover:text-foreground">Upload ID Card</span>
                            <input type="file" className="hidden" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-orange-500 transition-colors" />
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl" value={formData.password} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default SignupDriver;
