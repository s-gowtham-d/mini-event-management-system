<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    // Specify the custom table name
    protected $table = 'usertable';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'otp',
        'otp_expires_at',
        'is_verified',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'is_verified' => 'boolean',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp',
    ];

    // Append these for clean API responses
}