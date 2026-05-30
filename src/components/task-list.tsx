"use client";

import { useState } from "react";
import type { TaskWithId } from "@/lib/types";
import { SortableTaskItem } from "@/components/sortable-task-item";
import { CheckCircle2, Plus } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import type { EditTaskFormValues } from "./edit-task-form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { QuickTaskForm } from "./quick-task-form";
import type { TaskFormValues } from "./task-form";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DragOverlay } from "@dnd-kit/core";
import { TaskItem } from "./task-item";

interface TaskListProps {
  groupedTasks: Record<string, TaskWithId[]>;
  allTasksEmpty: boolean;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
  onSubtaskToggle: (task: TaskWithId, subtaskId: string) => void;
  onTaskEdit: (id: string, data: EditTaskFormValues) => void;
  onTaskAdd: (data: TaskFormValues) => void;
  onDragOverCategory: (activeId: string, overId: string, sourceCategory: string, destinationCategory: string) => void;
  onDragEndCategory: (activeId: string, overId: string, sourceCategory: string, destinationCategory: string) => void;
  loading: boolean;
}

const categoryConfig: Record<string, { title: string; colors: string }> = {
  "Urgent & Important": {
    title: "Urgent & Important",
    colors: "border-destructive/50",
  },
  "Unurgent & Important": {
    title: "Not Urgent & Important",
    colors: "border-primary/50",
  },
  "Urgent & Unimportant": {
    title: "Urgent & Not Important",
    colors: "border-yellow-500/50",
  },
  "Unurgent & Unimportant": {
    title: "Not Urgent & Not Important",
    colors: "border-muted-foreground/50",
  },
}


export function TaskList({ groupedTasks, allTasksEmpty, onTaskDelete, onTaskToggle, onSubtaskToggle, onTaskEdit, onTaskAdd, onDragOverCategory, onDragEndCategory, loading }: TaskListProps) {
  const [activeTask, setActiveTask] = useState<TaskWithId | null>(null);
  const [dialogStates, setDialogStates] = useState<Record<string, boolean>>({
    "Urgent & Important": false,
    "Unurgent & Important": false,
    "Urgent & Unimportant": false,
    "Unurgent & Unimportant": false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDialogChange = (category: string, isOpen: boolean) => {
    setDialogStates(prev => ({ ...prev, [category]: isOpen }));
  };

  const handleTaskAdd = (category: string) => (data: TaskFormValues) => {
    onTaskAdd(data);
    handleDialogChange(category, false);
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    for (const tasks of Object.values(groupedTasks)) {
      const task = tasks.find(t => t.id === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.data.current?.category;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    onDragOverCategory(activeId, overId, activeContainer, overContainer);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.data.current?.category;

    if (!activeContainer || !overContainer) return;

    onDragEndCategory(activeId, overId, activeContainer, overContainer);
  };
  if (loading) {
     return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(groupedTasks).map(category => (
          <Card key={category}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
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
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {Object.entries(groupedTasks).map(([category, tasks]) => {
          const config = categoryConfig[category];
          return (
            <TaskColumn 
              key={category}
              category={category}
              config={config}
              tasks={tasks}
              isDialogOpen={dialogStates[category]}
              onDialogChange={(isOpen: boolean) => handleDialogChange(category, isOpen)}
              onTaskAdd={handleTaskAdd(category)}
              onTaskDelete={onTaskDelete}
              onTaskToggle={onTaskToggle}
              onSubtaskToggle={onSubtaskToggle}
              onTaskEdit={onTaskEdit}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskItem 
            task={activeTask}
            onTaskDelete={onTaskDelete}
            onTaskToggle={onTaskToggle}
            onSubtaskToggle={onSubtaskToggle}
            onTaskEdit={onTaskEdit}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

import { useDroppable } from "@dnd-kit/core";

function TaskColumn({ category, config, tasks, isDialogOpen, onDialogChange, onTaskAdd, onTaskDelete, onTaskToggle, onSubtaskToggle, onTaskEdit }: any) {
  const { setNodeRef } = useDroppable({
    id: category,
    data: {
      type: "Column",
      category
    }
  });

  return (
    <div ref={setNodeRef} className={`space-y-4 p-4 rounded-lg border-2 border-dashed h-full ${config.colors}`}>
      <div className="text-center space-y-3">
        <h3 className="text-lg font-bold font-headline">{config.title}</h3>
        <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Task to {config.title}</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <QuickTaskForm onTaskAdd={onTaskAdd} defaultCategory={category} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {tasks.length > 0 ? (
        <SortableContext id={category} items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          <ul role="list" className="space-y-4 min-h-[50px]">
            {tasks.map((task: any) => (
              <SortableTaskItem 
                key={task.id} 
                task={task} 
                onTaskDelete={onTaskDelete} 
                onTaskToggle={onTaskToggle} 
                onSubtaskToggle={onSubtaskToggle} 
                onTaskEdit={onTaskEdit}
              />
            ))}
          </ul>
        </SortableContext>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground min-h-[100px] flex items-center justify-center border-2 border-transparent border-dashed rounded">
          <p>Drop tasks here</p>
        </div>
      )}
    </div>
  );
}
