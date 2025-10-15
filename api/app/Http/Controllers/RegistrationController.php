<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendee;

class RegistrationController extends Controller
{
    /**
     * Register a new attendee for an event
     * POST /api/events/{event_id}/register
     */
public function register(Request $request, $event_id)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email',
    ]);

    // Fetch the event
    $event = \App\Models\Event::find($event_id);
    if (!$event) {
        return response()->json([
            'message' => 'Event not found.',
        ], 404);
    }

    // Check if attendee with same email already exists for this event
    $existing = Attendee::where('event_id', $event_id)
        ->where('email', $validated['email'])
        ->first();

    if ($existing) {
        return response()->json([
            'message' => 'This email is already registered for this event.',
        ], 409); // 409 Conflict
    }

    // Check if event capacity exceeded
    $currentAttendees = Attendee::where('event_id', $event_id)->count();
    if ($currentAttendees >= $event->max_capacity) {
        return response()->json([
            'message' => 'Event capacity has been reached. Registration closed.',
        ], 400); // 400 Bad Request
    }

    try {
        $attendee = Attendee::create([
            'event_id' => $event_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Attendee registered successfully',
            'attendee' => $attendee,
        ], 201);
    } catch (\Exception $e) {
        \Log::error('Attendee registration error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Something went wrong',
            'error' => $e->getMessage(),
        ], 500);
    }
}


    /**
     * List attendees for an event (paginated)
     * GET /api/events/{event_id}/attendees
     */
    public function list($event_id, Request $request)
    {
        $perPage = $request->query('per_page', 10);

        $attendees = Attendee::where('event_id', $event_id)
            ->paginate($perPage);

        return response()->json($attendees);
    }

     // UPDATE attendee
    public function update(Request $request, $event_id, $attendee_id)
    {
        $attendee = Attendee::where('event_id', $event_id)
            ->where('id', $attendee_id)
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email',
        ]);

        // Check if email already exists for this event
        if (isset($validated['email'])) {
            $exists = Attendee::where('event_id', $event_id)
                ->where('email', $validated['email'])
                ->where('id', '!=', $attendee_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'This email is already registered for this event.',
                ], 409);
            }
        }

        $attendee->update($validated);
        return response()->json($attendee);
    }

    // DELETE attendee
    public function destroy($event_id, $attendee_id)
    {
        $attendee = Attendee::where('event_id', $event_id)
            ->where('id', $attendee_id)
            ->firstOrFail();

        $attendee->delete();
        return response()->json(['message' => 'Attendee deleted successfully']);
    }
}
