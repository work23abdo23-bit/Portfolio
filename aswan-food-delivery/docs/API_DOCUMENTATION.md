# 📚 توثيق الـ API - أسوان فود
# API Documentation - Aswan Food

## 🎯 نظرة عامة (Overview)

هذا التوثيق يشرح جميع نقاط النهاية (endpoints) المتاحة في API أسوان فود.

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Authentication**: Bearer JWT Token  

## 🔐 المصادقة (Authentication)

### تسجيل مستخدم جديد
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "أحمد",
  "lastName": "محمد",
  "phone": "+201234567890",
  "role": "CUSTOMER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "messageAr": "تم تسجيل المستخدم بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clp123...",
      "email": "user@example.com",
      "firstName": "أحمد",
      "lastName": "محمد",
      "role": "CUSTOMER",
      "isVerified": false
    }
  }
}
```

### تسجيل الدخول
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### الحصول على المستخدم الحالي
```http
GET /auth/me
Authorization: Bearer <token>
```

## 🏪 المطاعم (Restaurants)

### عرض جميع المطاعم
```http
GET /restaurants?page=1&limit=12&sortBy=rating&sortOrder=desc
```

**Query Parameters:**
- `page` (number): رقم الصفحة (افتراضي: 1)
- `limit` (number): عدد العناصر (افتراضي: 12)
- `search` (string): البحث في الأسماء والأوصاف
- `minRating` (number): الحد الأدنى للتقييم (1-5)
- `maxDeliveryTime` (number): الحد الأقصى لوقت التوصيل (بالدقائق)
- `sortBy` (string): ترتيب حسب (rating, deliveryTime, deliveryFee, name)
- `sortOrder` (string): اتجاه الترتيب (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Restaurants retrieved successfully",
  "messageAr": "تم استرداد المطاعم بنجاح",
  "data": [
    {
      "id": "clp123...",
      "name": "Nubian House Restaurant",
      "nameAr": "مطعم البيت النوبي",
      "description": "Authentic Nubian cuisine",
      "descriptionAr": "مأكولات نوبية أصيلة",
      "image": "https://...",
      "address": "شارع الكورنيش، أسوان",
      "rating": 4.5,
      "totalReviews": 125,
      "deliveryTime": 25,
      "deliveryFee": 15.0,
      "minimumOrder": 50.0,
      "isOpen": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### عرض مطعم محدد
```http
GET /restaurants/:id
```

### عرض قائمة المطعم
```http
GET /restaurants/:id/menu
```

### البحث في المطاعم
```http
GET /restaurants/search/:query?page=1&limit=20
```

## 🍕 القوائم (Menu)

### عرض الأطباق الشائعة
```http
GET /menu/popular?limit=20
```

### البحث في الأطباق
```http
GET /menu/search/:query?restaurantId=&categoryId=&minPrice=&maxPrice=
```

### عرض عنصر قائمة محدد
```http
GET /menu/items/:id
```

## 🛒 الطلبات (Orders)

### حساب إجمالي الطلب
```http
POST /orders/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "clp123...",
  "items": [
    {
      "menuItemId": "clp456...",
      "quantity": 2
    }
  ],
  "couponCode": "WELCOME10"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subtotal": 120.0,
    "deliveryFee": 15.0,
    "tax": 16.8,
    "discount": 12.0,
    "total": 139.8,
    "items": [...],
    "restaurant": {...},
    "coupon": {...}
  }
}
```

### إنشاء طلب جديد
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "clp123...",
  "addressId": "clp789...",
  "items": [
    {
      "menuItemId": "clp456...",
      "quantity": 2,
      "notes": "بدون فلفل حار"
    }
  ],
  "paymentMethod": "CASH",
  "notes": "اتصل عند الوصول",
  "couponCode": "WELCOME10"
}
```

### عرض طلب محدد
```http
GET /orders/:id
Authorization: Bearer <token>
```

### تحديث حالة الطلب
```http
PUT /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "estimatedDeliveryTime": "2024-01-15T14:30:00Z"
}
```

### إلغاء الطلب
```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "تغيير في الخطط"
}
```

## 👤 المستخدمين (Users)

### عرض الملف الشخصي
```http
GET /users/profile
Authorization: Bearer <token>
```

