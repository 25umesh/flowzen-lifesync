'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, hasTime } from '@/lib/utils';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { itemCategories, type FlowZenItem } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import React, { useState } from 'react';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

const reminderSchema = z.object({
    value: z.coerce.number().min(1, "Must be at least 1"),
    unit: z.enum(['minutes', 'hours', 'days', 'seconds'], { required_error: 'Please select a unit.' }),
});

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(100),
  date: z.date({
    required_error: 'A date is required.',
  }),
  category: z.enum(itemCategories, {
    required_error: 'Please select a category.',
  }),
  description: z.string().max(500).optional(),
  hasTime: z.boolean().default(false),
  time: z.string().optional(),
  email: z.string().optional(),
  reminders: z.array(reminderSchema).max(5, "You can add a maximum of 5 reminders."),
}).refine(data => {
    if (data.reminders && data.reminders.length > 0) {
        return !!data.email && data.email.length > 0 && z.string().email().safeParse(data.email).success;
    }
    return true;
}, {
    message: "A valid email address is required to set reminders.",
    path: ["email"],
});

type AddItemFormProps = {
  onSave: (item: Omit<FlowZenItem, 'id' | 'completed'>) => void;
  onFinished: () => void;
  defaultValues?: Partial<FlowZenItem>;
};

export function AddItemForm({ onSave, onFinished, defaultValues }: AddItemFormProps) {
    const [step, setStep] = useState(1);
    const defaultDate = defaultValues?.date ? new Date(defaultValues.date) : undefined;
    const defaultHasTime = defaultDate ? hasTime(defaultDate) : false;
    const defaultTime = defaultDate && defaultHasTime ? format(defaultDate, 'HH:mm') : '09:00';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: defaultValues?.title || '',
        date: defaultDate,
        category: defaultValues?.category,
        description: defaultValues?.description || '',
        hasTime: defaultHasTime,
        time: defaultTime,
        email: defaultValues?.email || '',
        reminders: defaultValues?.reminders || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "reminders"
  });

  const watchHasTime = form.watch('hasTime');

  async function handleNext() {
      const isValid = await form.trigger(["title", "date", "category"]);
      if (isValid) {
          setStep(2);
      }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    let finalDate = values.date;
    if (values.hasTime && values.time) {
        const [hours, minutes] = values.time.split(':');
        finalDate = setMinutes(setHours(values.date, parseInt(hours)), parseInt(minutes));
    } else {
        finalDate = setMinutes(setHours(values.date, 0), 0);
    }

    onSave({
        title: values.title,
        date: finalDate,
        category: values.category,
        description: values.description,
        email: values.email,
        reminders: values.reminders,
    });
    onFinished();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
         <DialogHeader className="p-6 pb-0">
            <DialogTitle>{defaultValues?.title ? 'Edit Item' : 'Add a New Item'}</DialogTitle>
            <DialogDescription>
                {step === 1 ? "Fill in the details below to add a new task, deadline, or event to your schedule." : "Set up email notifications for this item."}
            </DialogDescription>
          </DialogHeader>

        <ScrollArea className="flex-1">
            <div className="space-y-6 px-6 py-4">
                {step === 1 && (
                    <>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Pay electricity bill" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button
                                            variant={'outline'}
                                            className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                            )}
                                        >
                                            {field.value ? (
                                            format(field.value, 'PPP')
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
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
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
                                    <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    >
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {itemCategories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <FormField
                                control={form.control}
                                name="hasTime"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Set Time</FormLabel>
                                            <FormDescription>
                                                Specify a time for this item.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                            {watchHasTime && (
                                <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Time</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            )}
                        </div>
                        
                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Add more details..."
                                className="resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </>
                )}

                {step === 2 && (
                    <div className="space-y-4 rounded-lg border p-4 shadow-sm">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>Receive email reminders for this item.</FormDescription>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        
                        <div className="space-y-4">
                            <FormLabel>Reminders</FormLabel>
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                    <FormField
                                        control={form.control}
                                        name={`reminders.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={cn(index > 0 && "sr-only")}>Notify Before</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`reminders.${index}.unit`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={cn(index > 0 && "sr-only")}>Unit</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                        <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="seconds">Seconds</SelectItem>
                                                        <SelectItem value="minutes">Minutes</SelectItem>
                                                        <SelectItem value="hours">Hours</SelectItem>
                                                        <SelectItem value="days">Days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            <FormMessage>{form.formState.errors.reminders?.root?.message}</FormMessage>

                            {fields.length < 5 && (
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: 1, unit: 'days'})}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Reminder
                                </Button>
                            )}
                        </div>
                        <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                    </div>
                )}
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-2">
            <div className="flex justify-end gap-2 w-full">
                <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
                {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
                {step < 2 && <Button type="button" onClick={handleNext}>Next</Button>}
                {step === 2 && <Button type="submit">Save</Button>}
            </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
