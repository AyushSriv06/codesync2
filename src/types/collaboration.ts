export interface CollaborationState {
  isConnected: boolean;
  roomId: string | null;
  connectedUsers: number;
  provider: any | null;
  binding: any | null;
}

export interface RoomUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export interface CollaborationStore extends CollaborationState {
  joinRoom: (roomId: string, userName: string) => Promise<void>;
  leaveRoom: () => void;
  setProvider: (provider: any) => void;
  setBinding: (binding: any) => void;
  setConnectedUsers: (count: number) => void;
}