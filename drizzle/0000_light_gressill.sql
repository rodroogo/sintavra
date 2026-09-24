CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`hints` integer DEFAULT 0 NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `attempt_owner_time` ON `attempts` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`drafts` text DEFAULT '{}' NOT NULL,
	`projects` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`questions` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL,
	`submitted_at` integer,
	`hints` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quiz_owner_time` ON `quizzes` (`user_id`,`created_at`);