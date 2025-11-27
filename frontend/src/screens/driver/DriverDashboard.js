import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Navigation,
    Phone,
    Clock,
    AlertTriangle,
    Power
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { authService } from '../../services/authService';
import { io } from 'socket.io-client';

const DriverDashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(authService.getCurrentUser());
    const [isOnline, setIsOnline] = useState(false);
    const [socket, setSocket] = useState(null);

    // Simulation interval ref
    const intervalRef = React.useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (isOnline && socket && user) {
            // Simulate movement around Lagos
            let lat = 6.5244;
            let lng = 3.3792;

            intervalRef.current = setInterval(() => {
                lat += (Math.random() - 0.5) * 0.001;
                lng += (Math.random() - 0.5) * 0.001;

                socket.emit('driver_location_update', {
                    driverId: user.id || 'driver-123', // Fallback for mock user
                    name: user.fullName,
                    plate: user.plateNumber || 'LAG-123-XY',
                    location: { lat, lng }
                });
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isOnline, socket, user]);
    const [activeRequest, setActiveRequest] = useState({
        id: 1,
        patientName: "John Doe",
        location: "123 Lagos Street, Ikeja",
        distance: "2.5 km",
        eta: "8 mins",
        type: "Emergency"
    });

    if (!user) {
        navigate('/auth/driver/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error font-bold">
                            DR
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">{user.fullName}</h1>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                                {isOnline ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant={isOnline ? 'outline' : 'primary'}
                        onClick={() => setIsOnline(!isOnline)}
                        className={isOnline ? 'text-red-600 border-red-200 hover:bg-red-50' : ''}
                    >
                        <Power className="w-4 h-4 mr-1" />
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </Button>
                </div>
            </header>

            <main className="p-4 max-w-md mx-auto space-y-6">
                {/* Status Card */}
                {!isOnline && (
                    <Card className="bg-gray-800 text-white text-center py-8">
                        <h2 className="text-xl font-bold mb-2">You are Offline</h2>
                        <p className="text-gray-400">Go online to receive emergency requests.</p>
                    </Card>
                )}

                {isOnline && activeRequest && (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-2 text-red-700 font-bold">
                                <AlertTriangle className="w-5 h-5" />
                                NEW EMERGENCY REQUEST
                            </div>
                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-red-100">00:45</span>
                        </div>

                        <Card className="overflow-hidden">
                            {/* Map Placeholder */}
                            <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-500">
                                <MapPin className="w-8 h-8 mb-2" />
                                <span className="ml-2">Map View</span>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900">{activeRequest.distance}</h3>
                                        <p className="text-gray-500 text-sm">away from pickup</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-primary">{activeRequest.eta}</p>
                                        <p className="text-gray-500 text-sm">ETA</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Pickup Location</p>
                                            <p className="font-medium text-gray-900">{activeRequest.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Patient</p>
                                            <p className="font-medium text-gray-900">{activeRequest.patientName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="flex items-center justify-center gap-2">
                                        <Phone className="w-4 h-4" /> Call
                                    </Button>
                                    <Button variant="primary" className="flex items-center justify-center gap-2">
                                        <Navigation className="w-4 h-4" /> Navigate
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Button variant="danger" className="w-full py-4 text-lg font-bold shadow-lg shadow-red-200">
                            ACCEPT REQUEST
                        </Button>
                    </div>
                )}

                {isOnline && !activeRequest && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 animate-pulse">
                            <Navigation className="w-8 h-8" />
                        </div>
                        <p>Searching for nearby requests...</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DriverDashboard;
