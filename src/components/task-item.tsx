"use client";

import { format } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";
import type { TaskWithId } from "@/lib/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskItemProps {
  task: TaskWithId;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
}

export function TaskItem({ task, onTaskDelete, onTaskToggle }: TaskItemProps) {
  return (
    <li role="listitem">
      <Card className={`transition-all hover:shadow-md ${task.completed ? 'bg-muted/50' : ''}`}>
        <CardContent className="p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
             <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => onTaskToggle(task)}
                className="mt-1"
                aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
              />
            <div className="space-y-2 flex-1">
              <label htmlFor={`task-${task.id}`} className={`font-medium text-card-foreground ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.description}</label>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(task.dueDate, "PPP")}</span>
              </div>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Delete task">
                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your task.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onTaskDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </li>
  );
}
