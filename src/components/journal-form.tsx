"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { JournalSchema, type JournalFormValues } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"

interface JournalFormProps {
  initialValues?: Partial<JournalFormValues>;
  onSubmit: (data: JournalFormValues) => void;
  isSubmitting?: boolean;
}

export function JournalForm({ initialValues, onSubmit, isSubmitting }: JournalFormProps) {
  const form = useForm<JournalFormValues>({
    resolver: zodResolver(JournalSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      tags: initialValues?.tags || "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My thoughts today" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your journal entry here..." 
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., work, personal, ideas" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
             <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
             <><Save className="mr-2 h-4 w-4" /> Save Entry</>
          )}
        </Button>
      </form>
    </Form>
  )
}
