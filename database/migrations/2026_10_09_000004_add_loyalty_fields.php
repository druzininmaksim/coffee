<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('bonus_points')->default(0)->after('phone');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->unsignedInteger('bonus_points')->default(0)->after('total_price');
            $table->boolean('bonus_accrued')->default(false)->after('bonus_points');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['bonus_points', 'bonus_accrued']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('bonus_points');
        });
    }
};
