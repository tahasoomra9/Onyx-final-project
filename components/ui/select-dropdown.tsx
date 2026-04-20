"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SelectDropdownOption {
  value: string | number
  label: string
}

interface SelectDropdownProps {
  value: string | number
  onValueChange: (value: string | number) => void
  options: SelectDropdownOption[]
  placeholder?: string
  className?: string
}

export function SelectDropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select option",
  className = "w-full",
}: SelectDropdownProps) {
  const selectedOption = options.find((opt) => String(opt.value) === String(value))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between text-left font-normal ${className}`}
          data-empty={!selectedOption}
        >
          <span className="data-[empty=true]:text-muted-foreground">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onValueChange(option.value)}
            className="cursor-pointer"
            data-selected={String(option.value) === String(value)}
          >
            <span className="flex-1">{option.label}</span>
            {String(option.value) === String(value) && (
              <span className="ml-2 text-xs font-bold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
