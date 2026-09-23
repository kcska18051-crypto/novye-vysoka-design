// Demo fixtures only. Replace geometry, records and status together with client material.
window.planData = {
  quarters: [
    { id:'nk', name:'Николо-Корма', description:'Участки для ИЖС в селе Николо-Корма, с круглогодичным подъездом. Площади по материалам проекта — 9–20 соток. Расположение относительно школы, магазина и соседних домов уточняйте для выбранного участка.', price:'от 45 000 ₽/сотка', bounds:[40,100,270,310] },
    { id:'dg', name:'Дегтярицы', description:'Участки для ИЖС рядом с жилыми домами, неподалёку от бора и Волги. На сайте проекта указаны площади 11–25 соток.', price:'от 70 000 ₽/сотка', bounds:[630,100,230,310] },
    { id:'ct', name:'Центральная часть', description:'Участки площадью 6,5–19,5 сотки возле лагеря «Высоковский бор» соединяют Дегтярицы и Николо-Корму. По данным страницы этого квартала, до асфальтированной дороги — 30 метров; участки ровные, подготовлены к строительству. Состояние выбранного участка и необходимые подготовительные работы уточняются при просмотре.', price:'Цена уточняется', bounds:[335,100,270,310] }
  ],
  plots: [
    {id:'ДЕМО-01',quarter:'nk',area:10,status:'free',pricePerSotka:null,total:null,rect:[70,175,90,85]},
    {id:'ДЕМО-02',quarter:'nk',area:12,status:'free',pricePerSotka:null,total:null,rect:[185,175,90,85]},
    {id:'ДЕМО-03',quarter:'nk',area:14,status:'sold',pricePerSotka:null,total:null,rect:[70,285,205,80]},
    {id:'ДЕМО-04',quarter:'dg',area:15,status:'free',pricePerSotka:null,total:null,rect:[660,175,170,85]},
    {id:'ДЕМО-05',quarter:'dg',area:11,status:'sold',pricePerSotka:null,total:null,rect:[660,285,170,80]},
    {id:'ДЕМО-06',quarter:'ct',area:16,status:'sold',pricePerSotka:null,total:null,rect:[365,175,205,190]}
  ]
};
