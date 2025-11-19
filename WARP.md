# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

IUUtask is a Next.js 15 task management application implementing the Eisenhower Matrix (4-quadrant prioritization system). Built with Firebase Authentication & Firestore, ShadCN UI, and TypeScript. The app features real-time task updates, optimistic UI, and Google GenKit AI integration.

## Development Commands

### Primary Commands
- `npm run dev` - Start dev server with Turbopack on port 9002
- `npm run build` - Production build (sets NODE_ENV=production)
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linting
- `npm run typecheck` - Run TypeScript compiler checks without emitting files

### AI/GenKit Commands
- `npm run genkit:dev` - Start GenKit development server
- `npm run genkit:watch` - Start GenKit with auto-reload on changes

## Architecture

### Firebase Integration Pattern

**Critical**: This codebase uses a custom Firebase provider pattern with centralized error handling, NOT standard Firebase hooks.

#### Provider Hierarchy
```
RootLayout
  └─ FirebaseClientProvider (initializes Firebase app, auth, firestore)
      └─ FirebaseProvider (Context provider)
          └─ FirebaseErrorListener (global error handling)
```

#### Hooks
- `useFirebase()` - Returns `{ firebaseApp, auth, firestore }`
- `useAuth()` - Returns auth instance only
- `useFirestore()` - Returns firestore instance only
- `useUser()` - Returns `{ user, userProfile, loading }` with auth state
- `useCollection(query)` - Real-time collection subscription
- `useDoc(docRef)` - Real-time document subscription (exists but not shown above)

#### Error Handling Pattern
All Firestore operations use a centralized error emitter instead of try-catch blocks:

```typescript
// Operations emit errors to errorEmitter instead of throwing
addDoc(collection).catch(serverError => {
  errorEmitter.emit('permission-error', new FirestorePermissionError({
    path: collection.path,
    operation: 'create',
    requestResourceData: data
  }));
});
```

`FirebaseErrorListener` component listens to these events and displays toast notifications.

### Data Model

**Firestore Structure:**
```
users/{userId}
  - User profile (uid, email, displayName, photoURL)
  
  tasks/{taskId}
    - description: string
    - category: "Urgent & Important" | "Unurgent & Important" | "Urgent & Unimportant" | "Unurgent & Unimportant"
    - completed: boolean
    - dueDate?: Date
    - subtasks: Array<{ id: string, description: string, completed: boolean }>
    - createdAt: Timestamp
    - updatedAt: Timestamp
```

**Security Model:** Strict user-ownership enforced in `firestore.rules`. Users can only access documents under `/users/{theirUid}/`. No list operations allowed at top level.

### Optimistic UI Pattern

The app implements optimistic updates for task creation:
1. Immediately add task to local state with UUID
2. Show in UI instantly
3. Submit to Firestore
4. Remove optimistic task once real task appears via real-time subscription
5. If server fails, remove optimistic task and show error

See `handleAddTask` in `src/app/page.tsx` for implementation.

### Component Structure

- **`src/components/ui/`** - ShadCN components (auto-generated, use `npx shadcn@latest add <component>`)
- **`src/components/`** - Custom components:
  - `task-form.tsx` - Add task form with react-hook-form + Zod validation
  - `edit-task-form.tsx` - Edit existing task
  - `task-list.tsx` - Displays Eisenhower Matrix quadrants
  - `task-item.tsx` - Individual task with subtasks
  - `FirebaseErrorListener.tsx` - Global error toast handler
  - `loader.tsx` - Loading spinner

### Route Structure

- `/` - Main dashboard (protected, redirects to `/auth` if not signed in)
- `/auth` - Google sign-in page

Protected routes check auth in component `useEffect`, not middleware.

### TypeScript Configuration

- Path alias: `@/*` maps to `src/*`
- Target: ES2017
- Strict mode enabled
- Build ignores TypeScript and ESLint errors (see `next.config.ts`)

### AI Integration

GenKit AI is configured in `src/ai/genkit.ts` using Google AI's Gemini 2.5 Flash model. Integration setup exists but AI features may not be actively used in current UI.

## Environment Variables

Required in `.env.local` (see `.env.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Testing

No test framework is currently configured. When adding tests, check README for any testing approach or establish one based on Next.js conventions.

## Styling

- **Framework:** Tailwind CSS
- **Component System:** ShadCN UI (default style, neutral base color, CSS variables enabled)
- **Font:** Montserrat (loaded from Google Fonts in layout)
- **Icons:** Lucide React

## Common Patterns

### Adding a new Firebase hook
1. Create in `src/firebase/` or subdirectory
2. Use `useFirestore()` or `useAuth()` to access Firebase instances
3. Emit errors to `errorEmitter` for permission issues
4. Return `{ data, loading, error }` pattern for consistency

### Adding a new task field
1. Update `Task` and `TaskWithId` types in `src/lib/types.ts`
2. Update Zod schema in form components
3. Update form UI in `task-form.tsx` and `edit-task-form.tsx`
4. Update Firestore security rules if needed (optional validation)
5. Update task display in `task-item.tsx`

### Working with Firestore timestamps
- Use `serverTimestamp()` when writing to Firestore
- Cast to `Timestamp` when reading: `(data.createdAt as Timestamp).toDate()`
- Type as `FieldValue` for writes, `Timestamp` for reads

## Deployment

Configured for Firebase App Hosting (see `apphosting.yaml`). Max 1 instance currently configured.

## Known Configuration Notes

- TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`)
- Development server runs on port 9002 (not default 3000)
- Turbopack is enabled by default for dev server
- Remote images allowed from: placehold.co, images.unsplash.com, picsum.photos
