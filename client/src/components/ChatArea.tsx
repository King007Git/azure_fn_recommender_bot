// import { useState, useRef, useEffect } from "react"
// import { Send, Edit2, Sparkles } from "lucide-react" // <-- Added Sparkles here
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { api } from "@/lib/api"
// import { toast } from "sonner"
// import TicketActionModal from "./TicketActionModal"

// interface ChatAreaProps {
//   topK: number
//   threshold: number
// }

// interface Option {
//   id: string
//   score: number
//   short_description: string
//   resolution: string
//   desc: string
//   priority: string
//   issue_desc: string
//   rca: string
//   workaround: string
// }

// interface Message {
//   role: "user" | "ai"
//   content?: string
//   query?: string
//   options?: Option[]
//   error?: string
// }

// interface DetailModalState {
//   isOpen: boolean
//   option: Option | null
//   query: string
// }

// export default function ChatArea({ topK, threshold }: ChatAreaProps) {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState<string>("")
//   const [isLoading, setIsLoading] = useState<boolean>(false)

//   const [detailModal, setDetailModal] = useState<DetailModalState>({
//     isOpen: false,
//     option: null,
//     query: "",
//   })

//   const scrollAnchorRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     if (scrollAnchorRef.current) {
//       scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [messages.length])

//   const handleSend = async (e?: React.FormEvent) => {
//     e?.preventDefault()
//     if (!input.trim() || isLoading) return

//     const userMessage = input.trim()
//     setInput("")
//     setMessages((prev) => [...prev, { role: "user", content: userMessage }])
//     setIsLoading(true)

