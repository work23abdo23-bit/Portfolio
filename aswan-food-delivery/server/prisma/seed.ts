import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات التجريبية...');

  // إنشاء المستخدمين
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // إنشاء المدير
  const admin = await prisma.user.create({
    data: {
      email: 'admin@aswanfood.com',
      phone: '+201234567890',
      password: adminPassword,
      firstName: 'أحمد',
      lastName: 'محمد',
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // إنشاء أصحاب مطاعم
  const restaurantOwner1 = await prisma.user.create({
    data: {
      email: 'owner1@aswanfood.com',
      phone: '+201234567891',
      password: userPassword,
      firstName: 'محمد',
      lastName: 'أحمد',
      role: UserRole.RESTAURANT_OWNER,
      isVerified: true,
    },
  });

  const restaurantOwner2 = await prisma.user.create({
    data: {
      email: 'owner2@aswanfood.com',
      phone: '+201234567892',
      password: userPassword,
      firstName: 'فاطمة',
      lastName: 'علي',
      role: UserRole.RESTAURANT_OWNER,
      isVerified: true,
    },
  });

  const restaurantOwner3 = await prisma.user.create({
    data: {
      email: 'owner3@aswanfood.com',
      phone: '+201234567893',
      password: userPassword,
      firstName: 'خالد',
      lastName: 'حسن',
      role: UserRole.RESTAURANT_OWNER,
      isVerified: true,
    },
  });

  // إنشاء عملاء
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      phone: '+201234567894',
      password: userPassword,
      firstName: 'سارة',
      lastName: 'محمود',
      role: UserRole.CUSTOMER,
      isVerified: true,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      phone: '+201234567895',
      password: userPassword,
      firstName: 'أحمد',
      lastName: 'سالم',
      role: UserRole.CUSTOMER,
      isVerified: true,
    },
  });

  // إنشاء سائق توصيل
  const driver1 = await prisma.user.create({
    data: {
      email: 'driver1@aswanfood.com',
      phone: '+201234567896',
      password: userPassword,
      firstName: 'عبدالله',
      lastName: 'محمد',
      role: UserRole.DELIVERY_DRIVER,
      isVerified: true,
    },
  });

  console.log('✅ تم إنشاء المستخدمين بنجاح');

  // إنشاء عناوين للعملاء
  await prisma.address.createMany({
    data: [
      {
        userId: customer1.id,
        title: 'المنزل',
        address: 'شارع الكورنيش، أسوان',
        city: 'أسوان',
        governorate: 'أسوان',
        latitude: 24.0889,
        longitude: 32.8998,
        isDefault: true,
      },
      {
        userId: customer1.id,
        title: 'العمل',
        address: 'شارع السوق، أسوان',
        city: 'أسوان',
        governorate: 'أسوان',
        latitude: 24.0889,
        longitude: 32.8998,
        isDefault: false,
      },
      {
        userId: customer2.id,
        title: 'المنزل',
        address: 'شارع المحطة، أسوان',
        city: 'أسوان',
        governorate: 'أسوان',
        latitude: 24.0889,
        longitude: 32.8998,
        isDefault: true,
      },
    ],
  });

  console.log('✅ تم إنشاء العناوين بنجاح');

  // إنشاء المطاعم المشهورة في أسوان
  const restaurant1 = await prisma.restaurant.create({
    data: {
      ownerId: restaurantOwner1.id,
      name: 'Nubian House Restaurant',
      nameAr: 'مطعم البيت النوبي',
      description: 'Authentic Nubian cuisine with traditional flavors',
      descriptionAr: 'مأكولات نوبية أصيلة بنكهات تقليدية',
      address: 'شارع الكورنيش، أسوان',
      latitude: 24.0889,
      longitude: 32.8998,
      phone: '+201012345678',
      email: 'info@nubianhouse.com',
      deliveryTime: 25,
      deliveryFee: 15.0,
      minimumOrder: 50.0,
      rating: 4.5,
      totalReviews: 125,
      openingTime: '10:00',
      closingTime: '23:00',
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      ownerId: restaurantOwner2.id,
      name: 'Aswan Grill',
      nameAr: 'مشاوي أسوان',
      description: 'Best grilled meat and chicken in Aswan',
      descriptionAr: 'أفضل مشاوي اللحوم والفراخ في أسوان',
      address: 'شارع السوق، أسوان',
      latitude: 24.0889,
      longitude: 32.8998,
      phone: '+201012345679',
      email: 'info@aswangrill.com',
      deliveryTime: 30,
      deliveryFee: 12.0,
      minimumOrder: 40.0,
      rating: 4.3,
      totalReviews: 89,
      openingTime: '12:00',
      closingTime: '24:00',
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      ownerId: restaurantOwner3.id,
      name: 'Nile View Cafe',
      nameAr: 'كافيه إطلالة النيل',
      description: 'Coffee, desserts and light meals with Nile view',
      descriptionAr: 'قهوة وحلويات ووجبات خفيفة بإطلالة على النيل',
      address: 'كورنيش النيل، أسوان',
      latitude: 24.0889,
      longitude: 32.8998,
      phone: '+201012345680',
      email: 'info@nileviewcafe.com',
      deliveryTime: 20,
      deliveryFee: 10.0,
      minimumOrder: 30.0,
      rating: 4.7,
      totalReviews: 156,
      openingTime: '08:00',
      closingTime: '22:00',
    },
  });

  console.log('✅ تم إنشاء المطاعم بنجاح');

  // إنشاء فئات الطعام
  const categories1 = await prisma.category.createMany({
    data: [
      {
        restaurantId: restaurant1.id,
        name: 'Main Dishes',
        nameAr: 'الأطباق الرئيسية',
        description: 'Traditional Nubian main courses',
        sortOrder: 1,
      },
      {
        restaurantId: restaurant1.id,
        name: 'Appetizers',
        nameAr: 'المقبلات',
        description: 'Delicious starters',
        sortOrder: 2,
      },
      {
        restaurantId: restaurant1.id,
        name: 'Beverages',
        nameAr: 'المشروبات',
        description: 'Traditional and modern drinks',
        sortOrder: 3,
      },
    ],
  });

  const categories2 = await prisma.category.createMany({
    data: [
      {
        restaurantId: restaurant2.id,
        name: 'Grilled Meat',
        nameAr: 'مشاوي اللحوم',
        description: 'Premium grilled meat dishes',
        sortOrder: 1,
      },
      {
        restaurantId: restaurant2.id,
        name: 'Grilled Chicken',
        nameAr: 'مشاوي الفراخ',
        description: 'Tender grilled chicken',
        sortOrder: 2,
      },
      {
        restaurantId: restaurant2.id,
        name: 'Sides',
        nameAr: 'الأطباق الجانبية',
        description: 'Rice, bread and salads',
        sortOrder: 3,
      },
    ],
  });

  const categories3 = await prisma.category.createMany({
    data: [
      {
        restaurantId: restaurant3.id,
        name: 'Coffee',
        nameAr: 'القهوة',
        description: 'Fresh brewed coffee',
        sortOrder: 1,
      },
      {
        restaurantId: restaurant3.id,
        name: 'Desserts',
        nameAr: 'الحلويات',
        description: 'Sweet treats and pastries',
        sortOrder: 2,
      },
      {
        restaurantId: restaurant3.id,
        name: 'Light Meals',
        nameAr: 'الوجبات الخفيفة',
        description: 'Sandwiches and light bites',
        sortOrder: 3,
      },
    ],
  });

  console.log('✅ تم إنشاء فئات الطعام بنجاح');

  // الحصول على الفئات المنشأة
  const restaurant1Categories = await prisma.category.findMany({
    where: { restaurantId: restaurant1.id },
  });

  const restaurant2Categories = await prisma.category.findMany({
    where: { restaurantId: restaurant2.id },
  });

  const restaurant3Categories = await prisma.category.findMany({
    where: { restaurantId: restaurant3.id },
  });

  // إنشاء عناصر القائمة للمطعم النوبي
  await prisma.menuItem.createMany({
    data: [
      // الأطباق الرئيسية
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[0].id,
        name: 'Nubian Fish',
        nameAr: 'سمك نوبي',
        description: 'Fresh Nile fish with traditional spices',
        descriptionAr: 'سمك النيل الطازج مع البهارات التقليدية',
        price: 85.0,
        preparationTime: 25,
        isPopular: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[0].id,
        name: 'Bamya with Meat',
        nameAr: 'بامية باللحمة',
        description: 'Traditional okra stew with tender meat',
        descriptionAr: 'طبق البامية التقليدي باللحمة الطرية',
        price: 65.0,
        preparationTime: 30,
        isPopular: true,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[0].id,
        name: 'Molokhia',
        nameAr: 'ملوخية',
        description: 'Green soup with chicken or meat',
        descriptionAr: 'الشوربة الخضراء بالفراخ أو اللحمة',
        price: 55.0,
        preparationTime: 20,
      },
      // المقبلات
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[1].id,
        name: 'Tahina Salad',
        nameAr: 'سلطة طحينة',
        description: 'Fresh tahina with vegetables',
        descriptionAr: 'طحينة طازجة بالخضروات',
        price: 25.0,
        preparationTime: 10,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[1].id,
        name: 'Baba Ghanoush',
        nameAr: 'بابا غنوج',
        description: 'Grilled eggplant dip',
        descriptionAr: 'مقبلات الباذنجان المشوي',
        price: 30.0,
        preparationTime: 15,
      },
      // المشروبات
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[2].id,
        name: 'Karkade',
        nameAr: 'كركديه',
        description: 'Traditional hibiscus tea',
        descriptionAr: 'شاي الكركديه التقليدي',
        price: 15.0,
        preparationTime: 5,
      },
      {
        restaurantId: restaurant1.id,
        categoryId: restaurant1Categories[2].id,
        name: 'Fresh Juice',
        nameAr: 'عصير طازج',
        description: 'Mixed seasonal fruits',
        descriptionAr: 'فواكه موسمية مشكلة',
        price: 20.0,
        preparationTime: 5,
      },
    ],
  });

  // إنشاء عناصر القائمة لمطعم المشاوي
  await prisma.menuItem.createMany({
    data: [
      // مشاوي اللحوم
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[0].id,
        name: 'Mixed Grill',
        nameAr: 'مشكل مشاوي',
        description: 'Kofta, kebab and grilled meat',
        descriptionAr: 'كفتة وكباب ولحمة مشوية',
        price: 120.0,
        preparationTime: 35,
        isPopular: true,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[0].id,
        name: 'Lamb Chops',
        nameAr: 'ريش ضاني',
        description: 'Tender grilled lamb chops',
        descriptionAr: 'ريش الضان المشوية الطرية',
        price: 150.0,
        preparationTime: 40,
        isPopular: true,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[0].id,
        name: 'Beef Kebab',
        nameAr: 'كباب لحمة',
        description: 'Seasoned grilled beef kebab',
        descriptionAr: 'كباب اللحمة المتبل المشوي',
        price: 85.0,
        preparationTime: 30,
      },
      // مشاوي الفراخ
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[1].id,
        name: 'Grilled Chicken',
        nameAr: 'فراخ مشوية',
        description: 'Half chicken grilled to perfection',
        descriptionAr: 'نصف فرخة مشوية بالكمال',
        price: 75.0,
        preparationTime: 35,
        isPopular: true,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[1].id,
        name: 'Chicken Shawarma',
        nameAr: 'شاورما فراخ',
        description: 'Marinated chicken shawarma',
        descriptionAr: 'شاورما الفراخ المتبلة',
        price: 45.0,
        preparationTime: 15,
      },
      // الأطباق الجانبية
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[2].id,
        name: 'Rice with Vermicelli',
        nameAr: 'أرز بالشعرية',
        description: 'Egyptian style rice',
        descriptionAr: 'أرز على الطريقة المصرية',
        price: 20.0,
        preparationTime: 10,
      },
      {
        restaurantId: restaurant2.id,
        categoryId: restaurant2Categories[2].id,
        name: 'Grilled Vegetables',
        nameAr: 'خضار مشوية',
        description: 'Mixed grilled vegetables',
        descriptionAr: 'خضروات مشوية مشكلة',
        price: 25.0,
        preparationTime: 15,
      },
    ],
  });

  // إنشاء عناصر القائمة للكافيه
  await prisma.menuItem.createMany({
    data: [
      // القهوة
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[0].id,
        name: 'Turkish Coffee',
        nameAr: 'قهوة تركي',
        description: 'Traditional Turkish coffee',
        descriptionAr: 'قهوة تركية تقليدية',
        price: 25.0,
        preparationTime: 10,
        isPopular: true,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[0].id,
        name: 'Cappuccino',
        nameAr: 'كابتشينو',
        description: 'Italian style cappuccino',
        descriptionAr: 'كابتشينو على الطريقة الإيطالية',
        price: 35.0,
        preparationTime: 8,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[0].id,
        name: 'Arabic Coffee',
        nameAr: 'قهوة عربي',
        description: 'Traditional Arabic coffee',
        descriptionAr: 'قهوة عربية تقليدية',
        price: 20.0,
        preparationTime: 5,
      },
      // الحلويات
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[1].id,
        name: 'Baklava',
        nameAr: 'بقلاوة',
        description: 'Sweet pastry with nuts',
        descriptionAr: 'معجنات حلوة بالمكسرات',
        price: 30.0,
        preparationTime: 5,
        isPopular: true,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[1].id,
        name: 'Umm Ali',
        nameAr: 'أم علي',
        description: 'Traditional Egyptian dessert',
        descriptionAr: 'حلوى مصرية تقليدية',
        price: 40.0,
        preparationTime: 15,
      },
      // الوجبات الخفيفة
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[2].id,
        name: 'Club Sandwich',
        nameAr: 'كلوب ساندويتش',
        description: 'Triple layer sandwich',
        descriptionAr: 'ساندويتش ثلاث طبقات',
        price: 55.0,
        preparationTime: 12,
      },
      {
        restaurantId: restaurant3.id,
        categoryId: restaurant3Categories[2].id,
        name: 'Cheese Toast',
        nameAr: 'توست بالجبنة',
        description: 'Grilled cheese sandwich',
        descriptionAr: 'ساندويتش الجبنة المشوي',
        price: 35.0,
        preparationTime: 8,
      },
    ],
  });

  console.log('✅ تم إنشاء عناصر القائمة بنجاح');

  // إضافة إعدادات النظام
  await prisma.setting.createMany({
    data: [
      {
        key: 'APP_NAME',
        value: 'أسوان فود',
        type: 'STRING',
        category: 'GENERAL',
      },
      {
        key: 'APP_NAME_EN',
        value: 'Aswan Food',
        type: 'STRING',
        category: 'GENERAL',
      },
      {
        key: 'DELIVERY_RADIUS',
        value: '10',
        type: 'NUMBER',
        category: 'DELIVERY',
      },
      {
        key: 'DEFAULT_DELIVERY_FEE',
        value: '15',
        type: 'NUMBER',
        category: 'DELIVERY',
      },
      {
        key: 'MINIMUM_ORDER_VALUE',
        value: '30',
        type: 'NUMBER',
        category: 'ORDER',
      },
      {
        key: 'TAX_RATE',
        value: '0.14',
        type: 'NUMBER',
        category: 'PAYMENT',
      },
      {
        key: 'SUPPORT_PHONE',
        value: '+201012345678',
        type: 'STRING',
        category: 'CONTACT',
      },
      {
        key: 'SUPPORT_EMAIL',
        value: 'support@aswanfood.com',
        type: 'STRING',
        category: 'CONTACT',
      },
    ],
  });

  console.log('✅ تم إضافة إعدادات النظام بنجاح');

  // إضافة كوبونات تجريبية
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        title: 'خصم ترحيبي',
        description: 'خصم 10% للعملاء الجدد',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrder: 50,
        maxDiscount: 20,
        usageLimit: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        code: 'ASWAN50',
        title: 'خصم أسوان',
        description: 'خصم 50 جنيه على الطلبات أكثر من 150 جنيه',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50,
        minimumOrder: 150,
        usageLimit: 50,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    ],
  });

  console.log('✅ تم إضافة الكوبونات التجريبية بنجاح');

  console.log('🎉 تم الانتهاء من إضافة جميع البيانات التجريبية بنجاح!');
  console.log('');
  console.log('📊 ملخص البيانات المضافة:');
  console.log('- المستخدمين: 6 (1 مدير، 3 أصحاب مطاعم، 1 سائق، 2 عملاء)');
  console.log('- المطاعم: 3 (البيت النوبي، مشاوي أسوان، كافيه إطلالة النيل)');
  console.log('- فئات الطعام: 9 فئات');
  console.log('- عناصر القائمة: 21 عنصر');
  console.log('- العناوين: 3 عناوين');
  console.log('- الكوبونات: 2 كوبون');
  console.log('- الإعدادات: 8 إعدادات');
  console.log('');
  console.log('🔑 بيانات تسجيل الدخول:');
  console.log('المدير: admin@aswanfood.com / admin123');
  console.log('صاحب مطعم: owner1@aswanfood.com / user123');
  console.log('عميل: customer1@example.com / user123');
  console.log('سائق: driver1@aswanfood.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إضافة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });