# Drag and Drop Specification

## 1. Problem Statement

As users interact with the task board, they have no intuitive way to reorganize tasks within a category or easily move tasks between different categories. 

This makes it difficult for users to:

* Reorder and prioritize tasks within a specific category
* Move tasks across categories when their priority or urgency changes
* Maintain a customized layout of tasks that persists across reloads

Solution: This feature introduces full drag-and-drop functionality to solve this problem, supporting sorting both inside categories and across them.

## 2. Functional Requirements

The system should:

* Display tasks in columns/lists based on their current category
* Allow users to click, hold, and drag a task item
* Allow dropping the task in a new position within its current category to reorder it
* Allow dropping the task into a different category to change its category and position
* Display a visual drag overlay while the user is dragging the task
* Automatically and instantly update the visual order upon dropping (optimistic UI without flickering)
* Persist the new task order efficiently in the database using a dedicated "Array of IDs" approach per category
* Update a task's category field when it is moved across categories

## 3. inputs and outputs: Drag and Drop Behavior

**USER ACTION (INPUT)**
When a user drags a task from its starting position and drops it in a new location

**EXPECTED SYSTEM BEHAVIOR**

* The task immediately visually shifts to the new specified position 
* If dropped in a different category, its category changes visually in the board
* The system silently updates the persistent storage, modifying the specific arrays of task IDs for the affected categories to record the new order

## 4. Constraints

* The drag-and-drop UI should feel responsive (instant visual feedback)
* The board layout must remain stable without layout shift during the drag operation
* Database operations must be heavily optimized: the system should use an "array of IDs" approach rather than updating an index field on every single task document, avoiding excessive Firestore writes
* Empty categories must still provide a valid drop zone for incoming tasks

## 5. Edge Cases and Error Handling

* **User drags an item but drops it outside any valid droppable area**
* The task snaps back smoothly to its original position

* **Database update fails after a drop**
* Show message: "Failed to save new order. Please try again."
* Revert the task visually to its previous state/position

* **No tasks in a destination category**
* The empty category should gracefully accept the dropped task

* **Fast, repeated dragging across multiple lists**
* Ensure optimistic UI updates don't conflict with in-flight server requests and cause flickering

## 6. Acceptance Criteria

This feature is considered complete if:

* Users can smoothly reorder tasks within any category list via drag and drop
* Users can smoothly drag tasks from one category list and drop them into another
* The visual UI updates instantly without any flickering or snapping back
* The database schema successfully transitions to using arrays of IDs for maintaining order per category
* Read/write costs to Firestore are minimized when sorting
* Edge cases and errors (like dropping outside droppable areas or network failures) are handled seamlessly
