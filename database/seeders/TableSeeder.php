<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [
            ['number' => 1, 'capacity' => 2, 'location' => 'У окна'],
            ['number' => 2, 'capacity' => 2, 'location' => 'У окна'],
            ['number' => 3, 'capacity' => 4, 'location' => 'Основной зал'],
            ['number' => 4, 'capacity' => 4, 'location' => 'Основной зал'],
            ['number' => 5, 'capacity' => 6, 'location' => 'Барная зона'],
        ];

        foreach ($tables as $table) {
            Table::updateOrCreate(['number' => $table['number']], $table);
        }
    }
}
