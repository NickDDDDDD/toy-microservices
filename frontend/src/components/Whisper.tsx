import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useAIWebSocket } from "../context/AIWebsocketContext";
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import LiveWaveform from "./LiveWaveform";
type TranscribeAudioMessage = {
  type: "transcribe_audio";
  content: {
    audio_base64: string;
    mime_type?: string;
  };
};

// type TranscribeAudioResultMessage = {
//   type: "transcribe_audio_result";
//   content: {
//     transcript: string;
//   };
// };

const Whisper = () => {
  const { sendMessage } = useAIWebSocket();

  const {
    isRecording,
    permissionStatus,
    startRecording,
    stopRecording,
    fullRecordingUrl: recordingUrl,
  } = useAudioRecorder({
    onStop: async (blob: Blob) => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const base64Audio = btoa(
          String.fromCharCode(...new Uint8Array(arrayBuffer)),
        );

        sendMessage({
          type: "transcribe_audio",
          content: {
            mime_type: blob.type,
            audio_base64: base64Audio,
          },
        } satisfies TranscribeAudioMessage);
      } catch (err) {
        console.error("Error processing blob:", err);
      }
    },
  });

  return (
    <div className="rounded-4xl text-sm text-zinc-200">
      <div className="relative flex h-full w-full flex-col items-center justify-evenly gap-2">
        <div className="flex w-full items-center justify-evenly gap-2">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={
              permissionStatus === "denied" || permissionStatus === "requesting"
            }
            className={`flex w-full items-center justify-center rounded-full p-2 transition-colors duration-200 ${
              (permissionStatus === "denied" ||
                permissionStatus === "requesting") &&
              !isRecording
                ? "cursor-not-allowed bg-gray-600 text-gray-400"
                : isRecording
                  ? "bg-red-700 text-white hover:bg-red-600 active:bg-red-800"
                  : "bg-green-700 text-white hover:bg-green-600 active:bg-green-800"
            }`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <StopIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        {isRecording && (
          <div className="flex w-full flex-col items-center gap-2 text-purple-300">
            <p className="text-xs italic">🎙️ Recording... speak now</p>
            <LiveWaveform />
          </div>
        )}
        {recordingUrl && (
          <div className="w-full max-w-xl">
            <audio
              controls
              preload="metadata"
              src={recordingUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        {/* {transcript && (
          <div className="w-full max-w-xl rounded-4xl bg-zinc-700 p-4 text-sm">
            <h3 className="mb-2 font-semibold">Transcript:</h3>
            <p className="whitespace-pre-wrap">{transcript}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Whisper;
