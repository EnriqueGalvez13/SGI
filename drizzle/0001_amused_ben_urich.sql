CREATE TABLE `editor_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_state` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `reviews` ADD `public_email` text DEFAULT '' NOT NULL;