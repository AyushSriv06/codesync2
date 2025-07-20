"use client";

import { useCollaborationStore } from "@/store/useCollaborationStore";
import { Users, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

const CollaborationStatus = () => {
  const { isConnected, roomId, connectedUsers } = useCollaborationStore();

  if (!isConnected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
    >
      <Wifi className="w-4 h-4" />
      <span className="text-sm font-medium">Room: {roomId}</span>
      <div className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        <span className="text-xs">{connectedUsers}</span>
      </div>
    </motion.div>
  );
};

export default CollaborationStatus;