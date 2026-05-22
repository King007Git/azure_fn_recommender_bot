import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from '@/lib/api';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resolution: string;
}

export default function AiAnswerModal({ isOpen, onClose, resolution }: AiAnswerModalProps) {
  // Using 'any' here temporarily so we can catch and parse if the API returns an object
  const [answer, setAnswer] = useState<any>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && resolution) {
      setAnswer("");
      setError("");
      setIsLoading(true);
      
      api.generateAnswer(resolution)
        .then(res => {
          let text = res.generative_answer;
          
          // Safety check: If LangChain returns a list/object instead of a string, parse it
          if (typeof text !== 'string') {
            try {
              // Try to extract text if it's a LangChain content block array
              if (Array.isArray(text) && text[0]?.text) {
                text = text.map((block: any) => block.text).join('\n');
              } else {
                // Fallback: convert the raw object to a string so the UI doesn't crash
                text = JSON.stringify(text, null, 2);
              }
            } catch (e) {
              text = "Error parsing AI response.";
            }
          }
          
          setAnswer(text);
        })
        .catch(err => setError("Failed to generate AI answer. Please try again."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, resolution]);

  // Final absolute guarantee that ReactMarkdown receives a string
  const safeMarkdown = typeof answer === 'string' ? answer : String(answer || "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            AI Resolution Summary & Steps
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p>Analyzing resolution and generating steps...</p>
            </div>
          ) : error ? (
            <div className="text-destructive p-4 bg-destructive/10 rounded-md">
              {error}
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{safeMarkdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}