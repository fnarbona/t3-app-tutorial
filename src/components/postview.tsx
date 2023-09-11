// next
import Link from "next/link";
import Image from "next/image";

// utils
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs } from "~/utils/api";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  const timeSincePost = () => {
    return dayjs(post?.createdAt).fromNow();
  };

  return (
    <div
      key={post.id}
      className="flex gap-4 border-b-2 border-slate-500 p-4 py-6"
    >
      <Image
        src={author.imageUrl}
        className="rounded-full"
        width={48}
        height={48}
        alt={`${author.username}'s profile picture`}
      />
      <div>
        <div className="flex gap-1">
          <Link href={`/@${author?.username}`}>
            <span className="font-bold text-slate-300">{`@${author?.username}`}</span>
          </Link>
          <span className="text-slate-500">-</span>
          <Link href={`/post/${post?.id}`}>
            <span className="text-slate-500">{timeSincePost()}</span>
          </Link>
        </div>
        <span className="text-slate-300">{post.content}</span>
      </div>
    </div>
  );
};

export default PostView;
