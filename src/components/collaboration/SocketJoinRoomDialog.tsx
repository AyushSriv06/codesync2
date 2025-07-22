"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Wifi, Copy, Check } from "lucide-react";
import { useSocketCollaborationStore } from "@/store/useSocketCollaborationStore";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
interface SocketJoinRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocketJoinRoomDialog = ({ isOpen, onClose }: SocketJoinRoomDialogProps) => {
  const { user } = useUser();
  const router = useRouter(); 
  const { 
    joinRoom, 
    isConnected, 
    roomId: currentRoomId, 
    users,
    isJoining 
  } = useSocketCollaborationStore();
  
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }

    if (!user) {
      toast.error("Please sign in to join a room");
      return;
    }

    const userName = user.firstName || user.emailAddresses[0].emailAddress;
    try {
      await joinRoom(roomId.trim(), userName); 
      router.push(`/room/${roomId.trim()}`); 
      onClose(); 
    } catch (err) {
      toast.error("Failed to join room");
    }
  };

  const copyRoomId = async () => {
    if (currentRoomId) {
      await navigator.clipboard.writeText(currentRoomId);
      setCopied(true);
      toast.success("Room ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1e1e2e] rounded-xl border border-[#313244] shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#313244]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isConnected ? "Room Status" : "Join Collaboration Room"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {isConnected ? "Currently connected" : "Collaborate in real-time"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isConnected ? (
                /* Connected State */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected to room</span>
                  </div>
                  
                  <div className="bg-[#0a0a0f] rounded-lg p-4 border border-[#313244]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Room ID</span>
                      <button
                        onClick={copyRoomId}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-lg text-white">{currentRoomId}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Connected users</span>
                      <span className="text-white font-medium">{users.length}</span>
                    </div>
                    
                    {users.length > 0 && (
                      <div className="bg-[#0a0a0f] rounded-lg p-3 border border-[#313244]">
                        <div className="space-y-1">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Join Room State */
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room ID
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        placeholder="Enter room ID"
                        className="flex-1 px-3 py-2 bg-[#0a0a0f] border border-[#313244] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        maxLength={6}
                      />
                      <button
                        onClick={generateRoomId}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-300">
                      💡 Share the room ID with others to collaborate on the same code in real-time.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#313244]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {isConnected ? "Close" : "Cancel"}
              </button>
              {!isConnected && (
                <button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !roomId.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Join Room
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SocketJoinRoomDialog;