"use client"

import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase/provider"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useRouter, useParams } from "next/navigation"
import { JournalForm } from "@/components/journal-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { JournalFormValues, Journal } from "@/lib/types"
import { useDoc } from "@/firebase/firestore/use-doc"
import { Loader } from "@/components/loader"

export default function EditJournalPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useUser()
  const firestore = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const docRef = firestore && id ? doc(firestore, "journals", id) : null
  const { data: journalDoc, loading } = useDoc(docRef)

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><Loader className="h-12 w-12" /></div>
  }

  if (!journalDoc || !journalDoc.exists()) {
     return <div className="text-center py-12">Journal not found.</div>
  }

  const journalData = journalDoc.data() as Journal
  if (journalData.userId !== user?.uid) {
     return <div className="text-center py-12">Unauthorized.</div>
  }

  const initialValues: Partial<JournalFormValues> = {
    title: journalData.title,
    description: journalData.description,
    tags: journalData.tags ? journalData.tags.join(', ') : "",
  }

  const handleSubmit = async (data: JournalFormValues) => {
    if (!user || !firestore || !docRef) return

    setIsSubmitting(true)
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      
      const updates: Partial<Journal> = {
        title: data.title,
        description: data.description,
        tags: tagsArray,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(docRef, updates)
      
      toast({ title: "Journal entry updated!" })
      router.push("/journal")
    } catch (error) {
      console.error(error)
      toast({ title: "Failed to update entry", variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
           <Button variant="ghost" size="icon" onClick={() => router.push('/journal')}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
           <h1 className="text-2xl font-bold">Edit Journal Entry</h1>
        </div>
        <JournalForm initialValues={initialValues} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </header>
    </div>
  )
}
