import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "../components/Navbar"; // Adjust path if necessary

export default function HomePage() {
  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      {/* Reusable Navbar without the settings popover */}
      <Navbar showSettings={false} />

      <div className="flex flex-1 flex-col p-6">
        {/* Middle: Main Content */}
        <main className="flex flex-1 flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40 shadow-sm backdrop-blur-md border border-white/60">
            <Sparkles className="h-8 w-8 text-[#a855f7]" />
          </div>
          
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to AURA
          </h1>
          
          <p className="mb-8 max-w-[600px] text-lg text-slate-600 md:text-xl">
            Your personalized AI assistant helping in resolving incidents seamlessly and intelligently.
          </p>

          <Link to="/chat">
            <Button className="h-12 rounded-full bg-slate-800 px-8 text-[15px] font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-slate-700 hover:shadow-xl">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </main>

        {/* Footer: Terms & Conditions Modal */}
        <footer className="flex w-full justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                Terms and Conditions
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-xl border-white/60">
              <DialogHeader>
                <DialogTitle>Terms and Conditions</DialogTitle>
                <DialogDescription>
                  Please read these terms carefully before using AURA.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm text-slate-600 space-y-4">
                <p>
                  <strong>1. Acceptance of Terms:</strong> By accessing and using AURA, you agree to be bound by these Terms and Conditions.
                </p>
                <p>
                  <strong>2. Data Usage:</strong> AURA is an AI assistant designed to help resolve incidents. Data processed through this tool is used solely for the purpose of generating resolutions, RCAs, and workarounds.
                </p>
                <p>
                  <strong>3. Liability:</strong> While AURA strives for accuracy, the generated AI responses should be reviewed by a human operator before being applied to critical production systems.
                </p>
                <p>
                  <strong>4. Modifications:</strong> We reserve the right to modify or replace these Terms at any time. Your continued use of the application following any changes constitutes acceptance of those changes.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </footer>
      </div>
    </div>
  );
}