import { motion } from "framer-motion";
import { Star, CheckCircle, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FriendlyWebsite, WidgetSettings } from "./types";

interface WebsiteGridProps {
  websites: FriendlyWebsite[];
  settings: WidgetSettings;
  onWebsiteClick: (website: FriendlyWebsite) => void;
}

const WebsiteGrid = ({ websites, settings, onWebsiteClick }: WebsiteGridProps) => {
  const handleClick = (website: FriendlyWebsite) => {
    onWebsiteClick(website);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {websites.map((website, index) => (
        <Tooltip key={website.id}>
          <TooltipTrigger asChild>
            <motion.a
              href={website.url}
              target={website.open_in_new_tab ? '_blank' : '_self'}
              rel={website.open_in_new_tab ? 'noopener noreferrer' : undefined}
              onClick={() => handleClick(website)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all flex flex-col items-center text-center gap-1 group ${
                website.is_featured ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              {/* Icon */}
              <div className="relative">
                {website.icon_url ? (
                  <img 
                    src={website.icon_url} 
                    alt={website.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {website.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {settings.showVerifiedBadge && website.is_verified && (
                  <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 fill-background" />
                )}
              </div>

              {/* Name */}
              <span className="text-[10px] font-medium text-foreground truncate w-full group-hover:text-primary transition-colors">
                {website.name}
              </span>

              {/* Star rating */}
              {settings.showStarRatings && website.star_rating && website.star_rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-[9px] text-muted-foreground">{website.star_rating}</span>
                </div>
              )}

              {/* Featured/Custom badge */}
              {website.is_featured && (
                <Badge className="absolute -top-1 -right-1 text-[8px] px-1 py-0 bg-primary">
                  ★
                </Badge>
              )}

              {/* Hover external link icon */}
              <ExternalLink className="absolute top-1 right-1 w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{website.name}</p>
              {website.tagline && <p className="text-xs italic">"{website.tagline}"</p>}
              {website.description && <p className="text-xs text-muted-foreground max-w-48">{website.description}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default WebsiteGrid;
