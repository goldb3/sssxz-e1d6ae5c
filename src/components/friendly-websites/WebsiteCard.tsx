import { motion } from "framer-motion";
import { ExternalLink, Star, CheckCircle, TrendingUp, Sparkles, ArrowRight, MousePointer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FriendlyWebsite, WidgetSettings } from "./types";

interface WebsiteCardProps {
  website: FriendlyWebsite;
  settings: WidgetSettings;
  index: number;
  onWebsiteClick: (website: FriendlyWebsite) => void;
}

const WebsiteCard = ({ website, settings, index, onWebsiteClick }: WebsiteCardProps) => {
  // Check if website is new (added in last 7 days)
  const isNew = website.created_at && 
    new Date(website.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Check if website is popular (more than 50 clicks)
  const isPopular = website.click_count >= 50;
  
  // Check if featured
  const isFeatured = website.is_featured;

  const handleClick = (e: React.MouseEvent) => {
    onWebsiteClick(website);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : star - 0.5 <= rating
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  const getBadgeColor = (color: string | null) => {
    const colors: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground',
      success: 'bg-emerald-500 text-white',
      warning: 'bg-amber-500 text-white',
      danger: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      purple: 'bg-purple-500 text-white',
    };
    return colors[color || 'primary'] || colors.primary;
  };

  const formatClickCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const cardContent = (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all duration-200 group cursor-pointer ${
        isFeatured && settings.featuredStyle === 'glow' ? 'animate-featured-glow ring-2 ring-primary/20' : ''
      } ${isFeatured && settings.featuredStyle === 'animated' ? 'animate-pulse-subtle' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ x: 4 }}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="relative">
        {website.icon_url ? (
          <img 
            src={website.icon_url} 
            alt={website.name}
            className={`rounded-lg object-cover ${isFeatured ? 'w-10 h-10' : 'w-8 h-8'}`}
          />
        ) : (
          <div className={`rounded-lg bg-primary/20 flex items-center justify-center ${isFeatured ? 'w-10 h-10' : 'w-8 h-8'}`}>
            <span className="text-primary font-semibold text-sm">
              {website.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {settings.showVerifiedBadge && website.is_verified && (
          <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 fill-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium text-foreground truncate group-hover:text-primary transition-colors ${isFeatured ? 'text-sm' : 'text-sm'}`}>
            {website.name}
          </p>
          
          {/* Badges */}
          {settings.showBadges && (
            <div className="flex items-center gap-1 flex-wrap">
              {isFeatured && settings.featuredStyle === 'badge' && (
                <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-primary to-accent text-white">
                  {settings.featuredLabel}
                </Badge>
              )}
              {website.badge_text && (
                <Badge className={`text-[10px] px-1.5 py-0 ${getBadgeColor(website.badge_color)}`}>
                  {website.badge_text}
                </Badge>
              )}
              {isNew && (
                <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500 text-white animate-badge-shine">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  New
                </Badge>
              )}
              {isPopular && !isFeatured && (
                <Badge className="text-[10px] px-1.5 py-0 bg-orange-500 text-white">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  Popular
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Tagline or description */}
        {(website.tagline || (settings.showDescriptions && website.description)) && (
          <p className="text-xs text-muted-foreground truncate">
            {website.tagline || website.description}
          </p>
        )}

        {/* Star rating and click count row */}
        <div className="flex items-center gap-3 mt-1">
          {settings.showStarRatings && website.star_rating && website.star_rating > 0 && (
            renderStars(website.star_rating)
          )}
          {settings.showClickCounts && website.click_count > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MousePointer className="w-2.5 h-2.5" />
              {formatClickCount(website.click_count)} clicks
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      {settings.ctaStyle === 'icon' && (
        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {settings.ctaStyle === 'arrow' && (
        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
      )}
      {settings.ctaStyle === 'button' && (
        <Button 
          size="sm" 
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
        >
          {settings.ctaText}
        </Button>
      )}
    </motion.div>
  );

  // Wrap with hover preview if enabled
  if (settings.showHoverPreview) {
    return (
      <HoverCard openDelay={300}>
        <HoverCardTrigger asChild>
          <a
            href={website.url}
            target={website.open_in_new_tab ? '_blank' : '_self'}
            rel={website.open_in_new_tab ? 'noopener noreferrer' : undefined}
            onClick={handleClick}
          >
            {cardContent}
          </a>
        </HoverCardTrigger>
        <HoverCardContent 
          side="left" 
          className="w-72 p-4"
          sideOffset={10}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {website.icon_url ? (
                <img 
                  src={website.icon_url} 
                  alt={website.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {website.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-1">
                  {website.name}
                  {website.is_verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </h4>
                {website.star_rating && website.star_rating > 0 && (
                  renderStars(website.star_rating)
                )}
              </div>
            </div>
            {website.tagline && (
              <p className="text-sm font-medium text-primary italic">"{website.tagline}"</p>
            )}
            {website.description && (
              <p className="text-sm text-muted-foreground">{website.description}</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              {website.click_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  {formatClickCount(website.click_count)} visitors
                </span>
              )}
              <Button size="sm" className="gap-1">
                Visit Now
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <a
      href={website.url}
      target={website.open_in_new_tab ? '_blank' : '_self'}
      rel={website.open_in_new_tab ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
    >
      {cardContent}
    </a>
  );
};

export default WebsiteCard;
