# 🍕 أسوان فود - Aswan Food Delivery

> منصة توصيل الطعام الأولى في محافظة أسوان

![Aswan Food](https://img.shields.io/badge/Status-In%20Development-yellow)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue)

## 🎯 نظرة عامة

أسوان فود هو تطبيق ويب شامل لتوصيل الطعام مصمم خصيصاً لمحافظة أسوان. يربط التطبيق بين العملاء والمطاعم المحلية وسائقي التوصيل في منصة واحدة سهلة الاستخدام.

## ✨ الميزات الرئيسية

### للعملاء 👥
- تصفح المطاعم المحلية في أسوان
- البحث والفلترة حسب نوع الطعام والسعر
- إضافة الطعام للسلة والطلب بسهولة
- تتبع الطلب في الوقت الفعلي
- دفع آمن (نقدي أو إلكتروني)
- تقييم المطاعم والأطعمة

### لأصحاب المطاعم 🏪
- إدارة ملف المطعم والقائمة
- استقبال وإدارة الطلبات
- تحليل المبيعات والتقارير
- إدارة أوقات العمل والتوفر

### لسائقي التوصيل 🚗
- استقبال طلبات التوصيل
- تتبع المسارات المثلى
- إدارة حالة التوصيل
- تتبع الأرباح

### للإدارة 👨‍💼
- مراقبة النظام والإحصائيات
- إدارة المطاعم والمستخدمين
- إدارة المناطق والتغطية
- تقارير مفصلة

## 🛠️ التقنيات المستخدمة

### Frontend
- **React.js 18** - مكتبة واجهة المستخدم
- **TypeScript** - للأمان في الكود
- **Redux Toolkit** - إدارة الحالة
- **Tailwind CSS** - التصميم والتنسيق
- **React Router** - التنقل بين الصفحات
- **Socket.io Client** - التحديث في الوقت الفعلي
- **React Hook Form** - إدارة النماذج
- **Axios** - طلبات HTTP

### Backend
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الخادم
- **TypeScript** - للأمان في الكود
- **PostgreSQL** - قاعدة البيانات الرئيسية
- **Redis** - التخزين المؤقت
- **Socket.io** - الاتصال في الوقت الفعلي
- **JWT** - المصادقة والتفويض
- **Multer** - رفع الملفات
- **Nodemailer** - إرسال الإيميلات

### DevOps & Tools
- **Docker** - الحاويات
- **GitHub Actions** - CI/CD
- **Cloudinary** - تخزين الصور
- **Stripe** - معالجة المدفوعات
- **Google Maps API** - الخرائط والمواقع

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js (18.0+)
- PostgreSQL (13.0+)
- Redis (6.0+)
- npm أو yarn

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-username/aswan-food-delivery.git
cd aswan-food-delivery
```

2. **تثبيت التبعيات**
```bash
npm run install-all
```

3. **إعداد قاعدة البيانات**
```bash
# إنشاء قاعدة بيانات PostgreSQL
createdb aswan_food_db

# تشغيل الـ migrations
cd server
npm run migrate
npm run seed
```

4. **إعداد متغيرات البيئة**
```bash
# نسخ ملفات البيئة
cp server/.env.example server/.env
cp client/.env.example client/.env

# تحرير الملفات وإضافة البيانات المطلوبة
```

5. **تشغيل التطبيق**
```bash
npm run dev
```

## 🏗️ هيكل المشروع

```
aswan-food-delivery/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # المكونات القابلة لإعادة الاستخدام
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── store/         # إدارة الحالة (Redux)
│   │   ├── services/      # خدمات API
│   │   ├── utils/         # الوظائف المساعدة
│   │   └── types/         # أنواع TypeScript
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # تحكم في المنطق
│   │   ├── models/        # نماذج قاعدة البيانات
│   │   ├── routes/        # مسارات API
│   │   ├── middleware/    # الوسطاء
│   │   ├── services/      # الخدمات
│   │   └── utils/         # الوظائف المساعدة
│   └── package.json
├── shared/                 # الكود المشترك
└── docs/                  # التوثيق
```

## 📱 لقطات الشاشة

*سيتم إضافة لقطات الشاشة عند اكتمال التطوير*

## 🌟 المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

## 📞 التواصل

- **البريد الإلكتروني**: your.email@example.com
- **LinkedIn**: [Your LinkedIn Profile]
- **GitHub**: [Your GitHub Profile]

---

**صُنع بـ ❤️ لأهل أسوان الكرام**

> "أسوان فود - لأن الطعم الأصيل يستاهل التوصيل الأصيل"