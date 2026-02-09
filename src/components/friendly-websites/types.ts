export interface FriendlyWebsite {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  click_count: number;
  last_clicked_at: string | null;
  badge_text: string | null;
  badge_color: string | null;
  star_rating: number | null;
  is_verified: boolean;
  is_featured: boolean;
  tagline: string | null;
  created_at: string;
  updated_at: string;
}

export interface WidgetSettings {
  enabled: boolean;
  visibleToPublic: boolean;
  visibleToLoggedIn: boolean;
  colorScheme: 'primary' | 'accent' | 'gradient' | 'glass' | 'neon' | 'sunset' | 'ocean' | 'forest' | 'midnight' | 'minimal';
  size: 'small' | 'medium' | 'large';
  position: 'left' | 'right';
  showOnMobile: boolean;
  animationType: 'slide' | 'fade' | 'bounce';
  openByDefault: boolean;
  autoCloseDelay: number | null;
  showWebsiteCount: boolean;
  pulseAnimation: boolean;
  headerText: string;
  showDescriptions: boolean;
  // New engagement features
  displayMode: 'list' | 'carousel' | 'grid';
  carouselInterval: number;
  carouselAutoPlay: boolean;
  featuredLabel: string;
  featuredStyle: 'glow' | 'badge' | 'animated';
  showClickCounts: boolean;
  showBadges: boolean;
  showStarRatings: boolean;
  showVerifiedBadge: boolean;
  celebrateOnClick: boolean;
  celebrationStyle: 'confetti' | 'stars' | 'sparkles';
  showHoverPreview: boolean;
  ctaStyle: 'icon' | 'button' | 'arrow';
  ctaText: string;
  shuffleOrder: boolean;
  showMiniBar: boolean;
  miniBarPosition: 'top' | 'bottom';
  showFooterCTA: boolean;
  footerCTAText: string;
}

export const defaultSettings: WidgetSettings = {
  enabled: true,
  visibleToPublic: true,
  visibleToLoggedIn: true,
  colorScheme: 'primary',
  size: 'medium',
  position: 'right',
  showOnMobile: true,
  animationType: 'slide',
  openByDefault: false,
  autoCloseDelay: null,
  showWebsiteCount: true,
  pulseAnimation: true,
  headerText: 'Partner Sites',
  showDescriptions: true,
  // New engagement features defaults
  displayMode: 'list',
  carouselInterval: 5,
  carouselAutoPlay: true,
  featuredLabel: 'Featured',
  featuredStyle: 'glow',
  showClickCounts: false,
  showBadges: true,
  showStarRatings: true,
  showVerifiedBadge: true,
  celebrateOnClick: true,
  celebrationStyle: 'confetti',
  showHoverPreview: true,
  ctaStyle: 'arrow',
  ctaText: 'Visit',
  shuffleOrder: false,
  showMiniBar: false,
  miniBarPosition: 'bottom',
  showFooterCTA: true,
  footerCTAText: 'Explore All Partners',
};

export const colorClasses: Record<WidgetSettings['colorScheme'], string> = {
  primary: 'bg-primary/10 border-primary/30 hover:bg-primary/20',
  accent: 'bg-accent/10 border-accent/30 hover:bg-accent/20',
  gradient: 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30',
  glass: 'bg-card/80 backdrop-blur-xl border-border/50',
  neon: 'bg-pink-500/10 border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
  sunset: 'bg-gradient-to-br from-orange-500/15 to-rose-500/15 border-orange-400/40',
  ocean: 'bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-cyan-400/40',
  forest: 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-400/40',
  midnight: 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/40',
  minimal: 'bg-background border-border',
};

export const buttonColorClasses: Record<WidgetSettings['colorScheme'], string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  gradient: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
  glass: 'bg-card/90 backdrop-blur-xl text-foreground border border-border/50 hover:bg-card',
  neon: 'bg-pink-500 text-white hover:bg-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.4)]',
  sunset: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600',
  ocean: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600',
  forest: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600',
  midnight: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700',
  minimal: 'bg-muted text-foreground hover:bg-muted/80 border border-border',
};

export const pulseColors: Record<WidgetSettings['colorScheme'], string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  gradient: 'bg-primary',
  glass: 'bg-foreground',
  neon: 'bg-pink-400',
  sunset: 'bg-orange-400',
  ocean: 'bg-cyan-400',
  forest: 'bg-emerald-400',
  midnight: 'bg-purple-400',
  minimal: 'bg-foreground',
};
