import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#fdfcfd]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent" />
        <div className="absolute -bottom-[20%] -left-[10%] h-[70%] w-[60%] animate-float-pink rounded-full bg-pink-300 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[60%] animate-float-indigo rounded-full bg-indigo-300 blur-[120px]" />
        <div className="absolute top-[10%] left-[20%] h-[50%] w-[60%] animate-float-fuchsia rounded-full bg-fuchsia-200 blur-[120px]" />
      </div>

      <Outlet />
      <Toaster />
    </div>
  );
}