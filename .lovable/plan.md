

# Plan: Epic Full-Screen Celebrations & Advanced Gamification

## Overview
Upgrade the current basic confetti animations into spectacular full-screen celebration effects with multiple new animation styles, making partner site clicks feel rewarding and fun.

---

## Changes

### 1. Upgrade `useConfetti` Hook with New Celebration Functions

Add these new full-screen celebration effects using `canvas-confetti`:

| Effect | Description |
|--------|-------------|
| `fireFullScreenConfetti` | Multi-burst confetti from all corners with staggered timing |
| `fireFireworks` | Sequential firework-style bursts at random positions across the screen |
| `fireRainbow` | Colorful rain effect falling from the top with rainbow colors |
| `fireEmojis` | Custom emoji-shaped confetti (hearts, stars, thumbs up) |
| `fireSideCannons` | Dramatic side cannons firing from both edges simultaneously |

**Technical approach**: All use `canvas-confetti` API with varied `origin`, `angle`, `spread`, `shapes`, `scalar`, `ticks`, `gravity`, and `startVelocity` parameters plus `setInterval`/`setTimeout` for sequenced multi-burst effects.

---

### 2. Add New Celebration Styles to Widget Settings

Update the `celebrationStyle` type and admin dropdown:

| Style | Visual Effect |
|-------|---------------|
| `confetti` (existing) | Basic confetti burst |
| `stars` (existing) | Star shapes floating outward |
| `sparkles` (existing) | Gold sparkle effect |
| `fireworks` (new) | 5 sequential firework bursts at random screen positions |
| `rainbow` (new) | Multi-colored confetti raining from the top across full width |
| `cannons` (new) | Side cannons firing from both edges with large spread |
| `celebration` (new) | Ultimate combo: side cannons + delayed center burst + floating stars |

---

### 3. Update Celebration Trigger in Widget

Make the celebration trigger more impactful:
- Fire celebration BEFORE opening the link (slight delay on navigation)
- Use full-screen `origin` coordinates for maximum visual impact

---

### 4. Update Admin Panel

Add the new celebration styles to the admin dropdown in `AdminFriendlyWebsites.tsx`.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useConfetti.tsx` | Add `fireFireworks`, `fireRainbow`, `fireSideCannons`, `fireCelebration` functions |
| `src/components/friendly-websites/types.ts` | Extend `celebrationStyle` union type |
| `src/components/FriendlyWebsitesWidget.tsx` | Map new styles to new confetti functions |
| `src/pages/admin/AdminFriendlyWebsites.tsx` | Add new celebration options to dropdown |

---

## Technical Details

### Fireworks Effect (example)
```typescript
const fireFireworks = useCallback(async () => {
  const confetti = (await import("canvas-confetti")).default;
  const duration = 2000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      particleCount: 80,
      startVelocity: 30,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors: ['#ff0000','#ff7700','#ffff00','#00ff00','#0077ff','#8800ff'],
      zIndex: 9999,
    });
  }, 400);
}, []);
```

### Ultimate Celebration Effect
```typescript
const fireCelebration = useCallback(async () => {
  const confetti = (await import("canvas-confetti")).default;
  // Side cannons
  confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, ... });
  confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, ... });
  // Delayed center burst
  setTimeout(() => {
    confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.5 }, startVelocity: 45, ... });
  }, 300);
  // Delayed floating stars
  setTimeout(() => {
    confetti({ particleCount: 40, spread: 360, shapes: ['star'], gravity: 0.2, ... });
  }, 700);
}, []);
```

