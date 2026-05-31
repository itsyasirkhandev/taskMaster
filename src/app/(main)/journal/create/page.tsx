"use client"

import { useUser } from "@/firebase/auth/use-user"
import { useFirestore } from "@/firebase/provider"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { JournalForm } from "@/components/journal-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { JournalFormValues, Journal } from "@/lib/types"

export default function CreateJournalPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: JournalFormValues) => {
    if (!user || !firestore) return

    setIsSubmitting(true)
    try {
      const tagsArray = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      
      const newJournal: Partial<Journal> = {
        title: data.title,
        description: data.description,
        tags: tagsArray,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(firestore, "journals"), newJournal)
      
      toast({ title: "Journal entry created!" })
      router.push("/journal")
    } catch (error) {
      console.error(error)
      toast({ title: "Failed to create entry", variant: "destructive" })
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
           <h1 className="text-2xl font-bold">New Journal Entry</h1>
        </div>
        <JournalForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </header>
    </div>
  )
}
