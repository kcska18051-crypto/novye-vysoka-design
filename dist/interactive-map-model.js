(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  root.NOVYE_VYSOKA_MAP_MODEL = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const allItems = (data) => [...data.quarters, ...data.objects];

  function getVisibleItems(data, category) {
    const known = new Set(data.categories.map((item) => item.id));
    const selected = known.has(category) ? category : 'all';
    const items = allItems(data);
    return selected === 'all' ? items : items.filter((item) => item.category === selected);
  }

  function getItemById(data, id) {
    return allItems(data).find((item) => item.id === id) || null;
  }

  function nextSelection(data, category, selectedId) {
    if (!selectedId) return null;
    return getVisibleItems(data, category).some((item) => item.id === selectedId) ? selectedId : null;
  }

  function getCardModel(item) {
    if (!item) return null;
    const isQuarter = item.category === 'quarters';
    return {
      id: item.id,
      kind: isQuarter ? 'quarter' : 'object',
      name: item.name,
      description: item.description,
      image: item.image || item.imageFallback || '',
      imageFallback: item.imageFallback || '',
      facts: item.facts || [],
      mapUrl: item.mapUrl || '',
      distances: item.distances || [],
      metrics: isQuarter ? {
        pricePerSotka: item.pricePerSotka || 'Уточняется',
        free: item.free || 'Уточняется',
        reserved: item.reserved || 'Уточняется',
        sold: item.sold || 'Уточняется'
      } : null
    };
  }

  return { getVisibleItems, getItemById, nextSelection, getCardModel };
});
