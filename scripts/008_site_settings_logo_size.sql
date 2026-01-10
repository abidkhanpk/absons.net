-- Add logo sizing controls
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_width INTEGER DEFAULT 40 CHECK (logo_width > 0 AND logo_width <= 512),
  ADD COLUMN IF NOT EXISTS logo_height INTEGER DEFAULT 40 CHECK (logo_height > 0 AND logo_height <= 512);

-- Ensure defaults are set for existing row
UPDATE public.site_settings
SET logo_width = COALESCE(logo_width, 40),
    logo_height = COALESCE(logo_height, 40)
WHERE id = 'site';
