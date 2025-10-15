<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

Route::post('/events', [EventController::class, 'store']);
Route::get('/events', [EventController::class, 'index']);
Route::post('/events/{event_id}/register', [RegistrationController::class, 'register']);
Route::get('/events/{event_id}/attendees', [RegistrationController::class, 'list']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);
Route::put('/events/{event_id}/attendees/{attendee_id}', [RegistrationController::class, 'update']);
Route::delete('/events/{event_id}/attendees/{attendee_id}', [RegistrationController::class, 'destroy']);
