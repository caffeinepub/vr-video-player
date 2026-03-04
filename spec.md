# VR Video Player

## Current State
The project has the standard Caffeine scaffold: React + TypeScript frontend with shadcn/ui components, Tailwind CSS, and a Motoko backend shell. No App.tsx or app-specific code exists yet.

## Requested Changes (Diff)

### Add
- Welcome/landing screen with a "Load Video" button to pick a local file from the device
- Side-by-side (split-screen) video player: two synchronized video panels flush edge-to-edge, optimized for VR headsets
- Sync logic: play/pause/seek on the left panel mirrors instantly to the right panel; right panel is always muted to prevent audio echo
- Auto-hiding controls overlay: tap anywhere to show; fades after 3 seconds during playback; stays visible when paused
- Controls: play/pause button, seek/scrubber bar, volume slider with mute toggle, fullscreen button
- PWA manifest (manifest.json) with landscape orientation lock
- Service worker for offline caching
- iOS/Android meta tags for "Add to Home Screen" / standalone install

### Modify
- index.html: add PWA meta tags and manifest link

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/App.tsx` with welcome screen and VR player state machine
2. Create `src/frontend/src/components/VRPlayer.tsx` for the dual-video synchronized player
3. Create `src/frontend/src/components/PlayerControls.tsx` for the auto-hiding overlay controls
4. Create `src/frontend/public/manifest.json` for PWA support
5. Create `src/frontend/public/sw.js` service worker for offline caching
6. Update `src/frontend/index.html` with PWA meta tags and manifest link
