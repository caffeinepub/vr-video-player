# VR Video Player

## Current State
- App launches with a full-screen welcome screen ("WelcomeScreen") with a single "Load Video" button
- After selecting a file, it transitions to the split-screen VRPlayer
- Split-screen has per-panel playback controls (seek, play/pause, mute, fullscreen, back)
- The back button on the left panel returns to the welcome screen

## Requested Changes (Diff)

### Add
- Split-screen layout visible immediately on app launch (no welcome screen first)
- A "Load Video" button/overlay shown in both the left and right panels when no video is loaded
- Each panel shows the VR headset icon and a "Load Video" CTA, so the layout is already split at startup

### Modify
- App initial state: skip the welcome screen, render the split-screen layout directly
- VRPlayer (or a new wrapper) must support an "empty" state where both panels show a video-selection UI instead of a video
- Back/change-video control should replace the current "Back" button with a "Load Video" / "Change Video" button inside each panel (accessible during headset use)

### Remove
- Standalone WelcomeScreen component and the "welcome" screen state in App
- AnimatePresence screen transition (no longer needed since there is only one screen)

## Implementation Plan
1. Remove the welcome screen and `screen` state from App.tsx; always render the split-screen layout
2. Modify VRPlayer to accept an optional `file` prop (nullable) and render a per-panel empty state (VR icon + "Load Video" button) when no video is loaded
3. Pass a `onLoadVideo` callback into VRPlayer (and down to each PlayerControls or panel) to trigger the file input
4. Update PlayerControls to show a "Load Video" / "Change Video" button in each panel when in empty state or when controls are visible, replacing the left-only "Back" button
5. Ensure the hidden file input lives in App.tsx and is triggered from either panel
