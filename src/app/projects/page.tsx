import Link from "next/link";

//import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Projects } from "~/app/_components/Projects";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#111111] to-[#212121] text-white">        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {session?.user && <Projects />}
          {/* {session?.user && <LatestPost />} */}
        </div>
      </main>
    </HydrateClient>
  );
}
