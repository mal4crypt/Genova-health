import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { io } from 'socket.io-client';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ChatRoom = ({ roomId, userId, userRole, userName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join the room
        newSocket.emit('join_chat_room', roomId);

        // Listen for new messages
        newSocket.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Listen for typing indicator
        newSocket.on('user_typing', ({ userName }) => {
            setTyping(userName);
            setTimeout(() => setTyping(false), 3000);
        });

        newSocket.on('user_stopped_typing', () => {
            setTyping(false);
        });

        // Load chat history
        fetchChatHistory();

        return () => {
            newSocket.emit('leave_chat_room', roomId);
            newSocket.close();
        };
    }, [roomId]);

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chat/rooms/${roomId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send_message', {
            roomId,
            senderId: userId,
            senderType: userRole,
            message: newMessage.trim()
        });

        setNewMessage('');
        socket.emit('stop_typing', { roomId });
    };

    const handleTyping = () => {
        if (socket) {
            socket.emit('typing', { roomId, userName });
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    const isOwn = message.sender_id === userId;
                    return (
                        <div
                            key={index}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                <div
                                    className={`
                                        rounded-lg px-4 py-2
                                        ${isOwn
                                            ? 'bg-primary text-white rounded-br-none'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {!isOwn && (
                                        <p className="text-xs font-semibold mb-1 capitalize">
                                            {message.sender_type}
                                        </p>
                                    )}
                                    <p className="text-sm break-words">{message.message}</p>
                                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-light' : 'text-gray-500'}`}>
                                        {formatTime(message.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typing && (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                    {typing} is typing...
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatRoom;
