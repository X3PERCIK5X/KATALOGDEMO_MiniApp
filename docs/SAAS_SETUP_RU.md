# SaaS: Store ID и общая админка

## Что реализовано
- Единая админка с авторизацией по `storeId + пароль`.
- Регистрация нового магазина с автоматической генерацией `storeId` (ровно 6 символов).
- Активация магазина клиентом по `storeId + inviteCode`.
- Полная изоляция данных по магазину:
  - `config`
  - `categories`
  - `products`
  - загруженные изображения (папка `uploads/<STORE_ID>/...`)
- Публикация из админки обновляет только выбранный магазин.
- Мульти-магазинная БД (one deploy / many stores) с изоляцией по `store_id`:
  - `stores`, `store_users`, `sessions`
  - `categories`, `products`
  - `orders`, `order_items`
  - `events`
- Уведомления по заказам через бот конкретного магазина (`bot_token` в `stores`).

## API (сервер)
- `POST /api/owner/stores` — создать магазин для клиента (требуется `x-owner-key`).
- `POST /api/auth/register` — регистрация магазина.
- `POST /api/auth/activate` — активация клиентом созданного магазина.
- `POST /api/auth/register-by-store` — регистрация клиента по `storeId` (установка пароля).
- `POST /api/auth/login` — вход в магазин.
- `GET /api/auth/me` — проверка текущей сессии.
- `GET /api/admin/stores` — список магазинов пользователя.
- `POST /api/admin/stores` — создать новый магазин из админки.
- `POST /api/admin/stores/:storeId/bot` — подключить бота магазина (валидация `getMe`).
- `GET /api/admin/data` — получить данные магазина (требуется Bearer token).
- `PUT /api/admin/data` — сохранить данные магазина (требуется Bearer token).
- `POST /api/upload-image` — загрузка фото (требуется Bearer token).
- `GET /api/store/:storeId/public` — публичные данные каталога по `storeId`.
- `GET /api/stores/:storeId/public` — публичные данные каталога по `storeId`.
- `GET /api/stores/:storeId/categories` — категории магазина.
- `GET /api/stores/:storeId/products` — товары магазина.
- `POST /api/stores/:storeId/events` — запись событий (`view_product`, `add_to_cart`, `begin_checkout`, `create_order`, `payment_success`, `payment_fail`).
- `POST /api/stores/:storeId/orders` — создание заказа.
- `GET /api/stores/:storeId/admin/orders` — админ: заказы магазина.
- `GET /api/stores/:storeId/admin/metrics` — админ: базовые метрики магазина.

## Store ID для текущего каталога
Сервер при первом запуске создает магазин из локальных файлов (`config.json`, `data/categories.json`, `data/products.json`) с параметрами:
- `DEFAULT_STORE_ID=111111`
- `DEFAULT_ADMIN_EMAIL=admin@demokatalog.app`
- `DEFAULT_ADMIN_PASSWORD=Admin12345`

Их можно переопределить в `.env.local`.

Дополнительно:
- `OWNER_API_KEY` — секрет владельца SaaS для создания клиентских магазинов через `POST /api/owner/stores`.
- `BOT_TOKEN_SECRET` — ключ шифрования `bot_token` в БД (AES-GCM).
- `SAAS_API_BASE` — базовый URL SaaS API для CLI-утилиты создания магазинов.

## Как открыть
- Админка: открыть mini app в admin-режиме (`?admin=1` или `start_param` с `admin`), затем пройти вход.
- Каталог клиента: открыть mini app с `?store=111111` (или другим storeId).

## Поток для клиентов (рекомендуемый)
1. Владелец SaaS создает магазин:
   - `POST /api/owner/stores` с заголовком `x-owner-key: <OWNER_API_KEY>`
   - получает `storeId` и `inviteCode`
2. Передает клиенту `storeId + inviteCode`.
3. Клиент в админке выбирает вкладку `Регистрация`, вводит `storeId`, пароль и повтор пароля.
4. После сохранения пароля вход выполняется автоматически.

Актуальный UI админки:
- В одном окне две кнопки: `Вход` и `Регистрация`.
- `Вход`: `storeId + пароль`.
- `Регистрация`: `storeId + пароль + повтор пароля` (проверка совпадения сразу).

Пример запроса создания магазина:
```bash
curl -X POST "https://your-domain/api/owner/stores" \
  -H "Content-Type: application/json" \
  -H "x-owner-key: change_me_owner_key" \
  -d '{"storeName":"Store Client 1"}'
```

CLI-вариант (удобно для работы через Codex):
```bash
npm run create:store -- "Магазин клиента"
```
Скрипт выведет:
- `storeId`
- `inviteCode`

## Важно
- Для работы нужен Node.js 18+.
- В продакшене обязательно поменять `DEFAULT_ADMIN_PASSWORD`.
- Обязательно задать `BOT_TOKEN_SECRET` и `OWNER_API_KEY`.
