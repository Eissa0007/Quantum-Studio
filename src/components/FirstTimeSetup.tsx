import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ShieldAlert, Loader2, CheckCircle2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { seedAdmins } from "../utils/adminSeeder";

export const FirstTimeSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lang, setLang] = useState<'ar'|'en'>('ar');

  useEffect(() => {
    checkFirstRun();
  }, []);

  const checkFirstRun = async () => {
    if (!supabase) {
      onComplete();
      setChecking(false);
      return;
    }
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      if (count === 0) {
        setNeedsSetup(true);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error("Error checking setup status:", err);
      // Proceed to app if error
      onComplete();
    } finally {
      setChecking(false);
    }
  };

  const validateForm = () => {
    if (!fullName || fullName.length < 3) {
      setErrorMsg(lang === 'ar' ? 'الاسم بالكامل يجب أن يكون 3 أحرف على الأقل.' : 'Full name must be at least 3 characters.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMsg(lang === 'ar' ? 'البريد الإلكتروني غير صالح.' : 'Invalid email address.');
      return false;
    }
    if (!password || password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      setErrorMsg(lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير ورقم.' : 'Password must be at least 8 characters and contain an uppercase letter and a number.');
      return false;
    }
    return true;
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile name
      await updateProfile(user, { displayName: fullName });

      if (!supabase) throw new Error("Supabase is not configured.");

      // 2. Add to Supabase 'users' table
      const { error: userError } = await supabase.from('users').upsert({
        id: user.uid,
        email: email,
        full_name: fullName,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      // If table doesn't exist or fails, we gracefully continue with roles
      if (userError && userError.code !== '42P01') {
        console.warn("Could not insert into users table (might not exist):", userError);
      }

      // 3. Add to user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: user.uid,
        email: email,
        role: "admin",
        is_active: true,
        granted_by: user.uid,
        granted_at: new Date().toISOString()
      });

      if (roleError) throw roleError;

      // 4. Log to audit_logs
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: user.uid,
        action: 'SYSTEM_INIT_FIRST_ADMIN_CREATED',
        details: { email, fullName },
        timestamp: new Date().toISOString()
      });
      
      if (auditError && auditError.code !== '42P01') {
         console.warn("Could not insert into audit_logs table:", auditError);
      }
      
      // Optional: seed default admins as well
      await seedAdmins(["eissaaly07@gmail.com", "eissaaly007@gmail.com", "eissaaly0707@gmail.com", "eissaaly0007@gmail.com", "eissaaly@protonmail.com", "eissa1aly@gmail.com"], user.uid);

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (lang === 'ar' ? 'فشلت العملية' : 'Setup failed'));
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (!needsSetup) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] p-4 text-white font-sans flex items-center justify-center bg-[#0F0F13]/90 backdrop-blur-sm"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm border border-white/10 transition-colors"
        >
          {lang === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      <div className="bg-[#1A1A24] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Abstract Glow Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/30 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        {success ? (
          <div className="relative z-10 py-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={80} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]" />
            <h2 className="text-2xl font-bold mb-2">
              {lang === 'ar' ? 'تم الإعداد بنجاح' : 'Setup Complete'}
            </h2>
            <p className="text-gray-400 text-center">
              {lang === 'ar' 
                ? 'تم إنشاء حساب المشرف الأول. جاري توجيهك إلى النظام...' 
                : 'First admin account created. Redirecting...'}
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <ShieldAlert size={32} className="text-purple-400" />
            </div>

            <h1 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {lang === 'ar' ? 'إعداد النظام لأول مرة' : 'First Time Setup'}
            </h1>
            <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
              {lang === 'ar' 
                ? 'أهلاً بك! النظام يحتاج إلى مدير أول لإدارة الصلاحيات. قم بإنشاء الحساب الآن.'
                : 'Welcome! The system needs a primary administrator. Create your account now.'}
            </p>

            <form onSubmit={handleSetup} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  className="w-full bg-[#0F0F13] border border-white/10 focus:border-purple-500/50 rounded-xl py-3 pr-11 pl-4 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  className="w-full bg-[#0F0F13] border border-white/10 focus:border-purple-500/50 rounded-xl py-3 pr-11 pl-4 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner"
                  dir="ltr"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  className="w-full bg-[#0F0F13] border border-white/10 focus:border-purple-500/50 rounded-xl py-3 pr-11 pl-12 text-sm text-white placeholder-gray-500 outline-none transition-all shadow-inner font-mono"
                  dir="ltr"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(125,60,255,0.3)] transition-all flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {lang === 'ar' ? 'إنشاء حساب المشرف' : 'Create Admin Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
