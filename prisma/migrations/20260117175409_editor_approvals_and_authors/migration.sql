-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approved_at" TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "contact_inquiries" ALTER COLUMN "created_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "approved_at" TIMESTAMPTZ(6),
ADD COLUMN     "author_id" UUID,
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "editor_approval_required" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "testimonials" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "training_courses" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now();

-- Backfill approvals for existing published content
UPDATE "blog_posts" SET "approved" = TRUE, "approved_at" = NOW() WHERE "published" = TRUE AND "approved" = FALSE;
UPDATE "pages" SET "approved" = TRUE, "approved_at" = NOW() WHERE "published" = TRUE AND "approved" = FALSE;

-- RLS: allow editors to manage their own posts/pages, admins keep full access
CREATE OR REPLACE FUNCTION public.is_editor(user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND role = 'editor'
  );
$$ LANGUAGE sql STABLE;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Blog_select" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_update" ON public.blog_posts;
DROP POLICY IF EXISTS "Blog_delete" ON public.blog_posts;

CREATE POLICY "Blog_select"
  ON public.blog_posts FOR SELECT
  USING (
    (current_user_id() IS NULL AND published = TRUE)
    OR is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Blog_insert"
  ON public.blog_posts FOR INSERT
  WITH CHECK (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Blog_update"
  ON public.blog_posts FOR UPDATE
  USING (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Blog_delete"
  ON public.blog_posts FOR DELETE
  USING (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

DROP POLICY IF EXISTS "Pages_select" ON public.pages;
DROP POLICY IF EXISTS "Pages_insert" ON public.pages;
DROP POLICY IF EXISTS "Pages_update" ON public.pages;
DROP POLICY IF EXISTS "Pages_delete" ON public.pages;

CREATE POLICY "Pages_select"
  ON public.pages FOR SELECT
  USING (
    (current_user_id() IS NULL AND published = TRUE)
    OR is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Pages_insert"
  ON public.pages FOR INSERT
  WITH CHECK (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Pages_update"
  ON public.pages FOR UPDATE
  USING (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );

CREATE POLICY "Pages_delete"
  ON public.pages FOR DELETE
  USING (
    is_admin(current_user_id())
    OR (is_editor(current_user_id()) AND author_id = current_user_id())
  );