### تحديث الملف الشخصي
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "أحمد",
  "lastName": "محمد",
  "phone": "+201234567890"
}
```

### تغيير كلمة المرور
```http
PUT /users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### إدارة العناوين
```http
# عرض العناوين
GET /users/addresses
Authorization: Bearer <token>

# إضافة عنوان جديد
POST /users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "المنزل",
  "address": "شارع الكورنيش، أسوان",
  "city": "أسوان",
  "governorate": "أسوان",
  "latitude": 24.0889,
  "longitude": 32.8998,
  "isDefault": true
}

# تحديث عنوان
PUT /users/addresses/:id
Authorization: Bearer <token>

# حذف عنوان
DELETE /users/addresses/:id
Authorization: Bearer <token>

# تعيين عنوان افتراضي
PUT /users/addresses/:id/default
Authorization: Bearer <token>
```

### عرض طلبات المستخدم
```http
GET /users/orders?page=1&limit=10&status=DELIVERED
Authorization: Bearer <token>
```

## ⭐ التقييمات (Reviews)

### إضافة تقييم
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": "clp123...",
  "orderId": "clp456...",
  "rating": 5,
  "comment": "طعام ممتاز وخدمة رائعة!",
  "images": ["https://..."],
  "isAnonymous": false
}
```

### عرض التقييمات
```http
GET /reviews?restaurantId=clp123...&page=1&limit=10
```

### إحصائيات التقييمات
```http
GET /reviews/stats/:restaurantId
```

## 👨‍💼 لوحة الإدارة (Admin)

### التحليلات
```http
GET /admin/analytics?period=30
Authorization: Bearer <admin-token>
```

### إدارة المستخدمين
```http
# عرض المستخدمين
GET /admin/users?page=1&limit=20&role=CUSTOMER&search=أحمد
Authorization: Bearer <admin-token>

# تحديث حالة المستخدم
PUT /admin/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

### إدارة المطاعم
```http
# عرض المطاعم
GET /admin/restaurants?page=1&limit=20&isActive=true
Authorization: Bearer <admin-token>

# تحديث حالة المطعم
PUT /admin/restaurants/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

### إدارة الطلبات
```http
GET /admin/orders?page=1&limit=20&status=PENDING&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

## ⚡ Socket.IO Events

### الاتصال
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### أحداث الطلبات
```javascript
// تحديثات حالة الطلب
socket.on('order_update', (data) => {
  console.log('Order status updated:', data);
});

// موقع السائق
socket.on('driver_location', (data) => {
  console.log('Driver location:', data.driverLocation);
});

// طلب جديد (للمطاعم)
socket.on('new_order', (data) => {
  console.log('New order received:', data);
});
```

### إرسال الأحداث
```javascript
// تحديث موقع السائق
socket.emit('location_update', {
  latitude: 24.0889,
  longitude: 32.8998,
  orderId: 'clp123...'
});

// تحديث حالة الطلب
socket.emit('order_status_update', {
  orderId: 'clp123...',
  status: 'PREPARING',
  message: 'Order is being prepared'
});
```

## 📝 رموز الاستجابة (Response Codes)

### Success Codes
- `200 OK` - نجح الطلب
- `201 Created` - تم إنشاء المورد بنجاح
- `204 No Content` - نجح الطلب بدون محتوى

### Error Codes
- `400 Bad Request` - طلب غير صحيح
- `401 Unauthorized` - غير مصرح
- `403 Forbidden` - ممنوع
- `404 Not Found` - غير موجود
- `409 Conflict` - تعارض (مثل البريد الإلكتروني موجود)
- `422 Unprocessable Entity` - خطأ في التحقق
- `429 Too Many Requests` - طلبات كثيرة جداً
- `500 Internal Server Error` - خطأ داخلي في الخادم

## 🔍 أمثلة الاستخدام (Usage Examples)

### سيناريو كامل: إنشاء طلب

#### 1. تسجيل الدخول
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"user123"}'
```

#### 2. عرض المطاعم
```bash
curl -X GET http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer <token>"
```

#### 3. عرض قائمة مطعم
```bash
curl -X GET http://localhost:5000/api/restaurants/clp123.../menu \
  -H "Authorization: Bearer <token>"
```

#### 4. حساب إجمالي الطلب
```bash
curl -X POST http://localhost:5000/api/orders/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "restaurantId": "clp123...",
    "items": [{"menuItemId": "clp456...", "quantity": 2}]
  }'
