"use client"

import type * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 w-full max-w-full mx-auto", className)}
      classNames={{
        months: "flex flex-col w-full justify-center",
        month: "w-full",
        caption: "flex justify-center items-center mb-2 px-2 w-full",
        caption_label: "text-base font-semibold text-gray-800",
        nav: "flex items-center gap-2 justify-center w-full",
        nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 transition border-none rounded-full shadow-none focus:outline-none",
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex w-full justify-between",
        head_cell: "flex-1 text-center font-semibold text-gray-500 text-xs sm:text-sm",
        row: "flex w-full justify-between",
        cell: "flex-1 text-center p-1 sm:p-2 cursor-pointer hover:bg-gray-100 transition rounded-none",
        day: "h-8 w-8 sm:h-10 sm:w-10 p-0 font-normal text-sm sm:text-base aria-selected:opacity-100 bg-transparent border-none shadow-none rounded-none",
        day_range_end: "",
        day_selected: "bg-black text-white font-bold border-none rounded-none shadow-none",
        day_today: "bg-gray-100 text-black font-semibold border-none rounded-none",
        day_outside: "text-gray-300 opacity-50 aria-selected:bg-gray-100 aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-5 w-5" />
          }
          return <ChevronRight className="h-5 w-5" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }