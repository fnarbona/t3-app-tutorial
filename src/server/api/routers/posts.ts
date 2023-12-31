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

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { type Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (posts: Post[]) => {
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
};

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const fullPost = await addUserDataToPosts([post]).then(
        (posts) => posts[0],
      );

      return fullPost;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),
  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.post
        .findMany({
          where: {
            userId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts);
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const { success } = await ratelimit.limit(userId);

      if (!success)
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
        });

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input.content,
        },
      });

      return post;
    }),
});
