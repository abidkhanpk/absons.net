-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "seo_canonical_url" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keywords" TEXT,
ADD COLUMN     "seo_no_follow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_no_index" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_og_image" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "contact_inquiries" ALTER COLUMN "created_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "seo_canonical_url" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keywords" TEXT,
ADD COLUMN     "seo_no_follow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_no_index" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_og_image" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "allow_indexing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seo_default_canonical_base" TEXT,
ADD COLUMN     "seo_default_description" TEXT,
ADD COLUMN     "seo_default_keywords" TEXT,
ADD COLUMN     "seo_default_og_image" TEXT,
ADD COLUMN     "seo_default_title" TEXT,
ADD COLUMN     "seo_title_template" TEXT,
ADD COLUMN     "static_seo" JSONB,
ALTER COLUMN "site_title" SET DEFAULT 'Site',
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

-- AlterTable
ALTER TABLE "blog_posts" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();
