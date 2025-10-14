<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    //
    protected $fillable = ['name', 'location', 'start_time', 'end_time', 'max_capacity'];

}
