import LoginButton from "@/components/LoginButton";
export default function Home() {

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