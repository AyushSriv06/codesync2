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
    roomId 
  } = useSocketCollaborationStore();
  
  const { setLanguage, editor } = useCodeEditorStore();

  useEffect(() => {
    if (!socket) return;

    setSocket(socket);

    // Socket event listeners
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Room events
    socket.on('room-state', ({ code, language, messages, users }) => {
      console.log('Received room state:', { code, language, messages, users });
      
      // Update editor with room code
      if (editor && code) {
        editor.setValue(code);
      }
      
      // Update language
      setLanguage(language);
      
      // Update messages and users
      setMessages(messages);
      setUsers(users);
      setJoining(false);
      
      toast.success('Joined room successfully!');
    });

    socket.on('user-joined', ({ user, users }) => {
      console.log('User joined:', user);
      setUsers(users);
      toast.success(`${user.name} joined the room`);
    });

    socket.on('user-left', ({ userName, users }) => {
      console.log('User left:', userName);
      setUsers(users);
      toast.info(`${userName} left the room`);
    });

    // Code synchronization
    socket.on('code-update', ({ code, userId }) => {
      console.log('Code update from:', userId);
      if (editor && userId !== socket.id) {
        const currentPosition = editor.getPosition();
        editor.setValue(code);
        if (currentPosition) {
          editor.setPosition(currentPosition);
        }
      }
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

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('receive-message');
    };
  }, [socket, editor, setSocket, setConnected, setRoomId, setUsers, addMessage, setMessages, setLanguage, setJoining]);

  return <>{children}</>;
};