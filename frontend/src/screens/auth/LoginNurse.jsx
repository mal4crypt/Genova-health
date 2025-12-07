import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

const LoginNurse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
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
            await authService.login(formData.email, formData.password, 'nurse');
            navigate('/nurse/dashboard');
        } catch (error) {
            alert('Invalid credentials. Try demo@genova.com / demo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold text-highlight mb-2">Nurse Login</h1>
                <p className="text-gray-600 mb-8">Access your care dashboard.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />

                    <Button type="submit" className="w-full mt-6 bg-highlight hover:bg-yellow-500 text-white" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/auth/nurse/signup" className="text-highlight font-medium">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginNurse;
