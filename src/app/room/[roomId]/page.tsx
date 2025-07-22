'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SocketCollaborationProvider } from '@/components/collaboration/SocketCollaborationProvider';
import CollaborativeEditor from '@/components/collaboration/CollaborativeEditor';
import EnhancedChatBox from '@/components/collaboration/EnhancedChatBox';
import { useSocketCollaborationStore } from '@/store/useSocketCollaborationStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Wifi, Settings } from 'lucide-react';
import Link from 'next/link';
import RunButton from '@/app/(root)/_components/RunButton';
import ThemeSelector from '@/app/(root)/_components/ThemeSelector';
import LanguageSelector from '@/app/(root)/_components/LanguageSelector';
import OutputPanel from '@/app/(root)/_components/OutputPanel';
import toast from 'react-hot-toast';

export default function RoomPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { roomId } = useParams();
  const { joinRoom, isConnected, users, leaveRoom } = useSocketCollaborationStore();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      toast.error('Please sign in to join a room');
      router.push('/');
      return;
    }

    if (roomId && typeof roomId === 'string') {
      const userName = user.firstName || user.emailAddresses[0].emailAddress;
      joinRoom(roomId, userName);
    }

    // Cleanup on unmount
    return () => {
      leaveRoom();
    };
  }, [roomId, user, isLoaded, joinRoom, leaveRoom, router]);

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/');
    toast.success('Left the room');
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketCollaborationProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        {/* Header */}
        <div className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Editor</span>
                </Link>
                
                <div className="h-6 w-px bg-gray-800" />
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm font-medium text-white">
                      Room: {roomId}
                    </span>
                  </div>
                  
                  {isConnected && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm">
                      <Users className="w-3 h-3" />
                      <span>{users.length} online</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <ThemeSelector />
                <LanguageSelector />
                <RunButton />
                
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
                    <Wifi className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-white">Collaborative Editor</h2>
                    <p className="text-xs text-gray-500">Real-time code collaboration</p>
                  </div>
                </div>
              </div>
              
              <CollaborativeEditor />
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <OutputPanel />
            </motion.div>
          </div>
        </div>

        {/* Enhanced Chat */}
        <EnhancedChatBox />
      </div>
    </SocketCollaborationProvider>
  );
}
