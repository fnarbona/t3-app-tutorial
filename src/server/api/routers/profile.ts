// clerk
import { clerkClient } from "@clerk/nextjs";

// trpc
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// zod
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserForClient(user);
    }),
});
