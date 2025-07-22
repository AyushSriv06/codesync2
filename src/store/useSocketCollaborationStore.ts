import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  joinedAt?: number;
  color?: string;
}

interface ChatMessage {
  id: number;
  message: string;
  userName: string;
  userId: string;
  timestamp: number;
}

interface CursorPosition {
  lineNumber: number;
  column: number;
  startLineNumber?: number;
  startColumn?: number;
  endLineNumber?: number;
  endColumn?: number;
}

interface UserCursor {
  userId: string;
  userName: string;
  position: CursorPosition;
  color: string;
  timestamp: number;
}

interface SocketCollaborationState {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  users: User[];
  messages: ChatMessage[];
  isJoining: boolean;
  userCursors: UserCursor[];
  
  // Actions
  setSocket: (socket: Socket) => void;
  setConnected: (connected: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setUsers: (users: User[]) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setJoining: (joining: boolean) => void;
  updateUserCursor: (cursor: UserCursor) => void;
  removeUserCursor: (userId: string) => void;
  
  // Socket actions
  joinRoom: (roomId: string, userName: string) => void;
  leaveRoom: () => void;
  sendCodeChange: (code: string) => void;
  sendLanguageChange: (language: string) => void;
  sendMessage: (message: string, userName: string) => void;
  sendCursorPosition: (position: CursorPosition, userName: string) => void;
}

export const useSocketCollaborationStore = create<SocketCollaborationState>((set, get) => ({
  socket: null,
  isConnected: false,
  roomId: null,
  users: [],
  messages: [],
  isJoining: false,
  userCursors: [],

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),
  setRoomId: (roomId) => set({ roomId }),
  setUsers: (users) => set({ users }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setMessages: (messages) => set({ messages }),
  setJoining: (joining) => set({ isJoining: joining }),
  
  updateUserCursor: (cursor) => set((state) => ({
    userCursors: [
      ...state.userCursors.filter(c => c.userId !== cursor.userId),
      cursor
    ]
  })),
  
  removeUserCursor: (userId) => set((state) => ({
    userCursors: state.userCursors.filter(c => c.userId !== userId)
  })),

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
        isConnected: false,
        userCursors: []
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

  sendCursorPosition: (position, userName) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('cursor-change', {
        roomId,
        position,
        userId: socket.id,
        userName
      });
    }
  },
}));