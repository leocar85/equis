"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import { useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Tweets({ tweets }: { tweets: TweetWithAuthor[] }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [optimisticTweets, addOptimisticTweet] = useOptimistic<
    TweetWithAuthor[],
    TweetWithAuthor
  >(tweets, (currentOptimisticTweets, newTweet) => {
    const newOptimisticTweets = [...currentOptimisticTweets];
    const index = newOptimisticTweets.findIndex(
      (tweet) => tweet.id === newTweet.id
    );
    newOptimisticTweets[index] = newTweet;
    return newOptimisticTweets;
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime tweets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tweets",
        },
        (payload) => {
          console.log({ payload });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return (
    <>
      {optimisticTweets.map((tweet) => {
        return (
          <div
            key={tweet.id}
            className="border border-gray-800 border-t-0 px-4 py-8 flex"
          >
            <div className="bg-red-400 h-12 w-12 rounded-full">
              <Image
                src={tweet.author.avatar_url}
                alt="user-image"
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <div className="ml-4">
              <p>
                <span className="font-bold">{tweet.author.name}</span>
                <span className="text-sm text-gray-400 ml-2">
                  {tweet.author.username}
                </span>
              </p>
              <p>{tweet.title}</p>
              <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
            </div>
          </div>
        );
      })}
    </>
  );
}
