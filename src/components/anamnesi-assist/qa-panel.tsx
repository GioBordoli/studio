"use client";

import type { QuestionAnswerPair } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MessageSquareQuote } from "lucide-react";

interface QaPanelProps {
  qaPairs: QuestionAnswerPair[];
  isLoading: boolean;
}

export function QaPanel({ qaPairs, isLoading }: QaPanelProps) {
  const groupedQAs = qaPairs.reduce((acc, qa) => {
    const category = qa.category || "Non Categorizzato";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(qa);
    return acc;
  }, {} as Record<string, QuestionAnswerPair[]>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5" />
            D&R Identificate
        </CardTitle>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </CardHeader>
      <CardContent>
        {isLoading && qaPairs.length === 0 ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : Object.keys(groupedQAs).length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedQAs).map(([category, qas]) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger>{category}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4">
                    {qas.map((qa, index) => (
                      <li key={index} className="text-sm">
                        <p className="font-semibold">{qa.question}</p>
                        <p className="text-muted-foreground pl-4">{qa.answer}</p>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Nessuna domanda e risposta ancora identificata.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
