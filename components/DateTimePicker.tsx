"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
}: DateTimePickerProps) {
  const [time, setTime] = React.useState<string>("12:00");

  React.useEffect(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, "0");
      const minutes = value.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const [hours, minutes] = time.split(":");
      selectedDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(selectedDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (value) {
      const [hours, minutes] = newTime.split(":");
      const newDate = new Date(value);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full justify-start text-left font-normal bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--hover)] px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[var(--muted)]" />
          <span
            className={
              value ? "text-[var(--foreground)]" : "text-[var(--muted)]"
            }
          >
            {value ? format(value, "PPP p") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[var(--background)] border-[var(--border)]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          initialFocus
          className="rounded-md border shadow-sm text-[var(--foreground)]"
          captionLayout="dropdown"
        />
        <div className="p-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--muted)]" />
            <input
              type="time"
              value={time}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--foreground)]"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
