<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Категории новых позиций: слаг => атрибуты.
     * Категория создаётся только в том случае, если её ещё нет в базе.
     *
     * @var array<string, array{name: string, description: string, sort_order: int}>
     */
    private const CATEGORIES = [
        'coffee' => [
            'name' => 'Кофе',
            'description' => 'Классические и авторские кофейные напитки',
            'sort_order' => 1,
        ],
        'drinks' => [
            'name' => 'Напитки',
            'description' => 'Чай, какао и другие безалкогольные напитки',
            'sort_order' => 4,
        ],
        'breakfast' => [
            'name' => 'Завтраки',
            'description' => 'Завтраки с 8:00 до 12:00',
            'sort_order' => 3,
        ],
        'desserts' => [
            'name' => 'Десерты',
            'description' => 'Свежая выпечка и сладости',
            'sort_order' => 2,
        ],
    ];

    /**
     * Десять новых позиций меню: слаг категории => блюда.
     * Пути к фото — от корня сайта (файлы лежат в public/images/menu).
     *
     * @var array<string, array<int, array{name: string, price: int, description: string, image: string}>>
     */
    private const ITEMS = [
        'coffee' => [
            [
                'name' => 'Лавандовый Раф',
                'price' => 280,
                'description' => 'Нежный раф с сиропом лаванды',
                'image' => 'images/menu/lavender_raf.jpg',
            ],
            [
                'name' => 'Эспрессо-тоник',
                'price' => 290,
                'description' => 'Освежающий эспрессо с тоником и лаймом',
                'image' => 'images/menu/espresso_tonic.jpg',
            ],
        ],
        'drinks' => [
            [
                'name' => 'Матча Латте',
                'price' => 300,
                'description' => 'Трендовый зелёный чай с молоком',
                'image' => 'images/menu/matcha_latte.jpg',
            ],
            [
                'name' => 'Облепиховый чай',
                'price' => 240,
                'description' => 'Витаминный чай с апельсином',
                'image' => 'images/menu/sea_buckthorn_tea.jpg',
            ],
            [
                'name' => 'Какао с маршмеллоу',
                'price' => 220,
                'description' => 'Горячее какао с нежным маршмеллоу',
                'image' => 'images/menu/cocoa_marshmallow.jpg',
            ],
        ],
        'breakfast' => [
            [
                'name' => 'Авокадо-тост с яйцом',
                'price' => 390,
                'description' => 'Тост с авокадо, яйцом пашот и семенами чиа',
                'image' => 'images/menu/avocado_toast.jpg',
            ],
            [
                'name' => 'Сэндвич с курицей и песто',
                'price' => 350,
                'description' => 'Сытный сэндвич с курицей, песто и рукколой',
                'image' => 'images/menu/chicken_pesto_sandwich.jpg',
            ],
            [
                'name' => 'Бейгл с лососем',
                'price' => 450,
                'description' => 'Бейгл с лососем, сливочным сыром и каперсами',
                'image' => 'images/menu/salmon_bagel.jpg',
            ],
        ],
        'desserts' => [
            [
                'name' => 'Тирамису',
                'price' => 320,
                'description' => 'Классический итальянский десерт',
                'image' => 'images/menu/tiramisu.jpg',
            ],
            [
                'name' => 'Медовик',
                'price' => 280,
                'description' => 'Классический медовый торт со сметанным кремом',
                'image' => 'images/menu/honey_cake.jpg',
            ],
        ],
    ];

    public function run(): void
    {
        foreach (self::ITEMS as $categorySlug => $dishes) {
            $category = Category::firstOrCreate(
                ['slug' => $categorySlug],
                self::CATEGORIES[$categorySlug]
            );

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
