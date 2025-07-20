import { create } from "zustand";
import { CollaborationStore } from "@/types/collaboration";

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  isConnected: false,
  roomId: null,
  connectedUsers: 0,
  provider: null,
  binding: null,

  joinRoom: async (roomId: string, userName: string) => {
    try {
      // Dynamic imports to avoid SSR issues
      const { Doc } = await import("yjs");
      const { WebrtcProvider } = await import("y-webrtc");
      const { MonacoBinding } = await import("y-monaco");
      
      const { useCodeEditorStore } = await import("@/store/useCodeEditorStore");
      const currentEditor = useCodeEditorStore.getState().editor;
      
      if (!currentEditor) {
        throw new Error("Editor not initialized");
      }

      // Create Yjs document
      const doc = new Doc();
      const yText = doc.getText("monaco");

      // Create WebRTC provider
      const provider = new WebrtcProvider(roomId, doc, {
        signaling: ["wss://signaling.yjs.dev"],
      });

      // Set user awareness info
      provider.awareness.setLocalStateField("user", {
        name: userName,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });

      // Create Monaco binding
      const binding = new MonacoBinding(
        yText,
        currentEditor.getModel()!,
        new Set([currentEditor]),
        provider.awareness
      );

      // Update store
      set({
        isConnected: true,
        roomId,
        provider,
        binding,
      });

      // Listen for awareness changes
      provider.awareness.on("change", () => {
        const users = Array.from(provider.awareness.getStates().values());
        set({ connectedUsers: users.length });
      });

    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  },

  leaveRoom: () => {
    const { provider, binding } = get();
    
    if (binding) {
      binding.destroy();
    }
    
    if (provider) {
      provider.destroy();
    }

    set({
      isConnected: false,
      roomId: null,
      connectedUsers: 0,
      provider: null,
      binding: null,
    });
  },

  setProvider: (provider) => set({ provider }),
  setBinding: (binding) => set({ binding }),
  setConnectedUsers: (count) => set({ connectedUsers: count }),
}));