const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://genova-health.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`Blocked by CORS: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Request Logger for Auth
app.use('/api/auth', (req, res, next) => {
    console.log(`[AUTH] ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const videoRoutes = require('./routes/videoRoutes');
const fitnessRoutes = require('./routes/fitnessRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const driverLocationRoutes = require('./api/driverLocation');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/driver', driverLocationRoutes);

// Health check endpoint for monitoring platforms
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

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

const serverInstance = server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handling
const gracefulShutdown = () => {
    console.log('Received shutdown signal. Closing server...');
    serverInstance.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
