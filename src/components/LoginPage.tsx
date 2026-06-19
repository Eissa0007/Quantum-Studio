import React, { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { Loader2 } from "lucide-react";

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول بحساب Google");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء المصادقة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-[#1A1A2E]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden my-auto pointer-events-auto">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C4CC]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7D3CFF]/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00C4CC] to-[#7D3CFF] flex items-center justify-center text-white font-bold text-3xl mb-4 shadow-lg">
            Q
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Quantum Studio</h1>
          <p className="text-gray-400 text-sm">
            مرحباً بك في منصة التصميم المستقبلية
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            dir="rtl"
          >
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 px-4 rounded-xl font-bold hover:bg-gray-100 transition-colors mb-6 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
          )}
          تسجيل الدخول بحساب جوجل
        </button>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">
            أو استخدام البريد الإلكتروني
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4" dir="rtl">
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 ml-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C4CC] transition-colors"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1.5 ml-1">
              كلمة المرور
            </label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7D3CFF] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white py-3 px-4 rounded-xl font-bold mt-2 hover:opacity-90 transition-opacity flex justify-center disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              "تسجيل الدخول"
            ) : (
              "إنشاء حساب جديد"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {isLogin
              ? "ليس لديك حساب؟ إنشاء حساب جديد"
              : "لديك حساب بالفعل؟ تسجيل الدخول"}
          </button>
        </div>
      </div>
    </div>
  );
};
