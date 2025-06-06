
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMinutes } from "date-fns";
import { tr } from "date-fns/locale";

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price
export function formatPrice(price: number): string {
  return price.toLocaleString("tr-TR") + " ₺";
}

// Format date
export function formatDate(date: Date, formatStr: string = "d MMMM yyyy"): string {
  return format(date, formatStr, { locale: tr });
}

// Format time
export function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

// Parse duration string (e.g., "1 Saat 30 Dakika") to minutes
export function parseDuration(durationStr: string): number {
  let minutes = 0;
  
  // Match hours
  const hourMatch = durationStr.match(/(\d+)\s*(?:saat|hour)/i);
  if (hourMatch) {
    minutes += parseInt(hourMatch[1]) * 60;
  }
  
  // Match minutes
  const minuteMatch = durationStr.match(/(\d+)\s*(?:dakika|minute)/i);
  if (minuteMatch) {
    minutes += parseInt(minuteMatch[1]);
  }
  
  return minutes;
}

// Format duration in minutes to a human-readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dakika`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} saat`;
  }
  
  return `${hours} saat ${remainingMinutes} dakika`;
}

// Calculate end time from start time and duration
export function calculateEndTime(startTime: Date, durationInMinutes: number): Date {
  return addMinutes(startTime, durationInMinutes);
}

// Get time slots for a day
export function getTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30,
  bookedSlots: string[] = []
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentTime = new Date();
  currentTime.setHours(startHour, startMinute, 0);
  
  const endTimeDate = new Date();
  endTimeDate.setHours(endHour, endMinute, 0);
  
  while (currentTime < endTimeDate) {
    const timeString = format(currentTime, "HH:mm");
    slots.push({
      time: timeString,
      available: !bookedSlots.includes(timeString),
    });
    currentTime = addMinutes(currentTime, intervalMinutes);
  }
  
  return slots;
}

// Check if a date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if a time slot is in the past (for today only)
export function isTimeInPast(timeStr: string): boolean {
  if (!isToday(new Date())) return false;
  
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return slotTime <= now;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Extract initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
