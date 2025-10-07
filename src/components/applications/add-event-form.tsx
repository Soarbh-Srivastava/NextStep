'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ApplicationEvent } from '@/lib/types';
import { addApplicationEvent } from '@/lib/storage';

const eventSchema = z.object({
  type: z.string().min(1, 'Event type is required.'),
  occurredAt: z.date({
    required_error: 'An event date is required.',
  }),
  note: z.string().optional(),
});

type AddEventFormProps = {
    applicationId: string;
    onEventAdded: (event: ApplicationEvent) => void;
    onFinished: () => void;
}

const eventTypes = [
    'viewed',
    'first_response',
    'followed_up',
    'phone_screen_scheduled',
    'online_assessment',
    'technical_interview',
    'hr_interview',
    'interview_scheduled',
    'offer',
    'rejected',
    'withdrawn'
];

export default function AddEventForm({ applicationId, onEventAdded, onFinished }: AddEventFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: '',
      occurredAt: new Date(),
      note: '',
    },
  });

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    setIsSaving(true);
    try {
      const eventData = {
          type: values.type,
          occurredAt: values.occurredAt,
          metadata: values.note ? { note: values.note } : {},
      };
      
      const newEvent = await addApplicationEvent(applicationId, eventData);
      
      if (newEvent) {
        toast({
            title: 'Event Added!',
            description: `The event "${values.type.replace(/_/g, ' ')}" has been logged.`,
        });
        onEventAdded(newEvent);
        onFinished();
        form.reset();
      }
    } catch (error) {
        console.error("Failed to add event:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not save the event.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Event Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>
                            {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
        control={form.control}
        name="occurredAt"
        render={({ field }) => (
            <FormItem className="flex flex-col">
            <FormLabel>Date of Event</FormLabel>
            <Popover>
                <PopoverTrigger asChild>
                <FormControl>
                    <Button
                    variant={'outline'}
                    className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                    )}
                    >
                    {field.value ? (
                        format(field.value, 'PPP')
                    ) : (
                        <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Note (Optional)</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., Spoke with Jane Doe about the role." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Event
            </Button>
        </div>
      </form>
    </Form>
  );
}
