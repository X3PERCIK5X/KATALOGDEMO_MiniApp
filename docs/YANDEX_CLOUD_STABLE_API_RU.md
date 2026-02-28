# Стабильный API в Yandex Cloud (prod)

Ниже рабочая схема для SaaS API: **Compute VM + static IP + Nginx + TLS + systemd**.

## 1) Рекомендуемая архитектура
- `Yandex Compute Cloud` VM (Ubuntu 22.04 LTS, 2 vCPU, 4 GB RAM)
- Отдельный домен API: `api.<your-domain>`
- Nginx как reverse proxy на `127.0.0.1:3000`
- Node.js сервис через `systemd` (авторестарт)
- Данные: `storage/saas.sqlite3` + `uploads/`
- Бэкап через cron (ежедневно)

## 2) DNS и сеть
- Выдай VM **статический внешний IP**.
- В DNS сделай `A` запись: `api.<your-domain>` -> этот IP.
- Открой порты: `22`, `80`, `443`.

## 3) Установка на VM
```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx certbot python3-certbot-nginx git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs
```

## 4) Развертывание приложения
```bash
sudo mkdir -p /opt/demokatalog-api
sudo chown -R $USER:$USER /opt/demokatalog-api
git clone https://github.com/X3PERCIK5X/KATALOGDEMO_MiniApp.git /opt/demokatalog-api
cd /opt/demokatalog-api
npm ci --omit=dev
cp .env.example .env.local
```

Заполни `/opt/demokatalog-api/.env.local`:
- `PORT=3000`
- `DEFAULT_STORE_ID=111111`
- `DEFAULT_ADMIN_PASSWORD=<сильный_пароль>`
- `OWNER_API_KEY=<сильный_ключ>`
- `ALLOWED_ORIGINS=https://x3percik5x.github.io,https://t.me`

## 5) systemd сервис
```bash
sudo cp /opt/demokatalog-api/deploy/yandex/demokatalog-api.service /etc/systemd/system/demokatalog-api.service
sudo systemctl daemon-reload
sudo systemctl enable demokatalog-api
sudo systemctl start demokatalog-api
sudo systemctl status demokatalog-api --no-pager
```

## 6) Nginx
```bash
sudo cp /opt/demokatalog-api/deploy/yandex/nginx-demokatalog-api.conf /etc/nginx/sites-available/demokatalog-api
sudo ln -sf /etc/nginx/sites-available/demokatalog-api /etc/nginx/sites-enabled/demokatalog-api
sudo nginx -t
sudo systemctl reload nginx
```

Отредактируй `server_name` в файле на свой домен.

## 7) TLS
```bash
sudo certbot --nginx -d api.<your-domain>
```

Проверка:
```bash
curl -s https://api.<your-domain>/api/health
```

## 8) Обновление приложения
```bash
cd /opt/demokatalog-api
./deploy/yandex/deploy.sh
```

## 9) Бэкап (sqlite + uploads)
Пример cron (ежедневно 03:20):
```bash
crontab -e
```
```cron
20 3 * * * tar -czf /opt/demokatalog-backups/demokatalog-$(date +\%F).tar.gz /opt/demokatalog-api/storage /opt/demokatalog-api/uploads
```

## 10) Контроль
- health: `/api/health`
- логи API: `journalctl -u demokatalog-api -f`
- логи nginx: `/var/log/nginx/error.log`
