import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { buildResumeUserPrompt, normalizeResumeAnalysis, RESUME_JSON_SCHEMA, RESUME_MASTER_PROMPT } from "./resumePrompt";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  resume: router({
    analyze: publicProcedure
      .input(z.object({
        resumeText: z.string().min(80).max(50000),
        jobDescription: z.string().max(25000).optional(),
        targetRole: z.string().max(200).optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: RESUME_MASTER_PROMPT },
            { role: "user", content: buildResumeUserPrompt(input.resumeText, input.jobDescription, input.targetRole) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "resume_analysis", strict: true, schema: RESUME_JSON_SCHEMA },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        if (typeof content !== "string") throw new Error("The analysis service returned no structured response.");
        let parsed: unknown;
        try { parsed = JSON.parse(content); } catch { throw new Error("The analysis service returned invalid JSON. Please try again."); }
        return normalizeResumeAnalysis(parsed);
      }),
  }),
});

export type AppRouter = typeof appRouter;
