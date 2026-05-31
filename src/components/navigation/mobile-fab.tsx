"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm, type TaskFormValues } from "@/components/task-form";

interface MobileFabProps {
  onTaskAdd: (data: TaskFormValues) => void;
}

export function MobileFab({ onTaskAdd }: MobileFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (data: TaskFormValues) => {
    onTaskAdd(data);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="md:hidden fixed right-4 bottom-[76px] z-40 bg-primary text-primary-foreground h-14 w-14 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform active:scale-95"
          aria-label="Add Task"
        >
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Task</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <TaskForm onTaskAdd={handleAdd} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
