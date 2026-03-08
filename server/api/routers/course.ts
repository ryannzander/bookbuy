import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const courseRouter = createTRPCRouter({
  addCourse: protectedProcedure
    .input(z.object({ courseCode: z.string().min(2).max(20), courseName: z.string().max(120).optional(), semester: z.string().max(30).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.courseSchedule.upsert({
        where: { userId_courseCode: { userId: ctx.userId, courseCode: input.courseCode.toUpperCase() } },
        create: { userId: ctx.userId, courseCode: input.courseCode.toUpperCase(), courseName: input.courseName ?? null, semester: input.semester ?? null },
        update: { courseName: input.courseName ?? undefined, semester: input.semester ?? undefined },
      });
    }),
  removeCourse: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.db.courseSchedule.deleteMany({ where: { id: input.id, userId: ctx.userId } });
    return { ok: true };
  }),
  myCourses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.courseSchedule.findMany({ where: { userId: ctx.userId }, orderBy: { courseCode: "asc" } });
  }),
  suggestedBooks: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.courseSchedule.findMany({ where: { userId: ctx.userId }, select: { courseCode: true } });
    if (courses.length === 0) return [];
    return ctx.db.listing.findMany({
      where: { courseCode: { in: courses.map((c) => c.courseCode) }, status: "AVAILABLE", sellerId: { not: ctx.userId } },
      include: { seller: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }, take: 20,
    });
  }),
  popularCourses: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.listing.groupBy({
      by: ["courseCode"], where: { courseCode: { not: null }, status: "AVAILABLE" },
      _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 20,
    });
    return listings.filter((l) => l.courseCode).map((l) => ({ courseCode: l.courseCode!, count: l._count.id }));
  }),
});
