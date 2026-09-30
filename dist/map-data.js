(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  root.NOVYE_VYSOKA_MAP_DATA = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const unknown = 'По запросу';
  const quarters = [
    { id: 'quarter-1', name: 'Квартал 1', category: 'quarters', x: 33, y: 28, image: 'assets/quarters/quarter-1.webp', pricePerSotka: unknown, free: unknown, reserved: unknown, sold: unknown, distances: [], description: 'Северная часть общего генплана. Откройте схему, чтобы рассмотреть расположение участков.' },
    { id: 'quarter-2', name: 'Квартал 2', category: 'quarters', x: 30, y: 51, image: 'assets/quarters/quarter-2.webp', pricePerSotka: unknown, free: unknown, reserved: unknown, sold: unknown, distances: [], description: 'Западная часть общего генплана. Откройте схему, чтобы рассмотреть расположение участков.' },
    { id: 'quarter-3', name: 'Квартал 3', category: 'quarters', x: 51, y: 66, image: 'assets/quarters/quarter-3.webp', pricePerSotka: unknown, free: unknown, reserved: unknown, sold: unknown, distances: [], description: 'Участки вдоль центральной дороги. Актуальное наличие можно запросить у команды проекта.' },
    { id: 'quarter-4', name: 'Квартал 4', category: 'quarters', x: 76, y: 72, image: 'assets/quarters/quarter-4.webp', pricePerSotka: unknown, free: unknown, reserved: unknown, sold: unknown, distances: [], description: 'Восточная часть общего генплана. Откройте схему, чтобы рассмотреть расположение участков.' },
    { id: 'quarter-5', name: 'Квартал 5', category: 'quarters', x: 83, y: 88, image: 'assets/quarters/quarter-5.webp', pricePerSotka: unknown, free: unknown, reserved: unknown, sold: unknown, distances: [], description: 'Юго-восточная часть общего генплана. Актуальное наличие можно запросить у команды проекта.' }
  ];

  const objects = [
    { id: 'forest', name: 'Высоковский бор', category: 'nature', x: 43, y: 43, image: 'assets/forest-path.webp', description: 'Сосновый лес рядом с территорией проекта — пространство для прогулок, грибов и спокойных выходных.', facts: ['Сосновый бор', 'Прогулочные маршруты'] },
    { id: 'beach', name: 'Пляж', category: 'nature', x: 8, y: 31, image: 'assets/quiet-beach.webp', description: 'Песчаный берег большой воды для прогулок и летнего отдыха.', facts: ['Берег Волги', 'Точная точка уточняется'] },
    { id: 'pier', name: 'Причал', category: 'infrastructure', x: 9, y: 46, image: 'assets/forest-v2/pier-warm.webp', description: 'Концепция проекта предусматривает точку у воды для лодок и прогулок по Волге.', facts: ['Концепция проекта', 'Расположение будет подтверждено'] },
    { id: 'restaurant', name: 'Ресторан', category: 'infrastructure', x: 62, y: 23, image: 'assets/map-objects/restaurant.webp', imageFallback: 'assets/terrace-family.webp', description: 'Образ будущего места для семейных обедов и встреч рядом с природой.', facts: ['Визуализация будущего объекта'] },
    { id: 'camp', name: 'Детский лагерь «Высоковский бор»', category: 'infrastructure', x: 25, y: 37, image: 'assets/forest-water.webp', description: 'Детский лагерь отдыха в сосновом лесу на берегу Волги.', facts: ['д. Дегтярицы, 101'] },
    { id: 'school', name: 'Николо-Кормский центр образования', category: 'infrastructure', x: 91, y: 76, imageFallback: 'assets/territory-panorama.jpg', description: 'Образовательный комплекс имени Г. А. Троицкого.', facts: ['с. Никольское, ул. Мира, 18'] },
    { id: 'shop-five', name: 'Пятёрочка', category: 'infrastructure', x: 94, y: 67, imageFallback: 'assets/territory-panorama.jpg', description: 'Продуктовый магазин рядом с территорией проекта.', facts: ['с. Николо-Корма, ул. Светлая, 22'] },
    { id: 'shop-ryzhik', name: 'Рыжик', category: 'infrastructure', x: 92, y: 83, imageFallback: 'assets/territory-panorama.jpg', description: 'Магазин продуктов в Никольском.', facts: ['с. Никольское, ул. Центральная, 42'] },
    { id: 'church-nicholas', name: 'Церковь Николая Чудотворца', category: 'infrastructure', x: 88, y: 79, imageFallback: 'assets/territory-panorama.jpg', description: 'Церковь Николая Чудотворца в Николо-Корме.', facts: ['Николо-Корма'] },
    { id: 'church-presentation', name: 'Церковь Введения во храм', category: 'infrastructure', x: 86, y: 74, imageFallback: 'assets/territory-panorama.jpg', description: 'Церковь Введения во храм Пресвятой Богородицы рядом с проектом.', facts: ['Точное расположение показано на карте'] },
    { id: 'bus-stop', name: 'Остановка «Дегтярицы»', category: 'transport', x: 56, y: 17, imageFallback: 'assets/route-map.png', description: 'Остановка общественного транспорта на дороге 78Н-0704.', facts: ['Автобус № 190', 'Маршрут до Рыбинска'], mapUrl: 'https://yandex.ru/maps/?ll=38.516917%2C57.911129&z=16.61' }
  ];

  return Object.freeze({
    categories: Object.freeze([
      { id: 'all', label: 'Все' },
      { id: 'quarters', label: 'Кварталы' },
      { id: 'nature', label: 'Природа' },
      { id: 'infrastructure', label: 'Инфраструктура' },
      { id: 'transport', label: 'Транспорт' }
    ]),
    quarters: Object.freeze(quarters),
    objects: Object.freeze(objects)
  });
});
