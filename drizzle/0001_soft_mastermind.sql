CREATE TABLE `backups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `lesson_progress` text DEFAULT '{}' NOT NULL;