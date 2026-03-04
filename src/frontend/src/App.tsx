import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { VRPlayer } from "./components/VRPlayer";

type Screen = "welcome" | "player";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setVideoFile(file);
        setScreen("player");
      }
    },
    [],
  );

  const handleLoadVideo = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBack = useCallback(() => {
    setScreen("welcome");
    setVideoFile(null);
    // Reset file input
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

      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <WelcomeScreen key="welcome" onLoadVideo={handleLoadVideo} />
        )}
        {screen === "player" && videoFile && (
          <motion.div
            key="player"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VRPlayer file={videoFile} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface WelcomeScreenProps {
  onLoadVideo: () => void;
}

function WelcomeScreen({ onLoadVideo }: WelcomeScreenProps) {
  return (
    <motion.div
      data-ocid="welcome.section"
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.12 0.04 200 / 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-sm">
        {/* VR Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.15,
            duration: 0.5,
            type: "spring",
            bounce: 0.3,
          }}
        >
          <VRHeadsetIcon />
        </motion.div>

        {/* Title + subtitle */}
        <motion.div
          className="flex flex-col gap-3"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              color: "oklch(0.96 0.01 200)",
              letterSpacing: "-0.03em",
            }}
          >
            VR Video Player
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.55 0.02 200)" }}
          >
            Side-by-side split screen for VR headsets.
            <br />
            Load any video file from your device.
          </p>
        </motion.div>

        {/* Load Video button */}
        <motion.button
          data-ocid="welcome.upload_button"
          onClick={onLoadVideo}
          className="relative flex items-center gap-3 px-8 py-4 rounded-full text-black font-semibold text-base transition-all focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: "oklch(0.78 0.16 195)",
            boxShadow:
              "0 0 32px oklch(0.78 0.16 195 / 0.4), 0 4px 16px rgba(0,0,0,0.4)",
          }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          whileHover={{
            scale: 1.04,
            boxShadow:
              "0 0 48px oklch(0.78 0.16 195 / 0.6), 0 6px 20px rgba(0,0,0,0.5)",
          }}
          whileTap={{ scale: 0.97 }}
          aria-label="Load video file"
        >
          <FolderOpenIcon />
          Load Video
        </motion.button>

        {/* Hint text */}
        <motion.p
          className="text-xs"
          style={{ color: "oklch(0.38 0.01 200)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          MP4, MKV, WebM and most video formats supported
        </motion.p>
      </div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-4 left-0 right-0 text-center text-xs"
        style={{ color: "oklch(0.3 0.01 200)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/50 transition-colors underline underline-offset-2"
        >
          caffeine.ai
        </a>
      </motion.footer>
    </motion.div>
  );
}

// VR Headset SVG icon
function VRHeadsetIcon() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "oklch(0.08 0.03 200)",
        boxShadow:
          "0 0 60px oklch(0.78 0.16 195 / 0.25), inset 0 0 30px oklch(0.78 0.16 195 / 0.05)",
        border: "1px solid oklch(0.22 0.04 200)",
      }}
    >
      <svg
        width="64"
        height="40"
        viewBox="0 0 64 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Main headset body */}
        <rect
          x="2"
          y="8"
          width="60"
          height="24"
          rx="8"
          fill="oklch(0.18 0.05 200)"
          stroke="oklch(0.72 0.18 195)"
          strokeWidth="1.5"
        />
        {/* Left lens */}
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="oklch(0.08 0.03 200)"
          stroke="oklch(0.78 0.16 195)"
          strokeWidth="1.5"
        />
        <circle
          cx="20"
          cy="20"
          r="4"
          fill="oklch(0.78 0.16 195)"
          opacity="0.3"
        />
        <circle
          cx="20"
          cy="20"
          r="2"
          fill="oklch(0.78 0.16 195)"
          opacity="0.7"
        />
        {/* Right lens */}
        <circle
          cx="44"
          cy="20"
          r="8"
          fill="oklch(0.08 0.03 200)"
          stroke="oklch(0.78 0.16 195)"
          strokeWidth="1.5"
        />
        <circle
          cx="44"
          cy="20"
          r="4"
          fill="oklch(0.78 0.16 195)"
          opacity="0.3"
        />
        <circle
          cx="44"
          cy="20"
          r="2"
          fill="oklch(0.78 0.16 195)"
          opacity="0.7"
        />
        {/* Bridge between lenses */}
        <rect
          x="28"
          y="18"
          width="8"
          height="4"
          rx="2"
          fill="oklch(0.18 0.05 200)"
          stroke="oklch(0.55 0.1 195)"
          strokeWidth="1"
        />
        {/* Head strap top */}
        <path
          d="M12 8 Q32 2 52 8"
          stroke="oklch(0.5 0.1 195)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Head strap bottom */}
        <path
          d="M12 32 Q32 38 52 32"
          stroke="oklch(0.5 0.1 195)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Folder open icon for button
function FolderOpenIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5" />
      <path d="M22 17a2 2 0 0 1-2 2H11l-5 3v-3H7a2 2 0 0 1-2-2v-3h17z" />
    </svg>
  );
}
