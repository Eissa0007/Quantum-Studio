# دليل إعداد المشرفين (Admin Setup Guide)

هذا الدليل يوضح كيفية إعداد حسابات المشرفين (Admins) الستة المطلوبة للنظام.

## لماذا لا نقوم ببرمجة أسماء المستخدمين وكلمات المرور في الكود؟
أفضل ممارسات الأمان تمنع تخزين أسماء المستخدمين وكلمات المرور داخل شفرة المصدر (Hardcoding) لأن ذلك:
1. يعرض النظام للاختراق إذا تم الوصول إلى شفرة المصدر.
2. يمنع الإدارة الديناميكية للحسابات (إضافة/حذف مشرفين دون تغيير الكود).
3. يتعارض مع سياسات أمان Firebase و Supabase.

## الحسابات الستة المطلوبة:
1. eissaaly07@gmail.com
2. eissaaly007@gmail.com
3. eissaaly0707@gmail.com
4. eissaaly0007@gmail.com
5. eissaaly@protonmail.com
6. eissa1aly@gmail.com

## الطريقة الأولى: من خلال Console (للمطورين)
قم بفتح أداة المطورين في المتصفح (F12) والصق الأمر التالي:
```javascript
window.seedAdmins()
```
سيقوم هذا السكربت بإضافة الإيميلات الستة إلى قاعدة البيانات وإعطائها صلاحية المشرف (Admin). عندما يقوم أحد هؤلاء المستخدمين بالتسجيل عبر Firebase، سيتم ربط حسابه تلقائياً بصلاحيات المشرف.

## الطريقة الثانية: من خلال لوحة تحكم Supabase
1. اذهب إلى لوحة تحكم Supabase لمشروعك.
2. افتح SQL Editor.
3. قم بتنفيذ الاستعلام التالي:
```sql
INSERT INTO user_roles (user_id, email, role, is_active) VALUES 
('pending-1', 'eissaaly07@gmail.com', 'admin', true),
('pending-2', 'eissaaly007@gmail.com', 'admin', true),
('pending-3', 'eissaaly0707@gmail.com', 'admin', true),
('pending-4', 'eissaaly0007@gmail.com', 'admin', true),
('pending-5', 'eissaaly@protonmail.com', 'admin', true),
('pending-6', 'eissa1aly@gmail.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

## التعافي من فقدان الوصول
إذا فقدت الوصول لحسابات المشرفين، يمكنك دائماً الذهاب إلى واجهة Supabase -> Table Editor -> user_roles وتعديل دور أي إيميل ليكون `admin`.
