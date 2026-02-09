-- Add new columns to friendly_websites for enhanced widget features
ALTER TABLE public.friendly_websites 
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS badge_text TEXT,
ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS star_rating DECIMAL(2,1) CHECK (star_rating >= 0 AND star_rating <= 5),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Create function to increment click count
CREATE OR REPLACE FUNCTION public.increment_website_click(p_website_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.friendly_websites
  SET click_count = COALESCE(click_count, 0) + 1,
      last_clicked_at = NOW()
  WHERE id = p_website_id;
END;
$$;

-- Update RLS to allow anonymous users to call the click increment function
-- The function is SECURITY DEFINER so it runs with elevated privileges