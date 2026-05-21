import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from '@/lib/api';
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalQuery: string;
}

export default function FeedbackModal({ isOpen, onClose, originalQuery }: FeedbackModalProps) {
  const [shortDesc, setShortDesc] = useState<string>("");
  const [resolution, setResolution] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShortDesc(originalQuery);
      setResolution("");
    }
  }, [isOpen, originalQuery]);

  const handleSubmit = async () => {
    if (!resolution.trim()) return;
    setIsSubmitting(true);
    try {
      const responseText = await api.feedback(originalQuery, shortDesc, resolution);
      
      toast.success(responseText);
      
      onClose();
    } catch (err) {
      toast.warning("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Original Query</label>
            <Input value={originalQuery} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Short Description</label>
            <Input 
              value={shortDesc} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShortDesc(e.target.value)} 
              placeholder="Briefly describe the issue"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Resolution <span className="text-red-500">*</span></label>
            <Textarea 
              value={resolution} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResolution(e.target.value)} 
              placeholder="How was this resolved?"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!resolution.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}