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
      code: '// Welcome to the collaborative room!\nconsole.log("Hello, World!");',
      language: 'javascript',
      messages: [],
      cursors: new Map()
    });
  }
  return rooms.get(roomId);
}

// Generate user color based on user ID
function getUserColor(userId) {
  const colors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ];
  const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', ({ roomId, userName }) => {
    console.log(`User ${userName} (${socket.id}) joining room ${roomId}`);
    
    try {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;

      const room = getRoom(roomId);
      room.users.set(socket.id, {
        id: socket.id,
        name: userName,
        joinedAt: Date.now(),
        color: getUserColor(socket.id)
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
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  // Handle code changes
  socket.on('code-change', ({ roomId, code, userId }) => {
    console.log(`Code change in room ${roomId} by user ${userId || socket.id}, code length: ${code?.length}`);
    
    try {
      const room = getRoom(roomId);
      room.code = code;

      // Broadcast to all other users in the room
      console.log(`Broadcasting code update to room ${roomId}, excluding ${socket.id}`);
      socket.to(roomId).emit('code-update', { code, userId: socket.id });
    } catch (error) {
      console.error('Error handling code change:', error);
      socket.emit('error', 'Failed to update code');
    }
  });

  // Handle language changes
  socket.on('language-change', ({ roomId, language, userId }) => {
    console.log(`Language change in room ${roomId} to ${language} by user ${userId || socket.id}`);
    
    try {
      const room = getRoom(roomId);
      room.language = language;

      // Broadcast to all users in the room (including sender)
      console.log(`Broadcasting language update to room ${roomId}`);
      io.to(roomId).emit('language-update', { language, userId: socket.id });
    } catch (error) {
      console.error('Error handling language change:', error);
      socket.emit('error', 'Failed to update language');
    }
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, userName }) => {
    console.log(`Message in room ${roomId} from ${userName}: ${message}`);
    
    try {
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
      console.log(`Broadcasting message to room ${roomId}`);
      io.to(roomId).emit('receive-message', messageData);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle cursor position updates
  socket.on('cursor-change', ({ roomId, position, userId, userName }) => {
    // console.log(`Cursor update in room ${roomId} from ${userName || socket.userName}`); // Commented to reduce log spam
    
    try {
      const room = getRoom(roomId);
      room.cursors.set(socket.id, {
        position,
        userName: userName || socket.userName,
        timestamp: Date.now()
      });
      
      // Broadcast cursor position to other users
      socket.to(roomId).emit('cursor-update', { 
        position, 
        userId: socket.id, 
        userName: userName || socket.userName 
      });
    } catch (error) {
      console.error('Error handling cursor change:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      try {
        const room = getRoom(socket.roomId);
        room.users.delete(socket.id);
        room.cursors.delete(socket.id);

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
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    }
  });

  // Handle leaving room manually
  socket.on('leave-room', ({ roomId }) => {
    console.log(`User ${socket.id} manually leaving room ${roomId}`);
    
    if (socket.roomId === roomId) {
      try {
        const room = getRoom(roomId);
        room.users.delete(socket.id);
        room.cursors.delete(socket.id);

        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          userName: socket.userName,
          users: Array.from(room.users.values())
        });

        socket.leave(roomId);
        socket.roomId = null;
        socket.userName = null;

        console.log(`User ${socket.id} left room ${roomId}`);
      } catch (error) {
        console.error('Error handling leave room:', error);
      }
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});