```

#### 5. إنشاء الطلب
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "restaurantId": "clp123...",
    "addressId": "clp789...",
    "items": [{"menuItemId": "clp456...", "quantity": 2}],
    "paymentMethod": "CASH"
  }'
```

## 🚨 معالجة الأخطاء (Error Handling)

### تنسيق الأخطاء
```json
{
  "success": false,
  "message": "Validation failed",
  "messageAr": "فشل في التحقق من البيانات",
  "errors": {
    "email": ["Please provide a valid email address"],
    "password": ["Password must be at least 6 characters long"]
  }
}
```

### أخطاء التحقق
```json
{
  "success": false,
  "message": "Email address is already registered",
  "messageAr": "عنوان البريد الإلكتروني مسجل مسبقاً"
}
```

## 📊 الفلترة والترقيم (Filtering & Pagination)

### معاملات الفلترة الشائعة
```
?page=1              // رقم الصفحة
&limit=20            // عدد العناصر لكل صفحة
&search=نوبي         // البحث النصي
&sortBy=rating       // ترتيب حسب
&sortOrder=desc      // اتجاه الترتيب
&status=ACTIVE       // فلترة حسب الحالة
&startDate=2024-01-01 // تاريخ البداية
&endDate=2024-01-31   // تاريخ النهاية
```

### تنسيق الاستجابة المرقمة
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔄 حالات الطلبات (Order States)

### دورة حياة الطلب
```
PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
                                    ↓
                                CANCELLED
```

### تفسير الحالات
- **PENDING**: الطلب في الانتظار
- **CONFIRMED**: تم تأكيد الطلب من المطعم
- **PREPARING**: جاري تحضير الطلب
- **READY_FOR_PICKUP**: الطلب جاهز للاستلام
- **OUT_FOR_DELIVERY**: الطلب في الطريق للتوصيل
- **DELIVERED**: تم توصيل الطلب
- **CANCELLED**: تم إلغاء الطلب

## 💳 طرق الدفع (Payment Methods)

### الطرق المدعومة
- **CASH**: دفع نقدي عند التسليم
- **CARD**: بطاقة ائتمان (Stripe)
- **WALLET**: محفظة رقمية (مستقبلاً)

### حالات الدفع
- **PENDING**: في الانتظار
- **COMPLETED**: تم بنجاح
- **FAILED**: فشل
- **REFUNDED**: تم الاسترداد

## 🎨 التخصيص (Customization)

### إعدادات النظام
```http
GET /admin/settings
Authorization: Bearer <admin-token>

PUT /admin/settings/DELIVERY_RADIUS
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "value": "15"
}
```

### الإعدادات المتاحة
- `APP_NAME`: اسم التطبيق
- `DELIVERY_RADIUS`: نطاق التوصيل (كيلومتر)
- `DEFAULT_DELIVERY_FEE`: رسوم التوصيل الافتراضية
- `MINIMUM_ORDER_VALUE`: الحد الأدنى للطلب
- `TAX_RATE`: معدل الضريبة
- `SUPPORT_PHONE`: هاتف الدعم
- `SUPPORT_EMAIL`: بريد الدعم

## 🧪 اختبار الـ API (API Testing)

### باستخدام cURL
```bash
# متغير للتوكن
export TOKEN="your-jwt-token"

# اختبار صحة الخادم
curl http://localhost:5000/health

# اختبار تسجيل الدخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"user123"}'

# اختبار عرض المطاعم
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/restaurants
```

### باستخدام Postman
1. استيراد مجموعة Postman (إذا متاحة)
2. تعيين متغير البيئة للـ Base URL
3. تعيين Authorization header للطلبات المحمية

## 📋 قائمة التحقق للنشر (Deployment Checklist)

### قبل النشر
- [ ] تحديث متغيرات البيئة للإنتاج
- [ ] تشغيل جميع الاختبارات
- [ ] فحص الأمان والثغرات
- [ ] إعداد النسخ الاحتياطية
- [ ] تكوين مراقبة النظام

### بعد النشر
- [ ] فحص صحة الخدمات
- [ ] اختبار الميزات الأساسية
- [ ] مراقبة الأداء والأخطاء
- [ ] إعداد التنبيهات

---

**للمزيد من المساعدة**: support@aswanfood.com  
**آخر تحديث**: ديسمبر 2024