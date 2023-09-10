// clerk
import { clerkClient } from "@clerk/nextjs";

// trpc
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// zod
import { z } from "zod";

// helpers
import { filterUserForClient } from "~/server/helpers";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    const users = await clerkClient.users
      .getUserList({
        userId: posts.map((post) => post.userId),
        limit: 100,
      })
      .then((userList) => userList.map(filterUserForClient));

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.userId);

      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found",
        });

      return {
        post,
        author,
      };
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input.content,
        },
      });

      return post;
    }),
});
