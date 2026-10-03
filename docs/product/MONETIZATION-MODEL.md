# Модель монетизации KAFENE

**Статус:** ACTIVE DRAFT

## Назначение

Зафиксировать коммерческую модель KAFENE так, чтобы она:

- не ломала бесплатный knowledge/community loop;
- монетизировала высокоинтентные действия пользователя;
- могла работать не только на Кипре;
- не зашивала конкретную страну, город, категорию или валюту в ядро продукта;
- позволяла развивать несколько локальных инсталляций одного продуктового каркаса.

## Базовый принцип

KAFENE не должен строиться как рекламный сайт.

Главная коммерческая ценность возникает в точке, где практический вопрос пользователя превращается в действие:

`вопрос → гайд / journey / hub → подходящие коммерческие варианты → лид / покупка / подписка`.

Knowledge layer и базовый community layer остаются доступными бесплатно.

По умолчанию не вводится paywall на канонические гайды.

## Домен-агностичный каркас

KAFENE должен разделять:

### 1. Portable core

Общие продуктовые сущности и механики:

- guide;
- journey;
- collection / hub;
- change;
- news;
- discussion;
- locality;
- business;
- offer;
- lead;
- sponsorship placement;
- user subscription;
- analytics event.

### 2. Deployment configuration

Локальная конфигурация конкретного рынка:

- страна / штат / город;
- бренд и визуальная оболочка;
- языки;
- категории гайдов;
- категории бизнеса;
- localities;
- валюта;
- правовые / рекламные ограничения;
- pricing;
- локальные источники;
- локальные партнёры;
- локальная форумная структура.

Кипр — первая deployment-конфигурация, а не жёстко прошитая предметная область ядра.

Сегодня это может быть Cyprus deployment, позднее — New York deployment или другой рынок без переписывания core model.

## Основные коммерческие сущности

### Business

Профиль коммерческого или профессионального поставщика услуг.

Минимально может включать:

- id;
- deployment / market;
- category;
- locality;
- languages;
- display name;
- description;
- contact / destination;
- verification state;
- plan;
- visibility state.

### Offer

Конкретное коммерческое предложение, CTA или продукт бизнеса.

Примеры:

- консультация;
- страховой продукт;
- просмотр школы;
- заявка на услугу;
- quote request;
- пакет сопровождения.

Offer не должен быть обязателен для каждого Business.

### Lead

Нормализованный пользовательский запрос, который может быть передан одному или нескольким подходящим партнёрам.

Lead должен быть отдельной сущностью, а не просто email form submission.

Минимальные поля на продуктовом уровне:

- deployment / market;
- user intent;
- category;
- locality;
- language;
- source page / guide / journey;
- qualification state;
- routing state;
- assigned businesses;
- consent state;
- timestamps.

Это продуктовый контракт, а не окончательная схема БД.

## Каналы выручки

### 1. Business / Expert subscriptions

Основной повторяемый B2B revenue.

Базовая модель:

- бесплатный listing;
- платный Verified;
- платный Pro.

Рабочие ценовые гипотезы для Cyprus deployment:

- Verified: около €49 / месяц;
- Pro: около €149 / месяц.

Это не финальный прайс и не часть portable core.

В других deployment цены задаются локально.

### 2. Sponsorship

Спонсорство конкретных high-intent surfaces:

- category hub;
- city / locality hub;
- journey;
- тематический guide cluster;
- homepage placement.

Примеры:

- Tax hub;
- Schools hub;
- Property hub;
- Limassol page.

Спонсорство должно быть явно обозначено и не менять редакционную истину.

Рабочая Cyprus-гипотеза:

- примерно €500–1,500 / месяц за качественный ограниченный slot.

### 3. Qualified leads

Платная маршрутизация квалифицированного пользовательского запроса.

Примеры:

- найти бухгалтера;
- подобрать школу;
- получить предложения по relocation;
- получить страховой quote;
- найти специалиста по автомобилю;
- запросить corporate services.

Модель оплаты может быть:

- fixed fee per qualified lead;
- package / monthly quota;
- flat subscription + included leads.

Для регулируемых категорий конкретная lead/referral economics должна проходить отдельную локальную legal/compliance проверку.

Portable core не должен предполагать, что referral fee разрешён в любой юрисдикции.

### 4. Consumer Premium

Вторичный канал, не основа модели.

Платная подписка может включать позднее:

- saved journeys;
- персональные checklists;
- tracked guides;
- alerts по изменениям;
- расширенные Ask KAFENE quotas;
- персональный dashboard;
- отсутствие коммерческих placements.

Рабочая Cyprus-гипотеза:

- около €5.90 / месяц;
- либо около €49 / год.

Бесплатная knowledge base остаётся основной acquisition surface.

### 5. Affiliate / CPA

Дополнительный revenue там, где пользователь естественно готов совершить покупку.

Потенциальные категории:

- mobile / internet;
- insurance;
- moving;
- utilities;
- fintech / banking, где допустимо;
- travel;
- car-related services;
- другие локальные сервисы.

Affiliate economics не должны определять editorial ranking.

## Коммерческий путь пользователя

Базовый flow:

`Question`
→ `Guide / Journey / Hub`
→ `commercial options`
→ `Lead / Offer interaction`
→ `Partner conversion`
→ `Revenue`

Коммерческий CTA должен быть связан с текущим intent пользователя.

Не вставлять generic ads, когда нет понятной связи с задачей.

