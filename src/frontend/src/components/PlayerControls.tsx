import {
  ChevronLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isVisible: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  isVisible,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  onBack,
}: PlayerControlsProps) {
  const seekRef = useRef<HTMLInputElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);

  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeProgress = isMuted ? 0 : volume * 100;

  // Update CSS custom property for gradient fill
  useEffect(() => {
    if (seekRef.current) {
      seekRef.current.style.setProperty("--seek-progress", `${seekProgress}%`);
    }
  }, [seekProgress]);

  useEffect(() => {
    if (volumeRef.current) {
      volumeRef.current.style.setProperty(
        "--volume-progress",
        `${volumeProgress}%`,
      );
    }
  }, [volumeProgress]);

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(e.target.value);
      onSeek(value);
    },
    [onSeek],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(e.target.value);
      onVolumeChange(value);
    },
    [onVolumeChange],
  );

  const handleControlsClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
    },
    [],
  );

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        transition: "opacity 0.35s ease",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Back button — top left */}
      <div className="absolute top-0 left-0 right-0 flex items-start pt-4 px-4">
        <button
          type="button"
          data-ocid="player.secondary_button"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,0.55)" }}
          aria-label="Back to file selector"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Bottom controls bar — keyboard accessible via role="toolbar" */}
      <div
        role="toolbar"
        aria-label="Video controls"
        className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 px-4 pb-4 pt-8"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
        }}
        onClick={handleControlsClick}
        onKeyDown={handleControlsClick}
      >
        {/* Seek row */}
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs font-mono tabular-nums min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <input
            data-ocid="player.input"
            ref={seekRef}
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="vr-seek-slider flex-1"
            aria-label="Seek"
          />
          <span className="text-white/70 text-xs font-mono tabular-nums min-w-[40px] text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            type="button"
            data-ocid="player.toggle"
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95"
            style={{
              background: "oklch(0.78 0.16 195)",
              color: "#000",
              boxShadow: "0 0 18px oklch(0.78 0.16 195 / 0.45)",
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-px" />
            )}
          </button>

          {/* Mute toggle */}
          <button
            type="button"
            data-ocid="player.toggle.2"
            onClick={onMuteToggle}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Volume slider */}
          <input
            ref={volumeRef}
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="vr-volume-slider"
            aria-label="Volume"
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            type="button"
            data-ocid="player.button"
            onClick={onFullscreenToggle}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
