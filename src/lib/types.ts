import { FieldValue, Timestamp } from "firebase/firestore";
import { z } from "zod";

export type Subtask = {
  id: string;
  description: string;
  completed: boolean;
};

export type Task = {
  description: string;
  dueDate?: Date | FieldValue;
  completed: boolean;
  category: "Urgent & Important" | "Unurgent & Important" | "Urgent & Unimportant" | "Unurgent & Unimportant";
  columnState?: "Active" | "Completed";
  createdAt: FieldValue;
  updatedAt: FieldValue;
  subtasks: Subtask[];
  order?: number;
};

export type TaskWithId = Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> & {
    id: string;
    dueDate?: Date;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    order?: number;
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
};

export const JournalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().optional().default(""), // We will parse comma-separated tags
});

export type JournalFormValues = z.infer<typeof JournalSchema>;

export type Journal = {
  title: string;
  description: string;
  userId: string;
  tags: string[];
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type JournalWithId = Omit<Journal, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
