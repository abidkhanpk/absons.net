-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "rejected_at" TIMESTAMPTZ(6),
ADD COLUMN     "rejected_reason" TEXT,
ADD COLUMN     "rejection_notified_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "rejected_at" TIMESTAMPTZ(6),
ADD COLUMN     "rejected_reason" TEXT,
ADD COLUMN     "rejection_notified_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "resubmission_note" TEXT,
ADD COLUMN     "resubmitted_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "resubmission_note" TEXT,
ADD COLUMN     "resubmitted_at" TIMESTAMPTZ(6);
