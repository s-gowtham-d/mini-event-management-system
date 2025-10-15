"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

const EventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  location: z.string().min(1, "Location is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  max_capacity: z.string().min(1, "Capacity is required"),
})

type EventFormValues = z.infer<typeof EventSchema>
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
interface Event {
  id: number
  name: string
  location: string
  start_time: string
  end_time: string
  max_capacity: number
}

export default function Page() {
  const [events, setEvents] = useState<Event[]>([])
  const [open, setOpen] = useState(false)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(EventSchema),
    defaultValues: {
      name: "",
      location: "",
      start_time: "",
      end_time: "",
      max_capacity: "",
    },
  })

  // ✅ Fetch Events on page load
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/events`)
      setEvents(res.data)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // ✅ Submit new event
  const onSubmit = async (data: EventFormValues) => {
    try {
      await axios.post(`${API_BASE_URL}/events`, {
        ...data,
        max_capacity: Number(data.max_capacity),
      })

      toast({
        title: "Event Created ✅",
        description: `${data.name} has been added.`,
      })
      setOpen(false)
      form.reset()
      fetchEvents() // Refresh list after creation
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to create event",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        {/* <SiteHeader />   */}
        <div className="flex flex-1">
          {/* <AppSidebar /> */}
          <SidebarInset>
            <div className="p-6 flex flex-col gap-6">
              {/* Top Section */}
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">📅 Events</h1>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>➕ Add Event</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Event Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="Location" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="max_capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Capacity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 100"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">
                          Save Event
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Event List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border p-4 flex flex-col gap-2 bg-muted/50"
                  >
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      📍 {event.location}
                    </p>
                    <p className="text-sm">
                      🕒 {new Date(event.start_time).toLocaleString()} -{" "}
                      {new Date(event.end_time).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      👥 Capacity: {event.max_capacity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
