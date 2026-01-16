CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(20) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `job_duties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`category` varchar(50),
	`sortOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_duties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpi_actuals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kpiDefinitionId` int NOT NULL,
	`userId` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`actualValue` decimal(15,2) NOT NULL,
	`employeeNote` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`supervisorNote` text,
	`achievementRate` decimal(5,2),
	`score` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpi_actuals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpi_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionId` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`unit` varchar(50),
	`calculationMethod` text,
	`weight` decimal(5,2) NOT NULL,
	`targetValue` decimal(15,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpi_definitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('kpi_update','performance_interview','unreviewed_log','overdue_task','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`relatedId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`evaluatedBy` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`autoCalculatedScore` decimal(5,2),
	`finalScore` decimal(5,2) NOT NULL,
	`adjustmentReason` text,
	`strengths` text,
	`improvements` text,
	`comments` text,
	`interviewDate` timestamp,
	`interviewNotes` text,
	`status` enum('draft','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`level` enum('staff','specialist','manager','director','vp') NOT NULL DEFAULT 'staff',
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`progressPercentage` int NOT NULL,
	`progressNote` text NOT NULL,
	`adjustedCompletionDate` timestamp,
	`delayReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`assignedBy` int NOT NULL,
	`assignedTo` int NOT NULL,
	`relatedDuties` json NOT NULL,
	`plannedCompletionDate` timestamp NOT NULL,
	`completionRequirements` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('assigned','in_progress','completed','closed') NOT NULL DEFAULT 'assigned',
	`completionReport` text,
	`completionAttachments` json,
	`selfEvaluationScore` int,
	`selfEvaluationNote` text,
	`supervisorEvaluationScore` int,
	`supervisorEvaluationNote` text,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workLogId` int NOT NULL,
	`workCode` varchar(20),
	`workName` varchar(200) NOT NULL,
	`plannedContent` text,
	`executionResult` text NOT NULL,
	`relatedDuties` json NOT NULL,
	`plannedCompletionDate` timestamp,
	`actualCompletionDate` timestamp,
	`attachments` json,
	`selfEvaluation` enum('fully_aligned','partially_aligned','not_aligned'),
	`selfEvaluationNote` text,
	`supervisorEvaluation` enum('fully_aligned','partially_aligned','not_aligned'),
	`supervisorEvaluationNote` text,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `work_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`status` enum('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`reviewedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `work_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('employee','supervisor','chairman','admin') NOT NULL DEFAULT 'employee';--> statement-breakpoint
ALTER TABLE `users` ADD `departmentId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `positionId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;