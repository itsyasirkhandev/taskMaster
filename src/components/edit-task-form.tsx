"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Save } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { TaskWithId } from "@/lib/types"

const formSchema = z.object({
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  dueDate: z.date().optional(),
  category: z.string({
    required_error: "Please select a category.",
  }),
})

export type EditTaskFormValues = z.infer<typeof formSchema>

interface EditTaskFormProps {
  task: TaskWithId;
  onTaskEdit: (data: EditTaskFormValues) => void;
  onClose: () => void;
}

export function EditTaskForm({ task, onTaskEdit, onClose }: EditTaskFormProps) {
  const { toast } = useToast();
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: task.description,
      dueDate: task.dueDate,
      category: task.category,
    },
  })

  function onSubmit(data: EditTaskFormValues) {
    onTaskEdit(data);
    onClose();
    toast({
      title: "Success!",
      description: "Your task has been updated.",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Finish project report" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Urgent & Important">Urgent & Important</SelectItem>
                  <SelectItem value="Unurgent & Important">Unurgent & Important</SelectItem>
                  <SelectItem value="Urgent & Unimportant">Urgent & Unimportant</SelectItem>
                  <SelectItem value="Unurgent & Unimportant">Unurgent & Unimportant</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  )
}
