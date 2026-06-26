import { useState, useEffect } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

interface SimilarIncidentsModalProps {
  isOpen: boolean
  onClose: () => void
  query: string
}

interface Option {
  id: string
  number: string  
  short_description: string
  score: number
}

export default function SimilarIncidentsModal({
  isOpen,
  onClose,
  query,
}: SimilarIncidentsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [incidents, setIncidents] = useState<Option[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && query) {
      const fetchSimilarIncidents = async () => {
        setIsLoading(true)
        setError(null)
        try {
          // Passing top_k = 50, and threshold = 95 (since api.ts does 95/100 = 0.95)
          const response = await api.retrieve(query, 50, 95)
          setIncidents(response.data || [])
        } catch (err) {
          setError("Failed to fetch similar incidents.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchSimilarIncidents()
    }
  }, [isOpen, query])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl sm:rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Similar Incidents
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Finding matches for: <span className="font-medium text-slate-700">{query}</span>
          </p>
        </DialogHeader>

        <div className="py-4 min-h-[200px] flex flex-col">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm font-medium">Retrieving incidents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-2 text-rose-500">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              No similar incidents found above the 0.95 threshold.
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex items-center gap-3 rounded-xl border border-white/60 bg-white/50 p-3 shadow-sm"
                  >
                    <Badge variant="outline" className="bg-white font-mono text-purple-700 border-purple-200">
                      {inc.number}
                    </Badge>
                    <p className="line-clamp-1 text-sm text-slate-700 font-medium">
                      {inc.short_description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}