import { useState, useEffect } from "react"
import {
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Bot,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

interface Option {
  id: string
  score: number
  short_description: string
  resolution: string
  desc: string
  priority: string
  issue_desc: string
  rca: string
  workaround: string
}

interface TicketActionModalProps {
  isOpen: boolean
  onClose: () => void
  option: Option | null
  query: string
  onQuickFeedback: (query: string, option: Option) => void
  onRemoveDoc: (id: string) => void
  onGenerateAi: (issue_desc: string, rca: string, resolution: string, workaround: string) => Promise<string>
}

export default function TicketActionModal({
  isOpen,
  onClose,
  option,
  query,
  onQuickFeedback,
  onRemoveDoc,
  onGenerateAi,
}: TicketActionModalProps) {
  const [mode, setMode] = useState<"view" | "edit">("view")

  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiContent, setAiContent] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    shortDesc: "",
    desc: "",
    issueDesc: "",
    rca: "",
    resolution: "",
    workaround: "",
    priority: "P4",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAiLoading(false)
      setAiContent(null)

      if (option) {
        setMode("view")
        setFormData({
          shortDesc: option.short_description || "",
          desc: option.desc || "",
          issueDesc: option.issue_desc || "",
          rca: option.rca || "",
          resolution: option.resolution || "",
          workaround: option.workaround || "",
          priority: option.priority || "P4",
        })
      } else {
        setMode("edit")
        setFormData({
          shortDesc: query || "",
          desc: "",
          issueDesc: "",
          rca: "",
          resolution: "",
          workaround: "",
          priority: "P4",
        })
      }
    }
  }, [isOpen, option, query])

  const handleAiClick = async () => {
    if (!option) return
    setIsAiLoading(true)
    setAiContent(null)
    try {
      const generatedSteps = await onGenerateAi(
        option.issue_desc || "",
        option.rca || "",
        option.resolution || "",
        option.workaround || ""
      )
      setAiContent(generatedSteps)
    } catch (err) {
      toast.error("Failed to generate AI steps.")
      setAiContent("Failed to generate AI steps. Please try again.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!formData.resolution.trim()) return
    setIsSubmitting(true)
    try {
      const responseText = await api.feedback(
        query,
        formData.shortDesc,
        formData.resolution,
        formData.desc,
        formData.priority,
        formData.issueDesc,
        formData.rca,
        formData.workaround
      )
      toast.success(responseText || "Feedback submitted successfully.")
      onClose()
    } catch (err) {
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === "view" && option) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  option.priority === "P1" || option.priority === "P2"
                    ? "destructive"
                    : "secondary"
                }
              >
                {option.priority}
              </Badge>
              <DialogTitle className="text-xl leading-tight">
                {option.short_description}
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Description
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {option.desc}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Issue Details
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {option.issue_desc}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Root Cause Analysis (RCA)
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {option.rca}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Resolution
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {option.resolution}
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Workaround
                </h4>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {option.workaround}
                </p>
              </div>

              {(isAiLoading || aiContent) && (
                <div className="mt-6 rounded-xl border bg-purple-50/50 p-4 dark:bg-purple-950/20">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400">
                    <Bot className="h-4 w-4" /> AI Expanded Steps
                  </h4>
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                      Generating step-by-step instructions...
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap text-foreground">
                      <ReactMarkdown>{aiContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              className="text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={() => {
                onQuickFeedback(query, option) // Pass the full option object here
                onClose()
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Good Match
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                onRemoveDoc(option.id)
                onClose()
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" /> Remove
            </Button>
            <Button
              variant="outline"
              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setMode("edit")}
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
              onClick={handleAiClick}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              {isAiLoading ? "Generating..." : "AI Steps"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {option && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode("view")}
                className="mr-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {option ? "Edit & Provide Feedback" : "Provide Custom Feedback"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original User Query</label>
              <Input value={query} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <Input
                  value={formData.shortDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDesc: e.target.value })
                  }
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Input
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Details</label>
                <Textarea
                  value={formData.issueDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDesc: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Root Cause Analysis
                </label>
                <Textarea
                  value={formData.rca}
                  onChange={(e) =>
                    setFormData({ ...formData, rca: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Resolution <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Workaround</label>
              <Textarea
                value={formData.workaround}
                onChange={(e) =>
                  setFormData({ ...formData, workaround: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            disabled={!formData.resolution.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
