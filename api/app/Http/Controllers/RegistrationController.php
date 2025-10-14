<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\Attendee;

class RegistrationController extends Controller
{
    // POST /events/{event_id}/register
    public function register($event_id, Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
        ]);

        $event = Event::findOrFail($event_id);

        // Check capacity
        $currentCount = Attendee::where('event_id', $event_id)->count();
        if ($currentCount >= $event->max_capacity) {
            return response()->json(['message' => 'Event is fully booked'], 400);
        }

        // Check duplicate
        $exists = Attendee::where('event_id', $event_id)->where('email', $validated['email'])->exists();
        if ($exists) {
            return response()->json(['message' => 'Already registered with this email'], 400);
        }

        $attendee = Attendee::create([
            'event_id' => $event_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        return response()->json($attendee, 201);
    }

    // GET /events/{event_id}/attendees
    public function list($event_id, Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $attendees = Attendee::where('event_id', $event_id)->paginate($perPage);
        return response()->json($attendees);
    }
}
