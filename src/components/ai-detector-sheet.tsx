'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { runDeadlineDetector } from '@/app/actions';
import { Loader2, Sparkles } from 'lucide-react';
import type { DetectDeadlineOutput } from '@/ai/flows/deadline-detection';

type AIDetectorSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeadlineDetected: (deadline: DetectDeadlineOutput) => void;
};

export function AIDetectorSheet({
  open,
  onOpenChange,
  onDeadlineDetected,
}: AIDetectorSheetProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDetect = async () => {
    setIsLoading(true);
    const result = await runDeadlineDetector(text);
    setIsLoading(false);

    if (result.success && result.data) {
      if (result.data.shouldAdd) {
        toast({
          title: 'Deadline detected!',
          description: 'Review the details and save.',
        });
        onDeadlineDetected(result.data);
        onOpenChange(false);
      } else {
        toast({
          variant: 'default',
          title: 'No deadline found',
          description: 'The AI could not find a specific deadline in the text.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Smart AI Deadline Detection</SheetTitle>
          <SheetDescription>
            Paste any text from an email, document, or message. FlowZen AI will
            find any deadlines, appointments, or bills and help you add them.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Textarea
            placeholder="Paste your text here..."
            className="min-h-[200px] resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <SheetFooter>
          <Button onClick={handleDetect} disabled={isLoading || !text}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analyze Text
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
