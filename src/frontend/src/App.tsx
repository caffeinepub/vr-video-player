import { useCallback, useRef, useState } from "react";
import { VRPlayer } from "./components/VRPlayer";

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setVideoFile(file);
      }
    },
    [],
  );

  const handleLoadVideo = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBack = useCallback(() => {
    setVideoFile(null);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="relative w-full h-dvh bg-black overflow-hidden font-sans">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Load video file"
      />

      <VRPlayer
        file={videoFile}
        onLoadVideo={handleLoadVideo}
        onBack={handleBack}
      />
    </div>
  );
}
