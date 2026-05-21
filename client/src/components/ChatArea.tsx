import { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from '@/lib/api';
import FeedbackModal from './FeedbackModal';

interface ChatAreaProps {
  topK: number;
  threshold: number;
}

interface Option {
  score: number;
  short_description: string;
  resolution: string;
}

interface Message {
  role: 'user' | 'ai';
  content?: string;
  query?: string;
  options?: Option[];
  error?: string;
}

interface FeedbackState {
  isOpen: boolean;
  query: string;
}

export default function ChatArea({ topK, threshold }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({ isOpen: false, query: "" });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Parse the backend response
      const response = await api.retrieve(userMessage, topK, threshold);
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        query: userMessage, 
        options: response.data || [] // Access the 'data' array directly
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', error: "Failed to retrieve options. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full max-w-4xl mx-auto p-4">
      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-stretch'}`}>
              {msg.role === 'user' ? (
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl max-w-[80%] rounded-tl-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-3 w-full animate-in slide-in-from-bottom-2">
                  {msg.error ? (
                    <div className="text-destructive text-sm">{msg.error}</div>
                  ) : (
                    <>
                      {/* Check if options exist and map over them */}
                      {msg.options && msg.options.length === 0 && (
                        <div className="text-sm text-muted-foreground">No relevant solutions found.</div>
                      )}
                      
                      {msg.options?.map((opt, i) => (
                        <Card key={i} className="w-full relative shadow-sm border-muted">
                          <CardContent className="p-4 pt-8">
                            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                              Score: {(opt.score * 100).toFixed(1)}%
                            </Badge>
                            <Badge className="absolute top-2 left-2 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">
                              {String.fromCharCode(65 + i)}
                            </Badge>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-foreground">
                                {opt.short_description}
                              </p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {opt.resolution}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {msg.options && msg.options.length > 0 && (
                        <div className="flex justify-end pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => setFeedbackState({ isOpen: true, query: msg.query || "" })}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Provide Resolution Feedback
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
            <div className="text-muted-foreground text-sm flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div className="w-2 h-2 bg-primary rounded-full delay-75" />
              <div className="w-2 h-2 bg-primary rounded-full delay-150" />
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="relative mt-auto">
        <Input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Describe your issue (e.g., Cant log onto VMWare...)"
          className="pr-12 h-14 rounded-full shadow-sm bg-background"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isLoading}
          className="absolute right-1.5 top-1.5 h-11 w-11 rounded-full"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>

      <FeedbackModal 
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState({ isOpen: false, query: "" })}
        originalQuery={feedbackState.query}
      />
    </div>
  );
}