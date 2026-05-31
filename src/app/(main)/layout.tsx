"use client";

import { useUser } from "@/firebase/auth/use-user";
import { useFirebase } from "@/firebase/provider";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();

  // If not logged in and not loading, we can just return children (pages will redirect)
  // or we can handle it here, but pages already redirect.
  
  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-[60px] md:pb-0">
      {/* Global Header */}
      <header className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center gap-4 border-b md:border-none">
        <div className="flex-1">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight">IUtasks</h1>
          </Link>
          <p className="hidden md:block text-sm text-muted-foreground">
            Organize your tasks. Achieve your goals.
          </p>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant={pathname.startsWith('/journal') ? "secondary" : "outline"} 
            onClick={() => router.push('/journal')}
          >
            Journals
          </Button>
          {user && (
            <Avatar>
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
        </div>

        {/* Mobile Navigation Actions (Avatar / Sign Out can be here or in a sheet) */}
        <div className="flex md:hidden items-center gap-3">
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <Button variant="ghost" size="sm" onClick={() => auth.signOut()} className="px-2 h-8">
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
