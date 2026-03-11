ALTER TABLE "prescriptions" ALTER COLUMN "prescribed_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "prescribed_by" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "prescribed_by" SET NOT NULL;