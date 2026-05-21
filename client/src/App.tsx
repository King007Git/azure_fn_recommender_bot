import { useState } from 'react'
import Navbar from './components/Navbar'
import ChatArea from './components/ChatArea'
import { Toaster } from "@/components/ui/sonner"

function App() {
  const [topK, setTopK] = useState(5)
  const [threshold, setThreshold] = useState(50)

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar 
        topK={topK} 
        setTopK={setTopK} 
        threshold={threshold} 
        setThreshold={setThreshold} 
      />
      <main className="flex-1 overflow-hidden">
        <ChatArea topK={topK} threshold={threshold} />
      </main>
      <Toaster />
    </div>
  )
}

export default App