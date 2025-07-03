import { useState, useRef, useEffect } from "react";

type UseAudioRecorderOptions = {
  onStop?: (blob: Blob) => void;
};

type MediaRecorderErrorEvent = Event & {
  error?: {
    message?: string;
  };
};

type PermissionStatus = "idle" | "requesting" | "granted" | "denied" | "error";

export const useAudioRecorder = ({ onStop }: UseAudioRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [fullRecordingUrl, setFullRecordingUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (fullRecordingUrl) {
        URL.revokeObjectURL(fullRecordingUrl);
      }
    };
  }, [fullRecordingUrl]);

  const requestMic = async (): Promise<boolean> => {
    setStatusMessage("Requesting microphone permission...");
    setPermissionStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionStatus("granted");
      setStatusMessage("Permission granted.");
      return true;
    } catch (err) {
      console.error("Mic permission error:", err);
      setPermissionStatus("denied");
      setStatusMessage("Microphone permission denied.");
      return false;
    }
  };

  const handleDataAvailable = (e: BlobEvent): void => {
    if (e.data.size > 0) {
      audioChunksRef.current.push(e.data);
    }
  };

  const handleError = (e: MediaRecorderErrorEvent): void => {
    console.error("Recording error:", e);
    const message = e.error?.message || "Unknown recording error";
    setStatusMessage(`Recording error: ${message}`);
    setIsRecording(false);
    setPermissionStatus("error");
  };

  const handleStop = (): void => {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];

    if (blob.size > 0) {
      if (onStop) onStop(blob);

      const url = URL.createObjectURL(blob);
      setFullRecordingUrl(url);
    }
  };

  const startRecording = async (): Promise<void> => {
    if (isRecording) return;
    const granted = await requestMic();
    if (!granted || !streamRef.current) return;

    setStatusMessage("Recording...");
    setIsRecording(true);
    audioChunksRef.current = [];

    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;
    recorder.onerror = handleError;

    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current?.state === "recording") {
      setStatusMessage("Stopping recording...");
      mediaRecorderRef.current.stop();
      setStatusMessage("Recording stopped.");
    }

    setIsRecording(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return {
    isRecording,
    permissionStatus,
    statusMessage,
    startRecording,
    stopRecording,
    fullRecordingUrl,
  };
};
