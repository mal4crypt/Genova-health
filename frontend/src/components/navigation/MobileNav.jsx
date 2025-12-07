import React from 'react';
import { Home, MessageCircle, Calendar, User, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNav = ({ role = 'patient' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = {
        patient: [
            { icon: Home, label: 'Home', path: '/patient/dashboard' },
            { icon: Calendar, label: 'Appointments', path: '/patient/book-doctor' },
            { icon: MessageCircle, label: 'Chat', path: '/patient/chat' },
            { icon: User, label: 'Profile', path: '/patient/health-records' },
        ],
        doctor: [
            { icon: Home, label: 'Home', path: '/doctor/dashboard' },
            { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
            { icon: MessageCircle, label: 'Chat', path: '/doctor/chat' },
            { icon: Menu, label: 'More', path: '/doctor/prescriptions' },
        ],
        nurse: [
            { icon: Home, label: 'Home', path: '/nurse/dashboard' },
            { icon: Calendar, label: 'Tasks', path: '/nurse/home-care-tasks' },
            { icon: MessageCircle, label: 'Chat', path: '/nurse/chat' },
            { icon: User, label: 'Patients', path: '/nurse/assigned-patients' },
        ],
        driver: [
            { icon: Home, label: 'Home', path: '/driver/dashboard' },
            { icon: Calendar, label: 'Deliveries', path: '/driver/deliveries' },
            { icon: Menu, label: 'Requests', path: '/driver/transport-requests' },
            { icon: User, label: 'Profile', path: '/driver/profile' },
        ],
        admin: [
            { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
            { icon: User, label: 'Users', path: '/admin/users' },
            { icon: Calendar, label: 'Activity', path: '/admin/activity' },
            { icon: Menu, label: 'More', path: '/admin/settings' },
        ],
    };

    const items = navItems[role] || navItems.patient;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-bottom z-50 shadow-lg">
            <div className="flex justify-around items-center h-16">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`
                                flex flex-col items-center justify-center flex-1 h-full
                                transition-colors duration-200
                                ${isActive
                                    ? 'text-primary'
                                    : 'text-gray-500 active:text-primary'
                                }
                            `}
                        >
                            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
