<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->decimal('subtotal', 10, 2)->default(0)->after('total_price');
            $table->decimal('discount', 10, 2)->default(0)->after('subtotal');
            $table->foreignId('promocode_id')->nullable()->after('discount')->constrained()->nullOnDelete();
        });

        // Ранее оформленные заказы создавались без промокодов: сумма до скидки равна итоговой.
        DB::table('orders')->where('subtotal', 0)->update(['subtotal' => DB::raw('total_price')]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('promocode_id');
            $table->dropColumn(['subtotal', 'discount']);
        });
    }
};
