import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

// Auth
import Login from './screens/auth/Login';
import Register from './screens/auth/Register';

// Admin
import EnhancedAdminDashboard from './screens/admin/EnhancedAdminDashboard';

// Doctor
import CreatePrescription from './screens/doctor/CreatePrescription';

// Patient
import PatientDashboard from './screens/patient/PatientDashboard';
import PatientPrescriptions from './screens/patient/PatientPrescriptions';
import PatientChat from './screens/patient/PatientChat';
import MedicalRecordsTimeline from './screens/patient/MedicalRecordsTimeline';
import MedicationReminders from './screens/patient/MedicationReminders';
import FamilyAccounts from './screens/patient/FamilyAccounts';
import BookDoctor from './screens/patient/BookDoctor';
import Emergency from './screens/patient/Emergency';

// Driver
import DriverDeliveries from './screens/driver/DriverDeliveries';

// Video
import VideoConsultation from './components/video/VideoConsultation';

// Mobile Navigation
import MobileNav from './components/navigation/MobileNav';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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

function App() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <BrowserRouter>
            <ThemeProvider>
                <ToastProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

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

                        {/* Doctor Routes */}
                        <Route
                            path="/doctor/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['doctor']}>
                                    <AppLayout role="doctor">
                                        <CreatePrescription />
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

                        {/* Driver Routes */}
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
                        <Route
                            path="/"
                            element={
                                user.role === 'admin' ? (
                                    <Navigate to="/admin/dashboard" replace />
                                ) : user.role === 'doctor' ? (
                                    <Navigate to="/doctor/dashboard" replace />
                                ) : user.role === 'patient' ? (
                                    <Navigate to="/patient/dashboard" replace />
                                ) : user.role === 'driver' ? (
                                    <Navigate to="/driver/deliveries" replace />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />

                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ToastProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
