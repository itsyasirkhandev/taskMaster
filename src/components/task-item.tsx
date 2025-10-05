"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Trash2, Pencil } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EditTaskForm, type EditTaskFormValues } from "./edit-task-form";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface TaskItemProps {
  task: TaskWithId;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
  onSubtaskToggle: (task: TaskWithId, subtaskId: string) => void;
  onTaskEdit: (id: string, data: EditTaskFormValues) => void;
}

export function TaskItem({ task, onTaskDelete, onTaskToggle, onSubtaskToggle, onTaskEdit }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditSubmit = (data: EditTaskFormValues) => {
    onTaskEdit(task.id, data);
  };

  const subtaskProgress = task.subtasks && task.subtasks.length > 0 
    ? (task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100
    : 0;

  const handleMainCheckboxChange = () => {
    onTaskToggle(task);
  }
  
  return (
    <li role="listitem">
      <Card className={`transition-all hover:shadow-md ${task.completed ? 'bg-muted/50' : 'bg-card'}`}>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 overflow-hidden">
               <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={handleMainCheckboxChange}
                  className="mt-1"
                  aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
                />
              <div className="space-y-2 flex-1 overflow-hidden">
                <label htmlFor={`task-${task.id}`} className={`font-medium text-card-foreground break-words ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.description}</label>
                {task.dueDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>{format(task.dueDate, "PPP")}</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Edit task">
                    <Pencil className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                  </DialogHeader>
                  <EditTaskForm task={task} onTaskEdit={handleEditSubmit} onClose={() => setIsEditDialogOpen(false)} />
                </DialogContent>
              </Dialog>
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
            </div>
          </div>
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="pl-8 space-y-4">
                <Separator />
                <div className="space-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">SUB-TASKS</p>
                        <p className="text-xs font-semibold text-muted-foreground">{Math.round(subtaskProgress)}%</p>
                    </div>
                    <Progress value={subtaskProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3">
                    <Checkbox
                        id={`subtask-${subtask.id}`}
                        checked={subtask.completed}
                        onCheckedChange={() => onSubtaskToggle(task, subtask.id)}
                        aria-label={`Mark subtask ${subtask.completed ? 'incomplete' : 'complete'}`}
                    />
                    <label
                        htmlFor={`subtask-${subtask.id}`}
                        className={`text-sm flex-1 break-words ${subtask.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                    >
                        {subtask.description}
                    </label>
                    </div>
                ))}
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </li>
  );
}
