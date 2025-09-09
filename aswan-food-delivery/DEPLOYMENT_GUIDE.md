# 🚀 دليل النشر والتشغيل - أسوان فود
# Deployment Guide - Aswan Food

## 🎯 نظرة عامة (Overview)

هذا الدليل يشرح كيفية تشغيل ونشر تطبيق أسوان فود للطعام في بيئات مختلفة.

## ⚡ البدء السريع (Quick Start)

### المتطلبات الأساسية
- Node.js 18.0+
- PostgreSQL 13.0+
- Redis 6.0+
- npm أو yarn

### التشغيل بخطوة واحدة
```bash
# تحميل المشروع
git clone <repository-url>
cd aswan-food-delivery

# تشغيل سكريبت الإعداد السريع
./scripts/quick-start.sh
```

## 🛠️ الإعداد اليدوي (Manual Setup)

### 1. تثبيت التبعيات
```bash
# تثبيت تبعيات الجذر
npm install

# تثبيت تبعيات الخادم
cd server && npm install

# تثبيت تبعيات العميل
cd ../client && npm install
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
createdb aswan_food_db

# أو باستخدام Docker
docker run --name aswan-postgres \
  -e POSTGRES_DB=aswan_food_db \
  -e POSTGRES_USER=aswan_user \
  -e POSTGRES_PASSWORD=aswan_password \
  -p 5432:5432 -d postgres:15
```

### 3. إعداد Redis
```bash
# تشغيل Redis
redis-server

# أو باستخدام Docker
docker run --name aswan-redis -p 6379:6379 -d redis:7-alpine
```

### 4. إعداد متغيرات البيئة
```bash
# نسخ ملفات البيئة
cp server/.env.example server/.env
cp client/.env.example client/.env

# تحرير الملفات وإضافة القيم الحقيقية
nano server/.env
nano client/.env
```

### 5. إعداد قاعدة البيانات
```bash
cd server

# توليد Prisma client
npx prisma generate

# تشغيل المايقريشن
npx prisma migrate dev --name init

# إضافة البيانات التجريبية
npm run seed
```

### 6. تشغيل التطبيق
```bash
# العودة للجذر
cd ..

# تشغيل الخادم والعميل معاً
npm run dev
```

## 🐳 النشر باستخدام Docker

### التشغيل مع Docker Compose
```bash
# بناء وتشغيل جميع الخدمات
docker-compose up -d

# عرض الحالة
docker-compose ps

# عرض اللوقز
docker-compose logs -f

# إيقاف الخدمات
docker-compose down
```

### إعداد البيئة للإنتاج
```bash
# إنشاء ملف البيئة للإنتاج
cp .env.example .env.production

# تحديث القيم للإنتاج
nano .env.production

# تشغيل مع ملف البيئة المخصص
docker-compose --env-file .env.production up -d
```

## ☁️ النشر السحابي (Cloud Deployment)

### AWS Deployment
```bash
# 1. إنشاء EC2 instance
# 2. تثبيت Docker و Docker Compose
# 3. استنساخ المشروع
# 4. إعداد متغيرات البيئة
# 5. تشغيل التطبيق
```

### DigitalOcean Deployment
```bash
# 1. إنشاء Droplet
# 2. إعداد النطاق والـ SSL
# 3. نشر التطبيق
# 4. إعداد النسخ الاحتياطية
```

## 🔧 الصيانة والمراقبة

### مراقبة الصحة
```bash
# فحص حالة الخدمات
curl http://localhost:5000/health

# مراقبة استخدام الموارد
docker stats

# عرض لوقز الأخطاء
docker-compose logs server | grep ERROR
```

### النسخ الاحتياطية
```bash
# نسخ احتياطي لقاعدة البيانات
docker exec aswan-postgres pg_dump -U aswan_user aswan_food_db > backup.sql

# استعادة النسخة الاحتياطية
docker exec -i aswan-postgres psql -U aswan_user aswan_food_db < backup.sql
```

## 🌐 إعداد النطاق والـ SSL

### Nginx Configuration (Production)
```nginx
server {
    listen 80;
    server_name aswanfood.com www.aswanfood.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aswanfood.com www.aswanfood.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🔑 بيانات الدخول التجريبية (Demo Credentials)

### العملاء (Customers)
- **Email**: customer1@example.com
- **Password**: user123
- **الدور**: عميل

### أصحاب المطاعم (Restaurant Owners)
- **Email**: owner1@aswanfood.com
- **Password**: user123
- **الدور**: صاحب مطعم
- **المطعم**: البيت النوبي

### سائقو التوصيل (Delivery Drivers)
- **Email**: driver1@aswanfood.com
- **Password**: user123
- **الدور**: سائق توصيل

### الإداريون (Admins)
- **Email**: admin@aswanfood.com
- **Password**: admin123
- **الدور**: مدير النظام

## 📱 اختبار الميزات (Feature Testing)

### 1. اختبار تسجيل الدخول
```
1. اذهب إلى /login
2. استخدم بيانات العميل التجريبية
3. تأكد من إعادة التوجيه للرئيسية
```

### 2. اختبار الطلب
```
1. تصفح المطاعم
2. اختر مطعم واضف أطعمة للسلة
3. اذهب للدفع وأكمل الطلب
4. تتبع الطلب في الوقت الفعلي
```

### 3. اختبار الإدارة
```
1. سجل دخول كمدير
2. اذهب لوحة التحكم
3. راجع الإحصائيات والتقارير
```

## 🔍 استكشاف الأخطاء (Troubleshooting)

### مشاكل شائعة

#### خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من حالة PostgreSQL
docker ps | grep postgres

# إعادة تشغيل قاعدة البيانات
docker restart aswan-postgres
```

#### خطأ في Socket.IO
```bash
# تحقق من إعدادات CORS
# تأكد من تطابق الـ CLIENT_URL في البيئة
```

#### خطأ في التبعيات
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

## 📈 مراقبة الأداء

### مؤشرات الأداء الرئيسية
- **Response Time**: < 200ms للـ API
- **Database Queries**: < 50ms متوسط
- **Memory Usage**: < 512MB للخادم
- **CPU Usage**: < 70% في الذروة

### أدوات المراقبة
- **PM2 Monitoring**: لمراقبة العمليات
- **Database Monitoring**: PostgreSQL stats
- **Redis Monitoring**: Redis info
- **Application Logs**: Winston logs

## 🎉 التشغيل الناجح

عند التشغيل الناجح، ستحصل على:

```
🚀 أسوان فود - خادم التطبيق يعمل الآن
📡 الخادم متاح على: http://localhost:5000
🌐 البيئة: development
📊 قاعدة البيانات: متصلة
🔴 Redis: متصل
⚡ Socket.IO: متاح

📋 نقاط النهاية المتاحة:
  GET  /health - فحص حالة الخادم
  POST /api/auth/register - تسجيل مستخدم جديد
  POST /api/auth/login - تسجيل الدخول
  GET  /api/restaurants - عرض المطاعم
  POST /api/orders - إنشاء طلب جديد

🎯 جاهز لاستقبال الطلبات من أسوان وما حولها!
```

---

**للدعم الفني**: support@aswanfood.com  
**للطوارئ**: +20 123 456 7890