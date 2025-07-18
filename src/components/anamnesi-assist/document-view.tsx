"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Clipboard } from "lucide-react";

interface DocumentViewProps {
  documentText: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentView({ documentText, open, onOpenChange }: DocumentViewProps) {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(documentText);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Formatted Medical Document</DialogTitle>
          <DialogDescription>
            This is the generated document based on the anamnesis session.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] rounded-md border p-4">
          <pre className="text-sm whitespace-pre-wrap font-sans">
            {documentText}
          </pre>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleCopy}>
            {hasCopied ? (
                <Check className="mr-2 h-4 w-4" />
            ) : (
                <Clipboard className="mr-2 h-4 w-4" />
            )}
            {hasCopied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
