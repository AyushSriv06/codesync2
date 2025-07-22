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
  editorRef?: any;
}

const UserCursor = ({ cursors, editorRef }: UserCursorProps) => {
  const [visibleCursors, setVisibleCursors] = useState<UserCursor[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    // Filter out old cursors (older than 10 seconds)
    const now = Date.now();
    const activeCursors = cursors.filter(cursor => now - cursor.timestamp < 10000);
    setVisibleCursors(activeCursors);

    // Calculate pixel positions for cursors
    if (editorRef?.current && activeCursors.length > 0) {
      const editor = editorRef.current;
      const newPositions = new Map();

      activeCursors.forEach((cursor) => {
        try {
          // Get the pixel position from Monaco Editor
          const position = {
            lineNumber: cursor.position.lineNumber,
            column: cursor.position.column
          };
          
          const pixelPosition = editor.getScrolledVisiblePosition(position);
          
          if (pixelPosition) {
            newPositions.set(cursor.userId, {
              x: pixelPosition.left,
              y: pixelPosition.top
            });
          }
        } catch (error) {
          console.warn('Error calculating cursor position:', error);
        }
      });

      setCursorPositions(newPositions);
    }
  }, [cursors, editorRef]);

  if (!editorRef?.current) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <AnimatePresence>
        {visibleCursors.map((cursor) => {
          const position = cursorPositions.get(cursor.userId);
          if (!position) return null;

          return (
            <motion.div
              key={cursor.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-1px, 0)',
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
                className="absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg z-30"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.userName}
                <div 
                  className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent"
                  style={{ borderTopColor: cursor.color }}
                />
              </motion.div>

              {/* Selection Highlight (if exists) */}
              {cursor.position.startLineNumber && cursor.position.endLineNumber && (
                <div
                  className="absolute opacity-20 rounded pointer-events-none"
                  style={{
                    backgroundColor: cursor.color,
                    // This would need more complex calculation for multi-line selections
                    width: `${Math.abs((cursor.position.endColumn || 0) - (cursor.position.startColumn || 0)) * 7.2}px`,
                    height: '20px',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default UserCursor;