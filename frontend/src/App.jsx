import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

// Auth
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';

// Admin
import EnhancedAdminDashboard from './screens/admin/EnhancedAdminDashboard';
import UsersManagement from './screens/admin/UsersManagement';
import ActivityFeed from './screens/admin/ActivityFeed';

// Doctor
import CreatePrescription from './screens/doctor/CreatePrescription';
import DoctorDashboard from './screens/doctor/DoctorDashboard';
import Appointments from './screens/doctor/Appointments';

// Patient
import PatientDashboard from './screens/patient/PatientDashboard';
import PatientPrescriptions from './screens/patient/PatientPrescriptions';
import PatientChat from './screens/patient/PatientChat';
import MedicalRecordsTimeline from './screens/patient/MedicalRecordsTimeline';
import MedicationReminders from './screens/patient/MedicationReminders';
import FamilyAccounts from './screens/patient/FamilyAccounts';
import BookDoctor from './screens/patient/BookDoctor';
import Emergency from './screens/patient/Emergency';
import SymptomChecker from './screens/patient/SymptomChecker';
import OrderDrugs from './screens/patient/OrderDrugs';
import NutritionAI from './screens/patient/NutritionAI';
import FitnessAI from './screens/patient/FitnessAI';
import VirtualNurse from './screens/patient/VirtualNurse';

// Nurse
import NurseDashboard from './screens/nurse/NurseDashboard';
import HomeCareTasks from './screens/nurse/HomeCareTasks';
import AssignedPatients from './screens/nurse/AssignedPatients';

// Driver
import DriverDeliveries from './screens/driver/DriverDeliveries';
import DriverDashboard from './screens/driver/DriverDashboard';
import TransportRequests from './screens/driver/TransportRequests';

// Video
import VideoConsultation from './components/video/VideoConsultation';

// Mobile Navigation
import MobileNav from './components/navigation/MobileNav';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('genova_user') || '{}');
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Layout with Mobile Nav
const AppLayout = ({ children, role }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
            <MobileNav role={role} />
        </div>
    );
};

// Home Redirect Helper
const HomeRedirect = () => {
    const user = JSON.parse(localStorage.getItem('genova_user') || '{}');
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/login" replace />;

    switch (user.role) {
        case 'admin': return <Navigate to="/admin/dashboard" replace />;
        case 'doctor': return <Navigate to="/doctor/dashboard" replace />;
        case 'patient': return <Navigate to="/patient/dashboard" replace />;
        case 'driver': return <Navigate to="/driver/dashboard" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

function App() {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/auth/:role/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/:role/signup" element={<Register />} />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AppLayout role="admin">
                                        <EnhancedAdminDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AppLayout role="admin">
                                        <UsersManagement />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/activity"
                            element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AppLayout role="admin">
                                        <ActivityFeed />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Doctor Routes */}
                        <Route
                            path="/doctor/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['doctor']}>
                                    <AppLayout role="doctor">
                                        <DoctorDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/doctor/appointments"
                            element={
                                <ProtectedRoute allowedRoles={['doctor']}>
                                    <AppLayout role="doctor">
                                        <Appointments />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/doctor/prescriptions"
                            element={
                                <ProtectedRoute allowedRoles={['doctor']}>
                                    <AppLayout role="doctor">
                                        <CreatePrescription />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/doctor/chat"
                            element={
                                <ProtectedRoute allowedRoles={['doctor']}>
                                    <AppLayout role="doctor">
                                        <PatientChat />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Patient Routes */}
                        <Route
                            path="/patient/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <PatientDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/prescriptions"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <PatientPrescriptions />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/chat"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <PatientChat />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/records"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <MedicalRecordsTimeline />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/medications"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <MedicationReminders />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/family"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <FamilyAccounts />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/book-doctor"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <BookDoctor />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/emergency"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <Emergency />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/virtual-nurse"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <VirtualNurse />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/symptom-checker"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <SymptomChecker />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/order-drugs"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <OrderDrugs />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/nutrition"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <NutritionAI />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patient/fitness"
                            element={
                                <ProtectedRoute allowedRoles={['patient']}>
                                    <AppLayout role="patient">
                                        <FitnessAI />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Nurse Routes */}
                        <Route
                            path="/nurse/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['nurse']}>
                                    <AppLayout role="nurse">
                                        <NurseDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/nurse/home-care-tasks"
                            element={
                                <ProtectedRoute allowedRoles={['nurse']}>
                                    <AppLayout role="nurse">
                                        <HomeCareTasks />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/nurse/chat"
                            element={
                                <ProtectedRoute allowedRoles={['nurse']}>
                                    <AppLayout role="nurse">
                                        <PatientChat />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/nurse/assigned-patients"
                            element={
                                <ProtectedRoute allowedRoles={['nurse']}>
                                    <AppLayout role="nurse">
                                        <AssignedPatients />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Driver Routes */}
                        <Route
                            path="/driver/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['driver']}>
                                    <AppLayout role="driver">
                                        <DriverDashboard />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/driver/deliveries"
                            element={
                                <ProtectedRoute allowedRoles={['driver']}>
                                    <AppLayout role="driver">
                                        <DriverDeliveries />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/driver/transport-requests"
                            element={
                                <ProtectedRoute allowedRoles={['driver']}>
                                    <AppLayout role="driver">
                                        <TransportRequests />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/driver/chat"
                            element={
                                <ProtectedRoute allowedRoles={['driver']}>
                                    <AppLayout role="driver">
                                        <PatientChat />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Video Consultation (All authenticated users) */}
                        <Route
                            path="/consultation/:appointmentId"
                            element={
                                <ProtectedRoute>
                                    <VideoConsultation />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Routes */}
                        <Route path="/" element={<HomeRedirect />} />

                        {/* 404 */}
                        <Route path="*" element={<HomeRedirect />} />
                    </Routes>
                </ToastProvider>
            </ThemeProvider>
        </HashRouter >
    );
}

export default App;
