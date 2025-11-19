"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "./task-item";
import type { TaskWithId } from "@/lib/types";
import type { EditTaskFormValues } from "./edit-task-form";

interface SortableTaskItemProps {
  task: TaskWithId;
  onTaskDelete: (id: string) => void;
  onTaskToggle: (task: TaskWithId) => void;
  onSubtaskToggle: (task: TaskWithId, subtaskId: string) => void;
  onTaskEdit: (id: string, data: EditTaskFormValues) => void;
}

export function SortableTaskItem({
  task,
  onTaskDelete,
  onTaskToggle,
  onSubtaskToggle,
  onTaskEdit,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        onTaskDelete={onTaskDelete}
        onTaskToggle={onTaskToggle}
        onSubtaskToggle={onSubtaskToggle}
        onTaskEdit={onTaskEdit}
        dragHandleProps={{ attributes, listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}
