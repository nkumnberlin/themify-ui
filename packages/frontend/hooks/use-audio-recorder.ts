import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

type UseAudioRecorder = {
  setValue: (name: "message", value: string) => void;
};

export function useAudioRecorder({ setValue }: UseAudioRecorder) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null); // add this line
  const audioChunksRef = useRef<Blob[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Transcription:", data.text);
      return data;
    },
    onSuccess: (data) => {
      console.log("Transcription successful:", data);
      setValue("message", data.text);
      stopRecording();
    },
    onError: (error) => {
      console.error("Transcription error:", error);
      stopRecording();
    },
  });

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream; // save the stream
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      mutate({ formData });

      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, startRecording, stopRecording, isPending };
}
