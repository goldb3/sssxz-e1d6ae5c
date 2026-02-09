import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/hooks/useConfetti";
import {
  FriendlyWebsite,
  WidgetSettings,
  defaultSettings,
  colorClasses,
  buttonColorClasses,
  pulseColors,
} from "./friendly-websites/types";
import WebsiteCard from "./friendly-websites/WebsiteCard";
import WebsiteCarousel from "./friendly-websites/WebsiteCarousel";
import WebsiteMiniBar from "./friendly-websites/WebsiteMiniBar";
import WebsiteGrid from "./friendly-websites/WebsiteGrid";

const FriendlyWebsitesWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const hasInitialized = useRef(false);
  const userInteracted = useRef(false);
  const { fireConfetti, fireStarConfetti, fireFireworks, fireRainbow, fireSideCannons, fireCelebration } = useConfetti();

  // Fetch settings with React Query for caching and real-time updates
  const { data: settings = defaultSettings } = useQuery({
    queryKey: ['app_settings', 'friendly_sites_widget'],
    queryFn: async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'friendly_sites_widget')
        .maybeSingle();

      if (data?.value) {
        return { ...defaultSettings, ...(data.value as Partial<WidgetSettings>) };
      }
      return defaultSettings;
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 15,
  });

  // Fetch websites with React Query
  const { data: rawWebsites = [], isLoading } = useQuery({
    queryKey: ['friendly_websites', 'active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('friendly_websites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      return (data || []) as FriendlyWebsite[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Process websites (shuffle if enabled, sort featured first)
  const websites = useMemo(() => {
    let processed = [...rawWebsites];
    
    // Sort featured websites first
    processed.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    // Shuffle non-featured if enabled
    if (settings.shuffleOrder) {
      const featured = processed.filter(w => w.is_featured);
      const nonFeatured = processed.filter(w => !w.is_featured);
      
      // Fisher-Yates shuffle for non-featured
      for (let i = nonFeatured.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonFeatured[i], nonFeatured[j]] = [nonFeatured[j], nonFeatured[i]];
      }
      
      processed = [...featured, ...nonFeatured];
    }

    return processed;
  }, [rawWebsites, settings.shuffleOrder]);

  // Open by default logic - only run once on initial load
  useEffect(() => {
    if (!hasInitialized.current && settings.openByDefault && !userInteracted.current) {
      setIsOpen(true);
      hasInitialized.current = true;
    }
  }, [settings.openByDefault]);

  // Auto-close timer logic
  useEffect(() => {
    if (isOpen && settings.autoCloseDelay && settings.autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, settings.autoCloseDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, settings.autoCloseDelay]);

  // Handle user toggle
  const handleToggle = () => {
    userInteracted.current = true;
    setIsOpen(!isOpen);
  };

  // Handle website click - track and celebrate
  const handleWebsiteClick = async (website: FriendlyWebsite) => {
    // Track click
    try {
      await supabase.rpc('increment_website_click', { p_website_id: website.id });
    } catch (error) {
      console.error('Failed to track click:', error);
    }

    // Celebrate if enabled
    if (settings.celebrateOnClick) {
      const style = settings.celebrationStyle;
      if (style === 'confetti') {
        fireConfetti({ particleCount: 50, spread: 60 });
      } else if (style === 'stars') {
        fireStarConfetti();
      } else if (style === 'sparkles') {
        fireConfetti({ particleCount: 30, spread: 50, colors: ['#ffd700', '#ffec8b', '#fff8dc'] });
      } else if (style === 'fireworks') {
        fireFireworks();
      } else if (style === 'rainbow') {
        fireRainbow();
      } else if (style === 'cannons') {
        fireSideCannons();
      } else if (style === 'celebration') {
        fireCelebration();
      }
    }
  };

  // Check visibility permissions
  const isVisible = () => {
    if (!settings.enabled) return false;
    if (websites.length === 0) return false;
    
    if (user && !settings.visibleToLoggedIn) return false;
    if (!user && !settings.visibleToPublic) return false;
    
    return true;
  };

  if (isLoading || !isVisible()) return null;

  const sizeClasses = {
    small: 'w-48',
    medium: 'w-64',
    large: 'w-80',
  };

  const animationVariants = {
    slide: {
      hidden: { x: settings.position === 'right' ? 300 : -300, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
    fade: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    bounce: {
      hidden: { x: settings.position === 'right' ? 300 : -300, opacity: 0 },
      visible: { x: 0, opacity: 1 },
    },
  } as const;

  const positionClasses = settings.position === 'right' 
    ? 'right-0 rounded-l-xl' 
    : 'left-0 rounded-r-xl';

  const toggleButtonPosition = settings.position === 'right'
    ? 'right-0 rounded-l-lg'
    : 'left-0 rounded-r-lg';

  // Render mini bar if enabled and widget is closed
  if (settings.showMiniBar && !isOpen) {
    return (
      <WebsiteMiniBar
        websites={websites}
        settings={settings}
        onWebsiteClick={handleWebsiteClick}
        onExpand={handleToggle}
      />
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={handleToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 p-2 shadow-lg transition-all duration-300 ${toggleButtonPosition} ${buttonColorClasses[settings.colorScheme]} ${settings.showOnMobile ? '' : 'hidden md:block'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close friendly sites' : 'Open friendly sites'}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1">
              {settings.position === 'right' ? (
                isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              ) : (
                isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              )}
              {/* Website count badge */}
              {settings.showWebsiteCount && !isOpen && (
                <span className="relative flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-background/90 text-foreground">
                  {websites.length}
                  {settings.pulseAnimation && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${pulseColors[settings.colorScheme]} animate-pulse`} />
                  )}
                </span>
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side={settings.position === 'right' ? 'left' : 'right'}>
            <p>{isOpen ? 'Close' : settings.headerText}</p>
          </TooltipContent>
        </Tooltip>
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={animationVariants[settings.animationType]}
            transition={{ duration: 0.3 }}
            className={`fixed top-1/2 -translate-y-1/2 z-50 ${positionClasses} ${sizeClasses[settings.size]} ${colorClasses[settings.colorScheme]} border p-4 shadow-xl ${settings.showOnMobile ? '' : 'hidden md:block'}`}
          >
            {/* Close button */}
            <button
              onClick={() => {
                userInteracted.current = true;
                setIsOpen(false);
              }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Header */}
            <h3 className="font-semibold text-foreground mb-4 pr-6 flex items-center gap-2">
              {settings.pulseAnimation && (
                <span className={`w-2 h-2 rounded-full ${pulseColors[settings.colorScheme]} animate-pulse`} />
              )}
              {settings.headerText}
              {settings.showWebsiteCount && (
                <span className="text-xs font-normal text-muted-foreground">({websites.length})</span>
              )}
            </h3>

            {/* Website list based on display mode */}
            <div className="max-h-80 overflow-y-auto">
              {settings.displayMode === 'carousel' ? (
                <WebsiteCarousel
                  websites={websites}
                  settings={settings}
                  onWebsiteClick={handleWebsiteClick}
                />
              ) : settings.displayMode === 'grid' ? (
                <WebsiteGrid
                  websites={websites}
                  settings={settings}
                  onWebsiteClick={handleWebsiteClick}
                />
              ) : (
                <div className="space-y-2">
                  {websites.map((website, index) => (
                    <WebsiteCard
                      key={website.id}
                      website={website}
                      settings={settings}
                      index={index}
                      onWebsiteClick={handleWebsiteClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer CTA */}
            {settings.showFooterCTA && settings.footerCTAText && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-xs gap-1"
                onClick={() => {
                  fireConfetti({ particleCount: 30, spread: 40 });
                }}
              >
                <PartyPopper className="w-3 h-3" />
                {settings.footerCTAText}
              </Button>
            )}

            {/* Decorative elements */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FriendlyWebsitesWidget;
