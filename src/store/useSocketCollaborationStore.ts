import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  joinedAt?: number;
}

interface ChatMessage {
  id: number;
  message: string;
  userName: string;
  userId: string;
  timestamp: number;
}

interface SocketCollaborationState {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  users: User[];
  messages: ChatMessage[];
  isJoining: boolean;
  
  // Actions
  setSocket: (socket: Socket) => void;
  setConnected: (connected: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setUsers: (users: User[]) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setJoining: (joining: boolean) => void;
  
  // Socket actions
  joinRoom: (roomId: string, userName: string) => void;
  leaveRoom: () => void;
  sendCodeChange: (code: string) => void;
  sendLanguageChange: (language: string) => void;
  sendMessage: (message: string, userName: string) => void;
}

export const useSocketCollaborationStore = create<SocketCollaborationState>((set, get) => ({
  socket: null,
  isConnected: false,
  roomId: null,
  users: [],
  messages: [],
  isJoining: false,

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),
  setRoomId: (roomId) => set({ roomId }),
  setUsers: (users) => set({ users }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setMessages: (messages) => set({ messages }),
  setJoining: (joining) => set({ isJoining: joining }),

  joinRoom: (roomId, userName) => {
    const { socket } = get();
    if (socket) {
      set({ isJoining: true });
      socket.emit('join-room', { roomId, userName });
    }
  },

  leaveRoom: () => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('leave-room', { roomId });
      set({ 
        roomId: null, 
        users: [], 
        messages: [], 
        isConnected: false 
      });
    }
  },

  sendCodeChange: (code) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('code-change', { 
        roomId, 
        code, 
        userId: socket.id 
      });
    }
  },

  sendLanguageChange: (language) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('language-change', { 
        roomId, 
        language, 
        userId: socket.id 
      });
    }
  },

  sendMessage: (message, userName) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('send-message', { 
        roomId, 
        message, 
        userName 
      });
    }
  },
}));