import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";
import { TRPCError } from "@trpc/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Input validation schema
const launchPlanInputSchema = z.object({
  productDescription: z.string(),
  differentiators: z.array(z.string()),
  goals: z.array(z.string()),
  audience: z.array(z.string()),
});

// Response schema
const launchPlanResponseSchema = z.object({
  project: z.object({
    name: z.string(),
    description: z.string(),
  }),
  outcome: z.object({
    description: z.string(),
    type: z.string(),
    dueDate: z.string(),
  }),
  actions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.string(),
    priority: z.enum(["High", "Medium", "Low"]),
    week: z.number().min(1).max(3),
  })),
});

export const workflowRouter = createTRPCRouter({
  suggestDifferentiators: protectedProcedure
    .input(z.object({ productDescription: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a product strategist helping identify key differentiators. Based on the product description, suggest 3-5 key differentiators from this list: AI-Powered, Privacy-First, Open Source, Simple & Easy to Use, Fast & Performant, Highly Customizable, Well Integrated, Enterprise-Grade Security. Return your response as a JSON object with a 'differentiators' array containing only the exact differentiator values that match the list.",
            },
            {
              role: "user",
              content: `Please analyze this product description and return the differentiators as JSON: "${input.productDescription}"`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message.content;
        if (!response) throw new Error("Failed to generate differentiators");

        const result = z.object({
          differentiators: z.array(z.string()),
        }).parse(JSON.parse(response));

        return result.differentiators;
      } catch (error) {
        console.error('Error in suggestDifferentiators:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to suggest differentiators',
        });
      }
    }),

  generateLaunchPlan: protectedProcedure
    .input(launchPlanInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify session
        if (!ctx.session?.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to generate a launch plan',
          });
        }

        console.log('Starting launch plan generation with input:', input);

        // 1. Read the prompt template
        const promptPath = path.join(process.cwd(), "src/prompts/launch-sprint.txt");
        const promptTemplate = await fs.readFile(promptPath, "utf-8");

        // 2. Fill in the template
        const filledPrompt = promptTemplate
          .replace("{{product_description}}", input.productDescription)
          .replace("{{[differentiators]}}", JSON.stringify(input.differentiators))
          .replace("{{[goals]}}", JSON.stringify(input.goals))
          .replace("{{[audience]}}", JSON.stringify(input.audience));

        console.log('Calling OpenAI with prompt...');

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a startup co-pilot that helps entrepreneurs launch their products.",
            },
            {
              role: "user",
              content: filledPrompt,
            },
          ],
          response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message.content;
        if (!response) throw new Error("Failed to generate launch plan");

        console.log('Received OpenAI response, parsing...');

        // 4. Parse and validate the response
        const plan = launchPlanResponseSchema.parse(JSON.parse(response));
        console.log('Parsed launch plan:', plan);
        console.log('Creating workflow in database...');

        // 5. Store in database
        try {
          const workflow = await ctx.db.workflow.create({
            data: {
              title: "Launch Sprint",
              description: `Launch plan for ${plan.project.name}`,
              type: "launch_sprint",
              createdById: ctx.session.user.id,
              projects: {
                create: {
                  name: plan.project.name,
                  description: plan.project.description,
                  slug: plan.project.name.toLowerCase().replace(/\s+/g, "-"),
                  createdById: ctx.session.user.id,
                  outcomes: {
                    create: {
                      description: plan.outcome.description,
                      type: plan.outcome.type,
                      dueDate: new Date(plan.outcome.dueDate),
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            },
            include: {
              projects: {
                include: {
                  outcomes: true,
                },
              },
            },
          });

          console.log('Workflow created:', workflow.id);

          // 6. Create actions and workflow steps
          const project = workflow.projects[0];
          if (!project) {
            throw new Error("Failed to create project");
          }

          console.log('Creating actions and workflow steps...');

          const createdActions = await Promise.all(
            plan.actions.map(async (action) => {
              const createdAction = await ctx.db.action.create({
                data: {
                  name: action.name,
                  description: action.description,
                  dueDate: new Date(action.dueDate),
                  priority: action.priority.toUpperCase(),
                  projectId: project.id,
                  createdById: ctx.session.user.id,
                },
              });

              // Create workflow step for each action
              await ctx.db.workflowStep.create({
                data: {
                  workflowId: workflow.id,
                  order: action.week * 100 + plan.actions.indexOf(action),
                  title: action.name,
                  actionId: createdAction.id,
                },
              });

              return createdAction;
            }),
          );

          console.log('Successfully created workflow with', createdActions.length, 'actions');

          return {
            workflow,
            project,
            actions: createdActions,
          };
        } catch (dbError) {
          console.error('Database error:', dbError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to save launch plan to database',
            cause: dbError,
          });
        }
      } catch (error) {
        console.error('Error in generateLaunchPlan:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
      }
    }),
}); 