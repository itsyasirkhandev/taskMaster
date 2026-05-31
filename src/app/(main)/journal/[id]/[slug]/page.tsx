"use client"

import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase/provider"
import { useDoc } from "@/firebase/firestore/use-doc"
import { doc } from "firebase/firestore"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { slugify } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/loader"
import { ArrowLeft, Edit2 } from "lucide-react"
import Link from "next/link"
import type { Journal, JournalWithId } from "@/lib/types"

export default function JournalDetailPage() {
  const params = useParams()
  const id = params.id as string
  const urlSlug = params.slug as string
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const firestore = useFirestore()

  const docRef = firestore && id ? doc(firestore, "journals", id) : null
  const { data: journalDoc, loading: docLoading } = useDoc(docRef)

  const loading = authLoading || docLoading

  // Reconcile slug client-side once data is fetched
  useEffect(() => {
    if (loading || !journalDoc || !journalDoc.exists()) return

    const journalData = journalDoc.data() as Journal
    const currentSlug = slugify(journalData.title)

    if (urlSlug !== currentSlug) {
      router.replace(`/journal/${id}/${currentSlug}`)
    }
  }, [loading, journalDoc, urlSlug, id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="h-12 w-12" />
      </div>
    )
  }

  if (!journalDoc || !journalDoc.exists()) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-headline mb-3 text-foreground">Entry not found</h2>
          <p className="text-muted-foreground mb-6">
            The journal entry you are looking for might have been deleted or never existed.
          </p>
          <Link href="/journal">
            <Button className="w-full sm:w-auto min-w-[min(100%,200px)]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Journals
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const journalData = {
    id,
    ...journalDoc.data()
  } as JournalWithId

  if (journalData.userId !== user?.uid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold font-headline mb-3 text-destructive">Unauthorized Access</h2>
          <p className="text-muted-foreground mb-6">
            You do not have permission to view this journal entry.
          </p>
          <Link href="/journal">
            <Button variant="outline" className="w-full sm:w-auto min-w-[min(100%,200px)]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Journals
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Format dates beautifully
  const createdAt = journalData.createdAt?.toDate()
  const updatedAt = journalData.updatedAt?.toDate()
  const hasBeenUpdated = updatedAt && createdAt && updatedAt.getTime() - createdAt.getTime() > 1000

  const formattedDate = createdAt?.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = createdAt?.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-12">
      {/* Outer wrapper to center with padding */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        
        {/* Header toolbar */}
        <header className="flex justify-between items-center mb-8 gap-4">
          <Link href="/journal">
            <Button variant="ghost" size="sm" className="h-9 px-3 gap-1.5 hover:bg-accent min-w-[fit-content]">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </Link>
          
          <Link href={`/journal/${id}/edit`}>
            <Button variant="outline" size="sm" className="h-9 px-4 gap-1.5 hover:bg-accent min-w-[fit-content]">
              <Edit2 className="h-4 w-4" />
              <span>Edit Entry</span>
            </Button>
          </Link>
        </header>

        {/* Main Details Container with @container query enabling responsive inner layouts */}
        <div className="@container container-type-inline-size">
          
          <article className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 @md:p-8 transition-all duration-300">
            
            {/* Meta Information Row */}
            <div className="flex flex-col @sm:flex-row @sm:items-center @sm:justify-between gap-3 mb-6 pb-6 border-b border-border/40">
              <div className="w-fit text-xs text-muted-foreground/80 font-medium">
                {formattedDate && (
                  <span>
                    {formattedDate} {formattedTime && `at ${formattedTime}`}
                  </span>
                )}
                {hasBeenUpdated && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground uppercase font-semibold">
                    Edited
                  </span>
                )}
              </div>
            </div>

            {/* Title - Fluid typography using clamp() based on container width query */}
            <h1 className="text-[clamp(1.75rem,7cqw,2.75rem)] font-headline font-bold leading-tight tracking-tight text-foreground mb-4 select-text">
              {journalData.title}
            </h1>

            {/* Tags section */}
            {journalData.tags && journalData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {journalData.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] uppercase tracking-wider font-semibold bg-secondary text-secondary-foreground px-3 py-1 rounded-full border border-border/40 max-w-max"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description/Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground font-body leading-relaxed text-lg select-text min-w-[min(100%,320px)]">
                {journalData.description}
              </p>
            </div>
            
          </article>
        </div>
      </div>
    </div>
  )
}
