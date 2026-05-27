-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'News';

-- AlterTable
ALTER TABLE "section_page_settings" ADD COLUMN     "list_layout" TEXT NOT NULL DEFAULT 'list';
