/*
  Warnings:

  - You are about to drop the column `hero_image_fit` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "blog_posts" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "contact_inquiries" ALTER COLUMN "created_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "updated_at" SET DEFAULT now();

-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "hero_image_fit",
ADD COLUMN     "hero_height" INTEGER NOT NULL DEFAULT 560,
ADD COLUMN     "show_services" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_testimonials" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_training" BOOLEAN NOT NULL DEFAULT true,
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
