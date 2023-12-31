// next
import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

// components
import PostView from "~/components/postview";
import LoadingPage from "~/components/loading";
import PageLayout from "~/components/layout";

// utilities
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage size={60} />;
  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username ?? ""}'s profile picture`}
            width={120}
            height={120}
            className="absolute bottom-0 left-0 -mb-[60px]  ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="border-b border-slate-400 px-4 pb-4 pt-[68px]">
          <div className="text-2xl font-bold text-white">@{data.username}</div>
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("slug is required");
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
