'use client';

import { format } from 'date-fns';
import {
  MoreHorizontal,
  Edit,
  Trash,
  Calendar as CalendarIcon,
  Tag,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FlowZenItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { hasTime } from '@/lib/utils';

type TaskItemProps = {
  item: FlowZenItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: FlowZenItem) => void;
};

const categoryColors: { [key: string]: string } = {
  Work: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  Personal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Assignment: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  Exam: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Bill: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};


export function TaskItem({ item, onToggle, onDelete, onEdit }: TaskItemProps) {
  const itemHasTime = hasTime(item.date);

  return (
    <div className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <Checkbox
        id={`task-${item.id}`}
        checked={item.completed}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 grid gap-1">
        <label
          htmlFor={`task-${item.id}`}
          className={cn(
            'font-medium cursor-pointer',
            item.completed && 'line-through text-muted-foreground'
          )}
        >
          {item.title}
        </label>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{format(item.date, 'MMM d, yyyy')}</span>
          </div>
          {itemHasTime && (
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(item.date, 'p')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <Badge variant="outline" className={cn("border-none text-xs", categoryColors[item.category])}>
                {item.category}
            </Badge>
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(item)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
