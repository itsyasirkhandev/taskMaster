"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Trash2, Pencil, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaskItemProps {
  task: TaskWithId;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
  onSubtaskToggle: (task: TaskWithId, subtaskId: string) => void;
  onTaskEdit: (id: string, data: EditTaskFormValues) => void;
  dragHandleProps?: {
    attributes: any;
    listeners: any;
  };
  isDragging?: boolean;
}

export function TaskItem({ task, onTaskDelete, onTaskToggle, onSubtaskToggle, onTaskEdit, dragHandleProps, isDragging }: TaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Card className={`transition-all hover:shadow-md ${task.completed ? 'bg-muted/50' : 'bg-card'} ${isDragging ? 'opacity-50' : ''}`}>
        <CardContent className="p-3 md:p-4 flex flex-col gap-3 md:gap-4">
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div className="flex items-start gap-2 md:gap-4 flex-1 overflow-hidden">
              {dragHandleProps && (
                <button
                  className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[32px] md:min-w-[44px] flex items-center justify-center -ml-2 md:ml-0"
                  {...dragHandleProps.attributes}
                  {...dragHandleProps.listeners}
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-5 w-5" />
                </button>
              )}
               <div className="flex items-start mt-1 min-h-[44px]">
                 <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={handleMainCheckboxChange}
                    aria-label={`Mark task ${task.completed ? 'incomplete' : 'complete'}`}
                  />
               </div>
              <div className="space-y-1 md:space-y-2 flex-1 overflow-hidden py-1">
                <label htmlFor={`task-${task.id}`} className={`font-medium text-sm md:text-base text-card-foreground break-words cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.description}</label>
                {task.dueDate && (
                    <div className="flex items-center text-[10px] md:text-sm text-muted-foreground">
                      <Calendar className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span>{format(task.dueDate, "PPP")}</span>
                    </div>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-0 md:gap-1">
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Edit task" className="min-h-[44px] min-w-[44px]">
                    <Pencil className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-primary" />
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
                  <Button variant="ghost" size="icon" aria-label="Delete task" className="min-h-[44px] min-w-[44px]">
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hover:text-destructive" />
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
            <div className="pl-6 md:pl-8 space-y-3 md:space-y-4">
                <Separator />
                <div className="space-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-muted-foreground">SUB-TASKS</p>
                        <p className="text-xs font-semibold text-muted-foreground">{Math.round(subtaskProgress)}%</p>
                    </div>
                    <Progress value={subtaskProgress} className="h-2" />
                </div>
                <div className="space-y-2">
                  <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="space-y-2">
                    {task.subtasks.slice(0, 3).map(subtask => (
                        <div key={subtask.id} className="flex items-start gap-2 md:gap-3 w-full min-h-[44px] py-1">
                        <div className="mt-0.5">
                          <Checkbox
                              id={`subtask-${subtask.id}`}
                              checked={subtask.completed}
                              onCheckedChange={() => onSubtaskToggle(task, subtask.id)}
                              aria-label={`Mark subtask ${subtask.completed ? 'incomplete' : 'complete'}`}
                          />
                        </div>
                        <label
                            htmlFor={`subtask-${subtask.id}`}
                            className={`text-xs md:text-sm flex-1 min-w-0 break-words cursor-pointer pt-0.5 ${subtask.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                        >
                            {subtask.description}
                        </label>
                        </div>
                    ))}
                    {task.subtasks.length > 3 && (
                        <CollapsibleContent className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        {task.subtasks.slice(3).map(subtask => (
                            <div key={subtask.id} className="flex items-start gap-2 md:gap-3 w-full min-h-[44px] py-1">
                            <div className="mt-0.5">
                              <Checkbox
                                  id={`subtask-${subtask.id}`}
                                  checked={subtask.completed}
                                  onCheckedChange={() => onSubtaskToggle(task, subtask.id)}
                                  aria-label={`Mark subtask ${subtask.completed ? 'incomplete' : 'complete'}`}
                              />
                            </div>
                            <label
                                htmlFor={`subtask-${subtask.id}`}
                                className={`text-xs md:text-sm flex-1 min-w-0 break-words cursor-pointer pt-0.5 ${subtask.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}
                            >
                                {subtask.description}
                            </label>
                            </div>
                        ))}
                        </CollapsibleContent>
                    )}
                    {task.subtasks.length > 3 && (
                        <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 text-xs text-muted-foreground hover:text-foreground mt-1 px-3 -ml-3 min-h-[44px]">
                            {isExpanded ? "Show less" : `Show ${task.subtasks.length - 3} more`}
                            {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                        </CollapsibleTrigger>
                    )}
                  </Collapsible>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </li>
  );
}
