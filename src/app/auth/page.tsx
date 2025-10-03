"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.657-3.108-11.383-7.489l-6.723 5.311A19.904 19.904 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.447-2.274 4.481-4.177 5.981l5.927 5.927A19.927 19.927 0 0 0 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const firestore = useFirestore();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user && firestore) {
        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }, { merge: true });
      }

      toast({
        title: "Authentication Successful",
        description: `Welcome, ${user.displayName}!`,
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
            Welcome to TaskMaster
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>
        </div>
        <Button
          onClick={handleGoogleSignIn}
          className="w-full"
          variant="outline"
        >
          <GoogleIcon />
          <span className="ml-2">Continue with Google</span>
        </Button>
      </div>
    </div>
  );
}
