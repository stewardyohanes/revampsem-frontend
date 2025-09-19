import {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import {Button} from "./ui/button.tsx";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./ui/command.tsx";
import {cn} from "../lib/utils.ts";
import {useFindEvent} from "../services/event/hooks/use-find-event.ts";
import {EventDto} from "../types/dto";

export function SearchableEventSelect({onSelect}: { onSelect: (event: EventDto | null ) => void}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const { data } = useFindEvent()
  const events = data || []
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[80%] justify-between"
        >
          {value
            ? events.find((event: EventDto) => event.event === value)?.event
            : "Select event..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No events found.</CommandEmpty>
            <CommandGroup>
              {events.length > 0 && events.map((event: EventDto) => (
                <CommandItem
                  key={event.id}
                  value={event.event}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    if (currentValue === value) {
                      onSelect(null)
                    } else {
                      const selectedEvent = events.find((e: EventDto) => e.event === currentValue)
                      onSelect(selectedEvent || null)
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === event.event ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {event.event}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}