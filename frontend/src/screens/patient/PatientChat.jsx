import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ChatRoom from '../../components/chat/ChatRoom';
import { EmptyChat } from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';
import SearchBar from '../../components/ui/SearchBar';

const PatientChat = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [providers, setProviders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();

    const [newChatForm, setNewChatForm] = useState({
        providerType: 'doctor',
        providerId: ''
    });

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const fetchChatRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/rooms`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setChatRooms(data.rooms || []);
        } catch (error) {
            toast?.error('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const createNewChat = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newChatForm)
            });

            if (response.ok) {
                const data = await response.json();
                toast?.success('Chat created successfully');
                setShowNewChatModal(false);
                setNewChatForm({ providerType: 'doctor', providerId: '' });
                fetchChatRooms();
                setSelectedRoom(data.room);
            } else {
                toast?.error('Failed to create chat');
            }
        } catch (error) {
            toast?.error('An error occurred');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    const filteredRooms = chatRooms.filter(room =>
        room.provider_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedRoom) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <Button
                        onClick={() => setSelectedRoom(null)}
                        className="mb-4 bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        ← Back to Chats
                    </Button>

                    {/* Chat Header */}
                    <Card className="p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {selectedRoom.provider_name || 'Healthcare Provider'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {selectedRoom.provider_type}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Chat Room */}
                    <ChatRoom
                        roomId={selectedRoom.id}
                        userId={selectedRoom.patient_id}
                        userRole="patient"
                        userName="You"
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
                <div className="max-w-5xl mx-auto">
                    <SkeletonList count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Messages
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Chat with your healthcare providers
                        </p>
                    </div>
                    <Button onClick={() => setShowNewChatModal(true)} className="w-full md:w-auto">
                        <Plus className="w-5 h-5 mr-2" />
                        New Chat
                    </Button>
                </div>

                {/* Search */}
                <SearchBar
                    placeholder="Search conversations..."
                    onSearch={setSearchQuery}
                    className="mb-6"
                />

                {/* Chat Rooms List */}
                {filteredRooms.length === 0 ? (
                    <EmptyChat />
                ) : (
                    <div className="grid gap-3">
                        {filteredRooms.map((room) => (
                            <Card
                                key={room.id}
                                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedRoom(room)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {room.provider_name || 'Healthcare Provider'}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-2">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(room.last_message_at || room.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-1">
                                            {room.provider_type}
                                        </p>
                                        {room.last_message && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {room.last_message}
                                            </p>
                                        )}
                                        {room.unread_count > 0 && (
                                            <Badge variant="primary" size="sm" className="mt-2">
                                                {room.unread_count} new
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* New Chat Modal */}
                <Modal
                    isOpen={showNewChatModal}
                    onClose={() => setShowNewChatModal(false)}
                    title="Start New Conversation"
                    size="md"
                >
                    <form onSubmit={createNewChat} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Provider Type
                            </label>
                            <select
                                value={newChatForm.providerType}
                                onChange={(e) => setNewChatForm({ ...newChatForm, providerType: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="doctor">Doctor</option>
                                <option value="nurse">Nurse</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Provider ID
                            </label>
                            <input
                                type="number"
                                value={newChatForm.providerId}
                                onChange={(e) => setNewChatForm({ ...newChatForm, providerId: e.target.value })}
                                placeholder="Enter provider ID"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowNewChatModal(false)}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Start Chat
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default PatientChat;
