import {
  FolderOpen,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

interface PanelControlsProps {
  side: "left" | "right";
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
  onLoadVideo: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerControls({
  side,
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
  onLoadVideo,
}: PanelControlsProps) {
  const seekRef = useRef<HTMLInputElement>(null);
  const volumeRef = useRef<HTMLInputElement>(null);

  const seekProgress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumeProgress = isMuted ? 0 : volume * 100;

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

  const stopProp = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(Number.parseFloat(e.target.value));
    },
    [onSeek],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVolumeChange(Number.parseFloat(e.target.value));
    },
    [onVolumeChange],
  );

  const handleSeekBack = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSeek(Math.max(currentTime - 10, 0));
    },
    [onSeek, currentTime],
  );

  const handleSeekForward = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSeek(Math.min(currentTime + 10, duration));
    },
    [onSeek, currentTime, duration],
  );

  const handlePlayPause = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPlayPause();
    },
    [onPlayPause],
  );

  const handleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMuteToggle();
    },
    [onMuteToggle],
  );

  const handleFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFullscreenToggle();
    },
    [onFullscreenToggle],
  );

  const handleChangeVideo = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLoadVideo();
    },
    [onLoadVideo],
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transition: "opacity 0.35s ease",
        opacity: isVisible ? 1 : 0,
        zIndex: 10,
      }}
    >
      {/* Change Video button — top-left corner of EACH panel */}
      <div
        className="absolute top-0 left-0 pt-3 pl-3 pointer-events-auto"
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        <button
          type="button"
          data-ocid={`player.${side}.open_modal_button`}
          onClick={handleChangeVideo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,0.55)" }}
          aria-label="Change video file"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Change</span>
        </button>
      </div>

      {/* Bottom controls bar */}
      <div
        role="toolbar"
        aria-label={`Video controls ${side} panel`}
        className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 px-3 pb-3 pt-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={stopProp}
        onKeyDown={stopProp}
      >
        {/* Seek row */}
        <div className="flex items-center gap-2">
          <span className="text-white/70 text-xs font-mono tabular-nums min-w-[36px]">
            {formatTime(currentTime)}
          </span>
          <input
            data-ocid={`player.${side}.input`}
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
          <span className="text-white/70 text-xs font-mono tabular-nums min-w-[36px] text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1.5">
          {/* Seek -10s */}
          <button
            type="button"
            data-ocid={`player.${side}.secondary_button`}
            onClick={handleSeekBack}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label="Seek back 10 seconds"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="text-[8px] leading-none opacity-70">10s</span>
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            data-ocid={`player.${side}.toggle`}
            onClick={handlePlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95"
            style={{
              background: "oklch(0.78 0.16 195)",
              color: "#000",
              boxShadow: "0 0 18px oklch(0.78 0.16 195 / 0.45)",
            }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-px" />
            )}
          </button>

          {/* Seek +10s */}
          <button
            type="button"
            data-ocid={`player.${side}.secondary_button.2`}
            onClick={handleSeekForward}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label="Seek forward 10 seconds"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="text-[8px] leading-none opacity-70">10s</span>
          </button>

          {/* Mute toggle */}
          <button
            type="button"
            data-ocid={`player.${side}.toggle.2`}
            onClick={handleMute}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-95"
            style={{
              background: isMuted
                ? "rgba(255,80,80,0.18)"
                : "rgba(255,255,255,0.08)",
              border: `1px solid ${isMuted ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: isMuted
                ? "rgba(255,140,140,0.95)"
                : "rgba(255,255,255,0.80)",
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
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
            onClick={stopProp}
            className="vr-volume-slider flex-1 min-w-0"
            aria-label="Volume"
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            type="button"
            data-ocid={`player.${side}.button`}
            onClick={handleFullscreen}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)" }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
