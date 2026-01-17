import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { useToast } from '../ui/Toast';

const PatientSearch = ({ onSelect, selectedPatient }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchPatients = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                // Using the admin endpoint for now as it returns all users of a role
                // In a real app, we'd have a dedicated doctor-patient search endpoint
                const response = await fetch(`http://localhost:5000/api/admin/users/patient`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.users.filter(user =>
                        user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
                        user.email?.toLowerCase().includes(query.toLowerCase())
                    );
                    setResults(filtered.slice(0, 5)); // Limit to 5 results
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchPatients, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (patient) => {
        onSelect(patient);
        setQuery('');
        setIsOpen(false);
    };

    const clearSelection = () => {
        onSelect(null);
        setQuery('');
    };

    if (selectedPatient) {
        return (
            <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-800 p-2 rounded-full">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedPatient.full_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedPatient.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={clearSelection}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search patient by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {results.map((patient) => (
                        <button
                            key={patient.id}
                            onClick={() => handleSelect(patient)}
                            className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {patient.full_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {patient.email}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
