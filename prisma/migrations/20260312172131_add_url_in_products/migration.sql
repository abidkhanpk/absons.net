-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "link_url" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "link_url" TEXT;

-- AlterTable
ALTER TABLE "training_courses" ADD COLUMN     "link_url" TEXT;
