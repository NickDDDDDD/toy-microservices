// components/LiveWaveform.tsx
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/plugins/record";

export default function LiveWaveform() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const record = RecordPlugin.create({
      scrollingWaveform: true,
      renderRecordedAudio: false,
    });

    recordRef.current = record;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#9333ea",
      interact: false,
      cursorWidth: 0,
      height: 60,
      plugins: [record],
    });

    wavesurferRef.current = wavesurfer;

    record.startMic().catch((err: unknown) => {
      console.error("Failed to start microphone:", err);
    });

    return () => {
      record.stopMic();
      wavesurfer.destroy();
    };
  }, []);

  return <div className="w-full" ref={containerRef} />;
}
