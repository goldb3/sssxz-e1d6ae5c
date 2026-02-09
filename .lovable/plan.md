

# Plan: Enhanced Friendly Websites Widget

## Overview
Add new customization options to the Friendly Websites sidebar widget including an "Open by Default" setting, more color schemes, and additional appearance/behavior options to make the widget more engaging.

---

## Changes Required

### 1. Add New Widget Settings Options

**New Settings to Add:**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `openByDefault` | boolean | false | Keep widget open when page loads |
| `autoCloseDelay` | number \| null | null | Auto-close after X seconds (null = never) |
| `showWebsiteCount` | boolean | true | Display count badge on toggle button |
| `pulseAnimation` | boolean | true | Show pulsing dot to attract attention |
| `headerText` | string | "Partner Sites" | Customizable header text |
| `showDescriptions` | boolean | true | Show website descriptions |

**New Color Schemes:**

| Scheme | Description |
|--------|-------------|
| `neon` | Vibrant neon glow effect |
| `sunset` | Warm orange/pink gradient |
| `ocean` | Cool blue/cyan tones |
| `forest` | Natural green tones |
| `midnight` | Dark elegant purple |
| `minimal` | Clean, minimal styling |

---

### 2. Update WidgetSettings Interface

```typescript
interface WidgetSettings {
  // Existing
  enabled: boolean;
  visibleToPublic: boolean;
  visibleToLoggedIn: boolean;
  colorScheme: 'primary' | 'accent' | 'gradient' | 'glass' | 'neon' | 'sunset' | 'ocean' | 'forest' | 'midnight' | 'minimal';
  size: 'small' | 'medium' | 'large';
  position: 'left' | 'right';
  showOnMobile: boolean;
  animationType: 'slide' | 'fade' | 'bounce';
  
  // New options
  openByDefault: boolean;
  autoCloseDelay: number | null;
  showWebsiteCount: boolean;
  pulseAnimation: boolean;
  headerText: string;
  showDescriptions: boolean;
}
```

---

### 3. Update FriendlyWebsitesWidget.tsx

**Changes:**

1. **Open by Default Logic:**
   - Initialize `isOpen` state from settings: `useState(settings.openByDefault)`
   - Use `useEffect` to sync with settings changes

2. **Auto-Close Timer:**
   - Add `useEffect` to start timer when widget opens
   - Clear timer on close or when user interacts

3. **Website Count Badge:**
   - Show badge on toggle button with website count
   - Pulsing animation to attract attention

4. **New Color Schemes:**
   - Add 6 new color scheme variants
   - Each with unique background, border, and button styles

5. **Customizable Header:**
   - Use `settings.headerText` instead of hardcoded "Partner Sites"

6. **Toggle Descriptions:**
   - Conditionally render descriptions based on `showDescriptions`

---

### 4. Update AdminFriendlyWebsites.tsx

**Add New Settings Controls:**

1. **"Open by Default" Toggle:**
   - Switch control in settings panel
   - Description: "Widget opens automatically when page loads"

2. **"Auto-Close Delay" Input:**
   - Number input or select (0/5/10/15/30 seconds, or "Never")
   - Description: "Automatically close after X seconds"

3. **"Show Website Count" Toggle:**
   - Shows badge with number of partner sites

4. **"Pulse Animation" Toggle:**
   - Enable/disable attention-grabbing pulse

5. **"Header Text" Input:**
   - Text input to customize widget header

6. **"Show Descriptions" Toggle:**
   - Show/hide website descriptions in list

7. **Expanded Color Scheme Dropdown:**
   - Add all 6 new color options with preview swatches

---

## Technical Implementation Details

### Color Scheme Definitions

```typescript
const colorClasses = {
  // Existing
  primary: 'bg-primary/10 border-primary/30',
  accent: 'bg-accent/10 border-accent/30',
  gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30',
  glass: 'bg-card/80 backdrop-blur-xl border-border/50',
  
  // New schemes
  neon: 'bg-pink-500/10 border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
  sunset: 'bg-gradient-to-br from-orange-500/15 to-rose-500/15 border-orange-400/40',
  ocean: 'bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-cyan-400/40',
  forest: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-400/40',
  midnight: 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/40',
  minimal: 'bg-background border-border',
};
```

### Auto-Close Timer Logic

```typescript
useEffect(() => {
  if (isOpen && settings.autoCloseDelay && settings.autoCloseDelay > 0) {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, settings.autoCloseDelay * 1000);
    
    return () => clearTimeout(timer);
  }
}, [isOpen, settings.autoCloseDelay]);
```

### Open by Default Logic

```typescript
// Use useEffect to set initial open state after settings load
useEffect(() => {
  if (settings.openByDefault) {
    setIsOpen(true);
  }
}, [settings.openByDefault]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/FriendlyWebsitesWidget.tsx` | Add new color schemes, open by default logic, auto-close timer, count badge, customizable header |
| `src/pages/admin/AdminFriendlyWebsites.tsx` | Add new settings controls for all new options |

---

## UI Preview (Widget Settings Panel)

```text
+-----------------------------------------------+
|  Widget Settings                              |
+-----------------------------------------------+
|                                               |
|  [x] Enable Widget                            |
|                                               |
|  --- Display Behavior ---                     |
|  [x] Open by Default                          |
|      Widget opens automatically on page load  |
|                                               |
|  Auto-Close Delay: [Never      v]             |
|      5 sec, 10 sec, 15 sec, 30 sec, Never     |
|                                               |
|  [x] Show Website Count Badge                 |
|  [x] Pulse Animation (attracts attention)     |
|                                               |
|  --- Content ---                              |
|  Header Text: [Partner Sites    ]             |
|  [x] Show Website Descriptions                |
|                                               |
|  --- Appearance ---                           |
|  Color Scheme: [Neon            v]            |
|      Primary, Accent, Gradient, Glass,        |
|      Neon, Sunset, Ocean, Forest,             |
|      Midnight, Minimal                        |
|                                               |
|  Size: [Medium v]   Position: [Right v]       |
|  Animation: [Slide v]                         |
|                                               |
|  [x] Show on Mobile                           |
|                                               |
|  [       Save Settings       ]                |
+-----------------------------------------------+
```

---

## Benefits

1. **Better Engagement**: Open by default ensures users see partner sites immediately
2. **Non-Intrusive**: Auto-close option prevents permanent screen clutter
3. **Visual Appeal**: 6 new color schemes for better theme matching
4. **Customization**: Admin has full control over widget behavior and appearance
5. **User-Friendly**: Count badge and pulse animation draw attention naturally

