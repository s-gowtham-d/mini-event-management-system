<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Carbon\Carbon;

class EventController extends Controller
{
   public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'max_capacity' => 'required|integer|min:1',
        ]);

        $event = Event::create($validated);

        return response()->json($event, 201);
    }

 public function index()
    {
        $events = Event::where('start_time', '>=', Carbon::now())->orderBy('start_time')->get();
        return response()->json($events);
    }

}
