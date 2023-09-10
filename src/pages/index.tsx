import { useState } from "react";
// next
import Image from "next/image";

// components
import LoadingPage from "~/components/loading";
import { SignInButton, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

// utils
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import Progress from "~/components/progress";
import { PageLayout } from "~/components/Layout";
import PostView from "~/components/postview";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const [post, setPost] = useState("");
  const progress = Math.ceil((post.length / 280) * 100);

  const { user } = useUser();
  if (!user) return null;

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setPost("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to create post, please try again later.");
      }
    },
  });

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.imageUrl}
        className="rounded-full"
        width={48}
        height={48}
        alt="Profile image"
      />
      <div className="flex grow rounded-md">
        <input
          placeholder="Type some emojis!"
          className="grow bg-transparent  text-white outline-none"
          value={post}
          onChange={(e) => setPost(e.target.value)}
        />
        <Progress radius={18} stroke={2} progress={progress} />
      </div>
      <button
        className="mb-2 mr-2 min-w-[80px] rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        onClick={() => mutate({ content: post })}
        disabled={isPosting}
      >
        {!isPosting ? "Post" : <LoadingPage size={20} />}
      </button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage size={60} />;

  return (
    <div className="w-full">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // fetch is cached, so we don't need to capture it for Feed component
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && <SignInButton />}
        {!!isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
}
