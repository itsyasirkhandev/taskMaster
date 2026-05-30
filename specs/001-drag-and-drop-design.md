## Design Plan: Drag and Drop Task Ordering

Technical specification for implementing a scalable drag-and-drop feature for tasks using React, `@dnd-kit`, and Cloud Firestore.

## 1. Objective

Implement a drag-and-drop task ordering system that allows users to:

* Reorder tasks within a specific category
* Move tasks across different categories seamlessly
* Persist the ordering efficiently in Firestore
* Experience instant optimistic UI updates without layout shifting or flickering

## 2. Tech Stack

* **Frontend:** React (Next.js)
* **Drag-and-Drop Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
* **Database:** Cloud Firestore
* **State Management:** React Local State paired with Firebase real-time listeners

**Why this stack?**

* `@dnd-kit` provides a lightweight, highly customizable, and accessible hook-based API specifically designed for React.
* Cloud Firestore integrates natively into our current architecture, and batched writes provide atomic updates to multiple documents (the task arrays and the tasks themselves).
* Local React state overlaid on real-time Firebase listeners is the NotebookLM-recommended approach to avoid "flickering" while providing optimistic updates.

## 3. High-Level Architecture

The feature is divided into three responsibilities:

**A. Frontend (React & @dnd-kit)**

* Render multiple `SortableContext` drop zones (one per category) inside a root `DndContext`
* Handle `onDragOver` and `onDragEnd` events to calculate the new order and category
* Maintain local optimistic state of the category task arrays

**B. Data Persistence (Firestore)**

* Expose batched write methods to atomically update both a task's internal `category` field and the centralized `task_orders` arrays.
* Listen to changes from `task_orders` and `tasks` to sync data changes.

**C. Database Schema (Firestore)**

* A centralized `settings/task_orders` document stores the task arrays per category to avoid heavy write costs associated with indexing each document individually.

**ARCHITECTURE FLOW**
Frontend (`@dnd-kit` Events) -> Optimistic Local State Update -> Batched Firestore Write (`writeBatch`) -> Background Sync

## 4. Data Model

We will adapt the Firestore schema to offload the order index from the `tasks` documents to a dedicated settings document.

**Task Document (`users/{uid}/tasks/{taskId}`)**
* No longer requires an `order` field.
* `category` field is preserved (to track the task's parent if queried directly).

**Task Orders Document (`users/{uid}/settings/task_orders`)**
Stores arrays of task IDs representing the visual top-to-bottom order for each category.

```json
{
  "Urgent & Important": ["task_101", "task_502"],
  "Unurgent & Important": ["task_304"],
  "Urgent & Unimportant": [],
  "Unurgent & Unimportant": ["task_201", "task_809"]
}
```

## 5. Core Design Decisions

**Decision 1: Store order arrays in a single settings document**
*Why:* Updating an integer `order` field on every task document when sorting requires `O(N)` writes. Using arrays of IDs within a single document requires `O(1)` write per category affected, drastically reducing Firestore costs and latency.

**Decision 2: Use client-side UUID generation for new tasks**
*Why:* To keep the `task_orders` array in sync, we need the task ID immediately. Generating the ID via `uuid` on the client allows us to use Firestore's `writeBatch` to `setDoc` the new task and `updateDoc` the array simultaneously, ensuring atomic consistency.

**Decision 3: Maintain local state Overlay for Optimistic UI**
*Why:* Relying purely on Firestore's default real-time sync during heavy drag-and-drop operations causes noticeable flickering. Updating a local React state variable inside `onDragEnd` alongside the Firebase mutation prevents snapping back to old positions.

## 6. Core Functional Flows

**A. Dragging Across Categories**
Triggered by `@dnd-kit`'s `onDragOver` or `onDragEnd`.
1. Calculate the new array order locally.
2. Remove the task ID from the source category array and insert it into the destination array.
3. Batch update the `task_orders` document and the task's `category` field in Firestore.

```typescript
const batch = writeBatch(firestore);

// Update order arrays
const settingsRef = doc(firestore, `users/${user.uid}/settings/task_orders`);
batch.update(settingsRef, {
  "Urgent & Important": newSourceArray,
  "Unurgent & Important": newDestinationArray,
});

// Update the task's explicit category
const taskRef = doc(firestore, `users/${user.uid}/tasks/${taskId}`);
batch.update(taskRef, { category: "Unurgent & Important" });

await batch.commit();
```

**B. Adding a Task**
1. Generate `taskId` via `uuidv4()`.
2. Push `taskId` to the relevant category array.
3. Batch write both the new task document and the updated `task_orders` array.

**C. Deleting a Task**
1. Filter the `taskId` out of the relevant category array.
2. Batch delete the task document and update the `task_orders` array.

## 7. Development Plan

1. **Firestore Migrations:** Implement logic to initialize the `users/{uid}/settings/task_orders` document upon load, auto-populating arrays if they are missing based on existing task dates/order.
2. **Frontend `@dnd-kit` Integration:** Refactor `TaskList` to use a global `DndContext` and individual `SortableContext` instances for each category. Implement `onDragEnd` (and potentially `onDragOver`).
3. **Data Fetching & Optimistic Updates:** Update the custom data-fetching flow to read the `task_orders` arrays to determine the sorting instead of sorting locally by the deprecated `order` field.
4. **CRUD Adjustments:** Migrate `handleAddTask`, `handleDeleteTask`, and `handleTaskReorder` to use client-generated IDs and `writeBatch` interactions.
