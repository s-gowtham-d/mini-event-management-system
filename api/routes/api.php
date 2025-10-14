<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;

Route::post('/events', [EventController::class, 'store']);
Route::get('/events', [EventController::class, 'index']);
Route::post('/events/{event_id}/register', [RegistrationController::class, 'register']);
Route::get('/events/{event_id}/attendees', [RegistrationController::class, 'list']);
