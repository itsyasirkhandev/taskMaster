"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";
import { TaskForm, type TaskFormValues } from "@/components/task-form";
import { TaskList } from "@/components/task-list";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  // Avoid rendering the list on the server to prevent hydration mismatch with UUIDs
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground">
        <main className="container mx-auto max-w-2xl px-4 py-12 md:py-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">TaskMaster</h1>
            <p className="text-lg text-muted-foreground">
              Master your day. Bring clarity to your work and peace of mind to your life. Add your first task below.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
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
