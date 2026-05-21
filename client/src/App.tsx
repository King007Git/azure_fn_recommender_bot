// src/App.tsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import ChatArea from './components/ChatArea';
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [topK, setTopK] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(50);

  return (
    // CRITICAL: added h-screen and overflow-hidden here to lock the main container frame
    <div className="h-screen w-screen bg-slate-50/50 flex flex-col overflow-hidden">
      <Navbar 
        topK={topK} 
        setTopK={setTopK} 
        threshold={threshold} 
        setThreshold={setThreshold} 
      />
      {/* main element must also be restricted to flex layout box */}
      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <ChatArea topK={topK} threshold={threshold} />
      </main>
      <Toaster />
    </div>
  );
}

export default App;