const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Frontend URL
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const videoRoutes = require('./routes/videoRoutes');
const driverLocationRoutes = require('./api/driverLocation');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video', videoRoutes);

app.get('/', (req, res) => {
    res.send('Genova Health API is running');
});

// Socket.io Connection
const chatController = require('./controllers/chatController');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Driver location tracking (existing)
    socket.on('driver_location_update', (data) => {
        io.emit('admin_driver_update', data);
    });

    // Join chat room
    socket.on('join_chat_room', (roomId) => {
        socket.join(`room_${roomId}`);
        console.log(`Socket ${socket.id} joined room_${roomId}`);
    });

    // Leave chat room
    socket.on('leave_chat_room', (roomId) => {
        socket.leave(`room_${roomId}`);
        console.log(`Socket ${socket.id} left room_${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
        const { roomId, senderId, senderType, message } = data;

        try {
            // Save message to database
            const savedMessage = await chatController.saveMessage(
                roomId,
                senderId,
                senderType,
                message
            );

            // Broadcast to room
            io.to(`room_${roomId}`).emit('new_message', {
                ...savedMessage,
                roomId
            });
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { roomId, userName } = data;
        socket.to(`room_${roomId}`).emit('user_typing', { userName });
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
        const { roomId } = data;
        socket.to(`room_${roomId}`).emit('user_stopped_typing');
    });

    // Delivery status updates
    socket.on('delivery_status_update', (data) => {
        const { deliveryId, status, location } = data;
        io.emit('delivery_update', {
            deliveryId,
            status,
            location,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
