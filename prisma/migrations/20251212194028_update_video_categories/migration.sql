/*
  Warnings:

  - The values [tutorial,review,stream] on the enum `VideoCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoCategory_new" AS ENUM ('gameplay', 'funny_moments');
ALTER TABLE "videos" ALTER COLUMN "category" TYPE "VideoCategory_new" USING ("category"::text::"VideoCategory_new");
ALTER TYPE "VideoCategory" RENAME TO "VideoCategory_old";
ALTER TYPE "VideoCategory_new" RENAME TO "VideoCategory";
DROP TYPE "public"."VideoCategory_old";
COMMIT;
