const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store room data
const rooms = new Map();

// Helper function to get or create room
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      code: '',
      language: 'javascript',
      messages: []
    });
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', ({ roomId, userName }) => {
    console.log(`User ${userName} joining room ${roomId}`);
    
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;

    const room = getRoom(roomId);
    room.users.set(socket.id, {
      id: socket.id,
      name: userName,
      joinedAt: Date.now()
    });

    // Send current room state to the new user
    socket.emit('room-state', {
      code: room.code,
      language: room.language,
      messages: room.messages,
      users: Array.from(room.users.values())
    });

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      user: { id: socket.id, name: userName },
      users: Array.from(room.users.values())
    });

    console.log(`Room ${roomId} now has ${room.users.size} users`);
  });

  // Handle code changes
  socket.on('code-change', ({ roomId, code, userId }) => {
    console.log(`Code change in room ${roomId} by user ${userId}`);
    
    const room = getRoom(roomId);
    room.code = code;

    // Broadcast to all other users in the room
    socket.to(roomId).emit('code-update', { code, userId });
  });

  // Handle language changes
  socket.on('language-change', ({ roomId, language, userId }) => {
    console.log(`Language change in room ${roomId} to ${language} by user ${userId}`);
    
    const room = getRoom(roomId);
    room.language = language;

    // Broadcast to all users in the room (including sender)
    io.to(roomId).emit('language-update', { language, userId });
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, userName }) => {
    console.log(`Message in room ${roomId} from ${userName}: ${message}`);
    
    const room = getRoom(roomId);
    const messageData = {
      id: Date.now() + Math.random(),
      message,
      userName,
      userId: socket.id,
      timestamp: Date.now()
    };

    room.messages.push(messageData);

    // Keep only last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    // Broadcast to all users in the room
    io.to(roomId).emit('receive-message', messageData);
  });

  // Handle cursor position updates (optional)
  socket.on('cursor-change', ({ roomId, position, userId }) => {
    socket.to(roomId).emit('cursor-update', { position, userId, userName: socket.userName });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      const room = getRoom(socket.roomId);
      room.users.delete(socket.id);

      // Notify other users in the room
      socket.to(socket.roomId).emit('user-left', {
        userId: socket.id,
        userName: socket.userName,
        users: Array.from(room.users.values())
      });

      console.log(`Room ${socket.roomId} now has ${room.users.size} users`);

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(socket.roomId);
        console.log(`Room ${socket.roomId} deleted (empty)`);
      }
    }
  });

  // Handle leaving room manually
  socket.on('leave-room', ({ roomId }) => {
    if (socket.roomId === roomId) {
      const room = getRoom(roomId);
      room.users.delete(socket.id);

      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        userName: socket.userName,
        users: Array.from(room.users.values())
      });

      socket.leave(roomId);
      socket.roomId = null;
      socket.userName = null;

      console.log(`User ${socket.id} left room ${roomId}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});