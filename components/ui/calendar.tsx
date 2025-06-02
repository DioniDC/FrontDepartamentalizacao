"use client"

import React, { useState } from "react"
import ReactDatePicker from "react-datepicker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={setSelectedDate}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "w-full p-2 text-sm"
      )}
      placeholderText="Selecione uma data"
      calendarClassName="shadow-lg rounded-md"
    />
  )
}
