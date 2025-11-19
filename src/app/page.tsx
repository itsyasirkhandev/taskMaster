"use client";

import { useMemo, useEffect, useState } from "react";
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
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Loader } from "@/components/loader";

export default function Home() {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<TaskWithId[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

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

    if (!tasks && optimisticTasks.length === 0) {
      return { groupedTasks: initialGroupedTasks, allTasksEmpty: true };
    }

    const liveTasks = tasks?.docs
      .map(d => ({
        id: d.id, 
        ...d.data(),
        dueDate: (d.data().dueDate as Timestamp)?.toDate(),
        createdAt: d.data().createdAt as Timestamp | null,
        subtasks: d.data().subtasks || [],
      }))
      .filter(task => task.createdAt) as TaskWithId[] || [];
    
    const combinedTasks = [...liveTasks];
    optimisticTasks.forEach(optTask => {
      if (!combinedTasks.find(t => t.id === optTask.id)) {
        combinedTasks.push(optTask);
      }
    });

    const sortedTasks = combinedTasks
      .filter(task => task.createdAt)
      .sort((a,b) => a.createdAt!.toMillis() - b.createdAt!.toMillis());

    const grouped = sortedTasks.reduce((acc, task) => {
      const category = task.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, initialGroupedTasks as Record<string, TaskWithId[]>);

    const allEmpty = Object.values(grouped).every(arr => arr.length === 0);

    return { groupedTasks: grouped, allTasksEmpty: allEmpty };
  }, [tasks, optimisticTasks]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground flex items-center justify-center">
        <Loader className="h-12 w-12" />
      </div>
    );
  }

  const handleAddTask = async (data: TaskFormValues) => {
    if (!tasksQuery) return;

    const optimisticId = uuidv4();
    const now = new Date();

    const optimisticTask: TaskWithId = {
      id: optimisticId,
      description: data.description,
      category: data.category as TaskWithId['category'],
      completed: false,
      dueDate: data.dueDate,
      subtasks: data.subtasks 
        ? data.subtasks
            .filter(sub => sub.description.trim() !== '')
            .map(sub => ({ ...sub, id: uuidv4(), completed: false }))
        : [],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };
    
    setOptimisticTasks(prev => [...prev, optimisticTask]);
    setIsAddTaskDialogOpen(false);

    const newTask: Partial<Task> & { subtasks?: { id: string; description: string; completed: boolean }[] } = {
      description: data.description,
      category: data.category,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subtasks: optimisticTask.subtasks,
    };
    
    if (data.dueDate) {
        newTask.dueDate = data.dueDate;
    }

    try {
      const docRef = await addDoc(tasksQuery, newTask);
      setOptimisticTasks(prev => prev.filter(t => t.id !== optimisticId));
    } catch (serverError) {
      setOptimisticTasks(prev => prev.filter(t => t.id !== optimisticId));
      const permissionError = new FirestorePermissionError({
        path: tasksQuery.path,
        operation: 'create',
        requestResourceData: newTask,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
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
    
    const allSubtasksCompleted = task.subtasks && task.subtasks.every(sub => sub.completed);
    const newCompletedStatus = task.subtasks && task.subtasks.length > 0 ? allSubtasksCompleted : !task.completed;

    const updatedTask = {
      completed: newCompletedStatus,
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

  const handleToggleSubtask = (task: TaskWithId, subtaskId: string) => {
    if (!user || !firestore) return;
    const taskRef = doc(firestore, "users", user.uid, "tasks", task.id);
    
    const newSubtasks = task.subtasks.map(sub => 
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );

    const allSubtasksCompleted = newSubtasks.every(sub => sub.completed);
    
    const updatedTask = {
      subtasks: newSubtasks,
      completed: allSubtasksCompleted,
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
    const updatedTask: Partial<Task> = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    if (data.dueDate === undefined || data.dueDate === null) {
      (updatedTask as any).dueDate = null;
    }
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
       <header className="container mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-headline font-bold tracking-tight">TaskMaster</h1>
            <p className="text-sm text-muted-foreground">
              Master your day. Bring clarity to your work.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a New Task</DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <TaskForm onTaskAdd={handleAddTask} />
                </div>
              </DialogContent>
            </Dialog>
            <Avatar>
              <AvatarImage src={user.photoURL ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => auth.signOut()}>Sign Out</Button>
          </div>
        </header>
      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mt-2">
          <TaskList 
            groupedTasks={groupedTasks} 
            allTasksEmpty={allTasksEmpty}
            onTaskDelete={handleDeleteTask} 
            onTaskToggle={handleToggleTask} 
            onSubtaskToggle={handleToggleSubtask}
            onTaskEdit={handleEditTask} 
            onTaskAdd={handleAddTask}
            loading={tasksLoading && optimisticTasks.length === 0} 
          />
        </div>
      </main>
    </div>
  );
}
