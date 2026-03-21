-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "submitter_email" TEXT;
