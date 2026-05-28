import { useState } from 'react';
import Navbar from './components/Navbar';
import ChatArea from './components/ChatArea';
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [topK, setTopK] = useState<number>(5);
  const [threshold, setThreshold] = useState<number>(50);

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#fdfcfd]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[70%] w-[60%] rounded-full bg-pink-300/40 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[60%] rounded-full bg-indigo-300/30 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[50%] w-[60%] rounded-full bg-fuchsia-200/30 blur-[120px]" />
      </div>
      <div className="relative z-10 flex h-full w-full flex-col">
        <Navbar 
          topK={topK} 
          setTopK={setTopK} 
          threshold={threshold} 
          setThreshold={setThreshold} 
        />
        <main className="flex-1 min-h-0 w-full overflow-hidden">
          <ChatArea topK={topK} threshold={threshold} />
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;