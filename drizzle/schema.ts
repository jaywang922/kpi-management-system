import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ==========================================
 * 核心使用者與組織架構表格
 * ==========================================
 */

/**
 * 使用者表格 - 擴展自原有的users表格
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["employee", "supervisor", "chairman", "admin"]).default("employee").notNull(),
  departmentId: int("departmentId"), // 所屬部門
  positionId: int("positionId"), // 職位
  isActive: boolean("isActive").default(true).notNull(), // 是否啟用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * 部門表格 - 支援動態新增/裁撤
 */
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 部門名稱
  code: varchar("code", { length: 20 }).notNull().unique(), // 部門代碼 (SN, SM, SS, SK, SX, SE, M, PR, F, A, O, B, D, P)
  description: text("description"), // 部門描述
  isActive: boolean("isActive").default(true).notNull(), // 是否啟用
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 職位表格
 */
export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  departmentId: int("departmentId").notNull(), // 所屬部門
  title: varchar("title", { length: 100 }).notNull(), // 職位名稱
  level: mysqlEnum("level", ["staff", "supervisor", "manager", "director"]).default("staff").notNull(),
  description: text("description"), // 職位描述
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 職掌表格 - 每個職位的具體職責
 */
export const jobDuties = mysqlTable("job_duties", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(), // 所屬職位
  code: varchar("code", { length: 20 }).notNull(), // 職掌編碼 (B1, B2, SN1, SM1等)
  title: varchar("title", { length: 200 }).notNull(), // 職掌名稱
  description: text("description"), // 詳細描述
  category: varchar("category", { length: 50 }), // 職掌類別
  sortOrder: int("sortOrder").default(0), // 排序
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ==========================================
 * 工作日誌系統表格
 * ==========================================
 */

/**
 * 工作日誌表格 - 每天的工作記錄
 */
export const workLogs = mysqlTable("work_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 員工ID
  date: timestamp("date").notNull(), // 工作日期
  status: mysqlEnum("status", ["draft", "submitted", "reviewed"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"), // 提交時間
  reviewedAt: timestamp("reviewedAt"), // 複評時間
  reviewedBy: int("reviewedBy"), // 複評主管ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 工作項目表格 - 工作日誌中的具體工作項目
 */
export const workItems = mysqlTable("work_items", {
  id: int("id").autoincrement().primaryKey(),
  workLogId: int("workLogId").notNull(), // 所屬工作日誌
  workCode: varchar("workCode", { length: 20 }), // 工作編號 (選填)
  workName: varchar("workName", { length: 200 }).notNull(), // 工作名稱
  plannedContent: text("plannedContent"), // 預擬工作內容 (選填)
  executionResult: text("executionResult").notNull(), // 執行狀況/成果 (必填)
  relatedDuties: json("relatedDuties").$type<number[]>().notNull(), // 關聯職掌ID陣列
  plannedCompletionDate: timestamp("plannedCompletionDate"), // 預計完成時間
  actualCompletionDate: timestamp("actualCompletionDate"), // 實際完成時間
  attachments: json("attachments").$type<string[]>(), // 附件URL陣列
  
  // 自評
  selfEvaluation: mysqlEnum("selfEvaluation", ["fully_aligned", "partially_aligned", "not_aligned"]), // 是否符合職掌
  selfEvaluationNote: text("selfEvaluationNote"), // 自評說明
  
  // 主管複評
  supervisorEvaluation: mysqlEnum("supervisorEvaluation", ["fully_aligned", "partially_aligned", "not_aligned"]), // 主管複評
  supervisorEvaluationNote: text("supervisorEvaluationNote"), // 複評說明 (必填)
  
  sortOrder: int("sortOrder").default(0), // 排序
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ==========================================
 * 任務管理系統表格
 * ==========================================
 */

/**
 * 任務表格
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(), // 任務名稱
  description: text("description").notNull(), // 任務內容
  assignedBy: int("assignedBy").notNull(), // 交辦主管ID
  assignedTo: int("assignedTo").notNull(), // 指派員工ID
  relatedDuties: json("relatedDuties").$type<number[]>().notNull(), // 關聯職掌ID陣列 (可多選)
  plannedCompletionDate: timestamp("plannedCompletionDate").notNull(), // 預計完成時間 (必填)
  completionRequirements: text("completionRequirements").notNull(), // 必須完成的條件 (必填)
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(), // 優先級
  status: mysqlEnum("status", ["assigned", "in_progress", "completed", "closed"]).default("assigned").notNull(),
  
  // 結案資訊
  completionReport: text("completionReport"), // 結案說明
  completionAttachments: json("completionAttachments").$type<string[]>(), // 結案附件
  selfEvaluationScore: int("selfEvaluationScore"), // 自評分數 (1-5)
  selfEvaluationNote: text("selfEvaluationNote"), // 自評說明
  supervisorEvaluationScore: int("supervisorEvaluationScore"), // 複評分數 (1-5)
  supervisorEvaluationNote: text("supervisorEvaluationNote"), // 複評說明 (必填)
  
  closedAt: timestamp("closedAt"), // 結案時間
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * 任務進度回報表格
 */
export const taskProgress = mysqlTable("task_progress", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(), // 所屬任務
  userId: int("userId").notNull(), // 回報員工ID
  date: timestamp("date").notNull(), // 回報日期
  progressPercentage: int("progressPercentage").notNull(), // 進度百分比 (0-100)
  progressNote: text("progressNote").notNull(), // 進度說明
  adjustedCompletionDate: timestamp("adjustedCompletionDate"), // 調整後的預計完成時間
  delayReason: text("delayReason"), // 延期原因
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ==========================================
 * KPI追蹤系統表格
 * ==========================================
 */

/**
 * KPI定義表格
 */
export const kpiDefinitions = mysqlTable("kpi_definitions", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(), // 所屬職位
  category: varchar("category", { length: 50 }).notNull(), // KPI類別 (業績、效率、品質、管理)
  name: varchar("name", { length: 200 }).notNull(), // KPI名稱
  description: text("description"), // 描述
  unit: varchar("unit", { length: 50 }), // 單位
  calculationMethod: text("calculationMethod"), // 計算方式
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // 權重 (0-100)
  targetValue: decimal("targetValue", { precision: 15, scale: 2 }), // 目標值
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * KPI實際值表格
 */
export const kpiActuals = mysqlTable("kpi_actuals", {
  id: int("id").autoincrement().primaryKey(),
  kpiDefinitionId: int("kpiDefinitionId").notNull(), // KPI定義ID
  userId: int("userId").notNull(), // 員工ID
  period: varchar("period", { length: 20 }).notNull(), // 期間 (YYYY-MM)
  actualValue: decimal("actualValue", { precision: 15, scale: 2 }).notNull(), // 實際值
  employeeNote: text("employeeNote"), // 員工說明
  
  // 主管審核
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"), // 審核主管ID
  reviewedAt: timestamp("reviewedAt"), // 審核時間
  supervisorNote: text("supervisorNote"), // 主管說明
  
  // 自動計算
  achievementRate: decimal("achievementRate", { precision: 5, scale: 2 }), // 達成率 (%)
  score: decimal("score", { precision: 5, scale: 2 }), // 得分 (達成率 × 權重)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ==========================================
 * 績效評估系統表格
 * ==========================================
 */

/**
 * 績效評估表格
 */
export const performanceEvaluations = mysqlTable("performance_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 員工ID
  evaluatedBy: int("evaluatedBy").notNull(), // 評估主管ID
  period: varchar("period", { length: 20 }).notNull(), // 評估期間 (YYYY-MM)
  
  // 自動計算的分數
  autoCalculatedScore: decimal("autoCalculatedScore", { precision: 5, scale: 2 }), // 系統自動計算的分數
  
  // 主管調整
  finalScore: decimal("finalScore", { precision: 5, scale: 2 }).notNull(), // 最終分數
  adjustmentReason: text("adjustmentReason"), // 調整原因 (如果有調整則必填)
  
  // 評估內容
  strengths: text("strengths"), // 優勢
  improvements: text("improvements"), // 待改進項目
  comments: text("comments"), // 綜合評語
  
  // 面談記錄
  interviewDate: timestamp("interviewDate"), // 面談日期
  interviewNotes: text("interviewNotes"), // 面談記錄
  
  status: mysqlEnum("status", ["draft", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ==========================================
 * 通知提醒系統表格
 * ==========================================
 */

/**
 * 通知表格
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 接收通知的使用者ID
  type: mysqlEnum("type", ["kpi_update", "performance_interview", "unreviewed_log", "overdue_task", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(), // 通知標題
  content: text("content").notNull(), // 通知內容
  relatedId: int("relatedId"), // 相關記錄ID (任務ID、工作日誌ID等)
  isRead: boolean("isRead").default(false).notNull(), // 是否已讀
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * ==========================================
 * 系統設定表格
 * ==========================================
 */

/**
 * 績效週期設定表格
 */
export const performanceCycles = mysqlTable("performance_cycles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // 週期名稱
  startDate: timestamp("startDate").notNull(), // 開始日期
  endDate: timestamp("endDate").notNull(), // 結束日期
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ==========================================
 * 類型定義
 * ==========================================
 */

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;

export type JobDuty = typeof jobDuties.$inferSelect;
export type InsertJobDuty = typeof jobDuties.$inferInsert;

export type WorkLog = typeof workLogs.$inferSelect;
export type InsertWorkLog = typeof workLogs.$inferInsert;

export type WorkItem = typeof workItems.$inferSelect;
export type InsertWorkItem = typeof workItems.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type TaskProgress = typeof taskProgress.$inferSelect;
export type InsertTaskProgress = typeof taskProgress.$inferInsert;

export type KpiDefinition = typeof kpiDefinitions.$inferSelect;
export type InsertKpiDefinition = typeof kpiDefinitions.$inferInsert;

export type KpiActual = typeof kpiActuals.$inferSelect;
export type InsertKpiActual = typeof kpiActuals.$inferInsert;

export type PerformanceEvaluation = typeof performanceEvaluations.$inferSelect;
export type InsertPerformanceEvaluation = typeof performanceEvaluations.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type PerformanceCycle = typeof performanceCycles.$inferSelect;
export type InsertPerformanceCycle = typeof performanceCycles.$inferInsert;
