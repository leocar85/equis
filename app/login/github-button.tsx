"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

export default function GithubButton() {
  const supabase = createClientComponentClient<Database>();

  const handleLogIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button onClick={handleLogIn} className="hover:bg-gray-800 p-8 rounded-xl">
      <Image
        src="/github-mark-white.png"
        width={100}
        height={100}
        alt="github-logo"
      />
    </button>
  );
}
