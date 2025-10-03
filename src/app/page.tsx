"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import { TaskForm, type TaskFormValues } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";

// A helper to safely use crypto.randomUUID only on the client
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.randomUUID();
  }
  // Fallback for server-side rendering or older browsers
  return `task-${Date.now()}-${Math.random()}`;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);


  useEffect(() => {
    // Initialize with some example tasks only on the client
    setTasks([
      { id: generateUUID(), description: "Read a book for 30 minutes", dueDate: new Date() },
      { id: generateUUID(), description: "Plan the weekly sprint", dueDate: new Date(new Date().setDate(new Date().getDate() + 1)) },
      { id: generateUUID(), description: "Go for a walk", dueDate: new Date(new Date().setDate(new Date().getDate() + 2)) },
    ]);
  }, []);

  const handleAddTask = (data: TaskFormValues) => {
    const newTask: Task = {
      id: generateUUID(),
      ...data,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
       <header className="container mx-auto max-w-5xl px-4 py-4 flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
          </div>
        </header>
      <main className="container mx-auto max-w-2xl px-4 py-12 md:py-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">TaskMaster</h1>
          <p className="text-lg text-muted-foreground">
            Master your day. Bring clarity to your work and peace of mind to your life. Add your first task below.
          </p>
        </div>
        
        <div className="mt-12">
          <TaskForm onTaskAdd={handleAddTask} />
        </div>
        
        <div className="mt-8">
          <TaskList tasks={tasks} onTaskDelete={handleDeleteTask} />
        </div>
      </main>
    </div>
  );
}
