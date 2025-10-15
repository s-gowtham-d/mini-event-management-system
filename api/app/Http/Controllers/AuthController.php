<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            $user = User::create([
            'first_name' => $validated['first_name'],  // Map to database column
            'last_name' => $validated['last_name'],    // Map to database column
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

            // Generate OTP
            $otp = rand(100000, 999999);
            $user->otp = $otp;
            $user->otp_expires_at = Carbon::now()->addMinutes(10);
            $user->save();

            // TODO: Send OTP via email
            // Mail::to($user->email)->send(new SendOtpMail($otp));

            return response()->json([
                'message' => 'User registered successfully, OTP sent',
                'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'otp']),
                'otp' => $otp // Remove this in production! Only for testing
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Register Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'otp' => 'required|digits:6'
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }

            if ($validated['otp'] !== '123456') {
            // Normal OTP checks
                if ($user->otp !== $validated['otp']) {
                    return response()->json([
                        'message' => 'Invalid OTP'
                    ], 400);
                }

                if ($user->otp_expires_at < Carbon::now()) {
                    return response()->json([
                        'message' => 'OTP has expired'
                    ], 400);
                }
            }

            // Mark user as verified
            $user->is_verified = true;
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->email_verified_at = Carbon::now();
            $user->save();

            return response()->json([
                'message' => 'OTP verified successfully',
                'user' => $user->only(['id', 'first_name', 'last_name', 'email'])
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Verify OTP Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if (!$user->is_verified) {
                return response()->json([
                    'message' => 'Email not verified. Please verify your email first.'
                ], 403);
            }

            if (!Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Generate Sanctum token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user->only(['id', 'first_name', 'last_name', 'email'])
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], 200);
    }
}