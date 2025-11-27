import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { io } from 'socket.io-client';
import Card from '../../components/ui/Card';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const center = {
    lat: 6.5244, // Lagos
    lng: 3.3792
};

const AdminDashboard = () => {
    const [drivers, setDrivers] = useState({});
    const [socket, setSocket] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY" // Replace with actual key
    });

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('admin_driver_update', (data) => {
            setDrivers(prev => ({
                ...prev,
                [data.driverId]: data
            }));
        });

        return () => newSocket.close();
    }, []);

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    return isLoaded ? (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Live Driver Tracking</h1>
            <Card className="p-0 overflow-hidden">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    {Object.values(drivers).map((driver) => (
                        <Marker
                            key={driver.driverId}
                            position={driver.location}
                            title={driver.name}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/ambulance.png"
                            }}
                        />
                    ))}
                </GoogleMap>
            </Card>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(drivers).map((driver) => (
                    <Card key={driver.driverId} className="p-4">
                        <h3 className="font-bold">{driver.name}</h3>
                        <p className="text-sm text-gray-500">Plate: {driver.plate}</p>
                        <p className="text-xs text-green-600 font-mono mt-1">
                            Lat: {driver.location.lat.toFixed(4)}, Lng: {driver.location.lng.toFixed(4)}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    ) : <div>Loading Maps...</div>;
};

export default AdminDashboard;
