-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';

-- AlterTable
ALTER TABLE "training_courses" ADD COLUMN     "image_fit_mode" TEXT DEFAULT 'cover';
