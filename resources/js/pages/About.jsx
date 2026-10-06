import { Link } from 'react-router-dom';
import { ABOUT_IMAGE, CONTACTS_IMAGE } from '../utils/format';

const values = [
    {
        title: 'Своя обжарка',
        text: 'Обжариваем зерно каждую неделю небольшими партиями и всегда указываем дату обжарки.',
    },
    {
        title: 'Честные ингредиенты',
        text: 'Никаких сиропов по умолчанию: только кофе, молоко и то, что вы попросите сами.',
    },
    {
        title: 'Уютный зал',
        text: 'Пять столиков, мягкий свет и полки с книгами — можно работать или просто отдыхать.',
    },
];

export default function About() {
    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-4 text-3xl font-semibold">О нас</h1>
                <p className="mb-4 max-w-3xl text-amber-50/80">
                    Кофейня Roast &amp; Co началась в 2014 году с домашней обжарки на кухне и одного
                    ручного эспрессо-аппарата. Сегодня у нас собственный ростер, команда бариста и
                    гости, которые приходят каждое утро.
                </p>

                <div className="mb-4 grid gap-6 md:grid-cols-2">
                    <img
                        src={ABOUT_IMAGE}
                        alt="Обжарка кофе"
                        className="h-80 w-full rounded-lg object-cover shadow-md"
                    />
                    <img
                        src={CONTACTS_IMAGE}
                        alt="Бариста за работой"
                        className="h-80 w-full rounded-lg object-cover shadow-md"
                    />
                </div>

                <div className="mb-4 grid gap-6 md:grid-cols-3">
                    {values.map((value) => (
                        <div key={value.title} className="rounded-lg bg-stone-800 p-6 shadow-md">
                            <h2 className="mb-4 text-lg font-semibold">{value.title}</h2>
                            <p className="mb-0 text-sm text-amber-50/70">{value.text}</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Как мы работаем</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <p className="mb-4 font-medium text-amber-500">2014</p>
                            <p className="mb-0 text-sm text-amber-50/70">
                                Первая обжарка и продажа зерна друзьям.
                            </p>
                        </div>
                        <div>
                            <p className="mb-4 font-medium text-amber-500">2019</p>
                            <p className="mb-0 text-sm text-amber-50/70">
                                Открыли зал на 5 столиков в центре города.
                            </p>
                        </div>
                        <div>
                            <p className="mb-4 font-medium text-amber-500">Сегодня</p>
                            <p className="mb-0 text-sm text-amber-50/70">
                                Обжариваем 300 кг зерна в месяц и проводим каппинги по субботам.
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    to="/reservation"
                    className="mt-4 inline-block rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                >
                    Забронировать столик
                </Link>
            </div>
        </div>
    );
}
