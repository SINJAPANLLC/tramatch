import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: string | null | undefined): string {
  if (!value) return "";
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return value;
  return Number(num).toLocaleString("ja-JP");
}
