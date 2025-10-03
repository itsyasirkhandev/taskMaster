"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const subtaskSchema = z.object({
  id: z.string(),
  description: z.string(),
});

const formSchema = z.object({
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  dueDate: z.date().optional(),
  category: z.string({
    required_error: "Please select a category.",
  }),
  subtasks: z.array(subtaskSchema).optional()
})

export type TaskFormValues = z.infer<typeof formSchema>

interface TaskFormProps {
  onTaskAdd: (data: TaskFormValues) => void;
}

export function TaskForm({ onTaskAdd }: TaskFormProps) {
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      subtasks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  function onSubmit(data: TaskFormValues) {
    onTaskAdd(data);
    form.reset();
    toast({
      title: "Success!",
      description: "Your new task has been added.",
    })
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Add a New Task</CardTitle>
        <CardDescription>What do you need to get done?</CardDescription>
      </CardHeader>
      <CardContent>
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
            
            <div className="space-y-4">
              <FormLabel>Sub-tasks (Optional)</FormLabel>
              {fields.map((field, index) => (
                 <FormField
                    key={field.id}
                    control={form.control}
                    name={`subtasks.${index}.description`}
                    render={({ field: subtaskField }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                           <FormControl>
                             <Input {...subtaskField} placeholder={`Sub-task ${index + 1}`} />
                           </FormControl>
                           <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                           </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                 />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: uuidv4(), description: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-task
              </Button>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
