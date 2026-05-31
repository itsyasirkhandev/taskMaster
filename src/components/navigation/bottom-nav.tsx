"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookText } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around z-50 h-[60px] pb-safe">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Tasks</span>
      </Link>
      <Link 
        href="/journal" 
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/journal') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <BookText className="h-5 w-5" />
        <span className="text-[10px] font-medium">Journals</span>
      </Link>
    </nav>
  );
}