## Коммерческий путь бизнеса

`Business profile`
→ `relevant category / locality placement`
→ `qualified user`
→ `lead / offer interaction`
→ `conversion`
→ `retention / subscription renewal`

Продукт должен уметь позже показать бизнесу:

- views;
- profile opens;
- lead count;
- qualified lead count;
- conversion events, если доступны;
- source surfaces.

## Связь с knowledge layer

Коммерческие сущности не смешиваются с каноническим знанием.

Guide не становится рекламным текстом.

Допустимые связи:

- guide → related businesses;
- journey → commercial next steps;
- hub → sponsored placement;
- locality → relevant businesses;
- change → без коммерческого вмешательства по умолчанию;
- discussion → business participation по отдельным правилам.

Редакционная и коммерческая сортировка должны оставаться различимыми.

## Связь с homepage

MVP homepage не обязан сразу показывать большой business directory.

Но архитектура карточек и destination model не должна блокировать позднее появление:

- sponsored card;
- business CTA;
- offer CTA;
- lead CTA.

Commercial placement должен быть отдельным presentation type и иметь явный disclosure state.

## Каталог бизнеса

Позднее нужен отдельный индекс бизнеса, аналогично `/guides`.

Portable route concept:

- `/businesses` или локальный эквивалент.

Фильтры:

- category;
- locality;
- language;
- verification;
- service / offer type.

Точный route/copy не фиксируется этим документом.

## Аналитика для монетизации

Минимально полезные события:

- business_profile_view;
- commercial_card_click;
- offer_open;
- lead_start;
- lead_submit;
- lead_qualified;
- lead_routed;
- sponsor_impression;
- sponsor_click;
- subscription_start;
- subscription_renewal;
- affiliate_click.

Не требуется реализовывать весь набор в MVP homepage.

Но event model должен позволять добавить их без переработки базовой аналитики.

## Экономика: рабочий сценарий €10k MRR

Это **не прогноз**, а sanity-check бизнес-модели.

Пример Cyprus deployment:

- 30 Verified × €49 = €1,470;
- 10 Pro × €149 = €1,490;
- 3 sponsorships × €750 = €2,250;
- 150 qualified leads × €20 = €3,000;
- 250 Premium users × €5.90 = €1,475;
- affiliate / CPA ≈ €500.

Итого:

**≈ €10,185 MRR.**

Главный вывод: для достижения порядка €10k MRR продукту не обязательно становиться массовым медиа. Нужен достаточно плотный поток high-intent пользователей и ограниченное число платящих B2B партнёров.

## Более зрелый рабочий сценарий

Пример при заметном локальном трафике:

- 60 Verified × €49 = €2,940;
- 20 Pro × €149 = €2,980;
- 5 sponsorships × €900 = €4,500;
- 350 leads × €25 = €8,750;
- 500 Premium × €5.90 = €2,950;
- affiliate ≈ €1,500.

Итого:

**≈ €23,620 MRR.**

Это также scenario model, а не forecast.

## Что не является основой модели

### Programmatic display ads

Баннерная/programmatic реклама может существовать позднее, но не должна быть центральным revenue engine.

Причины:

- сравнительно низкая monetization density;
- ухудшение интерфейса;
- конфликт с trust positioning;
- high-intent leads/sponsorship/subscriptions потенциально ценнее.

### Marketplace / booking engine

Не строить полноценный marketplace или booking engine только ради монетизации на ранней стадии.

Сначала достаточно:

- профилей;
- CTA;
- lead routing;
- простых offers;
- analytics.

## Ограничения portable core

Core model не должен жёстко кодировать:

- Cyprus;
- конкретную валюту;
- EN/RU как единственно возможные языки;
- конкретные категории услуг;
- конкретные города;
- конкретные цены;
- referral fee как всегда разрешённый механизм;
- локальные regulatory assumptions.

Все такие параметры принадлежат deployment configuration.

## Что должно быть предусмотрено заранее, но не обязательно реализовано сейчас

1. `Business`.
2. `Offer`.
3. `Lead`.
4. commercial placement / sponsorship type.
5. market/deployment identity.
6. locality hierarchy.
7. currency/pricing configuration.
8. compliance flags для monetization channel.
9. monetization analytics events.

## Явно не требуется прямо сейчас

- полноценный business portal;
- self-service billing;
- marketplace;
- booking;
- автоматический lead scoring;
- сложный CRM;
- sponsor auction;
- dynamic ad server;
- multi-market admin UI.

## Открытые решения

1. точная граница между free / Verified / Pro;
2. exact pricing Cyprus deployment;
3. lead pricing model по категориям;
4. disclosure UI для sponsorship/commercial placements;
5. legal/compliance matrix по регулируемым вертикалям;
6. consumer Premium feature set;
7. архитектура multi-deployment management;
8. будет ли каждый deployment иметь свой локальный бренд или часть рынков останется под KAFENE.

## Условие принятия

Архитектурные принципы этого документа могут быть приняты отдельно от конкретных цен.

Перед переводом документа в CANONICAL необходимо:

1. сверить его с `PROJECT_RULES.md`;
2. сверить с `docs/00-DECISIONS.md`;
3. сверить с `docs/STATUS.md`;
4. зарегистрировать окончательный статус в inventory;
5. убедиться, что локальные pricing assumptions не представлены как universal core behavior.

До этого документ остаётся `ACTIVE DRAFT`.
