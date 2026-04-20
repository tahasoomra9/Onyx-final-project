"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date | string
  onDateChange?: (date: Date | string) => void
  placeholder?: string
  width?: string
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Pick a date",
  width = "w-[212px]"
}: Readonly<DatePickerProps>) {
  const [open, setOpen] = React.useState(false)

  // Convert string to Date if needed
  const dateObj = React.useMemo(() => {
    if (!date) return undefined
    if (typeof date === "string") {
      return new Date(date + "T00:00:00")
    }
    return date
  }, [date])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && onDateChange) {
      // Return ISO date string (YYYY-MM-DD format)
      const isoDate = selectedDate.toISOString().split("T")[0]
      onDateChange(isoDate)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!dateObj}
          className={`${width} h-11 justify-between rounded-lg border-white/10 bg-white/2 px-3 text-left text-sm font-medium hover:bg-white/6 data-[empty=true]:text-muted-foreground focus-visible:ring-white`}
        >
          {dateObj ? format(dateObj, "PPP") : <span>{placeholder}</span>}
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-white/10 bg-black p-0" align="start">
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={handleSelect}
          defaultMonth={dateObj}
        />
      </PopoverContent>
    </Popover>
  )
}
