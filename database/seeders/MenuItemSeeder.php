<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            'coffee' => [
                [
                    'name' => 'Эспрессо',
                    'price' => 150,
                    'description' => 'Двойной эспрессо из бленда Roast & Co',
                    'image' => 'menu/espresso.jpg',
                ],
                [
                    'name' => 'Американо',
                    'price' => 180,
                    'description' => 'Эспрессо с горячей водой',
                    'image' => 'menu/americano.jpg',
                ],
                [
                    'name' => 'Капучино',
                    'price' => 240,
                    'description' => 'Эспрессо и плотное молочное молоко',
                    'image' => 'menu/cappuccino.jpg',
                ],
                [
                    'name' => 'Латте',
                    'price' => 260,
                    'description' => 'Мягкий кофе с молоком',
                    'image' => 'menu/latte.jpg',
                ],
                [
                    'name' => 'Флэт Уайт',
                    'price' => 270,
                    'description' => 'Двойной ристретто и молоко',
                    'image' => 'menu/flat-white.jpg',
                ],
            ],
            'desserts' => [
                [
                    'name' => 'Чизкейк Нью-Йорк',
                    'price' => 320,
                    'description' => 'Классический чизкейк с ягодным соусом',
                    'image' => 'menu/cheesecake.jpg',
                ],
                [
                    'name' => 'Круассан миндальный',
                    'price' => 250,
                    'description' => 'Слоёный круассан с миндальным кремом',
                    'image' => 'menu/croissant.jpg',
                ],
                [
                    'name' => 'Брауни',
                    'price' => 280,
                    'description' => 'Шоколадный брауни с грецким орехом',
                    'image' => 'menu/brownie.jpg',
                ],
            ],
            'breakfast' => [
                [
                    'name' => 'Сырники со сметаной',
                    'price' => 390,
                    'description' => 'Домашние сырники и сметана',
                    'image' => 'menu/syrniki.jpg',
                ],
                [
                    'name' => 'Овсяная каша с ягодами',
                    'price' => 310,
                    'description' => 'Каша на молоке с сезонными ягодами',
                    'image' => 'menu/oatmeal.jpg',
                ],
            ],
        ];

        foreach ($items as $categorySlug => $dishes) {
            $category = Category::where('slug', $categorySlug)->firstOrFail();

            foreach ($dishes as $dish) {
                MenuItem::updateOrCreate(
                    ['slug' => str($dish['name'])->slug()->value()],
                    [
                        'category_id' => $category->id,
                        'name' => $dish['name'],
                        'description' => $dish['description'],
                        'price' => $dish['price'],
                        'image' => $dish['image'],
                        'is_available' => true,
                    ]
                );
            }
        }
    }
}
