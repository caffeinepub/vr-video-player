import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerControls } from "./PlayerControls";

interface VRPlayerProps {
  file: File | null;
  onLoadVideo: () => void;
  onBack: () => void;
}

export function VRPlayer({ file, onLoadVideo, onBack }: VRPlayerProps) {
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Create object URL from file
  useEffect(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;

    if (!file) {
      // Clear src when no file is loaded
      if (left) left.src = "";
      if (right) right.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const url = URL.createObjectURL(file);
    if (left) left.src = url;
    if (right) right.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Auto-hide controls
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // Left video event handlers (leader)
  useEffect(() => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left || !right) return;

    const syncToRight = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      right.currentTime = left.currentTime;
      isSyncingRef.current = false;
    };

    const handlePlay = () => {
      setIsPlaying(true);
      syncToRight();
      right.play().catch(() => {});
      scheduleHide();
    };

    const handlePause = () => {
      setIsPlaying(false);
      syncToRight();
      right.pause();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
    };

    const handleSeeked = () => {
      syncToRight();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(left.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(left.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
    };

    left.addEventListener("play", handlePlay);
    left.addEventListener("pause", handlePause);
    left.addEventListener("seeked", handleSeeked);
    left.addEventListener("timeupdate", handleTimeUpdate);
    left.addEventListener("loadedmetadata", handleLoadedMetadata);
    left.addEventListener("ended", handleEnded);

    return () => {
      left.removeEventListener("play", handlePlay);
      left.removeEventListener("pause", handlePause);
      left.removeEventListener("seeked", handleSeeked);
      left.removeEventListener("timeupdate", handleTimeUpdate);
      left.removeEventListener("loadedmetadata", handleLoadedMetadata);
      left.removeEventListener("ended", handleEnded);
    };
  }, [scheduleHide]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    const left = leftVideoRef.current;
    if (!left) return;
    if (left.paused) {
      left.play().catch(() => {});
    } else {
      left.pause();
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
    if (!left || !right) return;
    left.currentTime = time;
    right.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const left = leftVideoRef.current;
    if (!left) return;
    setVolume(newVolume);
    left.volume = newVolume;
    if (newVolume > 0) setIsMuted(false);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const left = leftVideoRef.current;
    if (!left) return;
    const next = !isMuted;
    setIsMuted(next);
    left.muted = next;
  }, [isMuted]);

  const handleFullscreenToggle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleContainerInteract = useCallback(() => {
    setControlsVisible((prev) => {
      if (!prev) {
        scheduleHide();
        return true;
      }
      return prev;
    });
  }, [scheduleHide]);

  const handleContainerTap = useCallback(() => {
    showControls();
  }, [showControls]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handlePlayPause();
        showControls();
      }
      if (e.key === "ArrowRight") {
        handleSeek(Math.min(currentTime + 10, duration));
        showControls();
      }
      if (e.key === "ArrowLeft") {
        handleSeek(Math.max(currentTime - 10, 0));
        showControls();
      }
    },
    [handlePlayPause, handleSeek, showControls, currentTime, duration],
  );

  // Shared controls props
  const controlsProps = {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isVisible: controlsVisible,
    onPlayPause: handlePlayPause,
    onSeek: handleSeek,
    onVolumeChange: handleVolumeChange,
    onMuteToggle: handleMuteToggle,
    onFullscreenToggle: handleFullscreenToggle,
    onLoadVideo,
    onBack,
  };

  return (
    <div
      ref={containerRef}
      data-ocid="player.canvas_target"
      role="application"
      aria-label="VR Video Player"
      className="relative w-full h-dvh overflow-hidden bg-black cursor-pointer select-none outline-none"
      onClick={handleContainerInteract}
      onTouchEnd={handleContainerTap}
      onKeyDown={handleKeyDown}
      style={{ userSelect: "none" }}
    >
      {/* Dual video panels — no gap */}
      <div className="absolute inset-0 flex">
        {/* Left panel (leader) */}
        <div className="relative w-1/2 h-full">
          <video
            ref={leftVideoRef}
            className="w-full h-full object-contain bg-black"
            style={{ visibility: file ? "visible" : "hidden" }}
            playsInline
            preload="auto"
          >
            <track kind="captions" />
          </video>

          {/* Empty state overlay — shown when no file loaded */}
          {!file && <PanelEmptyState side="left" onLoadVideo={onLoadVideo} />}

          {file && <PlayerControls side="left" {...controlsProps} />}
        </div>

        {/* Right panel (follower, always muted) */}
        <div className="relative w-1/2 h-full">
          <video
            ref={rightVideoRef}
            className="w-full h-full object-contain bg-black"
            style={{ visibility: file ? "visible" : "hidden" }}
            playsInline
            preload="auto"
            muted
          >
            <track kind="captions" />
          </video>

          {/* Empty state overlay — shown when no file loaded */}
          {!file && <PanelEmptyState side="right" onLoadVideo={onLoadVideo} />}

          {file && <PlayerControls side="right" {...controlsProps} />}
        </div>
      </div>

      {/* Center divider line — subtle seam reference */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}

// ─── Empty State Overlay ────────────────────────────────────────────────────

interface PanelEmptyStateProps {
  side: "left" | "right";
  onLoadVideo: () => void;
}

function PanelEmptyState({ side, onLoadVideo }: PanelEmptyStateProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLoadVideo();
    },
    [onLoadVideo],
  );

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Atmospheric radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.12 0.04 200 / 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Subtle cyan grid overlay */}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* VR headset icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            type: "spring",
            bounce: 0.3,
          }}
        >
          <VRHeadsetIcon />
        </motion.div>

        {/* Title */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        >
          <h2
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.6rem)",
              color: "oklch(0.96 0.01 200)",
              letterSpacing: "-0.02em",
            }}
          >
            VR Video Player
          </h2>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.52 0.02 200)" }}
          >
            Side-by-side split screen
            <br />
            for VR headsets
          </p>
        </motion.div>

        {/* Load Video button */}
        <motion.button
          data-ocid={`player.${side}.upload_button`}
          type="button"
          onClick={handleClick}
          className="relative flex items-center gap-2.5 px-6 py-3 rounded-full text-black font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: "oklch(0.78 0.16 195)",
            boxShadow:
              "0 0 28px oklch(0.78 0.16 195 / 0.4), 0 4px 14px rgba(0,0,0,0.4)",
          }}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 0 40px oklch(0.78 0.16 195 / 0.6), 0 6px 18px rgba(0,0,0,0.5)",
          }}
          whileTap={{ scale: 0.96 }}
          aria-label="Load video file"
        >
          <FolderOpenIcon />
          Load Video
        </motion.button>

        {/* Format hint */}
        <motion.p
          className="text-xs"
          style={{ color: "oklch(0.35 0.01 200)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          MP4, MKV, WebM and most formats
        </motion.p>
      </div>

      {/* Footer — only show on one side to avoid duplication */}
      {side === "left" && (
        <motion.footer
          className="absolute bottom-3 left-0 right-0 text-center text-xs"
          style={{ color: "oklch(0.28 0.01 200)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors underline underline-offset-2"
            onClick={(e) => e.stopPropagation()}
          >
            caffeine.ai
          </a>
        </motion.footer>
      )}
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function VRHeadsetIcon() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: "oklch(0.08 0.03 200)",
        boxShadow:
          "0 0 50px oklch(0.78 0.16 195 / 0.22), inset 0 0 24px oklch(0.78 0.16 195 / 0.05)",
        border: "1px solid oklch(0.22 0.04 200)",
      }}
    >
      <svg
        width="52"
        height="32"
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
        {/* Bridge */}
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

function FolderOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
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
