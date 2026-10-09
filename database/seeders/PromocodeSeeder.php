<?php

namespace Database\Seeders;

use App\Models\Promocode;
use App\Models\Promotion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromocodeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed demo promocodes and promotions.
     */
    public function run(): void
    {
        $promocodes = [
            [
                'code' => 'WELCOME10',
                'discount_type' => 'percent',
                'discount_value' => 10,
                'min_order_amount' => 0,
                'is_active' => true,
            ],
            [
                'code' => 'COFFEE50',
                'discount_type' => 'fixed',
                'discount_value' => 50,
                'min_order_amount' => 0,
                'is_active' => true,
            ],
            [
                'code' => 'VIP20',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'min_order_amount' => 1000,
                'is_active' => true,
            ],
        ];

        foreach ($promocodes as $promocode) {
            Promocode::query()->updateOrCreate(
                ['code' => $promocode['code']],
                $promocode,
            );
        }

        $promotions = [
            [
                'title' => 'Круассан + капучино',
                'description' => 'Каждое утро с 8:00 до 11:00 — круассан и капучино со скидкой 20%.',
                'image' => 'menu/croissant.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Шестой кофе в подарок',
                'description' => 'Соберите пять отметок в карте лояльности — шестой напиток за наш счёт.',
                'image' => 'menu/latte.jpg',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Десерт дня −30%',
                'description' => 'Каждый вечер после 19:00 десерт дня можно забрать со скидкой 30%.',
                'image' => 'menu/cheesecake.jpg',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::query()->updateOrCreate(
                ['title' => $promotion['title']],
                $promotion,
            );
        }
    }
}
