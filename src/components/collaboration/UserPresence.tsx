"use client";

import { useSocketCollaborationStore } from "@/store/useSocketCollaborationStore";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

const UserPresence = () => {
  const { users } = useSocketCollaborationStore();

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId: string) => {
    const colors = [
      "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
      "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
    ];
    const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                x: 0,
                transition: { delay: index * 0.1 }
              }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              className="relative group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white/20"
                style={{ backgroundColor: getUserColor(user.id) }}
              >
                {getUserInitials(user.name)}
              </div>
              
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {user.name}
              </div>

              {/* Online Indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-gray-900" />
            </motion.div>
          ))}
        </AnimatePresence>

        {users.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-2 px-2 py-1 bg-gray-800/80 backdrop-blur-sm rounded-lg text-xs text-gray-300"
          >
            {users.length} online
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UserPresence;