# VR Video Player

## Current State
A side-by-side VR video player with:
- Two synced video panels (left leader, right follower/muted)
- Bottom auto-hiding overlay controls (seek bar, play/pause, volume, fullscreen, back button)
- A center HUD overlay (absolute-positioned at screen center) with large tap-target buttons (play/pause, seek ±10s, mute, expand for volume/fullscreen, hide/show toggle)

## Requested Changes (Diff)

### Add
- Controls rendered **inside each video panel** (left and right) — identical layout, mirrored in position so both eyes see the controls in the correct location when wearing a VR headset.
- Each panel gets its own copy of: play/pause, seek ±10s, mute toggle, volume slider, fullscreen button, seek bar with time readout, and back button.
- Controls inside each panel auto-hide (same 3s timer behaviour), tap to reveal.

### Modify
- `PlayerControls` component refactored to accept a `side` prop (`"left" | "right"`) and render within the panel's coordinate space rather than as a full-screen overlay.
- `VRPlayer` renders two `PanelControls` instances — one inside each video panel wrapper div.

### Remove
- Center HUD (`showCenterHUD` state, `onToggleCenterHUD` callback, the entire center-positioned control panel, the "Show Controls" pill, `expandedHUD` state, and all related handlers).
- The single shared `PlayerControls` overlay.

## Implementation Plan
1. Rewrite `PlayerControls.tsx` → rename to `PanelControls.tsx` (or keep filename, refactor component). Remove center HUD entirely. Accept `side` prop. Render controls at the bottom of a relative-positioned container rather than absolute full-screen.
2. Update `VRPlayer.tsx`: wrap each `<video>` in a `relative` div, place a `PanelControls` inside each wrapper, remove `showCenterHUD`/`onToggleCenterHUD` state and handler, pass shared playback state/callbacks to both panels.
3. Ensure seek bar, time display, play/pause, seek ±10s, mute, volume, fullscreen all appear in both panels — functionally identical, visually aligned per-eye.
