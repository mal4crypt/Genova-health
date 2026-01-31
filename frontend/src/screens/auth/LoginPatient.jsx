import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import { ArrowLeft } from 'lucide-react';

const LoginPatient = (props) => {
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
            await authService.login(formData.email, formData.password, 'patient');
            navigate('/patient/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1">
                    <div className="flex items-center mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent -ml-2 text-gray-500 hover:text-gray-900"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-primary">Patient Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={props.onSwitch}
                            className="text-primary font-medium hover:underline focus:outline-none"
                        >
                            Sign Up
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPatient;
