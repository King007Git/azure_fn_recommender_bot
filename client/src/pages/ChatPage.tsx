import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ChatArea from '@/components/ChatArea';

export default function ChatPage() {
  const [topK, setTopK] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(50);

  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      <Navbar 
        topK={topK} 
        setTopK={setTopK} 
        threshold={threshold} 
        setThreshold={setThreshold} 
        showSettings={true}
      />
      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <ChatArea topK={topK} threshold={threshold} />
      </main>
    </div>
  );
}