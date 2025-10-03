"use client";

import type { Task } from "@/lib/types";
import { TaskItem } from "@/components/task-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onTaskDelete: (id: string) => void;
}

export function TaskList({ tasks, onTaskDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-card rounded-lg border-2 border-dashed">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h3 className="mt-4 text-xl font-semibold font-headline">All Caught Up!</h3>
        <p className="mt-1 text-muted-foreground">
          You have no pending tasks. Enjoy your day!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline">Your Tasks</h2>
      <ul role="list" className="space-y-4">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onTaskDelete={onTaskDelete} />
        ))}
      </ul>
    </div>
  );
}
