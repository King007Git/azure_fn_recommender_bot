import { useState, useRef, useEffect } from "react"
import { Send, Edit2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import TicketActionModal from "./TicketActionModal"

interface ChatAreaProps {
  topK: number
  threshold: number
}

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

interface Message {
  role: "user" | "ai"
  content?: string
  query?: string
  options?: Option[]
  error?: string
}

interface DetailModalState {
  isOpen: boolean
  option: Option | null
  query: string
}

const SUGGESTIONS = [
  "Question 1?",
  "Question 2?",
  "Question 3?",
]

export default function ChatArea({ topK, threshold }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [detailModal, setDetailModal] = useState<DetailModalState>({
    isOpen: false,
    option: null,
    query: "",
  })

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await api.retrieve(userMessage, topK, threshold)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          query: userMessage,
          options: response.data || [],
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", error: "Failed to retrieve options. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFeedback = async (query: string, opt: Option) => {
    try {
      const responseText = await api.feedback(
        query,
        opt.short_description,
        opt.resolution,
        opt.desc,
        opt.priority,
        opt.issue_desc,
        opt.rca,
        opt.workaround
      )
      toast.success(responseText)
    } catch (err) {
      toast.error("Failed to submit quick feedback.")
    }
  }

  const handleRemoveDoc = async (id: string) => {
    try {
      await api.remove([id])
      toast.success("Document successfully removed from index.")
    } catch (err) {
      toast.error("Failed to remove document.")
    }
  }

  const handleGenerateAi = async (
    issue_desc: string,
    rca: string,
    resolution: string,
    workaround: string
  ): Promise<string> => {
    if (api.generateAnswer) {
      try {
        const res = await api.generateAnswer(
          issue_desc,
          rca,
          resolution,
          workaround
        )

        if (typeof res === "string") return res

        if (res?.generative_answer && Array.isArray(res.generative_answer)) {
          const textBlock = res.generative_answer.find(
            (item: any) => item.type === "text"
          )
          if (textBlock && textBlock.text) {
            return textBlock.text
          }
        }

        return (
          res?.text ||
          res?.generative_answer ||
          "No valid response text could be extracted."
        )
      } catch (error) {
        console.error("Error formatting AI response:", error)
        return "An error occurred while processing the AI response."
      }
    }

    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            "AI analysis simulated... (Add your backend endpoint to see real results!)"
          ),
        2000
      )
    })
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden bg-transparent">
      <div className="flex flex-1 flex-col space-y-8 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-1 flex-col animate-in duration-500 fade-in">
            <div className="flex flex-1 flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center text-slate-700/80">
                <Sparkles className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-slate-700/80">
                Ask Anything with AURA
              </p>
            </div>

            {/* Suggestions anchored to the bottom */}
            <div className="mt-auto w-full pb-2 pt-8">
              <h3 className="mb-4 ml-1 text-[15px] font-semibold text-slate-600/90">
                Suggestions on what to ask AURA
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(suggestion)}
                    className="flex-1 rounded-2xl border border-white/60 bg-white/40 p-4 text-left text-[14px] font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col w-full">
              {msg.role === "user" ? (
                <div className="flex flex-col items-start mb-2">
                  <span className="mb-2 ml-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    ME
                  </span>
                  <div className="max-w-[80%] rounded-3xl bg-white px-6 py-3.5 text-[15px] font-medium text-slate-800 shadow-sm border border-slate-100">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-stretch w-full animate-in slide-in-from-bottom-2">
                  <span className="mb-2 ml-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    AURA
                  </span>
                  {msg.error ? (
                    <div className="text-sm text-destructive pl-2">{msg.error}</div>
                  ) : (
                    <div className="w-full space-y-3 rounded-[2rem] bg-white/40 p-4 shadow-sm backdrop-blur-md border border-white/60">
                      {msg.options && msg.options.length === 0 && (
                        <div className="text-sm text-slate-500 p-2">
                          No relevant solutions found.
                        </div>
                      )}

                      {msg.options?.map((opt, i) => (
                        <Card
                          key={i}
                          onClick={() =>
                            setDetailModal({
                              isOpen: true,
                              option: opt,
                              query: msg.query || "",
                            })
                          }
                          className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <CardContent className="p-5">
                            <div className="mb-2.5 flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className={`flex shrink-0 items-center gap-2 px-3 py-1 text-[11px] text-white border-0 ${
                                  opt.score * 100 > 70
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-amber-500 hover:bg-amber-600"
                                }`}
                              >
                                <span className="text-sm font-bold">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <div className="h-3.5 w-[1px] bg-white/50" />
                                <span className="font-medium">
                                  Score: {(opt.score * 100).toFixed(1)}%
                                </span>
                              </Badge>

                              <p className="line-clamp-1 text-[15px] font-bold text-slate-700">
                                {opt.short_description}
                              </p>
                            </div>
                            <p className="text-[14px] text-slate-500">
                              {opt.desc?.split(" ").length > 10 ? (
                                <>
                                  {opt.desc.split(" ").slice(0, 10).join(" ")}
                                  <span className="ml-1 font-semibold text-[#a855f7] transition-colors hover:text-purple-600">
                                    ... more
                                  </span>
                                </>
                              ) : (
                                opt.desc
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      ))}

                      {msg.options && msg.options.length > 0 && (
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-white/60 bg-white/60 backdrop-blur-md hover:bg-white text-slate-600"
                            onClick={() =>
                              setDetailModal({
                                isOpen: true,
                                option: null,
                                query: msg.query || "",
                              })
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                            Provide Custom Feedback
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex animate-pulse items-center gap-2 text-sm text-slate-400 pl-2">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <div className="h-2 w-2 rounded-full bg-slate-400 delay-75" />
            <div className="h-2 w-2 rounded-full bg-slate-400 delay-150" />
          </div>
        )}

        <div ref={scrollAnchorRef} className="h-1" />
      </div>

      <div className="shrink-0 bg-transparent p-4 pb-6">
        <form onSubmit={handleSend} className="relative w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your projects"
            className="h-[52px] rounded-[1.25rem] border border-white/80 bg-white/80 px-5 pr-12 text-[15px] shadow-sm backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-white focus:bg-white focus:ring-2 focus:ring-white/50"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!input.trim() || isLoading}
            className="absolute top-1 right-1.5 h-11 w-11 rounded-xl text-slate-400 hover:bg-slate-100/50 hover:text-slate-600"
          >
            <Send className="h-[18px] w-[18px]" />
          </Button>
        </form>
      </div>

      <TicketActionModal
        isOpen={detailModal.isOpen}
        onClose={() =>
          setDetailModal({ isOpen: false, option: null, query: "" })
        }
        option={detailModal.option}
        query={detailModal.query}
        onQuickFeedback={handleQuickFeedback}
        onRemoveDoc={handleRemoveDoc}
        onGenerateAi={handleGenerateAi}
      />
    </div>
  )
}