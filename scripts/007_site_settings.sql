-- Create site settings table for global configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'site',
  site_title TEXT NOT NULL DEFAULT 'ABSON Solutions',
  logo_url TEXT,
  contact_email TEXT DEFAULT 'info@absonsolutions.com',
  contact_phone TEXT DEFAULT '+92 XXX XXXXXXX',
  contact_address TEXT DEFAULT 'Pakistan',
  nav_alignment TEXT NOT NULL DEFAULT 'left', -- left | center | right
  nav_login_text TEXT NOT NULL DEFAULT 'Login',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure a single settings row exists
INSERT INTO public.site_settings (id)
VALUES ('site')
ON CONFLICT (id) DO NOTHING;

-- Helper to check super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
      AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Super admins can update site settings" ON public.site_settings;
CREATE POLICY "Super admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_super_admin(auth.uid()));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();
