import { useState, useRef, useEffect } from "react"
import { Send, ThumbsUp, ThumbsDown, Edit2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import FeedbackModal from "./FeedbackModal"
import AiAnswerModal from "./AiAnswerModal"

interface ChatAreaProps {
  topK: number
  threshold: number
}

interface Option {
  id: string // Added ID
  score: number
  short_description: string
  resolution: string
}

interface Message {
  role: "user" | "ai"
  content?: string
  query?: string
  options?: Option[]
  error?: string
}

interface FeedbackState {
  isOpen: boolean
  query: string
  shortDesc?: string
  resolution?: string
}

interface AiModalState {
  isOpen: boolean
  resolution: string
}

export default function ChatArea({ topK, threshold }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    isOpen: false,
    query: "",
  })
  const [aiModalState, setAiModalState] = useState<AiModalState>({
    isOpen: false,
    resolution: "",
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

  // Card Action Handlers
  const handleQuickFeedback = async (query: string, resolution: string) => {
    try {
      // Uses user query as both query AND short desc for quick feedback
      const responseText = await api.feedback(query, query, resolution)
      toast.success(responseText)
    } catch (err) {
      toast.error("Failed to submit quick feedback.")
    }
  }

  const handleRemoveDoc = async (id: string) => {
    try {
      const res = await api.remove([id])
      toast.success("Document successfully removed from index.")
    } catch (err) {
      toast.error("Failed to remove document.")
    }
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden bg-background">
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-stretch"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary px-4 py-2 text-primary-foreground">
                {msg.content}
              </div>
            ) : (
              <div className="w-full animate-in space-y-3 slide-in-from-bottom-2">
                {msg.error ? (
                  <div className="text-sm text-destructive">{msg.error}</div>
                ) : (
                  <>
                    {msg.options && msg.options.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No relevant solutions found.
                      </div>
                    )}

                    {msg.options?.map((opt, i) => (
                      <Card
                        key={i}
                        className="group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-cyan-300/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-cyan-500/20"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                        <CardContent className="relative p-4 pt-8 pb-2">
                          <Badge
                            variant="secondary"
                            className={`absolute top-2 right-2 text-xs text-white ${
                              opt.score * 100 > 70
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            }`}
                          >
                            Score: {(opt.score * 100).toFixed(1)}%
                          </Badge>
                          <Badge
                            className={`absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs ${
                              opt.score * 100 > 70
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-yellow-500 hover:bg-yellow-600"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </Badge>

                          <div className="mb-4 space-y-2">
                            <p className="text-sm font-semibold text-foreground">
                              {opt.short_description}
                            </p>
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                              {opt.resolution}
                            </p>
                          </div>

                          {/* Action Bar for each Card */}
                          <div className="mt-2 flex items-center justify-end gap-1 border-t pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-green-600"
                              onClick={() =>
                                handleQuickFeedback(
                                  msg.query || "",
                                  opt.resolution
                                )
                              }
                              title="Thumbs Up - Good Match"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-red-600"
                              onClick={() => handleRemoveDoc(opt.id)}
                              title="Thumbs Down - Remove from Index"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-blue-600"
                              onClick={() =>
                                setFeedbackState({
                                  isOpen: true,
                                  query: msg.query || "",
                                  shortDesc: opt.short_description,
                                  resolution: opt.resolution,
                                })
                              }
                              title="Edit and Submit Feedback"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-muted-foreground hover:text-purple-600"
                              onClick={() =>
                                setAiModalState({
                                  isOpen: true,
                                  resolution: opt.resolution,
                                })
                              }
                              title="Generate AI Steps"
                            >
                              <Bot className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* General Bottom Feedback Button */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex justify-end pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            setFeedbackState({
                              isOpen: true,
                              query: msg.query || "",
                            })
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                          Provide Custom Feedback
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-primary delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary delay-150" />
          </div>
        )}

        <div ref={scrollAnchorRef} className="h-1" />
      </div>

      <div className="shrink-0 border-t bg-background p-4">
        <form onSubmit={handleSend} className="relative w-full">
          <Input
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            placeholder="Describe your issue (e.g., Cant log onto VMWare...)"
            className="h-14 rounded-full bg-background pr-12 shadow-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="absolute top-1.5 right-1.5 h-11 w-11 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>

      <FeedbackModal
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState({ isOpen: false, query: "" })}
        originalQuery={feedbackState.query}
        initialShortDesc={feedbackState.shortDesc}
        initialResolution={feedbackState.resolution}
      />

      <AiAnswerModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState({ isOpen: false, resolution: "" })}
        resolution={aiModalState.resolution}
      />
    </div>
  )
}
