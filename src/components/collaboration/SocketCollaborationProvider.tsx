"use client";

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useSocketCollaborationStore } from '@/store/useSocketCollaborationStore';
import { useCodeEditorStore } from '@/store/useCodeEditorStore';
import toast from 'react-hot-toast';

interface SocketCollaborationProviderProps {
  children: React.ReactNode;
}

export const SocketCollaborationProvider = ({ children }: SocketCollaborationProviderProps) => {
  const socket = useSocket();
  const { 
    setSocket, 
    setConnected, 
    setRoomId, 
    setUsers, 
    addMessage, 
    setMessages,
    setJoining,
    roomId,
    updateUserCursor,
    removeUserCursor
  } = useSocketCollaborationStore();
  
  const { setLanguage, editor } = useCodeEditorStore();

  // Generate user color based on user ID
  const getUserColor = (userId: string) => {
    const colors = [
      "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
      "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
    ];
    const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  useEffect(() => {
    if (!socket) return;

    setSocket(socket);
    console.log('Socket connected with ID:', socket.id);

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // Room events
    socket.on('room-state', ({ code, language, messages, users }) => {
      console.log('Received room state:', { code, language, messages, users });
      
      // Update editor with room code
      if (editor && code) {
        const currentPosition = editor.getPosition();
        editor.setValue(code);
        if (currentPosition) {
          editor.setPosition(currentPosition);
        }
      }
      
      // Update language
      if (language) {
        setLanguage(language);
      }
      
      // Update messages and users
      setMessages(messages || []);
      setUsers(users || []);
      setJoining(false);
      
      toast.success('Joined room successfully!');
    });

    socket.on('user-joined', ({ user, users }) => {
      console.log('User joined:', user);
      setUsers(users || []);
      toast.success(`${user.name} joined the room`);
    });

    socket.on('user-left', ({ userName, users, userId }) => {
      console.log('User left:', userName);
      setUsers(users || []);
      if (userId) {
        removeUserCursor(userId);
      }
      toast.info(`${userName} left the room`);
    });

    // Code synchronization
    socket.on('code-update', ({ code, userId }) => {
      console.log('Code update received from:', userId, 'code length:', code?.length);
      // Note: Code update handling is now done in CollaborativeEditor component
    });

    // Language synchronization
    socket.on('language-update', ({ language, userId }) => {
      console.log('Language update to:', language, 'from:', userId);
      if (userId !== socket.id) {
        setLanguage(language);
        toast.info(`Language changed to ${language}`);
      }
    });

    // Chat messages
    socket.on('receive-message', (message) => {
      console.log('Received message:', message);
      addMessage(message);
    });

    // Cursor updates
    socket.on('cursor-update', ({ position, userId, userName }) => {
      // console.log('Cursor update from:', userName, position); // Commented to reduce log spam
      if (userId !== socket.id) {
        updateUserCursor({
          userId,
          userName,
          position,
          color: getUserColor(userId),
          timestamp: Date.now()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error occurred');
    });

    // Connection error handling
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast.error('Failed to connect to collaboration server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
      socket.off('cursor-update');
      socket.off('error');
    };
  }, [socket, editor, setSocket, setConnected, setRoomId, setUsers, addMessage, setMessages, setLanguage, setJoining, updateUserCursor, removeUserCursor]);

  return <>{children}</>;
};