# Implementation Plan: Drag and Drop Task Reordering

## Goal
Enable users to reorder tasks within their respective categories using drag-and-drop.

## Dependencies
- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Proposed Changes

### 1. Data Model & Types
**File:** `src/lib/types.ts`
- Update `Task` and `TaskWithId` types to include optional `order: number`.

### 2. Component: `SortableTaskItem`
**File:** `src/components/sortable-task-item.tsx` (New)
- Wrapper component using `useSortable` from `@dnd-kit/sortable`.
- Renders the existing `TaskItem`.
- Adds a drag handle (grip icon) to the `TaskItem` (requires updating `TaskItem` to accept a handle slot or similar).
- **Actually**, better to wrap `TaskItem` and pass `attributes` and `listeners` to a specific handle element inside `TaskItem`.
- **Plan:** Modify `TaskItem` to accept `dragHandleProps` (attributes + listeners) and render a grip icon if provided.

### 3. Update `TaskItem`
**File:** `src/components/task-item.tsx`
- Import `GripVertical` from `lucide-react`.
- Add optional props for drag attributes and listeners.
- Render grip icon on the left side of the card if props exist.

### 4. Update `TaskList`
**File:** `src/components/task-list.tsx`
- Import `DndContext`, `DragOverlay`, `closestCorners`, `KeyboardSensor`, `PointerSensor`, `useSensor`, `useSensors`.
- Import `SortableContext`, `verticalListSortingStrategy`.
- Wrap the grid in `DndContext`.
- Wrap each category's list in `SortableContext` with `items` mapped to task IDs.
- Implement `onDragEnd`:
  - Check if `active.id` !== `over.id`.
  - Call `onTaskReorder(activeId, overId)` prop.

### 5. Update `page.tsx` (Logic Hub)
**File:** `src/app/page.tsx`
- **Sorting:** Update `sortedTasks` logic to sort by `order` (ascending) first, then `createdAt`.
- **Creation:** Update `handleAddTask` to calculate new `order`.
  - Query existing tasks in that category to find max `order`, set new task `order = max + 1`.
- **Reordering:** Implement `handleTaskReorder`:
  - Locate the tasks in the local state.
  - Use `arrayMove` (from dnd-kit) logic to find new index.
  - Calculate new order values for affected tasks.
  - **Batch Update:** Use Firestore `writeBatch` to update the `order` field of all tasks in that category to reflect the new sequence.

## Technical Details

**Sorting Logic in `page.tsx`:**
```typescript
const sortedTasks = combinedTasks.sort((a, b) => {
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  if (orderA !== orderB) return orderA - orderB;
  return a.createdAt!.toMillis() - b.createdAt!.toMillis();
});
```

**Reordering Logic:**
- We will restrict dragging to *within* the same category for now to simplify. `dnd-kit` handles this by checking container.
- If we allow cross-category, we need to update `category` field too. The prompt says "in a category", implying intra-category. We will assume intra-category for this iteration.

## Steps

1. **Install packages**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
2. **Update Types**: Add `order` field.
3. **Update `TaskItem`**: Add drag handle support.
4. **Create `SortableTaskItem`**: Bridge between dnd-kit and TaskItem.
5. **Update `TaskList`**: Implement DND context and sensors.
6. **Update `page.tsx`**: Implement sorting and batch update logic.

## Verification
- Verify new tasks appear at the bottom.
- Verify dragging updates order locally.
- Verify dropping persists order to Firestore.
- Verify order is maintained after refresh.
