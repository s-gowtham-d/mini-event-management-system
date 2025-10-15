"use client"
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import axios from "axios"
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"


type Props = {
    event: any | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onRegistered?: () => void; // callback to refresh parent if desired
}

export default function AttendeesDrawer({ event, open, onOpenChange, onRegistered }: Props) {
    const [attendees, setAttendees] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(8);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const form = useForm<{ name: string, email: string }>({
        defaultValues: { name: "", email: "" }
    });
    const fetchAttendees = async (event: any, pageNum = 1, perPage = 10, setLoading: any, setAttendees: any, setTotal: any, setPage: any) => {
        if (!event) return
        setLoading(true)
        try {
            const res = await axios.get(`${API_BASE_URL}/events/${event.id}/attendees`, {
                params: { per_page: perPage, page: pageNum },
            })

            // Laravel's pagination structure:
            // { data: [...], total: xx, current_page: xx, ... }
            setAttendees(res.data.data)
            setTotal(res.data.total)
            setPage(res.data.current_page)
        } catch (err) {
            console.error(err)
            toast({
                title: "Error",
                description: "Failed to load attendees",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (event) {
            fetchAttendees(event, 1, perPage, setLoading, setAttendees, setTotal, setPage)
        }
    }, [event])


    const onRegister = async (vals: { name: string, email: string }) => {
        if (!event) return;
        try {
            const res = await axios.post(`${API_BASE_URL}/events/${event.id}/register`, vals);
            toast({ title: "Registered", description: "You are registered for the event." });
            form.reset();
            fetchAttendees(event, 1, perPage, setLoading, setAttendees, setTotal, setPage);
            onRegistered?.();
        } catch (err: any) {
            console.error(err);
            const msg = err?.response?.data?.message || "Failed to register";
            toast({ title: "Error", description: msg, variant: "destructive" });
        }
    }

    const totalPages = Math.ceil(total / perPage);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild><></></SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{event ? event.name : "Event"}</SheetTitle>
                </SheetHeader>

                <div className="space-y-4">
                    {event && (
                        <>
                            <div className="text-sm text-muted-foreground">📍 {event.location}</div>
                            <div className="text-sm">🕒 {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}</div>
                            <div className="text-sm">👥 Capacity: {event.max_capacity}</div>
                        </>
                    )}

                    <div className="pt-4 border-t">
                        <h4 className="font-semibold">Register</h4>
                        <form onSubmit={form.handleSubmit(onRegister)} className="space-y-2 mt-2">
                            <Input placeholder="Full name" {...form.register("name", { required: true })} />
                            <Input placeholder="Email" {...form.register("email", { required: true })} />
                            <Button type="submit" className="w-full">Register</Button>
                        </form>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-semibold">Attendees ({total})</h4>

                        {loading ? <div className="py-4">Loading…</div> : (
                            <>
                                <ul className="space-y-2 mt-2">
                                    {attendees.map((a: any) => (
                                        <li key={a.id} className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{a.name}</div>
                                                <div className="text-xs text-muted-foreground">{a.email}</div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex gap-2 justify-end mt-4">
                                    <Button variant="ghost" disabled={page <= 1} onClick={() => { fetchAttendees(event, page - 1, perPage, setLoading, setAttendees, setTotal, setPage); }}>Prev</Button>
                                    <div className="flex items-center text-sm text-muted-foreground">Page {page} / {totalPages || 1}</div>
                                    <Button variant="ghost" disabled={page >= totalPages} onClick={() => { fetchAttendees(event, page + 1, perPage, setLoading, setAttendees, setTotal, setPage); }}>Next</Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
