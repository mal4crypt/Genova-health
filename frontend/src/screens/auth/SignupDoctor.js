import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Doctor starts as pending verification
            await authService.register({ ...formData, role: 'doctor', isVerified: false });
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-secondary mb-2">Doctor Sign Up</h1>
                <p className="text-gray-600 mb-8">Join our network of verified professionals.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} required />
                    <Input id="specialty" label="Medical Specialty" value={formData.specialty} onChange={handleChange} required />
                    <Input id="hospital" label="Hospital / Clinic" value={formData.hospital} onChange={handleChange} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="experience" label="Years of Exp." type="number" value={formData.experience} onChange={handleChange} required />
                        <Input id="licenseNumber" label="License Number" value={formData.licenseNumber} onChange={handleChange} required />
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload Medical License</span>
                        <input type="file" className="hidden" />
                    </div>

                    <Input id="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />

                    <Button type="submit" variant="secondary" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/auth/doctor/login" className="text-secondary font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupDoctor;
