"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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

interface UserCursorProps {
  cursors: UserCursor[];
}

const UserCursor = ({ cursors }: UserCursorProps) => {
  const [visibleCursors, setVisibleCursors] = useState<UserCursor[]>([]);

  useEffect(() => {
    // Filter out old cursors (older than 10 seconds)
    const now = Date.now();
    const activeCursors = cursors.filter(cursor => now - cursor.timestamp < 10000);
    setVisibleCursors(activeCursors);
  }, [cursors]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {visibleCursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute"
            style={{
              // This is a simplified positioning - in a real implementation,
              // you'd need to calculate the exact pixel position based on
              // the Monaco Editor's line height and character width
              top: `${cursor.position.lineNumber * 19}px`, // Approximate line height
              left: `${cursor.position.column * 7.2}px`, // Approximate character width
            }}
          >
            {/* Cursor Line */}
            <div
              className="w-0.5 h-5 animate-pulse"
              style={{ backgroundColor: cursor.color }}
            />
            
            {/* User Name Bubble */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </motion.div>

            {/* Selection Highlight (if exists) */}
            {cursor.position.startLineNumber && cursor.position.endLineNumber && (
              <div
                className="absolute opacity-20 rounded"
                style={{
                  backgroundColor: cursor.color,
                  top: `${(cursor.position.startLineNumber - cursor.position.lineNumber) * 19}px`,
                  left: `${(cursor.position.startColumn! - cursor.position.column) * 7.2}px`,
                  width: `${(cursor.position.endColumn! - cursor.position.startColumn!) * 7.2}px`,
                  height: `${(cursor.position.endLineNumber - cursor.position.startLineNumber + 1) * 19}px`,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UserCursor;