"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TranscriptionViewProps {
  transcript: string;
  isRecording: boolean;
  isLoading: boolean;
}

export function TranscriptionView({ transcript, isRecording, isLoading }: TranscriptionViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trascrizione Live</CardTitle>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="h-72 w-full p-6 pt-0" ref={scrollAreaRef}>
          {transcript.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>{isRecording ? "In ascolto..." : "Inizia a registrare per vedere la trascrizione qui."}</p>
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">
            {transcript}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
