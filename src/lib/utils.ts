import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasTime(date: Date): boolean {
    if (!date) return false;
    const d = new Date(date);
    return d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0;
}
