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
CREATE TABLE "messages" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
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
CREATE TABLE "widgets" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"allowed_domains" text[],
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT now()
);
