import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

const LoginDriver = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        driverId: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using driverId as "email" for login consistency in mock service, or we'd adjust service
            // For simplicity, let's assume the mock service can handle this or we pass it as email
            await authService.login(formData.driverId, formData.password, 'driver');
            navigate('/driver/dashboard');
        } catch (error) {
            alert('Invalid credentials. Try demo / demo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold text-error mb-2">Driver Login</h1>
                <p className="text-gray-600 mb-8">Start your shift.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="driverId" label="Driver ID" value={formData.driverId} onChange={handleChange} required />
                    <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />

                    <Button type="submit" variant="danger" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/auth/driver/signup" className="text-error font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginDriver;
