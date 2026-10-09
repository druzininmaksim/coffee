<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'type',
    'name',
    'phone',
    'address',
    'comment',
    'status',
    'subtotal',
    'discount',
    'total_price',
    'promocode_id',
    'bonus_points',
    'bonus_accrued',
])]
class Order extends Model
{
    public const TYPE_PICKUP = 'pickup';

    public const TYPE_DELIVERY = 'delivery';

    public const STATUS_NEW = 'new';

    public const STATUS_PREPARING = 'preparing';

    public const STATUS_READY = 'ready';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    /** Доля суммы заказа, возвращаемая бонусными баллами. */
    public const BONUS_RATE = 0.05;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return BelongsTo<Promocode, $this>
     */
    public function promocode(): BelongsTo
    {
        return $this->belongsTo(Promocode::class);
    }
}
