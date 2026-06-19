// File: src/utils/adminSeeder.ts
// Admin Seeder - Secure script to add initial admin users

import { supabase } from '../lib/supabase';

// قائمة الإيميلات المسموح لها بأن تكون admins
const ADMIN_EMAILS = [
  'eissaaly07@gmail.com',
  'eissaaly007@gmail.com',
  'eissaaly0707@gmail.com',
  'eissaaly0007@gmail.com',
  'eissaaly@protonmail.com',
  'eissa1aly@gmail.com',
];

// نوع البيانات لنتيجة العملية
interface SeederResult {
  success: boolean;
  message: string;
  addedCount: number;
  skippedCount: number;
  failedCount: number;
  notFoundCount: number;
  details: Array<{
    email: string;
    status: 'added' | 'skipped' | 'failed' | 'not_found';
    reason?: string;
  }>;
}

/**
 * دالة رئيسية لإضافة الـ admins إلى قاعدة البيانات
 * يجب تشغيلها مرة واحدة فقط بعد التسجيل الأول لكل إيميل
 */
export async function seedAdmins(
  adminEmails: string[] = ADMIN_EMAILS,
  grantedByUserId?: string
): Promise<SeederResult> {
  const result: SeederResult = {
    success: false,
    message: '',
    addedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    notFoundCount: 0,
    details: [],
  };

  console.log('🚀 بدء عملية إضافة الـ admins...');
  console.log(`📧 عدد الإيميلات: ${adminEmails.length}`);

  // التحقق من اتصال Supabase
  if (!supabase) {
    result.message = '❌ خطأ: Supabase غير متصل';
    console.error(result.message);
    return result;
  }

  // التحقق من وجود جدول user_roles
  const { error: tableCheckError } = await supabase
    .from('user_roles')
    .select('id')
    .limit(1);

  if (tableCheckError) {
    result.message = `❌ خطأ: جدول user_roles غير موجود. قم بتنفيذ admin-schema.sql أولاً.\nالتفاصيل: ${tableCheckError.message}`;
    console.error(result.message);
    return result;
  }

  // معالجة كل إيميل
  for (const email of adminEmails) {
    try {
      console.log(`\n📧 معالجة: ${email}`);

      // 1. التحقق من صحة صيغة الإيميل
      if (!isValidEmail(email)) {
        result.details.push({
          email,
          status: 'failed',
          reason: 'صيغة إيميل غير صحيحة',
        });
        result.failedCount++;
        console.warn(`⚠️ صيغة إيميل غير صحيحة: ${email}`);
        continue;
      }

      // 2. البحث عن المستخدم في جدول users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (userError || !userData) {
        result.details.push({
          email,
          status: 'not_found',
          reason: 'المستخدم غير مسجل بعد في التطبيق',
        });
        result.notFoundCount++;
        console.warn(`⚠️ المستخدم ${email} غير مسجل. يجب أن يسجل أولاً.`);
        continue;
      }

      // 3. التحقق من عدم وجود الدور مسبقاً
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userData.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        result.details.push({
          email,
          status: 'skipped',
          reason: 'الدور موجود مسبقاً',
        });
        result.skippedCount++;
        console.log(`⏭️ تم التخطي: ${email} لديه دور admin بالفعل`);
        continue;
      }

      // 4. إضافة الدور الجديد
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: userData.id,
        email: email,
        role: 'admin',
        granted_by: grantedByUserId || userData.id,
        is_active: true,
      });

      if (insertError) {
        result.details.push({
          email,
          status: 'failed',
          reason: insertError.message,
        });
        result.failedCount++;
        console.error(`❌ فشل إضافة الدور لـ ${email}:`, insertError.message);
        continue;
      }

      // 5. تسجيل العملية في audit log
      await logAdminAction('ADMIN_ADDED', {
        email,
        userId: userData.id,
        grantedBy: grantedByUserId || 'system',
      });

      result.details.push({
        email,
        status: 'added',
      });
      result.addedCount++;
      console.log(`✅ تمت إضافة ${email} كـ admin بنجاح`);
    } catch (error) {
      result.details.push({
        email,
        status: 'failed',
        reason: error instanceof Error ? error.message : 'خطأ غير معروف',
      });
      result.failedCount++;
      console.error(`❌ خطأ في معالجة ${email}:`, error);
    }
  }

  // تحديد النتيجة النهائية
  if (result.failedCount === 0 && result.addedCount > 0) {
    result.success = true;
    result.message = `✅ تمت العملية بنجاح!\nتمت الإضافة: ${result.addedCount}\nتم التخطي: ${result.skippedCount}\nغير مسجل: ${result.notFoundCount}`;
  } else if (result.addedCount > 0) {
    result.success = true;
    result.message = `⚠️ تمت العملية مع بعض التحذيرات.\nتمت الإضافة: ${result.addedCount}\nفشل: ${result.failedCount}\nتم التخطي: ${result.skippedCount}\nغير مسجل: ${result.notFoundCount}`;
  } else {
    result.success = false;
    result.message = `❌ فشلت العملية.\nفشل: ${result.failedCount}\nتم التخطي: ${result.skippedCount}\nغير مسجل: ${result.notFoundCount}`;
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 ملخص العملية:');
  console.log(result.message);
  console.log('═'.repeat(50));

  return result;
}

