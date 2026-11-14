import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// utils for merging classes 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
