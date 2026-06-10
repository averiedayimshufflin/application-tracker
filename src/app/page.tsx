
"use client";

import { createClient } from "@/lib/supabase/client";

export default function Home() {
 

const supabase = createClient();

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.message);
  }
}
  return (
    <>
    <div>
      <h1>Welcome to the Job Application Tracker</h1>
      <p>Please sign in to manage your applications.</p>
    </div>


<button onClick={signInWithGoogle}>
  Continue with Google
</button>
</>
);
}