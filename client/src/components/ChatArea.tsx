import { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Edit2, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from '@/lib/api';
import { toast } from "sonner";
import FeedbackModal from './FeedbackModal';
import AiAnswerModal from './AiAnswerModal';

interface ChatAreaProps {
  topK: number;
  threshold: number;
}

interface Option {
  id: string; // Added ID
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
  shortDesc?: string;
  resolution?: string;
}

interface AiModalState {
  isOpen: boolean;
  resolution: string;
}

export default function ChatArea({ topK, threshold }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({ isOpen: false, query: "" });
  const [aiModalState, setAiModalState] = useState<AiModalState>({ isOpen: false, resolution: "" });
  
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]); 

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.retrieve(userMessage, topK, threshold);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        query: userMessage, 
        options: response.data || [] 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', error: "Failed to retrieve options. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Card Action Handlers
  const handleQuickFeedback = async (query: string, resolution: string) => {
    try {
      // Uses user query as both query AND short desc for quick feedback
      const responseText = await api.feedback(query, query, resolution);
      toast.success(responseText);
    } catch (err) {
      toast.error("Failed to submit quick feedback.");
    }
  };

  const handleRemoveDoc = async (id: string) => {
    try {
      const res = await api.remove([id]);
      toast.success("Document successfully removed from index.");
    } catch (err) {
      toast.error("Failed to remove document.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                    {msg.options && msg.options.length === 0 && (
                      <div className="text-sm text-muted-foreground">No relevant solutions found.</div>
                    )}
                    
                    {msg.options?.map((opt, i) => (
                      <Card key={i} className="w-full relative shadow-sm border-muted">
                        <CardContent className="p-4 pt-8 pb-2">
                          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                            Score: {(opt.score * 100).toFixed(1)}%
                          </Badge>
                          <Badge className="absolute top-2 left-2 text-xs w-6 h-6 rounded-full flex items-center justify-center p-0">
                            {String.fromCharCode(65 + i)}
                          </Badge>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-semibold text-foreground">
                              {opt.short_description}
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {opt.resolution}
                            </p>
                          </div>

                          {/* Action Bar for each Card */}
                          <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                            <Button 
                              variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-green-600"
                              onClick={() => handleQuickFeedback(msg.query || "", opt.resolution)}
                              title="Thumbs Up - Good Match"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-red-600"
                              onClick={() => handleRemoveDoc(opt.id)}
                              title="Thumbs Down - Remove from Index"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-blue-600"
                              onClick={() => setFeedbackState({
                                isOpen: true, 
                                query: msg.query || "", 
                                shortDesc: opt.short_description, 
                                resolution: opt.resolution
                              })}
                              title="Edit and Submit Feedback"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-purple-600"
                              onClick={() => setAiModalState({ isOpen: true, resolution: opt.resolution })}
                              title="Generate AI Steps"
                            >
                              <Bot className="w-4 h-4" />
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
                          onClick={() => setFeedbackState({ isOpen: true, query: msg.query || "" })}
                        >
                          <Edit2 className="w-4 h-4" />
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
          <div className="text-muted-foreground text-sm flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <div className="w-2 h-2 bg-primary rounded-full delay-75" />
            <div className="w-2 h-2 bg-primary rounded-full delay-150" />
          </div>
        )}
        
        <div ref={scrollAnchorRef} className="h-1" />
      </div>

      <div className="shrink-0 p-4 bg-background border-t">
        <form onSubmit={handleSend} className="relative w-full">
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
  );
}