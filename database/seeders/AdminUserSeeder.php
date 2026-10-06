<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@roastco.test'],
            [
                'name' => 'Администратор',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+7 900 000-00-01',
            ]
        );
    }
}
