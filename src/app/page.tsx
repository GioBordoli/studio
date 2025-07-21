"use client";

import { useState, useCallback, useRef } from "react";
import type { QuestionAnswerPair } from "@/types";
import { Header } from "@/components/anamnesi-assist/header";
import { AudioRecorder } from "@/components/anamnesi-assist/audio-recorder";
import { TranscriptionView } from "@/components/anamnesi-assist/transcription-view";
import { QaPanel } from "@/components/anamnesi-assist/qa-panel";
import { SuggestionsPanel } from "@/components/anamnesi-assist/suggestions-panel";
import { DocumentView } from "@/components/anamnesi-assist/document-view";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { identifyQuestionsAndAnswers } from "@/ai/flows/identify-questions-and-answers";
import { suggestAdditionalQuestions } from "@/ai/flows/suggest-additional-questions";
import { formatMedicalDocument } from "@/ai/flows/format-medical-document";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
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
    setTranscript("");
    setQaPairs([]);
    setSuggestions([]);
    setDocumentText("");
    fullTranscriptRef.current = "";
    setIsRecording(true);
  };

  const analyzeFinalTranscript = async () => {
    if (fullTranscriptRef.current.trim().length === 0) return;

    setLoading((prev) => ({ ...prev, qa: true, suggest: true, document: true }));

    try {
      // Identify Q&A
      const qaResult = await identifyQuestionsAndAnswers({
        transcription: fullTranscriptRef.current,
      });
      setQaPairs(qaResult);

      // Suggest Questions
      const suggestionsResult = await suggestAdditionalQuestions({
        transcript: fullTranscriptRef.current,
        answeredQuestions: qaResult.map((qa) => qa.question),
        screeningSection: "Generale",
      });
      setSuggestions(suggestionsResult.suggestedQuestions);

      // Format Document if Q&A was found
      if (qaResult.length > 0) {
        const interviewData = qaResult
          .map((qa) => `D: ${qa.question}\nR: ${qa.answer}`)
          .join("\n\n");
        const documentResult = await formatMedicalDocument({ interviewData });
        setDocumentText(documentResult.formattedDocument);
        setIsDocumentOpen(true);
      }
    } catch (error) {
      console.error("Error during final analysis:", error);
    } finally {
      setLoading({
        transcribe: false,
        qa: false,
        suggest: false,
        document: false,
      });
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    await analyzeFinalTranscript();
  };

  const handleAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (!isRecording) return;
    
    setLoading((prev) => ({ ...prev, transcribe: true }));
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const result = await transcribeAudio({ audioDataUri: base64data });
          if (result.transcription) {
            fullTranscriptRef.current += result.transcription + " ";
            setTranscript(fullTranscriptRef.current);
          }
        } catch (error) {
           console.error("Error transcribing audio:", error);
        } finally {
          setLoading(prev => ({ ...prev, transcribe: false }));
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error reading audio blob:", error);
      setLoading(prev => ({ ...prev, transcribe: false }));
    }
  }, [isRecording]);

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
        {(loading.document || loading.qa || loading.suggest) && (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Analisi e generazione del documento in corso...</span>
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
