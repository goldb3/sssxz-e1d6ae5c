import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendlyWebsite, WidgetSettings } from "./types";
import WebsiteCard from "./WebsiteCard";

interface WebsiteCarouselProps {
  websites: FriendlyWebsite[];
  settings: WidgetSettings;
  onWebsiteClick: (website: FriendlyWebsite) => void;
}

const WebsiteCarousel = ({ websites, settings, onWebsiteClick }: WebsiteCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % websites.length);
  }, [websites.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + websites.length) % websites.length);
  }, [websites.length]);

  // Auto-play logic
  useEffect(() => {
    if (!settings.carouselAutoPlay || isPaused || websites.length <= 1) return;

    const interval = setInterval(goToNext, settings.carouselInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.carouselAutoPlay, settings.carouselInterval, isPaused, goToNext, websites.length]);

  if (websites.length === 0) return null;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <WebsiteCard
            website={websites[currentIndex]}
            settings={settings}
            index={0}
            onWebsiteClick={onWebsiteClick}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      {websites.length > 1 && (
        <>
          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {websites.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <Play className="w-3 h-3" />
              ) : (
                <Pause className="w-3 h-3" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={goToNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteCarousel;
