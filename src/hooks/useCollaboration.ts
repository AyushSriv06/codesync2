"use client";

import { useEffect } from "react";
import { useCollaborationStore } from "@/store/useCollaborationStore";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

export const useCollaboration = () => {
  const { editor } = useCodeEditorStore();
  const { isConnected, leaveRoom, provider, binding } = useCollaborationStore();

  // Cleanup on unmount or when editor changes
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveRoom();
      }
    };
  }, []);

  // Handle editor changes for collaboration
  useEffect(() => {
    if (editor && isConnected && provider && binding) {
      // The binding automatically handles synchronization
      // No additional setup needed here as MonacoBinding handles it
    }
  }, [editor, isConnected, provider, binding]);

  return {
    isConnected,
    leaveRoom,
  };
};