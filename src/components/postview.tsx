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
    <div key={post.id} className="flex gap-4 border-b-2 border-slate-400 p-4">
      <Image
        src={author.imageUrl}
        className="rounded-full"
        width={48}
        height={48}
        alt={`${author.username}'s profile picture`}
      />
      <div>
        <div className="flex gap-1 text-slate-500">
          <Link href={`/@${author?.username}`}>
            <span>{`@${author?.username}`}</span>
          </Link>

          <span>-</span>
          <Link href={`/post/${post?.id}`}>
            <span>{timeSincePost()}</span>
          </Link>
        </div>
        <span className="text-white">{post.content}</span>
      </div>
    </div>
  );
};

export default PostView;
