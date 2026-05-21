import { useState } from "react";
import { Settings, Database, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";
import { toast } from "sonner"; // Using Sonner for toasts

interface NavbarProps {
  topK: number;
  setTopK: (value: number) => void;
  threshold: number;
  setThreshold: (value: number) => void;
}

export default function Navbar({ topK, setTopK, threshold, setThreshold }: NavbarProps) {
  const [isIngesting, setIsIngesting] = useState(false);

  const handleIngest = async () => {
    if (isIngesting) return;
    setIsIngesting(true);
    
    const toastId = toast.loading("Indexing data... Please wait.");

    try {
      await api.ingest();
      toast.success("Data indexed successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to index data.", { id: toastId });
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-background">
      <div className="text-xl font-bold tracking-tight">IT Support Assistant</div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mr-4" align="end">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Top K ({topK})</label>
              </div>
              <Slider
                value={[topK]}
                onValueChange={(val: number[]) => setTopK(val[0])}
                min={2}
                max={20}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Threshold ({threshold}%)</label>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(val: number[]) => setThreshold(val[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <Button 
              onClick={handleIngest} 
              variant="destructive" 
              className="w-full flex gap-2"
              disabled={isIngesting}
            >
              {isIngesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isIngesting ? "Indexing..." : "Index Data"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  );
}


// import { Settings, Database } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { api } from "@/lib/api";

// interface NavbarProps {
//   topK: number;
//   setTopK: (value: number) => void;
//   threshold: number;
//   setThreshold: (value: number) => void;
// }

// export default function Navbar({ topK, setTopK, threshold, setThreshold }: NavbarProps) {
//   const handleIngest = async () => {
//     try {
//       await api.ingest();
//       alert("Data indexed successfully!");
//     } catch (err) {
//       alert("Error indexing data.");
//     }
//   };

//   return (
//     <nav className="flex items-center justify-between p-4 border-b bg-background">
//       <div className="text-xl font-bold tracking-tight">IT Support Assistant</div>
      
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button variant="ghost" size="icon">
//             <Settings className="w-5 h-5" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-80 mr-4" align="end">
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <label className="text-sm font-medium">Top K ({topK})</label>
//               </div>
//               <Slider
//                 value={[topK]}
//                 onValueChange={(val: number[]) => setTopK(val[0])}
//                 min={2}
//                 max={20}
//                 step={1}
//               />
//             </div>
            
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <label className="text-sm font-medium">Threshold ({threshold}%)</label>
//               </div>
//               <Slider
//                 value={[threshold]}
//                 onValueChange={(val: number[]) => setThreshold(val[0])}
//                 min={0}
//                 max={100}
//                 step={1}
//               />
//             </div>

//             <Button 
//               onClick={handleIngest} 
//               variant="destructive" 
//               className="w-full flex gap-2"
//             >
//               <Database className="w-4 h-4" />
//               Index Data
//             </Button>
//           </div>
//         </PopoverContent>
//       </Popover>
//     </nav>
//   );
// }