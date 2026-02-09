import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FriendlyWebsite, WidgetSettings, pulseColors } from "./types";

interface WebsiteMiniBarProps {
  websites: FriendlyWebsite[];
  settings: WidgetSettings;
  onWebsiteClick: (website: FriendlyWebsite) => void;
  onExpand: () => void;
}

const WebsiteMiniBar = ({ websites, settings, onWebsiteClick, onExpand }: WebsiteMiniBarProps) => {
  const displayWebsites = websites.slice(0, 5); // Show max 5 icons in mini bar

  const positionClasses = settings.miniBarPosition === 'top'
    ? 'top-4'
    : 'bottom-4';

  const handleClick = (website: FriendlyWebsite) => {
    onWebsiteClick(website);
    window.open(website.url, website.open_in_new_tab ? '_blank' : '_self');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${positionClasses} ${settings.position === 'right' ? 'right-4' : 'left-4'} z-40`}
    >
      <div className="flex items-center gap-1 bg-background/90 backdrop-blur-xl border border-border rounded-full px-2 py-1 shadow-lg">
        {displayWebsites.map((website, index) => (
          <Tooltip key={website.id}>
            <TooltipTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleClick(website)}
                className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all relative"
              >
                {website.icon_url ? (
                  <img 
                    src={website.icon_url} 
                    alt={website.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-xs">
                      {website.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {website.is_featured && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${pulseColors[settings.colorScheme]} animate-pulse`} />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side={settings.miniBarPosition === 'top' ? 'bottom' : 'top'}>
              <p className="font-medium">{website.name}</p>
              {website.tagline && (
                <p className="text-xs text-muted-foreground">{website.tagline}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Expand button */}
        {websites.length > 5 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExpand}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <span className="text-xs font-medium text-primary">+{websites.length - 5}</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View all {websites.length} partner sites</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
};

export default WebsiteMiniBar;