//     try {
//       const response = await api.retrieve(userMessage, topK, threshold)
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "ai",
//           query: userMessage,
//           options: response.data || [],
//         },
//       ])
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         { role: "ai", error: "Failed to retrieve options. Please try again." },
//       ])
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleQuickFeedback = async (query: string, opt: Option) => {
//     try {
//       const responseText = await api.feedback(
//         query,
//         opt.short_description,
//         opt.resolution,
//         opt.desc,
//         opt.priority,
//         opt.issue_desc,
//         opt.rca,
//         opt.workaround
//       )
//       toast.success(responseText)
//     } catch (err) {
//       toast.error("Failed to submit quick feedback.")
//     }
//   }

//   const handleRemoveDoc = async (id: string) => {
//     try {
//       await api.remove([id])
//       toast.success("Document successfully removed from index.")
//     } catch (err) {
//       toast.error("Failed to remove document.")
//     }
//   }

//   const handleGenerateAi = async (
//     issue_desc: string,
//     rca: string,
//     resolution: string,
//     workaround: string
//   ): Promise<string> => {
//     if (api.generateAnswer) {
//       try {
//         const res = await api.generateAnswer(
//           issue_desc,
//           rca,
//           resolution,
//           workaround
//         )

//         if (typeof res === "string") return res

//         if (res?.generative_answer && Array.isArray(res.generative_answer)) {
//           const textBlock = res.generative_answer.find(
//             (item: any) => item.type === "text"
//           )
//           if (textBlock && textBlock.text) {
//             return textBlock.text
//           }
//         }

//         return (
//           res?.text ||
//           res?.generative_answer ||
//           "No valid response text could be extracted."
//         )
//       } catch (error) {
//         console.error("Error formatting AI response:", error)
//         return "An error occurred while processing the AI response."
//       }
//     }

//     return new Promise((resolve) => {
//       setTimeout(
//         () =>
//           resolve(
//             "AI analysis simulated... (Add your backend endpoint to see real results!)"
//           ),
//         2000
//       )
//     })
//   }

//   return (
//     <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden bg-background">
//       <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4">
//         {/* Empty State / Welcome Screen */}
//         {messages.length === 0 ? (
//           <div className="flex h-full flex-1 flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
//             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
//               <Sparkles className="h-8 w-8" />
//             </div>
//             <p className="text-lg font-medium text-muted-foreground">
//               How can I help you resolve an issue today?
//             </p>
//           </div>
//         ) : (
//           /* Messages List */
//           messages.map((msg, idx) => (
//             <div
//               key={idx}
//               className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-stretch"}`}
//             >
//               {msg.role === "user" ? (
//                 <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary px-4 py-2 text-primary-foreground">
//                   {msg.content}
//                 </div>
//               ) : (
//                 <div className="w-full animate-in space-y-3 slide-in-from-bottom-2">
//                   {msg.error ? (
//                     <div className="text-sm text-destructive">{msg.error}</div>
//                   ) : (
//                     <>
//                       {msg.options && msg.options.length === 0 && (
//                         <div className="text-sm text-muted-foreground">
//                           No relevant solutions found.
//                         </div>
//                       )}

//                       {msg.options?.map((opt, i) => (
//                         <Card
//                           key={i}
//                           onClick={() =>
//                             setDetailModal({
//                               isOpen: true,
//                               option: opt,
//                               query: msg.query || "",
//                             })
//                           }
//                           className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-cyan-300/40 hover:bg-white/15 hover:shadow-2xl hover:shadow-cyan-500/20"
//                         >
//                           <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
//                           <CardContent className="relative p-4">
//                             <div className="mb-2 flex items-center gap-3">
//                               <Badge
//                                 variant="secondary"
//                                 className={`flex shrink-0 items-center gap-2 px-2.5 py-1 text-xs text-white ${
//                                   opt.score * 100 > 70
//                                     ? "bg-green-500 hover:bg-green-600"
//                                     : "bg-yellow-500 hover:bg-yellow-600"
//                                 }`}
//                               >
//                                 <span className="text-sm font-bold">
//                                   {String.fromCharCode(65 + i)}
//                                 </span>
//                                 <div className="h-3.5 w-[1px] rounded-full bg-white/40" />
//                                 <span>
//                                   Score: {(opt.score * 100).toFixed(1)}%
//                                 </span>
//                               </Badge>

//                               <p className="line-clamp-1 text-sm font-semibold text-foreground">
//                                 {opt.short_description}
//                               </p>
//                             </div>
//                             <p className="text-sm text-muted-foreground">
//                               {opt.desc?.split(" ").length > 10 ? (
//                                 <>
//                                   {opt.desc.split(" ").slice(0, 10).join(" ")}
//                                   <span className="ml-1 font-medium text-cyan-400 transition-colors hover:text-cyan-300 hover:underline">
//                                     ... more
//                                   </span>
//                                 </>
//                               ) : (
//                                 opt.desc
//                               )}
//                             </p>
//                           </CardContent>
//                         </Card>
//                       ))}

//                       {msg.options && msg.options.length > 0 && (
//                         <div className="flex justify-end pt-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="gap-2"
//                             onClick={() =>
//                               setDetailModal({
//                                 isOpen: true,
//                                 option: null,
//                                 query: msg.query || "",
//                               })
//                             }
//                           >
//                             <Edit2 className="h-4 w-4" />
//                             Provide Custom Feedback
//                           </Button>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))
//         )}

//         {/* Loading Indicator */}
//         {isLoading && (
//           <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
//             <div className="h-2 w-2 rounded-full bg-primary" />
//             <div className="h-2 w-2 rounded-full bg-primary delay-75" />
//             <div className="h-2 w-2 rounded-full bg-primary delay-150" />
//           </div>
//         )}

//         <div ref={scrollAnchorRef} className="h-1" />
//       </div>

//       <div className="shrink-0 border-t bg-background p-4">
//         <form onSubmit={handleSend} className="relative w-full">
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Describe your issue (e.g., High CPU on AIX...)"
//             className="h-14 rounded-full bg-background pr-12 shadow-sm"
//           />
//           <Button
//             type="submit"
//             size="icon"
//             disabled={!input.trim() || isLoading}
//             className="absolute top-1.5 right-1.5 h-11 w-11 rounded-full"
//           >
//             <Send className="h-5 w-5" />
//           </Button>
//         </form>
//       </div>

//       <TicketActionModal
//         isOpen={detailModal.isOpen}
//         onClose={() =>
//           setDetailModal({ isOpen: false, option: null, query: "" })
//         }
//         option={detailModal.option}
//         query={detailModal.query}
//         onQuickFeedback={handleQuickFeedback}
//         onRemoveDoc={handleRemoveDoc}
//         onGenerateAi={handleGenerateAi}
//       />
//     </div>
//   )
// }
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
      <div className="flex flex-1 flex-col space-y-6 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-1 animate-in flex-col items-center justify-center space-y-4 duration-500 fade-in">
            <div className="flex h-16 w-16 items-center justify-center text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium text-foreground/80">
              Ask Anything with AURA
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-stretch"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary px-4 py-2 text-primary-foreground shadow-sm">
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
                          onClick={() =>
                            setDetailModal({
                              isOpen: true,
                              option: opt,
                              query: msg.query || "",
                            })
                          }
                          className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-white/60 hover:bg-white/50 hover:shadow-xl hover:shadow-pink-500/10"
                        >
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
                          <CardContent className="relative p-4">
                            <div className="mb-2 flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className={`flex shrink-0 items-center gap-2 px-2.5 py-1 text-xs text-white ${
                                  opt.score * 100 > 70
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-yellow-500 hover:bg-yellow-600"
                                }`}
                              >
                                <span className="text-sm font-bold">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <div className="h-3.5 w-[1px] rounded-full bg-white/40" />
                                <span>
                                  Score: {(opt.score * 100).toFixed(1)}%
                                </span>
                              </Badge>

                              <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                {opt.short_description}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {opt.desc?.split(" ").length > 10 ? (
                                <>
                                  {opt.desc.split(" ").slice(0, 10).join(" ")}
                                  <span className="ml-1 font-medium text-primary transition-colors hover:underline">
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
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-white/40 bg-white/40 backdrop-blur-md hover:bg-white/60"
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
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-primary delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary delay-150" />
          </div>
        )}

        <div ref={scrollAnchorRef} className="h-1" />
      </div>

      {/* Changed: bg-background to bg-transparent, removed top border */}
      <div className="shrink-0 bg-transparent p-4 pb-6">
        <form onSubmit={handleSend} className="relative w-full">
          {/* Added glassmorphism styling to the input field */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your projects"
            className="h-14 rounded-full border border-white/60 bg-white/60 pr-12 shadow-sm backdrop-blur-md transition-all focus:border-white focus:bg-white/80 focus:ring-2 focus:ring-white/50"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!input.trim() || isLoading}
            className="absolute top-1.5 right-1.5 h-11 w-11 rounded-full text-muted-foreground hover:bg-white/50 hover:text-foreground"
          >
            <Send className="h-5 w-5" />
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
