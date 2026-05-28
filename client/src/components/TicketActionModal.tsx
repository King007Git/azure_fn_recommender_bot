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
  onGenerateAi: (
    issue_desc: string,
    rca: string,
    resolution: string,
    workaround: string
  ) => Promise<string>
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
        <DialogContent className="sm:max-w-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl sm:rounded-[2rem]">
          <DialogHeader>
            <div className="flex items-start gap-3 pt-2">
              <Badge
                className="mt-1 shadow-sm"
                variant={
                  option.priority === "P1" || option.priority === "P2"
                    ? "destructive"
                    : "secondary"
                }
              >
                {option.priority}
              </Badge>
              <DialogTitle className="text-xl font-bold text-slate-800 leading-tight">
                {option.short_description}
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div className="space-y-1.5">
                <h4 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-[15px] whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {option.desc}
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
                  Issue Details
                </h4>
                <p className="text-[15px] whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {option.issue_desc}
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
                  Root Cause Analysis (RCA)
                </h4>
                <p className="text-[15px] whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {option.rca}
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
                  Resolution
                </h4>
                <p className="text-[15px] whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {option.resolution}
                </p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-[14px] font-bold text-slate-700 uppercase tracking-wide">
                  Workaround
                </h4>
                <p className="text-[15px] whitespace-pre-wrap text-slate-600 leading-relaxed">
                  {option.workaround}
                </p>
              </div>

              {(isAiLoading || aiContent) && (
                <div className="mt-6 rounded-2xl border border-white/80 bg-white/50 p-5 shadow-sm backdrop-blur-md">
                  <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-purple-700">
                    <Bot className="h-5 w-5" /> AI Expanded Steps
                  </h4>
                  {isAiLoading ? (
                    <div className="flex items-center gap-3 text-[15px] text-slate-600 font-medium">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                      Generating step-by-step instructions...
                    </div>
                  ) : (
                    <div className="text-[15px] whitespace-pre-wrap text-slate-700 leading-relaxed prose prose-slate max-w-none prose-p:my-2 prose-headings:my-3">
                      <ReactMarkdown>{aiContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-3 border-t border-white/40 pt-5 pb-2">
            <Button
              variant="outline"
              className="rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 shadow-sm backdrop-blur-md transition-all"
              onClick={() => {
                onQuickFeedback(query, option)
                onClose()
              }}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Good Match
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 shadow-sm backdrop-blur-md transition-all"
              onClick={() => {
                onRemoveDoc(option.id)
                onClose()
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" /> Bad Match
            </Button>
            <Button
              variant="outline"
              className="hidden rounded-xl border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 shadow-sm backdrop-blur-md transition-all"
              onClick={() => setMode("edit")}
            >
              <Edit2 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-purple-200 bg-purple-50/80 text-purple-700 hover:bg-purple-100 hover:text-purple-800 shadow-sm backdrop-blur-md transition-all"
              onClick={handleAiClick}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              {isAiLoading ? "Generating..." : "AI Answer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl sm:rounded-[2rem]">
        <DialogHeader>
          <div className="flex items-center gap-2 pt-2">
            {option && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMode("view")}
                className="mr-1 h-8 w-8 rounded-full hover:bg-white/50 text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-xl font-bold text-slate-800">
              {option ? "Edit & Provide Feedback" : "Provide Custom Feedback"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                Original User Query
              </label>
              <Input
                value={query}
                disabled
                className="rounded-xl border-white/60 bg-white/40 text-slate-700 shadow-sm backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                  Short Description
                </label>
                <Input
                  className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30"
                  value={formData.shortDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDesc: e.target.value })
                  }
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                  Priority
                </label>
                <Input
                  className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                Description
              </label>
              <Textarea
                className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-y"
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                  Issue Details
                </label>
                <Textarea
                  className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-y"
                  value={formData.issueDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDesc: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                  Root Cause Analysis
                </label>
                <Textarea
                  className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-y"
                  value={formData.rca}
                  onChange={(e) =>
                    setFormData({ ...formData, rca: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                Resolution <span className="text-rose-500">*</span>
              </label>
              <Textarea
                className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-y"
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 uppercase tracking-wide ml-1">
                Workaround
              </label>
              <Textarea
                className="rounded-xl border-white/60 bg-white/50 text-slate-800 shadow-sm backdrop-blur-md transition-all focus-visible:bg-white/80 focus-visible:ring-2 focus-visible:ring-purple-500/30 resize-y"
                value={formData.workaround}
                onChange={(e) =>
                  setFormData({ ...formData, workaround: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-3 border-t border-white/40 pt-5 pb-2">
          <Button
            variant="ghost"
            className="rounded-xl hover:bg-white/50 text-slate-600 font-medium transition-all"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
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