import * as React from "react";
import { format, setMonth, setYear, getYear, getMonth } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate years from 2020 to current year
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Select date range",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [displayMonth, setDisplayMonth] = React.useState<Date>(value?.from || new Date());

  // Update display month when value changes
  React.useEffect(() => {
    if (value?.from) {
      setDisplayMonth(value.from);
    }
  }, [value?.from]);

  const handleMonthChange = (monthStr: string) => {
    const newDate = setMonth(displayMonth, parseInt(monthStr));
    setDisplayMonth(newDate);
  };

  const handleYearChange = (yearStr: string) => {
    const newDate = setYear(displayMonth, parseInt(yearStr));
    setDisplayMonth(newDate);
  };

  const handlePrevYear = () => {
    const newYear = getYear(displayMonth) - 1;
    if (newYear >= 2020) {
      setDisplayMonth(setYear(displayMonth, newYear));
    }
  };

  const handleNextYear = () => {
    const newYear = getYear(displayMonth) + 1;
    if (newYear <= currentYear) {
      setDisplayMonth(setYear(displayMonth, newYear));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-9 text-xs",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "MMM d, yy", { locale: enUS })} -{" "}
                {format(value.to, "MMM d, yy", { locale: enUS })}
              </>
            ) : (
              format(value.from, "MMM d, yyyy", { locale: enUS })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {/* Year/Month Navigation */}
        <div className="flex items-center justify-between gap-2 p-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevYear}
            disabled={getYear(displayMonth) <= 2020}
            title="Previous year"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Select
              value={getMonth(displayMonth).toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-xs">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={getYear(displayMonth).toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleNextYear}
            disabled={getYear(displayMonth) >= currentYear}
            title="Next year"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <Calendar
          initialFocus
          mode="range"
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          selected={value}
          onSelect={(range) => {
            onChange?.(range);
            if (range?.from && range?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={2}
          locale={enUS}
          disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
