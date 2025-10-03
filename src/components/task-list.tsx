"use client";

import type { TaskWithId } from "@/lib/types";
import { TaskItem } from "@/components/task-item";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import type { EditTaskFormValues } from "./edit-task-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TaskListProps {
  groupedTasks: Record<string, TaskWithId[]>;
  allTasksEmpty: boolean;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
  onSubtaskToggle: (task: TaskWithId, subtaskId: string) => void;
  onTaskEdit: (id: string, data: EditTaskFormValues) => void;
  loading: boolean;
}

const categoryConfig: Record<string, { title: string; description: string; colors: string }> = {
  "Urgent & Important": {
    title: "Urgent & Important",
    description: "Crises, deadlines, problems",
    colors: "border-destructive/50",
  },
  "Unurgent & Important": {
    title: "Not Urgent & Important",
    description: "Relationship building, new opportunities",
    colors: "border-primary/50",
  },
  "Urgent & Unimportant": {
    title: "Urgent & Not Important",
    description: "Some meetings, some mails, interruptions",
    colors: "border-yellow-500/50",
  },
  "Unurgent & Unimportant": {
    title: "Not Urgent & Not Important",
    description: "Time wasters, pleasant activities",
    colors: "border-muted-foreground/50",
  },
}


export function TaskList({ groupedTasks, allTasksEmpty, onTaskDelete, onTaskToggle, onSubtaskToggle, onTaskEdit, loading }: TaskListProps) {
  if (loading) {
     return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.keys(groupedTasks).map(category => (
          <Card key={category}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
     )
  }

  if (allTasksEmpty) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
      {Object.entries(groupedTasks).map(([category, tasks]) => {
        const config = categoryConfig[category];
        return (
        <div key={category} className={`space-y-4 p-4 rounded-lg border-2 border-dashed h-full ${config.colors}`}>
          <div className="text-center">
            <h3 className="text-lg font-bold font-headline">{config.title}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          {tasks.length > 0 ? (
            <ul role="list" className="space-y-4">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onTaskDelete={onTaskDelete} onTaskToggle={onTaskToggle} onSubtaskToggle={onSubtaskToggle} onTaskEdit={onTaskEdit}/>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <p>No tasks in this category.</p>
            </div>
          )}
        </div>
      )})}
    </div>
  );
}
