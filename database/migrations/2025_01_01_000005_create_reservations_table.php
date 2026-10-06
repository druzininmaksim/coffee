<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('table_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->unsignedInteger('guests')->default(2);
            $table->dateTime('reserved_at');
            $table->string('status')->default('pending');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('reserved_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
