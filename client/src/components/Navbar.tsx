import { useState } from "react"
import { Settings, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Link } from "react-router-dom"

interface NavbarProps {
  topK?: number
  setTopK?: (value: number) => void
  threshold?: number
  setThreshold?: (value: number) => void
  showSettings?: boolean
}

export default function Navbar({
  topK = 5,
  setTopK,
  threshold = 50,
  setThreshold,
  showSettings = true, // Defaults to true for the Chat page
}: NavbarProps) {
  const [isIngesting, setIsIngesting] = useState(false)

  const handleIngest = async () => {
    if (isIngesting) return
    setIsIngesting(true)

    const toastId = toast.loading("Indexing data... Please wait.")

    try {
      await api.ingest()
      toast.success("Data indexed successfully!", { id: toastId })
    } catch (err) {
      toast.error("Failed to index data.", { id: toastId })
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <nav className="flex h-16 shrink-0 items-center justify-between border-b border-white/20 bg-gradient-to-r from-[#06a1d5] to-[#83defc] px-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex h-full cursor-pointer items-center transition-transform hover:scale-105"
        >
          <div className="flex h-full items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Conditionally render the settings popover */}
      {showSettings && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="group hover:bg-[#06a1d5]/10 hover:text-[#06a1d5]"
            >
              <Settings className="h-5 w-5 text-white transition-colors group-hover:text-[#06a1d5]" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="mr-4 w-80" align="end">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Top K ({topK})</label>
                </div>

                <Slider
                  value={[topK]}
                  onValueChange={(val: number[]) => setTopK?.(val[0])}
                  min={2}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">
                    Threshold ({threshold}%)
                  </label>
                </div>

                <Slider
                  value={[threshold]}
                  onValueChange={(val: number[]) => setThreshold?.(val[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <Button
                onClick={handleIngest}
                variant="destructive"
                className="flex w-full gap-2"
                disabled={isIngesting}
              >
                {isIngesting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}

                {isIngesting ? "Indexing..." : "Index Data"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </nav>
  )
}
