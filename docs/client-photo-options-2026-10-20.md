# Фотографии клиента — варианты первого экрана

Источник: https://disk.yandex.ru/d/tXy4O-veP_VMAw

В папке 55 файлов: 39 JPEG и 16 RAW DNG. Видео в этой папке нет.
Просмотрены превью всех JPEG; RAW не содержит отдельных дополнительных ракурсов.

## Варианты

1. Дом в лесу: существующий `dist/assets/forest-v2/hero.webp`, сохранён без изменений и остаётся первым вариантом.
2. Лес и Волга: `DJI_20250821145901_0192_D.JPG` → `dist/assets/client-october/hero-river-sunset.webp`.
3. Участки и соседние дома: `DJI_20250821144252_0171_D.JPG` → `dist/assets/client-october/hero-plots-sunset.webp`.

Для блока о проекте: `DJI_20250821145333_0179_D.JPG` → `dist/assets/client-october/intro-real-sunset.webp`.

Оригиналы сохранены локально в `source-assets/client-review-2026-10-20/originals/`.
На сайт идут оптимизированные WebP. Переключение первого экрана ручное, без автоматической смены.
Прямые ссылки для сравнения: `?hero=1`, `?hero=2`, `?hero=3`.

## Обработка

Использован встроенный imagegen, два прохода: закатное освещение и затем смягчение насыщенности.
Рекомендация: вариант 2 лучше показывает реальное окружение и отличается от образа дома в первом варианте.

Смысл исходного промпта: relight the exact real client photograph to gentle golden hour;
preserve camera viewpoint, geography, coastline, field boundaries, roads, buildings and fences;
no new amenities, objects or text; muted olive / cream natural palette, no HDR.

Финальный промпт: Edit only photographic light and color grading. Keep all geography,
roads, fields, trees, buildings, fences, perspective and framing unchanged. Reduce orange,
yellow and brightness; pale warm ivory / gray-blue sky, faint peach horizon, muted olive
and sage greens, natural shadows, silver-blue water, no dramatic rays or HDR.

Это художественно обработанные реальные фотографии, а не доказательство текущего
времени суток или состояния объектов. Alt-тексты указывают закатную обработку.
