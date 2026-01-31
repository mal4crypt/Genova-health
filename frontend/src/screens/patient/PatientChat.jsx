import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Search, Clock, ChevronLeft, MoreHorizontal, Send, Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import ChatRoom from '../../components/chat/ChatRoom';
import { EmptyChat } from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';

const PatientChat = () => {
    const [chatRooms, setChatRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
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
            <div className="fixed inset-0 z-[100] bg-background flex flex-col md:relative md:inset-auto md:min-h-screen md:bg-transparent md:p-6 md:pb-28">
                <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                    {/* Premium Chat Header */}
                    <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 md:rounded-t-[2.5rem] md:border md:mb-1 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedRoom(null)}
                                className="rounded-full hover:bg-muted"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-border/50">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRoom.provider_name}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {selectedRoom.provider_name?.charAt(0) || 'P'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-black text-foreground tracking-tight leading-none text-base">
                                        {selectedRoom.provider_name || 'Healthcare Provider'}
                                    </h2>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                                        {selectedRoom.provider_type} • Online
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>

                    {/* Chat Room Implementation */}
                    <div className="flex-1 overflow-hidden relative">
                        <ChatRoom
                            roomId={selectedRoom.id}
                            userId={selectedRoom.patient_id}
                            userRole="patient"
                            userName="You"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent p-6">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="h-10 w-48 bg-muted/50 rounded-xl animate-pulse" />
                    <SkeletonList count={5} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6">
            <div className="max-w-5xl mx-auto">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
                            Conversations
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            Private and encrypted chat with your care team
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowNewChatModal(true)}
                        className="h-14 px-8 rounded-[1.5rem] shadow-xl shadow-primary/20 font-bold gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Start Care Session
                    </Button>
                </div>

                {/* Advanced Search */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search your care team or history..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-16 pl-14 pr-6 bg-card/50 border-border/50 rounded-3xl text-base font-medium shadow-sm group-focus-within:ring-4 group-focus-within:ring-primary/10 transition-all"
                    />
                </div>

                {/* Chat Rooms List */}
                <AnimatePresence mode="wait">
                    {filteredRooms.length === 0 ? (
                        <EmptyChat key="empty" />
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-4"
                        >
                            {filteredRooms.map((room, idx) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        className="p-5 border-border/50 bg-card/80 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group rounded-[2.5rem] overflow-hidden"
                                        onClick={() => setSelectedRoom(room)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <Avatar className="h-16 w-16 border-2 border-border/20 group-hover:scale-105 transition-transform">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.provider_name}`} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-black">
                                                        {room.provider_name?.charAt(0) || 'P'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="text-lg font-black text-foreground tracking-tight truncate">
                                                        {room.provider_name || 'Healthcare Provider'}
                                                    </h3>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-2 whitespace-nowrap">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTime(room.last_message_at || room.created_at)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest py-0.5 px-2 font-bold border-border/50 bg-muted/30">
                                                        {room.provider_type}
                                                    </Badge>
                                                    {room.unread_count > 0 && (
                                                        <Badge variant="primary" className="text-[9px] uppercase tracking-widest py-0.5 px-2 font-bold shadow-lg shadow-primary/20 animate-pulse">
                                                            {room.unread_count} New
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm text-muted-foreground font-medium truncate italic">
                                                    {room.last_message || 'Start a new conversation...'}
                                                </p>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-2xl bg-primary/10">
                                                <Send className="w-5 h-5 text-primary" />
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Chat Modal */}
                <Modal
                    isOpen={showNewChatModal}
                    onClose={() => setShowNewChatModal(false)}
                    title="Initialize Care Session"
                    size="md"
                >
                    <form onSubmit={createNewChat} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                Provider Authority
                            </label>
                            <select
                                value={newChatForm.providerType}
                                onChange={(e) => setNewChatForm({ ...newChatForm, providerType: e.target.value })}
                                className="w-full h-14 px-4 rounded-2xl border border-border/50 bg-muted/30 text-foreground font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="doctor">Medical Doctor</option>
                                <option value="nurse">Clinical Nurse</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground ml-2">
                                Provider Referral ID
                            </label>
                            <Input
                                type="number"
                                value={newChatForm.providerId}
                                onChange={(e) => setNewChatForm({ ...newChatForm, providerId: e.target.value })}
                                placeholder="Enter system ID..."
                                className="h-14 rounded-2xl border-border/50 bg-muted/30 font-bold"
                                required
                            />
                            <p className="text-[10px] text-muted-foreground ml-4">Authorized providers only</p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowNewChatModal(false)}
                                className="flex-1 h-14 rounded-2xl font-bold"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">
                                <MessageCircle className="w-5 h-5 mr-3" />
                                Secure Connect
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default PatientChat;
