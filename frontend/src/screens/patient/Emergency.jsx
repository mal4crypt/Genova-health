import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Emergency = () => {
    const [status, setStatus] = useState('idle'); // idle, searching, found, arrived
    const [driver, setDriver] = useState(null);

    const handleEmergency = () => {
        setStatus('searching');

        // Simulate finding a driver
        setTimeout(() => {
            setDriver({
                name: "Ibrahim Musa",
                plate: "LAG-123-XY",
                eta: "5 mins",
                phone: "08012345678"
            });
            setStatus('found');
        }, 3000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-error">Emergency Assistance</h2>
                <p className="text-sm text-gray-500">Immediate help is on the way</p>
            </div>

            {status === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-red-100 rounded-full animate-ping opacity-75"></div>
                        <button
                            onClick={handleEmergency}
                            className="relative w-48 h-48 bg-error rounded-full flex flex-col items-center justify-center text-white shadow-xl hover:bg-red-700 transition-transform active:scale-95"
                        >
                            <AlertTriangle className="w-16 h-16 mb-2" />
                            <span className="text-xl font-bold uppercase tracking-wider">SOS</span>
                            <span className="text-xs opacity-80 mt-1">Tap for Help</span>
                        </button>
                    </div>

                    <div className="text-center max-w-xs mx-auto">
                        <p className="text-gray-600 mb-2">Pressing this button will alert nearby emergency drivers and hospitals.</p>
                        <p className="text-sm text-gray-400">Location tracking will be enabled.</p>
                    </div>
                </div>
            )}

            {status === 'searching' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 border-4 border-error border-t-transparent rounded-full animate-spin mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Locating Driver...</h3>
                    <p className="text-gray-500">Contacting nearest ambulance services</p>
                </div>
            )}

            {status === 'found' && driver && (
                <div className="flex-1 flex flex-col space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium">Driver is on the way!</span>
                    </div>

                    <Card className="border-l-4 border-l-primary">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                                <p className="text-gray-500 text-sm">Emergency Medical Technician</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-primary">{driver.eta}</p>
                                <p className="text-xs text-gray-400">Estimated Arrival</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Ambulance Plate</p>
                                <p className="font-mono font-bold text-gray-900">{driver.plate}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Driver Phone</p>
                                <p className="font-mono font-bold text-gray-900">{driver.phone}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1 flex items-center justify-center gap-2" variant="primary">
                                <Phone className="w-4 h-4" /> Call Driver
                            </Button>
                            <Button className="flex-1 flex items-center justify-center gap-2" variant="outline">
                                <MapPin className="w-4 h-4" /> Track Live
                            </Button>
                        </div>
                    </Card>

                    <Button
                        variant="ghost"
                        className="text-error hover:bg-red-50"
                        onClick={() => setStatus('idle')}
                    >
                        Cancel Request
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Emergency;
