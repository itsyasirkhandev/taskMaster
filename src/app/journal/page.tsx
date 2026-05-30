"use client"

import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase/provider"
import { useCollection } from "@/firebase/firestore/use-collection"
import { collection, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react"
import { Loader } from "@/components/loader"
import Link from "next/link"
import type { JournalWithId } from "@/lib/types"

export default function JournalListPage() {
  const { user, loading } = useUser()
  const firestore = useFirestore()
  const router = useRouter()

  const journalsQuery = useMemo(() => {
    if (!user || !firestore) return null
    return query(
      collection(firestore, "journals"),
      where("userId", "==", user.uid)
    )
  }, [user, firestore])

  const { data: journalsData, loading: journalsLoading } = useCollection(journalsQuery)

  if (loading || !user) {
     return <div className="min-h-screen flex items-center justify-center"><Loader className="h-12 w-12" /></div>
  }

  const journals = journalsData?.docs.map(d => ({
     id: d.id,
     ...d.data(),
     createdAt: d.data().createdAt as Timestamp,
     updatedAt: d.data().updatedAt as Timestamp,
  })) as JournalWithId[] || []
  
  // Sort by createdAt desc in memory to avoid composite index requirement
  journals.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
  });

  const handleDelete = async (id: string) => {
     if (!confirm("Are you sure you want to delete this journal entry?")) return;
     if (!firestore) return;
     try {
         await deleteDoc(doc(firestore, "journals", id));
     } catch (e) {
         console.error("Failed to delete journal", e);
     }
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
           <div>
             <h1 className="text-2xl font-headline font-bold tracking-tight">Journals</h1>
           </div>
        </div>
        <Link href="/journal/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {journalsLoading ? (
           <div className="flex justify-center"><Loader className="h-8 w-8" /></div>
        ) : journals.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground">
             No journal entries found. Create your first one!
           </div>
        ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {journals.map(journal => (
               <Card key={journal.id} className="flex flex-col">
                 <CardHeader>
                   <CardTitle className="line-clamp-1">{journal.title}</CardTitle>
                   <CardDescription>
                      {journal.createdAt?.toDate().toLocaleDateString()}
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="flex-1">
                   <p className="text-sm line-clamp-4 whitespace-pre-wrap">{journal.description}</p>
                   {journal.tags && journal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {journal.tags.map((tag, i) => (
                           <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                             {tag}
                           </span>
                        ))}
                      </div>
                   )}
                 </CardContent>
                 <CardFooter className="flex justify-end gap-2">
                   <Link href={`/journal/${journal.id}/edit`}>
                     <Button variant="outline" size="sm">
                       <Edit2 className="h-4 w-4" />
                     </Button>
                   </Link>
                   <Button variant="destructive" size="sm" onClick={() => handleDelete(journal.id)}>
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </CardFooter>
               </Card>
             ))}
           </div>
        )}
      </main>
    </div>
  )
}
