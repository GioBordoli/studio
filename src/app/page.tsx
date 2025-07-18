"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { QuestionAnswerPair } from "@/types";
import { Header } from "@/components/anamnesi-assist/header";
import { AudioRecorder } from "@/components/anamnesi-assist/audio-recorder";
import { TranscriptionView } from "@/components/anamnesi-assist/transcription-view";
import { QaPanel } from "@/components/anamnesi-assist/qa-panel";
import { SuggestionsPanel } from "@/components/anamnesi-assist/suggestions-panel";
import { DocumentView } from "@/components/anamnesi-assist/document-view";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { identifyQuestionsAndAnswers } from "@/ai/flows/identify-questions-and-answers";
import { suggestAdditionalQuestions } from "@/ai/flows/suggest-additional-questions";
import { formatMedicalDocument } from "@/ai/flows/format-medical-document";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [qaPairs, setQaPairs] = useState<QuestionAnswerPair[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [documentText, setDocumentText] = useState("");
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [loading, setLoading] = useState({
    transcribe: false,
    qa: false,
    suggest: false,
    document: false,
  });

  const fullTranscriptRef = useRef("");

  const handleStartRecording = () => {
    setTranscript([]);
    setQaPairs([]);
    setSuggestions([]);
    setDocumentText("");
    fullTranscriptRef.current = "";
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    if (qaPairs.length > 0) {
      setLoading((prev) => ({ ...prev, document: true }));
      try {
        const interviewData = qaPairs
          .map((qa) => `D: ${qa.question}\nR: ${qa.answer}`)
          .join("\n\n");
        const result = await formatMedicalDocument({ interviewData });
        setDocumentText(result.formattedDocument);
        setIsDocumentOpen(true);
      } catch (error) {
        console.error("Error formatting document:", error);
      } finally {
        setLoading((prev) => ({ ...prev, document: false }));
      }
    }
  };

  const analyzeTranscript = useCallback(async (currentTranscript: string) => {
    if (currentTranscript.trim().length === 0) return;

    setLoading((prev) => ({ ...prev, qa: true, suggest: true }));
    try {
      const qaPromise = identifyQuestionsAndAnswers({
        transcription: currentTranscript,
      });
      const suggestionsPromise = suggestAdditionalQuestions({
        transcript: currentTranscript,
        answeredQuestions: qaPairs.map((qa) => qa.question),
        screeningSection: "Generale", // Placeholder for dynamic section
      });

      const [qaResult, suggestionsResult] = await Promise.all([
        qaPromise,
        suggestionsPromise,
      ]);

      setQaPairs(qaResult);
      setSuggestions(suggestionsResult.suggestedQuestions);
    } catch (error) {
      console.error("Error analyzing transcript:", error);
    } finally {
      setLoading((prev) => ({ ...prev, qa: false, suggest: false }));
    }
  }, [qaPairs]);

  const handleAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (!isRecording) return;
    
    setLoading((prev) => ({ ...prev, transcribe: true }));
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const result = await transcribeAudio({ audioDataUri: base64data });
        if (result.transcription) {
          setTranscript((prev) => [...prev, result.transcription]);
          fullTranscriptRef.current += result.transcription + " ";
          await analyzeTranscript(fullTranscriptRef.current);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
        setLoading(prev => ({ ...prev, transcribe: false }));
    }
  }, [isRecording, analyzeTranscript]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <AudioRecorder
              isRecording={isRecording}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              onAudioChunk={handleAudioChunk}
            />
            <TranscriptionView transcript={transcript} isRecording={isRecording} isLoading={loading.transcribe} />
          </div>
          <div className="flex flex-col gap-6">
            <QaPanel qaPairs={qaPairs} isLoading={loading.qa} />
            <SuggestionsPanel suggestions={suggestions} isLoading={loading.suggest} />
          </div>
        </div>
      </main>
      <footer className="container mx-auto p-4 text-center text-muted-foreground text-sm">
        <p>AnamnesiAssist - Il tuo assistente medico basato sull'IA.</p>
        {loading.document && (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Generazione del documento in corso...</span>
          </div>
        )}
      </footer>
      <DocumentView
        documentText={documentText}
        open={isDocumentOpen}
        onOpenChange={setIsDocumentOpen}
      />
    </div>
  );
}
