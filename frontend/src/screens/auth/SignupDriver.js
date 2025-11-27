import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

const SignupDriver = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        driverId: '',
        plateNumber: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register({ ...formData, role: 'driver', isVerified: false });
            navigate('/driver/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-error mb-2">Driver Sign Up</h1>
                <p className="text-gray-600 mb-8">Join our emergency response team.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} required />
                    <Input id="driverId" label="Driver / Badge ID" value={formData.driverId} onChange={handleChange} required />
                    <Input id="plateNumber" label="Ambulance Plate Number" value={formData.plateNumber} onChange={handleChange} required />

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload ID Card</span>
                        <input type="file" className="hidden" />
                    </div>

                    <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />

                    <Button type="submit" variant="danger" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/auth/driver/login" className="text-error font-medium">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupDriver;
