# SaaS: Store ID и общая админка

## Что реализовано
- Единая админка с авторизацией по `storeId + пароль`.
- Регистрация нового магазина с автоматической генерацией `storeId` (ровно 6 символов).
- Полная изоляция данных по магазину:
  - `config`
  - `categories`
  - `products`
  - загруженные изображения (папка `uploads/<STORE_ID>/...`)
- Публикация из админки обновляет только выбранный магазин.

## API (сервер)
- `POST /api/auth/register` — регистрация магазина.
- `POST /api/auth/login` — вход в магазин.
- `GET /api/auth/me` — проверка текущей сессии.
- `GET /api/admin/data` — получить данные магазина (требуется Bearer token).
- `PUT /api/admin/data` — сохранить данные магазина (требуется Bearer token).
- `POST /api/upload-image` — загрузка фото (требуется Bearer token).
- `GET /api/store/:storeId/public` — публичные данные каталога по `storeId`.

## Store ID для текущего каталога
Сервер при первом запуске создает магазин из локальных файлов (`config.json`, `data/categories.json`, `data/products.json`) с параметрами:
- `DEFAULT_STORE_ID=DEMO01`
- `DEFAULT_ADMIN_EMAIL=admin@demokatalog.app`
- `DEFAULT_ADMIN_PASSWORD=Admin12345`

Их можно переопределить в `.env.local`.

## Как открыть
- Админка: открыть mini app в admin-режиме (`?admin=1` или `start_param` с `admin`), затем пройти вход.
- Каталог клиента: открыть mini app с `?store=DEMO01` (или другим storeId).

## Важно
- Для работы нужен Node.js 18+.
- В продакшене обязательно поменять `DEFAULT_ADMIN_PASSWORD`.
