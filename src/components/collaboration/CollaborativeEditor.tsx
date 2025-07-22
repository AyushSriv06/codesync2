"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useSocketCollaborationStore } from "@/store/useSocketCollaborationStore";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Users, Wifi, WifiOff } from "lucide-react";
import UserCursor from "./UserCursor";
import UserPresence from "./UserPresence";

interface CollaborativeEditorProps {
  height?: string;
}

const CollaborativeEditor = ({ height = "600px" }: CollaborativeEditorProps) => {
  const { user } = useUser();
  const { language, theme, fontSize, setEditor } = useCodeEditorStore();
  const { 
    isConnected, 
    users, 
    sendCodeChange, 
    sendCursorPosition,
    userCursors 
  } = useSocketCollaborationStore();
  
  const editorRef = useRef<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [lastChangeFromSocket, setLastChangeFromSocket] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditor(editor);

    // Handle code changes
    editor.onDidChangeModelContent((e: any) => {
      // Don't send changes if they came from socket
      if (lastChangeFromSocket) {
        setLastChangeFromSocket(false);
        return;
      }

      if (!isTyping) {
        setIsTyping(true);
        const code = editor.getValue();
        sendCodeChange(code);
        
        // Clear typing indicator after 1 second
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      }
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      if (isConnected && user) {
        const position = {
          lineNumber: e.position.lineNumber,
          column: e.position.column
        };
        sendCursorPosition(position, user.firstName || user.emailAddresses[0].emailAddress);
      }
    });

    // Handle selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      if (isConnected && user) {
        const selection = {
          startLineNumber: e.selection.startLineNumber,
          startColumn: e.selection.startColumn,
          endLineNumber: e.selection.endLineNumber,
          endColumn: e.selection.endColumn,
          lineNumber: e.selection.positionLineNumber,
          column: e.selection.positionColumn
        };
        sendCursorPosition(selection, user.firstName || user.emailAddresses[0].emailAddress);
      }
    });
  };

  // Listen for code updates from socket
  useEffect(() => {
    const handleCodeUpdate = (code: string) => {
      if (editorRef.current) {
        const currentPosition = editorRef.current.getPosition();
        setLastChangeFromSocket(true);
        editorRef.current.setValue(code);
        if (currentPosition) {
          editorRef.current.setPosition(currentPosition);
        }
      }
    };

    // This would be called from the socket store when code updates are received
    // The actual implementation is in SocketCollaborationProvider
  }, []);

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm ${
            isConnected
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connected</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{users.length}</span>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Disconnected</span>
            </>
          )}
        </motion.div>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm backdrop-blur-sm"
          >
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Syncing...</span>
          </motion.div>
        )}
      </div>

      {/* User Presence Indicators */}
      <UserPresence />

      {/* Monaco Editor */}
      <div className="relative rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
        <Editor
          height={height}
          language={LANGUAGE_CONFIG[language].monacoLanguage}
          theme={theme}
          beforeMount={defineMonacoThemes}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            renderWhitespace: "selection",
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
            fontLigatures: true,
            cursorBlinking: "smooth",
            smoothScrolling: true,
            contextmenu: true,
            renderLineHighlight: "all",
            lineHeight: 1.6,
            letterSpacing: 0.5,
            roundedSelection: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            wordWrap: "on",
            wordWrapColumn: 120,
            rulers: [80, 120],
          }}
        />

        {/* User Cursors Overlay */}
        <UserCursor cursors={userCursors} editorRef={editorRef} />
      </div>
    </div>
  );
};

export default CollaborativeEditor;