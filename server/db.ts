import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  departments,
  positions,
  jobDuties,
  workLogs,
  workItems,
  tasks,
  taskProgress,
  kpiDefinitions,
  kpiActuals,
  performanceEvaluations,
  notifications,
  performanceCycles,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * ==========================================
 * 使用者相關查詢
 * ==========================================
 */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'chairman';
      updateSet.role = 'chairman';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(
    and(
      eq(users.departmentId, departmentId),
      eq(users.isActive, true)
    )
  );
}

/**
 * ==========================================
 * 組織架構相關查詢
 * ==========================================
 */

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(departments).where(eq(departments.isActive, true));
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPositionsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(positions).where(
    and(
      eq(positions.departmentId, departmentId),
      eq(positions.isActive, true)
    )
  );
}

export async function getJobDutiesByPosition(positionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(jobDuties).where(
    and(
      eq(jobDuties.positionId, positionId),
      eq(jobDuties.isActive, true)
    )
  ).orderBy(jobDuties.sortOrder);
}

export async function getAllPositions() {
  const db = await getDb();
  if (!db) return [];

  // 獲取所有職位並關聯部門資訊
  return await db.select({
    id: positions.id,
    departmentId: positions.departmentId,
    title: positions.title,
    level: positions.level,
    description: positions.description,
    isActive: positions.isActive,
    createdAt: positions.createdAt,
    updatedAt: positions.updatedAt,
    department: {
      id: departments.id,
      name: departments.name,
      code: departments.code,
    },
  })
  .from(positions)
  .leftJoin(departments, eq(positions.departmentId, departments.id))
  .orderBy(positions.createdAt);
}

export async function getAllJobDuties() {
  const db = await getDb();
  if (!db) return [];

  // 獲取所有職控並關聯職位和部門資訊
  const results = await db.select({
    id: jobDuties.id,
    positionId: jobDuties.positionId,
    code: jobDuties.code,
    title: jobDuties.title,
    description: jobDuties.description,
    category: jobDuties.category,
    sortOrder: jobDuties.sortOrder,
    isActive: jobDuties.isActive,
    createdAt: jobDuties.createdAt,
    updatedAt: jobDuties.updatedAt,
    positionTitle: positions.title,
    positionId2: positions.id,
    departmentId: departments.id,
    departmentName: departments.name,
    departmentCode: departments.code,
  })
  .from(jobDuties)
  .leftJoin(positions, eq(jobDuties.positionId, positions.id))
  .leftJoin(departments, eq(positions.departmentId, departments.id))
  .orderBy(jobDuties.sortOrder);

  // 轉換為嵌套結構
  return results.map(r => ({
    id: r.id,
    positionId: r.positionId,
    code: r.code,
    title: r.title,
    description: r.description,
    category: r.category,
    sortOrder: r.sortOrder,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    position: r.positionId2 ? {
      id: r.positionId2,
      title: r.positionTitle || '',
      department: r.departmentId ? {
        id: r.departmentId,
        name: r.departmentName || '',
        code: r.departmentCode || '',
      } : null,
    } : null,
  }));
}

