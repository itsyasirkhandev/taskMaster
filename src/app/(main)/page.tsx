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
import { MobileFab } from "@/components/navigation/mobile-fab";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, Timestamp, writeBatch, getDocs, query, where, setDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { EditTaskFormValues } from "@/components/edit-task-form";
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Loader } from "@/components/loader";
import { arrayMove } from "@dnd-kit/sortable";

export default function Home() {
  const { user, loading } = useUser();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Partial<TaskWithId> & { _deleted?: boolean }>>({});
  const [optimisticTaskOrders, setOptimisticTaskOrders] = useState<Record<string, string[]> | null>(null);

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
  
  const taskOrdersRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid, "settings", "task_orders");
  }, [user, firestore]);

  const { data: taskOrdersDoc, loading: taskOrdersLoading } = useDoc(taskOrdersRef);

  useEffect(() => {
    if (taskOrdersDoc?.exists() && optimisticTaskOrders) {
      const dbOrders = taskOrdersDoc.data() as Record<string, string[]>;
      
      const isSynced = Object.keys(optimisticTaskOrders).every(category => {
        const opt = optimisticTaskOrders[category] || [];
        const db = dbOrders[category] || [];
        return opt.length === db.length && opt.every((val, index) => val === db[index]);
      });
      if (isSynced) {
        setOptimisticTaskOrders(null);
      }
    }
  }, [taskOrdersDoc, optimisticTaskOrders]);

  const { groupedTasks, allTasksEmpty, liveTasks } = useMemo(() => {
    const liveTasks = tasks?.docs
      .map(d => ({
        id: d.id, 
        ...d.data(),
        dueDate: (d.data().dueDate as Timestamp)?.toDate(),
        createdAt: d.data().createdAt as Timestamp | null,
        subtasks: d.data().subtasks || [],
      }))
      .filter(task => task.createdAt) as TaskWithId[] || [];
      
    let combinedTasks = liveTasks
       .map(t => optimisticTasks[t.id] ? { ...t, ...optimisticTasks[t.id] } as TaskWithId : t)
       .filter(t => !optimisticTasks[t.id]?._deleted);
       
    Object.values(optimisticTasks).forEach(optTask => {
       if (!liveTasks.find(t => t.id === optTask.id) && !optTask._deleted) {
           combinedTasks.push(optTask as TaskWithId);
       }
    });

    const taskOrders = optimisticTaskOrders || (taskOrdersDoc?.exists() ? taskOrdersDoc.data() : {});

    const grouped = combinedTasks.reduce((acc, task) => {
      const category = task.columnState === "Completed" ? "Completed" : task.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {
      "Urgent & Important": [],
      "Unurgent & Important": [],
      "Urgent & Unimportant": [],
      "Unurgent & Unimportant": [],
      "Completed": [],
    } as Record<string, TaskWithId[]>);

    for (const category of Object.keys(grouped)) {
       const orderArray = taskOrders[category] || [];
       grouped[category].sort((a, b) => {
         const indexA = orderArray.indexOf(a.id);
         const indexB = orderArray.indexOf(b.id);
         if (indexA !== -1 && indexB !== -1) return indexA - indexB;
         if (indexA !== -1) return -1;
         if (indexB !== -1) return 1;
         const timeA = a.createdAt?.toMillis?.() || 0;
         const timeB = b.createdAt?.toMillis?.() || 0;
         return timeA - timeB;
       });
    }

    const allEmpty = Object.values(grouped).every(arr => arr.length === 0);
    return { groupedTasks: grouped, allTasksEmpty: allEmpty, liveTasks };
  }, [tasks, optimisticTasks, optimisticTaskOrders, taskOrdersDoc]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground flex items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  const handleAddTask = async (data: TaskFormValues) => {
    if (!tasksQuery || !user || !firestore) return;

    const optimisticId = uuidv4();
    const now = new Date();

    const optimisticTask: TaskWithId = {
      id: optimisticId,
      description: data.description,
      category: data.category as TaskWithId['category'],
      columnState: (data as any).columnState || "Active",
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
    
    setOptimisticTasks(prev => ({ ...prev, [optimisticId]: optimisticTask }));

    const currentOrders = optimisticTaskOrders || (taskOrdersDoc?.exists() ? taskOrdersDoc.data() : {});
    const catOrders = [...(currentOrders[data.category] || groupedTasks[data.category].map(t => t.id))];
    catOrders.push(optimisticId);
    
    const newOrders = { ...currentOrders, [data.category]: catOrders };
    setOptimisticTaskOrders(newOrders);
    setIsAddTaskDialogOpen(false);

    const newTask: Partial<Task> & { subtasks?: { id: string; description: string; completed: boolean }[] } = {
      description: data.description,
      category: data.category as Task['category'],
      columnState: (data as any).columnState || "Active",
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subtasks: optimisticTask.subtasks,
    };
    
    if (data.dueDate) newTask.dueDate = data.dueDate;

    const batch = writeBatch(firestore);
    const taskRef = doc(firestore, "users", user.uid, "tasks", optimisticId);
    batch.set(taskRef, newTask);

    const settingsRef = doc(firestore, "users", user.uid, "settings", "task_orders");
    batch.set(settingsRef, newOrders, { merge: true });

    try {
      await batch.commit();
      setOptimisticTasks(prev => {
          const next = { ...prev };
          delete next[optimisticId];
          return next;
      });
    } catch (serverError) {
      setOptimisticTasks(prev => {
          const next = { ...prev };
          delete next[optimisticId];
          return next;
      });
      setOptimisticTaskOrders(null);
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

    let category: string | null = null;
    for (const [cat, tasks] of Object.entries(groupedTasks)) {
      if (tasks.find(t => t.id === id)) {
        category = cat;
        break;
      }
    }

    setOptimisticTasks(prev => ({ ...prev, [id]: { _deleted: true } }));

    let newOrders: Record<string, string[]> | null = null;
    if (category) {
        const currentOrders = optimisticTaskOrders || (taskOrdersDoc?.exists() ? taskOrdersDoc.data() : {});
        const catOrders = (currentOrders[category] || groupedTasks[category].map(t => t.id)).filter((tId: string) => tId !== id);
        newOrders = { ...currentOrders, [category]: catOrders };
        setOptimisticTaskOrders(newOrders);
    }

    const batch = writeBatch(firestore);
    const taskRef = doc(firestore, "users", user.uid, "tasks", id);
    batch.delete(taskRef);

    if (newOrders) {
        const settingsRef = doc(firestore, "users", user.uid, "settings", "task_orders");
        batch.set(settingsRef, newOrders, { merge: true });
    }

    batch.commit().then(() => {
        setOptimisticTasks(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }).catch(async (serverError) => {
      setOptimisticTasks(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
      });
      setOptimisticTaskOrders(null);
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
    
    const processedSubtasks = data.subtasks
      ?.filter(sub => sub.description.trim() !== '')
      .map(sub => ({
        id: sub.id,
        description: sub.description,
        completed: sub.completed
      })) || [];
    
    const updatedTask: Partial<Task> = {
      description: data.description,
      category: data.category as Task['category'],
      columnState: (data as any).columnState || "Active",
      subtasks: processedSubtasks,
      updatedAt: serverTimestamp(),
    };
    
    if (data.dueDate === undefined || data.dueDate === null) {
      (updatedTask as any).dueDate = null;
    } else {
      updatedTask.dueDate = data.dueDate;
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

  const handleDragOverCategory = (activeId: string, overId: string, sourceCategory: string, destinationCategory: string) => {
      if (sourceCategory === destinationCategory) return;
      
      const sourceArray = groupedTasks[sourceCategory].map(t => t.id);
      const destArray = groupedTasks[destinationCategory].map(t => t.id);

      const activeIndex = sourceArray.indexOf(activeId);
      const overIndex = destArray.indexOf(overId);

      if (activeIndex === -1) return;

      sourceArray.splice(activeIndex, 1);
      destArray.splice(overIndex >= 0 ? overIndex : destArray.length, 0, activeId);

      setOptimisticTaskOrders((prev) => {
          const currentOrders = prev || (taskOrdersDoc?.exists() ? taskOrdersDoc.data() : {});
          return {
              ...currentOrders,
              [sourceCategory]: sourceArray,
              [destinationCategory]: destArray
          };
      });

      setOptimisticTasks(prev => {
          const existing = prev[activeId] || {};
          const newCategory = destinationCategory === "Completed" ? existing.category : destinationCategory as Task['category'];
          const newColumnState = destinationCategory === "Completed" ? "Completed" : "Active";
          return { ...prev, [activeId]: { ...existing, id: activeId, category: newCategory, columnState: newColumnState } };
      });
  };

  const handleDragEndCategory = async (activeId: string, overId: string, sourceCategory: string, destinationCategory: string, originalCategory?: string) => {
      if (!user || !firestore) return;

      const currentOrders = optimisticTaskOrders || (taskOrdersDoc?.exists() ? taskOrdersDoc.data() : {});
      
      let sourceArray = groupedTasks[sourceCategory].map(t => t.id);
      let destArray = sourceCategory === destinationCategory 
          ? sourceArray 
          : groupedTasks[destinationCategory].map(t => t.id);

      const activeIndex = sourceArray.indexOf(activeId);
      const overIndex = destArray.indexOf(overId);

      if (activeIndex === -1) return;

      if (sourceCategory === destinationCategory) {
          if (activeIndex !== overIndex && overIndex !== -1) {
              sourceArray = arrayMove(sourceArray, activeIndex, overIndex);
              destArray = sourceArray;
          } else if (overIndex === -1 && overId === destinationCategory) {
              // dropped on empty space in same category, push to end
              sourceArray.splice(activeIndex, 1);
              sourceArray.push(activeId);
              destArray = sourceArray;
          }
      } else {
          sourceArray.splice(activeIndex, 1);
          destArray.splice(overIndex >= 0 ? overIndex : destArray.length, 0, activeId);
      }

      const newOrders = {
          ...currentOrders,
          [sourceCategory]: sourceArray,
          [destinationCategory]: destArray
      };

      setOptimisticTaskOrders(newOrders);
      setOptimisticTasks(prev => {
          const existing = prev[activeId] || {};
          const newCategory = destinationCategory === "Completed" ? existing.category : destinationCategory as Task['category'];
          const newColumnState = destinationCategory === "Completed" ? "Completed" : "Active";
          // If moved into completed, mark completed
          const isCompleted = destinationCategory === "Completed" ? true : existing.completed;
          return { ...prev, [activeId]: { ...existing, id: activeId, category: newCategory, columnState: newColumnState, completed: isCompleted } };
      });

      const batch = writeBatch(firestore);
      const settingsRef = doc(firestore, "users", user.uid, "settings", "task_orders");
      batch.set(settingsRef, newOrders, { merge: true });

      const categoryChanged = originalCategory ? originalCategory !== destinationCategory : sourceCategory !== destinationCategory;

      if (categoryChanged) {
          const taskRef = doc(firestore, "users", user.uid, "tasks", activeId);
          
          let updateData: Partial<Task> = { updatedAt: serverTimestamp() };
          
          if (destinationCategory === "Completed") {
             updateData.columnState = "Completed";
             updateData.completed = true;
          } else {
             updateData.columnState = "Active";
             updateData.category = destinationCategory as Task['category'];
          }
          
          batch.update(taskRef, updateData);
      }

      try {
          await batch.commit();
          setOptimisticTasks(prev => {
              const next = { ...prev };
              delete next[activeId];
              return next;
          });
      } catch (error) {
          setOptimisticTaskOrders(null);
          setOptimisticTasks(prev => {
              const next = { ...prev };
              delete next[activeId];
              return next;
            });
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/settings/task_orders`,
            operation: 'update',
          });
          errorEmitter.emit('permission-error', permissionError);
      }
  };

  return (
    <main className="container mx-auto max-w-7xl px-2 md:px-4 py-4 md:py-8">
      {/* Desktop Actions */}
      <div className="hidden md:flex justify-end mb-6">
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
      </div>

      <div className="mt-2">
        <TaskList 
          groupedTasks={groupedTasks} 
          allTasksEmpty={allTasksEmpty}
          onTaskDelete={handleDeleteTask} 
          onTaskToggle={handleToggleTask} 
          onSubtaskToggle={handleToggleSubtask}
          onTaskEdit={handleEditTask} 
          onTaskAdd={handleAddTask}
          onDragOverCategory={handleDragOverCategory}
          onDragEndCategory={handleDragEndCategory}
          loading={tasksLoading} 
        />
      </div>
      
      {/* Mobile Add Task FAB */}
      <MobileFab onTaskAdd={handleAddTask} />
    </main>
  );
}
