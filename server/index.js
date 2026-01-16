const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tech-bridge';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/circles', require('./routes/circles'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/students', require('./routes/students'));
app.use('/api/supports', require('./routes/supports'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/evaluation', require('./routes/evaluation'));

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Vercel用のエクスポート（Vercelではappを直接エクスポート）
// ただし、Socket.ioを使う場合はserverをエクスポートする必要がある
// Vercel Serverless FunctionsではSocket.ioは制限があるため、通常のHTTPリクエストのみ対応

const PORT = process.env.PORT || 5000;

// ローカル開発時のみサーバーを起動
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Vercel用のエクスポート
module.exports = app;
