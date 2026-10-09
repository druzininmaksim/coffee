<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promocode_usages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('promocode_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->timestamp('used_at')->nullable();

            // Гарантия на уровне базы: один пользователь применяет промокод только один раз.
            $table->unique(['promocode_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promocode_usages');
    }
};