// 部門 CRUD
export async function createDepartment(data: { name: string; code: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(departments).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateDepartment(id: number, data: { name: string; code: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(departments).set(data).where(eq(departments.id, id));
  return { id, ...data };
}

export async function toggleDepartmentActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(departments).set({ isActive }).where(eq(departments.id, id));
  return { id, isActive };
}

// 職位 CRUD
export async function createPosition(data: {
  departmentId: number;
  title: string;
  level: "staff" | "supervisor" | "manager" | "director";
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(positions).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updatePosition(
  id: number,
  data: {
    departmentId: number;
    title: string;
    level: "staff" | "supervisor" | "manager" | "director";
    description?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(positions).set(data).where(eq(positions.id, id));
  return { id, ...data };
}

export async function togglePositionActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(positions).set({ isActive }).where(eq(positions.id, id));
  return { id, isActive };
}

// 職控 CRUD
export async function createJobDuty(data: {
  positionId: number;
  code: string;
  title: string;
  description?: string;
  category?: string;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(jobDuties).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateJobDuty(
  id: number,
  data: {
    positionId: number;
    code: string;
    title: string;
    description?: string;
    category?: string;
    sortOrder?: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(jobDuties).set(data).where(eq(jobDuties.id, id));
  return { id, ...data };
}

export async function toggleJobDutyActive(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(jobDuties).set({ isActive }).where(eq(jobDuties.id, id));
  return { id, isActive };
}

/**
 * ==========================================
 * 工作日誌相關查詢
 * ==========================================
 */

export async function getWorkLogsByUser(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(workLogs.userId, userId)];
  
  if (startDate) {
    conditions.push(sql`${workLogs.date} >= ${startDate}`);
  }
  if (endDate) {
    conditions.push(sql`${workLogs.date} <= ${endDate}`);
  }

  return await db.select().from(workLogs).where(and(...conditions)).orderBy(desc(workLogs.date));
}

export async function getWorkItemsByLogId(workLogId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(workItems).where(eq(workItems.workLogId, workLogId)).orderBy(workItems.sortOrder);
}

export async function getUnreviewedWorkLogs(supervisorId: number) {
  const db = await getDb();
  if (!db) return [];

  // 獲取主管管理的部門下的所有員工
  const supervisor = await getUserById(supervisorId);
  if (!supervisor || !supervisor.departmentId) return [];

  const departmentUsers = await getUsersByDepartment(supervisor.departmentId);
  const userIds = departmentUsers.map(u => u.id);

  return await db.select().from(workLogs).where(
    and(
      sql`${workLogs.userId} IN (${userIds})`,
      eq(workLogs.status, "submitted")
    )
  ).orderBy(desc(workLogs.date));
}

/**
 * ==========================================
 * 任務管理相關查詢
 * ==========================================
 */

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByAssigner(assignerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks).where(eq(tasks.assignedBy, assignerId)).orderBy(desc(tasks.createdAt));
}

export async function getTaskProgressByTaskId(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(taskProgress).where(eq(taskProgress.taskId, taskId)).orderBy(desc(taskProgress.date));
}

export async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db.select().from(tasks).where(
    and(
      sql`${tasks.plannedCompletionDate} < ${now}`,
      sql`${tasks.status} IN ('assigned', 'in_progress')`
    )
  );
}

/**
 * ==========================================
 * KPI相關查詢
 * ==========================================
 */

export async function getKpiDefinitionsByPosition(positionId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(kpiDefinitions).where(
    and(
      eq(kpiDefinitions.positionId, positionId),
      eq(kpiDefinitions.isActive, true)
    )
  );
}

export async function getKpiActualsByUser(userId: number, period: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(kpiActuals).where(
    and(
      eq(kpiActuals.userId, userId),
      eq(kpiActuals.period, period)
    )
  );
}

export async function getPendingKpiActuals(supervisorId: number) {
  const db = await getDb();
  if (!db) return [];

  // 獲取主管管理的部門下的所有員工
  const supervisor = await getUserById(supervisorId);
  if (!supervisor || !supervisor.departmentId) return [];

  const departmentUsers = await getUsersByDepartment(supervisor.departmentId);
  const userIds = departmentUsers.map(u => u.id);

  return await db.select().from(kpiActuals).where(
    and(
      sql`${kpiActuals.userId} IN (${userIds})`,
      eq(kpiActuals.status, "pending")
    )
  );
}

/**
 * ==========================================
 * 績效評估相關查詢
 * ==========================================
 */

export async function getPerformanceEvaluationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(performanceEvaluations).where(
    eq(performanceEvaluations.userId, userId)
  ).orderBy(desc(performanceEvaluations.period));
}

/**
 * ==========================================
 * 通知相關查詢
 * ==========================================
 */

export async function getNotificationsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications).where(
    eq(notifications.userId, userId)
  ).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(
    and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    )
  );

  return result[0]?.count || 0;
}

/**
 * ==========================================
 * 績效週期相關查詢
 * ==========================================
 */

export async function getActivePerformanceCycle() {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(performanceCycles).where(
    eq(performanceCycles.isActive, true)
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
