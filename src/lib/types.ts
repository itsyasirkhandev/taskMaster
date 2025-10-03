import { FieldValue, Timestamp } from "firebase/firestore";

export type Task = {
  description: string;
  dueDate?: Date | FieldValue;
  completed: boolean;
  category: "Urgent & Important" | "Unurgent & Important" | "Urgent & Unimportant" | "Unurgent & Unimportant";
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type TaskWithId = Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> & {
    id: string;
    dueDate?: Date;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};


export type UserProfile = {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
};
