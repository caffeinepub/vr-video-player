import { useCallback, useEffect, useRef, useState } from "react";
import { PlayerControls } from "./PlayerControls";

interface VRPlayerProps {
  file: File;
  onBack: () => void;
}

export function VRPlayer({ file, onBack }: VRPlayerProps) {
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
    const url = URL.createObjectURL(file);

    const left = leftVideoRef.current;
    const right = rightVideoRef.current;
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
            playsInline
            preload="auto"
          >
            <track kind="captions" />
          </video>
          <PlayerControls side="left" {...controlsProps} />
        </div>

        {/* Right panel (follower, always muted) */}
        <div className="relative w-1/2 h-full">
          <video
            ref={rightVideoRef}
            className="w-full h-full object-contain bg-black"
            playsInline
            preload="auto"
            muted
          >
            <track kind="captions" />
          </video>
          <PlayerControls side="right" {...controlsProps} />
        </div>
      </div>

      {/* Center divider line — subtle seam reference */}
      <div
        className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
    </div>
  );
}
