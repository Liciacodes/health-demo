CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"patient_id" integer NOT NULL,
	"provider" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"patient_id" integer NOT NULL,
	"body_part" text NOT NULL,
	"note" text,
	"severity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;