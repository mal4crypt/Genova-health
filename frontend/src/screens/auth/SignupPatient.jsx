import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/authService';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register({ ...formData, role: 'patient' });
            navigate('/patient/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-2">Patient Sign Up</h1>
                <p className="text-gray-600 mb-8">Create your account to get started.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="age" label="Age" type="number" value={formData.age} onChange={handleChange} required />
                        <Input id="bloodGroup" label="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="genotype" label="Genotype" value={formData.genotype} onChange={handleChange} />
                        <Input id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input id="height" label="Height (cm)" type="number" value={formData.height} onChange={handleChange} />
                        <Input id="weight" label="Weight (kg)" type="number" value={formData.weight} onChange={handleChange} />
                    </div>

                    <Input id="allergies" label="Allergies (Optional)" value={formData.allergies} onChange={handleChange} />
                    <Input id="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                    <Input id="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={props.onSwitch}
                        className="text-primary font-medium hover:underline focus:outline-none"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPatient;
