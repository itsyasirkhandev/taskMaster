"use client";

import { useMemo } from "react";
import type { Task, TaskWithId } from "@/lib/types";
import { TaskForm, type TaskFormValues } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { useUser } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFirebase, useFirestore } from "@/firebase/provider";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { EditTaskFormValues } from "@/components/edit-task-form";

export default function Home() {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();

  const tasksQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "users", user.uid, "tasks");
  }, [user, firestore]);

  const { data: tasks, loading: tasksLoading } = useCollection(tasksQuery);
  
  const { groupedTasks, allTasksEmpty } = useMemo(() => {
    const initialGroupedTasks = {
      "Urgent & Important": [],
      "Unurgent & Important": [],
      "Urgent & Unimportant": [],
      "Unurgent & Unimportant": [],
    };

    if (!tasks) {
      return { groupedTasks: initialGroupedTasks, allTasksEmpty: true };
    }

    const mappedTasks = tasks.docs.map(d => ({
      id: d.id, 
      ...d.data(),
      dueDate: (d.data().dueDate as Timestamp)?.toDate()
    })).sort((a,b) => a.createdAt.toMillis() - b.createdAt.toMillis()) as TaskWithId[];

    const grouped = mappedTasks.reduce((acc, task) => {
      const category = task.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, initialGroupedTasks as Record<string, TaskWithId[]>);

    const allEmpty = Object.values(grouped).every(arr => arr.length === 0);

    return { groupedTasks: grouped, allTasksEmpty: allEmpty };
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null; 
  }

  const handleAddTask = (data: TaskFormValues) => {
    if (!tasksQuery) return;
    const newTask: Task = {
      ...data,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    addDoc(tasksQuery, newTask).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: tasksQuery.path,
        operation: 'create',
        requestResourceData: newTask,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteTask = (id: string) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", id);
    deleteDoc(taskRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: taskRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleToggleTask = (task: TaskWithId) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", task.id);
    const updatedTask = {
      completed: !task.completed,
      updatedAt: serverTimestamp(),
    };
    updateDoc(taskRef, updatedTask).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: taskRef.path,
        operation: 'update',
        requestResourceData: updatedTask,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleEditTask = (id: string, data: EditTaskFormValues) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", id);
    const updatedTask = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    updateDoc(taskRef, updatedTask).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: taskRef.path,
        operation: 'update',
        requestResourceData: updatedTask,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
       <header className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
          <div></div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
          </div>
        </header>
      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">TaskMaster</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master your day. Bring clarity to your work and peace of mind to your life. Add your first task below.
          </p>
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto">
          <TaskForm onTaskAdd={handleAddTask} />
        </div>
        
        <div className="mt-12">
          <TaskList 
            groupedTasks={groupedTasks} 
            allTasksEmpty={allTasksEmpty}
            onTaskDelete={handleDeleteTask} 
            onTaskToggle={handleToggleTask} 
            onTaskEdit={handleEditTask} 
            loading={tasksLoading} 
          />
        </div>
      </main>
    </div>
  );
}
