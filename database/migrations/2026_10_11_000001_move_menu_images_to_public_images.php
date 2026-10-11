<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Картинки меню переехали из storage/app/public/menu в public/images/menu, чтобы
 * попадать на сервер вместе с кодом (git pull) и не теряться при переносе проекта.
 * Обновляем пути в БД: 'menu/espresso.jpg' => 'images/menu/espresso.jpg'.
 */
return new class extends Migration
{
    /**
     * Таблицы, в которых хранятся пути к картинкам меню.
     *
     * @var array<int, string>
     */
    private const TABLES = ['menu_items', 'promotions'];

    public function up(): void
    {
        $this->replacePrefix('menu/', 'images/menu/');
    }

    public function down(): void
    {
        $this->replacePrefix('images/menu/', 'menu/');
    }

    /**
     * Меняет префикс пути у подходящих записей. Миграция идемпотентна:
     * записи, у которых уже стоит новый префикс, повторно не обрабатываются.
     */
    private function replacePrefix(string $from, string $to): void
    {
        foreach (self::TABLES as $table) {
            DB::table($table)
                ->where('image', 'like', $from.'%')
                ->orderBy('id')
                ->chunkById(100, function ($rows) use ($table, $from, $to): void {
                    foreach ($rows as $row) {
                        DB::table($table)->where('id', $row->id)->update([
                            'image' => $to.substr($row->image, strlen($from)),
                        ]);
                    }
                });
        }
    }
};
