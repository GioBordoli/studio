"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AudioRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onAudioChunk: (audioBlob: Blob) => void;
}

export function AudioRecorder({ isRecording, onStart, onStop, onAudioChunk }: AudioRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const updateAudioLevel = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
      setAudioLevel(avg);
    }
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const stopAudioProcessing = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setAudioLevel(0);
    mediaRecorderRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
  }, []);

  const startAudioProcessing = useCallback(async () => {
    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      analyserRef.current = audioContext.createAnalyser();
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioChunk(event.data);
        }
      };
      recorder.start(3000); // Trigger dataavailable every 3 seconds

      updateAudioLevel();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // You might want to show an error to the user here
    } finally {
      setIsInitializing(false);
    }
  }, [onAudioChunk, updateAudioLevel]);

  useEffect(() => {
    if (isRecording) {
      startAudioProcessing();
    } else {
      mediaRecorderRef.current?.stop();
      stopAudioProcessing();
    }

    return () => {
      mediaRecorderRef.current?.stop();
      stopAudioProcessing();
    };
  }, [isRecording, startAudioProcessing, stopAudioProcessing]);


  const getBarColor = () => {
    if (audioLevel > 100) return 'bg-red-500';
    if (audioLevel > 60) return 'bg-yellow-400';
    return 'bg-accent';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Controllo Registrazione</CardTitle>
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button onClick={onStart} disabled={isInitializing}>
              {isInitializing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mic className="mr-2 h-4 w-4" />
              )}
              Inizia a Registrare
            </Button>
          ) : (
            <Button onClick={onStop} variant="destructive">
              <StopCircle className="mr-2 h-4 w-4" />
              Interrompi Registrazione
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="font-medium text-sm w-28">Livello Audio</div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${getBarColor()}`}
              style={{ width: `${Math.min(100, (audioLevel / 150) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
