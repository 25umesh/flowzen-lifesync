'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, CalendarCheck, ClipboardList, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initialItems } from '@/lib/data';
import type { FlowZenItem, ItemCategory } from '@/lib/types';
import { itemCategories } from '@/lib/types';
import { AddItemForm } from '@/components/add-item-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AIDetectorSheet } from '@/components/ai-detector-sheet';
import { TaskItem } from '@/components/task-item';
import { format } from 'date-fns';
import Image from 'next/image';
import type { DetectDeadlineOutput } from '@/ai/flows/deadline-detection';
import { hasTime } from '@/lib/utils';
import { runSendConfirmationEmail } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [items, setItems] = useState<FlowZenItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAIDetectorOpen, setIsAIDetectorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FlowZenItem | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const storedItems = localStorage.getItem('flowzen-items');
    setItems(storedItems ? JSON.parse(storedItems, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
    }) : initialItems);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
        localStorage.setItem('flowzen-items', JSON.stringify(items));
    }
  }, [items, isMounted]);


  const upcomingItems = useMemo(() => {
    const now = new Date();
    return items
      .filter((item) => !item.completed && item.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [items]);
  
  const incompleteTasks = useMemo(() => {
     return items
      .filter((item) => !item.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [items]);

  const handleSaveItem = (itemData: Omit<FlowZenItem, 'id' | 'completed'>) => {
    let savedItem: FlowZenItem;
    if (editingItem && editingItem.id) { // Check if editingItem and its id exists
      savedItem = { ...editingItem, ...itemData };
      setItems(items.map(i => i.id === editingItem.id ? savedItem : i));
    } else {
      savedItem = {
        ...itemData,
        id: Date.now().toString(),
        completed: false,
      };
      setItems([...items, savedItem]);
    }
    setEditingItem(undefined);

    // Send confirmation email if reminders are set
    if (savedItem.email && savedItem.reminders && savedItem.reminders.length > 0) {
      runSendConfirmationEmail(savedItem).then(result => {
        if(result.success) {
            toast({
                title: "Confirmation Sent",
                description: `A confirmation email has been sent to ${savedItem.email}.`
            })
        }
      });
    }
  };

  const handleToggleItem = (id: string, completed: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, completed } : item));
  };
  
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleEditItem = (item: FlowZenItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingItem(undefined);
    setIsAddDialogOpen(true);
  }

  const handleDeadlineDetected = (deadline: DetectDeadlineOutput) => {
      const { title, date, category } = deadline;
      const defaultValues: Partial<FlowZenItem> = {
          title: title,
          date: date ? new Date(date) : new Date(),
          category: itemCategories.includes(category as ItemCategory) ? category as ItemCategory : 'Personal',
      };
      setEditingItem(defaultValues as FlowZenItem); // a bit of a hack
      setIsAddDialogOpen(true);
  }

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAIDetectorOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" /> AI Scan
          </Button>
          <Button onClick={handleOpenDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingItems.length > 0 ? (
              <ul className="space-y-3">
                {upcomingItems.map(item => (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{format(item.date, 'd')}</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                           <span>{format(item.date, "MMM yyyy, EEEE")}</span>
                           {hasTime(item.date) && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{format(item.date, "p")}</span>
                            </div>
                           )}
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines. Enjoy the peace!</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Task List</CardTitle>
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {incompleteTasks.length > 0 ? (
                <div className="space-y-2">
                    {incompleteTasks.map(item => (
                        <TaskItem 
                            key={item.id} 
                            item={item} 
                            onToggle={handleToggleItem}
                            onDelete={handleDeleteItem}
                            onEdit={handleEditItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <Image src="https://picsum.photos/300/200" alt="All tasks completed" width={300} height={200} className="rounded-lg mb-4" data-ai-hint="zen organizing" />
                    <h3 className="text-lg font-semibold">All Clear!</h3>
                    <p className="text-muted-foreground max-w-xs">You've completed all your tasks. Time for a well-deserved break.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh] flex flex-col">
            <AddItemForm
                onSave={handleSaveItem}
                onFinished={() => setIsAddDialogOpen(false)}
                defaultValues={editingItem}
            />
        </DialogContent>
      </Dialog>
      
      <AIDetectorSheet 
        open={isAIDetectorOpen}
        onOpenChange={setIsAIDetectorOpen}
        onDeadlineDetected={handleDeadlineDetected}
      />
    </main>
  );
}