/**
 * دالة للتحقق من صيغة الإيميل
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * دالة لتسجيل عمليات الـ admins في audit log
 */
async function logAdminAction(
  action: string,
  details: Record<string, any>
): Promise<void> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: userData?.user?.id || null,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('⚠️ فشل تسجيل العملية في audit log:', error);
  }
}

/**
 * دالة لإزالة دور admin من مستخدم
 */
export async function removeAdminRole(
  email: string,
  removedByUserId: string
): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return { success: false, message: '❌ Supabase غير متصل' };
  }

  try {
    // البحث عن المستخدم
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      return { success: false, message: `❌ المستخدم ${email} غير موجود` };
    }

    // حذف الدور
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userData.id)
      .eq('role', 'admin');

    if (deleteError) {
      return { success: false, message: `❌ فشل الحذف: ${deleteError.message}` };
    }

    // تسجيل العملية
    await logAdminAction('ADMIN_REMOVED', {
      email,
      userId: userData.id,
      removedBy: removedByUserId,
    });

    return { success: true, message: `✅ تمت إزالة دور admin من ${email}` };
  } catch (error) {
    return {
      success: false,
      message: `❌ خطأ: ${error instanceof Error ? error.message : 'غير معروف'}`,
    };
  }
}

/**
 * دالة للحصول على قائمة جميع الـ admins
 */
export async function getAllAdmins(): Promise<
  Array<{ id: string; email: string; granted_at: string }>
> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id, email, granted_at')
      .eq('role', 'admin')
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (error) {
      console.error('❌ فشل جلب قائمة الـ admins:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ خطأ في جلب الـ admins:', error);
    return [];
  }
}

/**
 * دالة للتحقق مما إذا كان المستخدم الحالي هو admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;

    const { data: roleData } = await supabase.rpc('is_admin');
    return roleData || false;
  } catch (error) {
    console.error('❌ خطأ في التحقق من صلاحية admin:', error);
    return false;
  }
}

export const linkFirebaseUserToRole = async (email: string, firebaseUid: string) => {
  if (!supabase) return;
  try {
    await supabase
      .from('user_roles')
      .update({ user_id: firebaseUid })
      .eq('email', email)
      .like('user_id', 'pending-%');
  } catch (err) {
    console.error('Failed to link user', err);
  }
};

/**
 * ═══════════════════════════════════════════════════
 * أوامر Console (يمكن استدعاؤها من DevTools)
 * ═══════════════════════════════════════════════════
 * 
 * طريقة الاستخدام:
 * 1. افتح التطبيق
 * 2. اضغط F12 لفتح Console
 * 3. اكتب أحد الأوامر التالية:
 *    - window.seedAdmins()
 *    - window.listAdmins()
 *    - window.removeAdmin('email@example.com')
 * 4. اضغط Enter
 */
if (typeof window !== 'undefined') {
  (window as any).seedAdmins = async () => {
    console.log('🔧 تشغيل seedAdmins من Console...');
    console.log('📧 سيتم إضافة الإيميلات الستة كـ admins');
    const result = await seedAdmins();
    console.log(result);
    return result;
  };

  (window as any).removeAdmin = async (email: string) => {
    console.log(`🔧 إزالة دور admin من: ${email}`);
    const { data: userData } = await supabase.auth.getUser();
    const result = await removeAdminRole(email, userData?.user?.id || 'system');
    console.log(result);
    return result;
  };

  (window as any).listAdmins = async () => {
    console.log('🔧 جلب قائمة الـ admins...');
    const admins = await getAllAdmins();
    console.log(`📊 عدد الـ admins: ${admins.length}`);
    console.table(admins);
    return admins;
  };

  (window as any).checkAdmin = async () => {
    console.log('🔧 التحقق من صلاحية المستخدم الحالي...');
    const isAdmin = await isCurrentUserAdmin();
    console.log(isAdmin ? '✅ أنت admin' : '❌ لست admin');
    return isAdmin;
  };
}

export default seedAdmins;
