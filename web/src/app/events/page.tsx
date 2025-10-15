"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { set, useForm } from "react-hook-form"
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
import { toast } from "sonner"

// Event schema
const EventSchema = z.object({
    name: z.string().min(1, "Event name is required"),
    location: z.string().min(1, "Location is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    max_capacity: z.string().min(1, "Capacity is required"),
})

type EventFormValues = z.infer<typeof EventSchema>

interface Event {
    id: number
    name: string
    location: string
    start_time: string
    end_time: string
    max_capacity: number
}

interface Attendee {
    id: number
    name: string
    email: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

export default function Page() {
    const [events, setEvents] = useState<Event[]>([])
    const [open, setOpen] = useState(false)

    // For drawer
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [attendees, setAttendees] = useState<Attendee[]>([])
    const [loadingAttendees, setLoadingAttendees] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const perPage = 5

    const eventForm = useForm<EventFormValues>({
        resolver: zodResolver(EventSchema),
        defaultValues: {
            name: "",
            location: "",
            start_time: "",
            end_time: "",
            max_capacity: "",
        },
    })

    const attendeeForm = useForm({
        defaultValues: {
            name: "",
            email: "",
        },

    })

    useEffect(() => {
        fetchEvents()
    }, [])

    // ✅ Fetch Events
    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/events`)
            setEvents(res.data)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load events")
        }
    }

    useEffect(() => {
        if (selectedEvent) {
            fetchAttendees(page)
        }
    }, [selectedEvent, page])

    // ✅ Create Event
    // const onSubmitEvent = async (data: EventFormValues) => {
    //     try {
    //         await axios.post(`${API_BASE_URL}/events`, {
    //             ...data,
    //             max_capacity: Number(data.max_capacity),
    //         })

    //         toast.success(`${data.name} event has been added.`)
    //         setOpen(false)
    //         eventForm.reset()
    //         fetchEvents()
    //     } catch (err: any) {
    //         console.error(err)
    //         toast(err?.response?.data?.message || "Failed to create event")
    //     }
    // }

    // ✅ Fetch Attendees
    const fetchAttendees = async (pageNum = 1) => {
        if (!selectedEvent) return
        setLoadingAttendees(true)
        try {
            const res = await axios.get(
                `${API_BASE_URL}/events/${selectedEvent.id}/attendees`,
                { params: { per_page: perPage, page: pageNum } }
            )
            setAttendees(res.data.data)
            setTotal(res.data.total)
            setPage(res.data.current_page)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load attendees")
        } finally {
            setLoadingAttendees(false)
        }
    }


    // ✅ Register Attendee
    // const onSubmitAttendee = async (data: any) => {
    //     if (!selectedEvent) return;

    //     try {
    //         await axios.post(`${API_BASE_URL}/events/${selectedEvent.id}/register`, data);
    //         toast.success(`✅ Attendee Registered: ${data.name} has been added.`);
    //         attendeeForm.reset();
    //         fetchAttendees(page);
    //     } catch (err: unknown) {
    //         // Make sure error is AxiosError
    //         let message = "Failed to register attendee";

    //         if (axios.isAxiosError(err)) {
    //             // AxiosError type-safe
    //             if (err.response?.status === 409) {
    //                 message = err.response.data.message || "Email already registered";
    //             } else if (err.response?.data?.message) {
    //                 message = err.response.data.message;
    //             }
    //         } else if (err instanceof Error) {
    //             // Other JS errors
    //             message = err.message;
    //         }

    //         toast.error(message);
    //     }
    // };

    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const openEditEventDrawer = (event: Event) => {
        setEditingEvent(event);
        eventForm.reset({
            name: event.name,
            location: event.location,
            start_time: event.start_time,
            end_time: event.end_time,
            max_capacity: event.max_capacity.toString(),
        });
        setOpen(true);
    };

    // In onSubmitEvent, differentiate between add/update
    const onSubmitEvent = async (data: EventFormValues) => {
        try {
            if (editingEvent) {
                await axios.put(`${API_BASE_URL}/events/${editingEvent.id}`, {
                    ...data,
                    max_capacity: Number(data.max_capacity),
                });
                toast.success(`${data.name} event updated successfully`);
            } else {
                await axios.post(`${API_BASE_URL}/events`, {
                    ...data,
                    max_capacity: Number(data.max_capacity),
                });
                toast.success(`${data.name} event has been added`);
            }

            setOpen(false);
            eventForm.reset();
            setEditingEvent(null);
            fetchEvents();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to save event");
        }
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/events/${id}`);
            toast.success("Event deleted successfully");
            fetchEvents();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to delete event");
        }
    };

    const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);

    const openEditAttendee = (attendee: Attendee) => {
        setEditingAttendee(attendee);
        attendeeForm.reset({
            name: attendee.name,
            email: attendee.email,
        });
    };

    // Modify onSubmitAttendee:
    const onSubmitAttendee = async (data: any) => {
        if (!selectedEvent) return;

        try {
            if (editingAttendee) {
                // Update attendee
                await axios.put(
                    `${API_BASE_URL}/events/${selectedEvent.id}/attendees/${editingAttendee.id}`,
                    data
                );
                toast.success("Attendee updated successfully");
            } else {
                // Register new attendee
                await axios.post(
                    `${API_BASE_URL}/events/${selectedEvent.id}/register`,
                    data
                );
                toast.success(`✅ Attendee Registered: ${data.name} has been added.`);
            }

            // Reset form **to empty values** and clear editing state
            attendeeForm.reset({ name: "", email: "" });
            setEditingAttendee(null);

            // Refetch attendee list to show updates
            fetchAttendees(page);
        } catch (err: unknown) {
            let message = "Failed to register attendee";
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 409)
                    message = err.response.data.message || "Email already registered";
                else if (err.response?.data?.message) message = err.response.data.message;
            } else if (err instanceof Error) message = err.message;

            toast.error(message);
        }
    };


    const handleDeleteAttendee = async (attendeeId: number) => {
        if (!selectedEvent) return;
        if (!confirm("Are you sure you want to delete this attendee?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/events/${selectedEvent.id}/attendees/${attendeeId}`);
            toast.success("Attendee deleted successfully");
            fetchAttendees(page);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to delete attendee");
        }
    };



    // ✅ Handle drawer open
    const openAttendeeDrawer = (event: Event) => {
        setSelectedEvent(event)
        setPage(1) // reset pagination
        setDrawerOpen(true)
    }

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                <div className="flex flex-1">
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

                                        <Form {...eventForm}>
                                            <form
                                                onSubmit={eventForm.handleSubmit(onSubmitEvent)}
                                                className="space-y-4"
                                            >
                                                <FormField
                                                    control={eventForm.control}
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
                                                    control={eventForm.control}
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
                                                    control={eventForm.control}
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
                                                    control={eventForm.control}
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
                                                    control={eventForm.control}
                                                    name="max_capacity"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Max Capacity</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="e.g. 100" {...field} />
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
                                        <p className="text-sm">👥 Capacity: {event.max_capacity}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditEventDrawer(event)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteEvent(event.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-2"
                                            onClick={() => openAttendeeDrawer(event)}
                                        >
                                            View / Register Attendees
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>

            {/* 🧍 Attendee Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="p-6">
                    <DrawerHeader>
                        <DrawerTitle>
                            Attendees — {selectedEvent?.name}
                        </DrawerTitle>
                        <DrawerDescription>
                            Register attendees and view the list below.
                        </DrawerDescription>
                    </DrawerHeader>

                    {/* Registration Form */}
                    <Form {...attendeeForm}>
                        <form
                            onSubmit={attendeeForm.handleSubmit(onSubmitAttendee)}
                            className="flex gap-3 mb-6"
                        >
                            <FormField
                                control={attendeeForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={attendeeForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Add</Button>
                        </form>
                    </Form>

                    {/* Attendee List */}
                    {loadingAttendees ? (
                        <p>Loading attendees...</p>
                    ) : attendees.length === 0 ? (
                        <p>No attendees yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {attendees.map((attendee) => (
                                <div
                                    key={attendee.id}
                                    className="border rounded-lg p-2 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-medium">{attendee.name}</p>
                                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditAttendee(attendee)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDeleteAttendee(attendee.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* Pagination */}
                    {total > perPage && (
                        <div className="flex justify-between items-center mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                            >
                                Prev
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(total / perPage)))}
                                disabled={page * perPage >= total}
                            >
                                Next
                            </Button>

                        </div>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    )
}
