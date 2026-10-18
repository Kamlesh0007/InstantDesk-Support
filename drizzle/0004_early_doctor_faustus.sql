ALTER TABLE "knowledge_source" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "knowledge_source" DROP COLUMN "blob_url";--> statement-breakpoint
ALTER TABLE "knowledge_source" DROP COLUMN "blob_pathname";--> statement-breakpoint
ALTER TABLE "knowledge_source" DROP COLUMN "extraction_status";--> statement-breakpoint
ALTER TABLE "knowledge_source" DROP COLUMN "extraction_error";--> statement-breakpoint
ALTER TABLE "knowledge_source" DROP COLUMN "chunk_count";