CREATE TABLE "knowledge_source" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"source_url" text,
	"blob_url" text,
	"blob_pathname" text,
	"extraction_status" text DEFAULT 'pending' NOT NULL,
	"extraction_error" text,
	"chunk_count" text,
	"meta_data" text,
	"last_updated" text DEFAULT now(),
	"created_at" text DEFAULT now()
);
