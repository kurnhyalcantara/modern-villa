'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function AvailabilityCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' },
  );

  const isPastMonth =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth < today.getMonth());

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToPrevMonth}
          disabled={isPastMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">{monthName}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground py-1 text-center text-xs font-medium"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth, day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isPast =
            date <
            new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <div
              key={day}
              className={cn(
                'flex aspect-square items-center justify-center rounded-md text-sm',
                isPast
                  ? 'text-muted-foreground/40'
                  : 'text-foreground hover:bg-ocean/10 cursor-pointer transition-colors',
                isToday && 'bg-ocean/10 text-ocean font-semibold',
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="bg-success/20 size-3 rounded-sm" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-muted size-3 rounded-sm" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
      </div>
    </div>
  );
}
