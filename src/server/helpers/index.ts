import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};

export const generateSSGHelper = () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
};
