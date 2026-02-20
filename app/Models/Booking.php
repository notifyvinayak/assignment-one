<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $event_id
 * @property int $quantity
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Event $event
 * @property-read \App\Models\User $user
 */
class Booking extends Model
{
    protected $fillable = ['user_id', 'event_id', 'quantity', 'status'];

    /**
     * Get the event that this booking belongs to.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user that owns this booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
