"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Loader2, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

interface SuggestionsPanelProps {
  suggestions: string[];
  isLoading: boolean;
}

export function SuggestionsPanel({ suggestions, isLoading }: SuggestionsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Domande Suggerite
        </CardTitle>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </CardHeader>
      <CardContent>
        {isLoading && suggestions.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center justify-between text-sm">
                <span>{suggestion}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PlusCircle className="h-4 w-4 text-accent" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Nessun suggerimento al momento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
