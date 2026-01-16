import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * ==========================================
 * 認證與使用者路由
 * ==========================================
 */

const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

/**
 * ==========================================
 * 組織架構路由
 * ==========================================
 */

const organizationRouter = router({
  // 獲取所有部門
  getDepartments: protectedProcedure.query(async () => {
    return await db.getAllDepartments();
  }),

  // 獲取所有職位
  getPositions: protectedProcedure.query(async () => {
    return await db.getAllPositions();
  }),

  // 獲取部門下的職位
  getPositionsByDepartment: protectedProcedure
    .input(z.object({ departmentId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPositionsByDepartment(input.departmentId);
    }),

  // 獲取職位的職控
  getJobDutiesByPosition: protectedProcedure
    .input(z.object({ positionId: z.number() }))
    .query(async ({ input }) => {
      return await db.getJobDutiesByPosition(input.positionId);
    }),

  // 獲取所有職控
  getJobDuties: protectedProcedure.query(async () => {
    return await db.getAllJobDuties();
  }),

  // 部門管理 (CRUD)
  createDepartment: protectedProcedure
    .input(z.object({
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理部門' });
      }
      return await db.createDepartment(input);
    }),

  updateDepartment: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理部門' });
      }
      return await db.updateDepartment(input.id, input);
    }),

  toggleDepartmentActive: protectedProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理部門' });
      }
      return await db.toggleDepartmentActive(input.id, input.isActive);
    }),

  // 職位管理 (CRUD)
  createPosition: protectedProcedure
    .input(z.object({
      departmentId: z.number(),
      title: z.string(),
      level: z.enum(['staff', 'supervisor', 'manager', 'director']),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職位' });
      }
      return await db.createPosition(input);
    }),

  updatePosition: protectedProcedure
    .input(z.object({
      id: z.number(),
      departmentId: z.number(),
      title: z.string(),
      level: z.enum(['staff', 'supervisor', 'manager', 'director']),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職位' });
      }
      return await db.updatePosition(input.id, input);
    }),

  togglePositionActive: protectedProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職位' });
      }
      return await db.togglePositionActive(input.id, input.isActive);
    }),

  // 職控管理 (CRUD)
  createJobDuty: protectedProcedure
    .input(z.object({
      positionId: z.number(),
      code: z.string(),
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職控' });
      }
      return await db.createJobDuty(input);
    }),

  updateJobDuty: protectedProcedure
    .input(z.object({
      id: z.number(),
      positionId: z.number(),
      code: z.string(),
      title: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職控' });
      }
      return await db.updateJobDuty(input.id, input);
    }),

  toggleJobDutyActive: protectedProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'chairman') {
        throw new TRPCError({ code: 'FORBIDDEN', message: '只有管理員和董事長可以管理職控' });
      }
      return await db.toggleJobDutyActive(input.id, input.isActive);
    }),
});

/**
 * ==========================================
 * 工作日誌路由
 * ==========================================
 */

const workLogRouter = router({
  // 獲取我的工作日誌列表
  getMyWorkLogs: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return await db.getWorkLogsByUser(ctx.user.id, input.startDate, input.endDate);
    }),

  // 獲取工作日誌的工作項目
  getWorkItems: protectedProcedure
    .input(z.object({ workLogId: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkItemsByLogId(input.workLogId);
    }),

  // 獲取待複評的工作日誌 (主管)
  getUnreviewedLogs: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (ctx.user.role !== 'supervisor' && ctx.user.role !== 'chairman') {
      throw new TRPCError({ code: 'FORBIDDEN', message: '只有主管可以查看待複評的工作日誌' });
    }
    return await db.getUnreviewedWorkLogs(ctx.user.id);
  }),

  // TODO: 創建工作日誌
  // TODO: 更新工作項目
  // TODO: 提交工作日誌
  // TODO: 主管複評工作項目
});

/**
 * ==========================================
 * 任務管理路由
 * ==========================================
 */

const taskRouter = router({
  // 獲取我的任務列表
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.getTasksByUser(ctx.user.id);
  }),

  // 獲取我交辦的任務 (主管)
  getAssignedTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (ctx.user.role !== 'supervisor' && ctx.user.role !== 'chairman') {
      throw new TRPCError({ code: 'FORBIDDEN', message: '只有主管可以查看交辦的任務' });
    }
    return await db.getTasksByAssigner(ctx.user.id);
  }),

  // 獲取任務進度記錄
  getTaskProgress: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTaskProgressByTaskId(input.taskId);
    }),

  // TODO: 創建任務 (主管)
  // TODO: 更新任務進度 (員工)
  // TODO: 提交結案報告 (員工)
  // TODO: 主管複評任務
});

/**
 * ==========================================
 * KPI追蹤路由
 * ==========================================
 */

const kpiRouter = router({
  // 獲取我的KPI定義
  getMyKpiDefinitions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || !ctx.user.positionId) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: '使用者未設定職位' });
    }
    return await db.getKpiDefinitionsByPosition(ctx.user.positionId);
  }),

  // 獲取我的KPI實際值
  getMyKpiActuals: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return await db.getKpiActualsByUser(ctx.user.id, input.period);
    }),

  // 獲取待審核的KPI (主管)
  getPendingKpis: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (ctx.user.role !== 'supervisor' && ctx.user.role !== 'chairman') {
      throw new TRPCError({ code: 'FORBIDDEN', message: '只有主管可以查看待審核的KPI' });
    }
    return await db.getPendingKpiActuals(ctx.user.id);
  }),

  // TODO: 錄入KPI實際值
  // TODO: 主管審核KPI
});

/**
 * ==========================================
 * 績效評估路由
 * ==========================================
 */

const performanceRouter = router({
  // 獲取我的績效評估記錄
  getMyEvaluations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.getPerformanceEvaluationsByUser(ctx.user.id);
  }),

  // TODO: 創建績效評估 (主管)
  // TODO: 更新績效評估 (主管)
});

/**
 * ==========================================
 * 通知路由
 * ==========================================
 */

const notificationRouter = router({
  // 獲取我的通知列表
  getMyNotifications: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return await db.getNotificationsByUser(ctx.user.id, input.limit);
    }),

  // 獲取未讀通知數量
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.getUnreadNotificationCount(ctx.user.id);
  }),

  // TODO: 標記通知為已讀
});

/**
 * ==========================================
 * 儀表板路由
 * ==========================================
 */

const dashboardRouter = router({
  // TODO: 員工個人儀表板數據
  // TODO: 主管團隊儀表板數據
  // TODO: 董事長公司儀表板數據
});

/**
 * ==========================================
 * 主路由器
 * ==========================================
 */

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  organization: organizationRouter,
  workLog: workLogRouter,
  task: taskRouter,
  kpi: kpiRouter,
  performance: performanceRouter,
  notification: notificationRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
