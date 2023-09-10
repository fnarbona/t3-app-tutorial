// next
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username: "fnarbona",
  });

  if (isLoading) <div>Loading...</div>;

  if (!data) return <div>404</div>;

  console.log(data);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div className="text-white">Profile View</div>
      </main>
    </>
  );
};

export default ProfilePage;
