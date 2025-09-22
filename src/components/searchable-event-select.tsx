import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { Button } from "./ui/button.tsx";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command.tsx";
import { cn } from "../lib/utils.ts";
import { useFindEvent } from "../services/event/hooks/use-find-event.ts";
import { EventDto } from "../types/dto";

export function SearchableEventSelect({
  onSelect,
}: {
  onSelect: (event: EventDto | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { data } = useFindEvent();
  const events = data || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[80%] md:w-[70%] lg:w-[60%] justify-between text-sm sm:text-base"
        >
          <span className="truncate">
            {value
              ? events.find((event: EventDto) => event.event === value)?.event
              : "Select event..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-[400px] md:w-[500px] lg:w-[600px] p-0"
        align="start"
        side="bottom"
      >
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search events..."
            className="h-10 sm:h-12 text-sm sm:text-base px-3"
          />
          <CommandList className="max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No events found.
            </CommandEmpty>
            <CommandGroup>
              {events.length > 0 &&
                events.map((event: EventDto) => (
                  <CommandItem
                    key={event.id}
                    value={event.event}
                    className="flex items-center gap-2 px-3 py-2 sm:py-3 text-sm sm:text-base cursor-pointer hover:bg-accent"
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      if (currentValue === value) {
                        onSelect(null);
                      } else {
                        const selectedEvent = events.find(
                          (e: EventDto) => e.event === currentValue
                        );
                        onSelect(selectedEvent || null);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === event.event ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate flex-1">{event.event}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
