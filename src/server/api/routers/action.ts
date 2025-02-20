import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const actionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.action.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        project: true,
      },
      orderBy: {
        project: {
          priority: "desc",
        },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        projectId: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum([
          "Quick",
          "Scheduled",
          "1st Priority",
          "2nd Priority",
          "3rd Priority",
          "4th Priority",
          "5th Priority",
          "Errand",
          "Remember",
          "Watch",
          "Someday Maybe"
        ]).default("Quick"),
        status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.action.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        projectId: z.string().optional(),
        priority: z.enum([
          "Quick",
          "Scheduled",
          "1st Priority",
          "2nd Priority",
          "3rd Priority",
          "4th Priority",
          "5th Priority",
          "Errand",
          "Remember",
          "Watch",
          "Someday Maybe"
        ]).optional(),
        status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.action.update({
        where: { id },
        data: updateData,
      });
    }),

  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return ctx.db.action.findMany({
      where: {
        createdById: ctx.session.user.id,
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        status: "ACTIVE",
      },
      include: {
        project: true,
      },
      orderBy: {
        project: {
          priority: "desc",
        },
      },
    });
  }),
}); 