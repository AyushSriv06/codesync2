// app/room/[roomId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { SocketCollaborationProvider } from '@/components/collaboration/SocketCollaborationProvider';
import EditorPanel from '@/components/collaboration/EditorPanel';
import ChatPanel from '@/components/collaboration/ChatBox';
import ChatBox from '@/components/collaboration/ChatBox';


export default function RoomPage() {
  const { roomId } = useParams();

  return (
    <SocketCollaborationProvider>
      <div className="flex h-screen">
        <EditorPanel  />
        <ChatBox />
      </div>
    </SocketCollaborationProvider>
  );
}
