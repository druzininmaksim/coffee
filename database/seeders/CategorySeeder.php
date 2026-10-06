<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Кофе',
                'slug' => 'coffee',
                'description' => 'Классические и авторские кофейные напитки',
                'sort_order' => 1,
            ],
            [
                'name' => 'Десерты',
                'slug' => 'desserts',
                'description' => 'Свежая выпечка и сладости',
                'sort_order' => 2,
            ],
            [
                'name' => 'Завтраки',
                'slug' => 'breakfast',
                'description' => 'Завтраки с 8:00 до 12:00',
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
