'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initialItems } from '@/lib/data';
import type { FlowZenItem } from '@/lib/types';
import { TaskItem } from '@/components/task-item'; // Re-using TaskItem for consistency
import Image from 'next/image';

export default function CalendarPage() {
  const [items, setItems] = useState<FlowZenItem[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedItems = localStorage.getItem('flowzen-items');
    setItems(storedItems ? JSON.parse(storedItems, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
    }) : initialItems);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('flowzen-items', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const handleToggleItem = (id: string, completed: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, completed } : item));
  };
  
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  // For now, edit will just log to console on this page
  const handleEditItem = (item: FlowZenItem) => {
    console.log('Editing is not implemented on this page. Please edit from the dashboard.', item);
  };

  const itemsByDate = useMemo(() => {
    const map = new Map<string, FlowZenItem[]>();
    items.forEach(item => {
      const day = item.date.toISOString().split('T')[0];
      if (!map.has(day)) {
        map.set(day, []);
      }
      map.get(day)!.push(item);
    });
    return map;
  }, [items]);
  
  const selectedDayItems = useMemo(() => {
    if (!date) return [];
    const day = date.toISOString().split('T')[0];
    return itemsByDate.get(day) || [];
  }, [date, itemsByDate]);
  
  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex-1 flex-col p-4 md:p-8">
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Calendar</h1>
          <p className="text-muted-foreground">Your unified schedule at a glance.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-3"
                modifiers={{
                    hasEvent: Array.from(itemsByDate.keys()).map(day => new Date(day + 'T12:00:00'))
                }}
                modifiersStyles={{
                    hasEvent: { 
                        position: 'relative',
                        '--tw-bg-opacity': '1',
                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                    }
                }}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>
                    Schedule for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {selectedDayItems.length > 0 ? (
                    <div className="space-y-2">
                        {selectedDayItems.map(item => (
                            <TaskItem 
                                key={item.id} 
                                item={item}
                                onToggle={handleToggleItem}
                                onDelete={handleDeleteItem}
                                onEdit={handleEditItem} // Note: Edit is limited here
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                        <Image src="https://picsum.photos/300/200" alt="A clear day" width={300} height={200} className="rounded-lg mb-4" data-ai-hint="relax serene" />
                        <h3 className="text-lg font-semibold">Nothing scheduled</h3>
                        <p className="text-muted-foreground max-w-xs">Looks like a clear day. Enjoy your free time!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
