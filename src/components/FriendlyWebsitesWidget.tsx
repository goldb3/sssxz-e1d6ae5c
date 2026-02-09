import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FriendlyWebsite {
  id: string;
  name: string;
  url: string;
  icon_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
}

interface WidgetSettings {
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
}

const defaultSettings: WidgetSettings = {
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
};

const FriendlyWebsitesWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const hasInitialized = useRef(false);
  const userInteracted = useRef(false);

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
    staleTime: 1000 * 30, // 30 seconds - will refetch when invalidated
    refetchOnWindowFocus: true,
  });

  // Fetch websites with React Query
  const { data: websites = [], isLoading } = useQuery({
    queryKey: ['friendly_websites', 'active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('friendly_websites')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  const colorClasses = {
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

  const buttonColorClasses = {
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

  const pulseColors = {
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

            {/* Website list */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {websites.map((website, index) => (
                <motion.a
                  key={website.id}
                  href={website.url}
                  target={website.open_in_new_tab ? '_blank' : '_self'}
                  rel={website.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all duration-200 group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  {website.icon_url ? (
                    <img 
                      src={website.icon_url} 
                      alt={website.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {website.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {website.name}
                    </p>
                    {settings.showDescriptions && website.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {website.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FriendlyWebsitesWidget;
