import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for routes
import WelcomeScreen from './screens/onboarding/WelcomeScreen';
import RoleSelect from './screens/onboarding/RoleSelect';

// Auth Screens
import LoginPatient from './screens/auth/LoginPatient';
import SignupPatient from './screens/auth/SignupPatient';
import LoginDoctor from './screens/auth/LoginDoctor';
import SignupDoctor from './screens/auth/SignupDoctor';
import LoginNurse from './screens/auth/LoginNurse';
import SignupNurse from './screens/auth/SignupNurse';
import LoginDriver from './screens/auth/LoginDriver';
import SignupDriver from './screens/auth/SignupDriver';

// Dashboards
import PatientDashboard from './screens/patient/PatientDashboard';
import DoctorDashboard from './screens/doctor/DoctorDashboard';
import NurseDashboard from './screens/nurse/NurseDashboard';
import DriverDashboard from './screens/driver/DriverDashboard';
import AdminDashboard from './screens/admin/AdminDashboard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background text-text-primary font-sans antialiased">
                <Routes>
                    {/* Onboarding */}
                    <Route path="/" element={<WelcomeScreen />} />
                    <Route path="/role-select" element={<RoleSelect />} />

                    {/* Auth Routes */}
                    <Route path="/auth/patient/login" element={<LoginPatient />} />
                    <Route path="/auth/patient/signup" element={<SignupPatient />} />

                    <Route path="/auth/doctor/login" element={<LoginDoctor />} />
                    <Route path="/auth/doctor/signup" element={<SignupDoctor />} />

                    <Route path="/auth/nurse/login" element={<LoginNurse />} />
                    <Route path="/auth/nurse/signup" element={<SignupNurse />} />

                    <Route path="/auth/driver/login" element={<LoginDriver />} />
                    <Route path="/auth/driver/signup" element={<SignupDriver />} />

                    {/* Dashboard Routes */}
                    <Route path="/patient/*" element={<PatientDashboard />} />
                    <Route path="/doctor/*" element={<DoctorDashboard />} />
                    <Route path="/nurse/*" element={<NurseDashboard />} />
                    <Route path="/driver/*" element={<DriverDashboard />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
