CREATE TABLE "chatBotMetadata" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" text NOT NULL,
	"color" text DEFAULT '#4f39f6',
	"welcome_message" text DEFAULT 'Hi there, How can I help you today?',
	"mode" text DEFAULT 'text' NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_ip" text,
	"name" text,
	"chatbot_id" text NOT NULL,
	"channel" text DEFAULT 'text' NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunk" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text NOT NULL,
	"user_email" text NOT NULL,
	"chunk_index" text NOT NULL,
	"chunk_type" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"meta_data" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metadata" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" text NOT NULL,
	"business_name" text NOT NULL,
	"website_url" text NOT NULL,
	"external_links" text,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"source_ids" text[] NOT NULL,
	"tone" text NOT NULL,
	"allowed_topics" text,
	"blocked_topics" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" text NOT NULL,
	"name" text NOT NULL,
	"organization_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"image" text,
	"created_at" text DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"allowed_domains" text[],
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "knowledge_chunk" ADD CONSTRAINT "knowledge_chunk_source_id_knowledge_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_source"("id") ON DELETE cascade ON UPDATE no action;