"use client"

import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase/provider"
import { useCollection } from "@/firebase/firestore/use-collection"
import { collection, deleteDoc, doc, query, where, Timestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit2, Trash2, ArrowLeft, SearchX, CalendarIcon } from "lucide-react"
import { Loader } from "@/components/loader"
import Link from "next/link"
import type { JournalWithId } from "@/lib/types"
import { slugify, cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { startOfDay, endOfDay, format } from "date-fns"

export default function JournalListPage() {
  const { user, loading } = useUser()
  const firestore = useFirestore()
  const router = useRouter()

  const [journalToDelete, setJournalToDelete] = useState<JournalWithId | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const journalsQuery = useMemo(() => {
    if (!user || !firestore) return null
    return query(
      collection(firestore, "journals"),
      where("userId", "==", user.uid)
    )
  }, [user, firestore])

  const { data: journalsData, loading: journalsLoading } = useCollection(journalsQuery)

  if (loading || !user) {
     return <div className="min-h-screen flex items-center justify-center"><Loader size="xl" /></div>
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

  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      // Search Matching
      const queryStr = searchQuery.toLowerCase()
      const matchesSearch = !queryStr || 
        journal.title?.toLowerCase().includes(queryStr) ||
        journal.description?.toLowerCase().includes(queryStr) ||
        journal.tags?.some(tag => tag.toLowerCase().includes(queryStr))

      // Date Matching
      let matchesDate = true
      if (dateRange?.from) {
        const journalDate = journal.createdAt?.toDate()
        if (journalDate) {
           if (dateRange.to) {
              matchesDate = journalDate >= startOfDay(dateRange.from) && journalDate <= endOfDay(dateRange.to)
           } else {
              matchesDate = journalDate >= startOfDay(dateRange.from)
           }
        }
      }

      return matchesSearch && matchesDate
    })
  }, [journals, searchQuery, dateRange])

  const handleDeleteConfirm = async () => {
     if (!journalToDelete || !firestore) return;
     setIsDeleting(true);
     try {
         await deleteDoc(doc(firestore, "journals", journalToDelete.id));
         setJournalToDelete(null);
     } catch (e) {
         console.error("Failed to delete journal", e);
     } finally {
         setIsDeleting(false);
     }
  }

  return (
    <main className="container mx-auto max-w-7xl px-2 md:px-4 py-4 md:py-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-headline font-bold">Your Journals</h2>
        <div className="flex flex-wrap items-center gap-2">
           <Input
             placeholder="Search journals..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full md:w-auto md:max-w-xs"
           />
           <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className={cn(
                   "justify-start text-left font-normal w-full md:w-auto",
                   !dateRange && "text-muted-foreground"
                 )}
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {dateRange?.from ? (
                   dateRange.to ? (
                     <>
                       {format(dateRange.from, "LLL dd, y")} -{" "}
                       {format(dateRange.to, "LLL dd, y")}
                     </>
                   ) : (
                     format(dateRange.from, "LLL dd, y")
                   )
                 ) : (
                   <span>Pick a date range</span>
                 )}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="end">
               <Calendar
                 initialFocus
                 mode="range"
                 defaultMonth={dateRange?.from}
                 selected={dateRange}
                 onSelect={setDateRange}
                 numberOfMonths={2}
               />
             </PopoverContent>
           </Popover>
          <Link href="/journal/create" className="w-full md:w-auto">
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {journalsLoading ? (
         <div className="flex justify-center"><Loader size="lg" /></div>
      ) : journals.length === 0 ? (
         <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
           <p>No journal entries found. Create your first one!</p>
           <Link href="/journal/create">
             <Button>
               <Plus className="mr-2 h-4 w-4" />
               Create Entry
             </Button>
           </Link>
         </div>
      ) : filteredJournals.length === 0 ? (
         <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
           <SearchX className="h-12 w-12 text-muted-foreground/50" />
           <p>No journals match your filters.</p>
           <div className="flex gap-2">
             <Button variant="outline" onClick={() => { setSearchQuery(""); setDateRange(undefined); }}>
               Clear Filters
             </Button>
             <Link href="/journal/create">
               <Button>
                 <Plus className="mr-2 h-4 w-4" />
                 Create New Entry
               </Button>
             </Link>
           </div>
         </div>
      ) : (
         <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJournals.map(journal => (
              <Card key={journal.id} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 group relative overflow-hidden">
                <Link 
                  href={`/journal/${journal.id}/${slugify(journal.title)}`} 
                  className="flex-1 flex flex-col focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-t-lg"
                >
                  <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                    <CardTitle className="line-clamp-1 text-lg md:text-xl font-headline group-hover:text-primary transition-colors duration-300">{journal.title}</CardTitle>
                    <CardDescription className="text-[10px] md:text-xs">
                       {journal.createdAt?.toDate().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3 md:pb-4 px-4 md:px-6">
                    <p className="text-xs md:text-sm line-clamp-3 md:line-clamp-4 whitespace-pre-wrap text-muted-foreground/90 font-body leading-relaxed">{journal.description}</p>
                    {journal.tags && journal.tags.length > 0 && (
                       <div className="flex flex-wrap gap-1 md:gap-1.5 mt-3 md:mt-4">
                         {journal.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] md:text-[10px] uppercase tracking-wider font-semibold bg-secondary/80 text-secondary-foreground px-1.5 py-0.5 rounded-full border border-border/50">
                              {tag}
                            </span>
                         ))}
                       </div>
                    )}
                  </CardContent>
                </Link>
                <CardFooter className="flex justify-end gap-2 pt-2 pb-3 px-3 md:px-6 border-t border-border/30" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/journal/${journal.id}/edit`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-8 md:h-9 px-2 md:px-3 font-medium hover:bg-accent min-h-[44px] md:min-h-0 min-w-[44px]">
                      <Edit2 className="h-4 w-4 md:mr-1.5" />
                      <span className="hidden md:inline">Edit</span>
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" className="h-8 md:h-9 px-2 md:px-3 font-medium min-h-[44px] md:min-h-0 min-w-[44px]" onClick={(e) => { e.stopPropagation(); setJournalToDelete(journal); }}>
                    <Trash2 className="h-4 w-4 md:mr-1.5" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
         </div>
      )}

      <AlertDialog open={!!journalToDelete} onOpenChange={(open) => {
        if (!open && !isDeleting) setJournalToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &apos;{journalToDelete?.title}&apos;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
            >
              {isDeleting ? <Loader size="sm" className="mr-2" showText={false} /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
