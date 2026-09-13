CREATE TABLE `cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`start_date` text NOT NULL,
	`length_days` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `cycles_start_date_idx` ON `cycles` (`start_date`);--> statement-breakpoint
CREATE TABLE `mood_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`mood_cipher` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `mood_logs_day_idx` ON `mood_logs` (`day`);--> statement-breakpoint
CREATE TABLE `period_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`cycle_id` text,
	`day` text NOT NULL,
	`flow_cipher` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `period_logs_day_idx` ON `period_logs` (`day`);--> statement-breakpoint
CREATE INDEX `period_logs_cycle_id_idx` ON `period_logs` (`cycle_id`);--> statement-breakpoint
CREATE TABLE `symptom_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`symptom_cipher` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `symptom_logs_day_idx` ON `symptom_logs` (`day`);