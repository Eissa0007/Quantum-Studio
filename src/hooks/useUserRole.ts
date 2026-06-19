import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { linkFirebaseUserToRole } from '../utils/adminSeeder';

export type UserRole = 'admin' | 'editor' | 'viewer' | 'moderator' | null;

const CACHE_KEY = 'quantum_user_role_cache';

export const useUserRole = (email?: string | null, uid?: string | null) => {
  // Initialize from cache if possible
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${email}`);
      if (cached) return cached as UserRole;
    } catch (e) {}
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!email || !supabase) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Ensure user_id is updated if it was pending
      if (uid) {
        await linkFirebaseUserToRole(email, uid);
      }

      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching role:', fetchError);
        setError('فشل في جلب صلاحيات المستخدم.');
      }

      const newRole = (data?.role as UserRole) || null;
      setRole(newRole);
      
      if (newRole) {
        localStorage.setItem(`${CACHE_KEY}_${email}`, newRole);
      } else {
        localStorage.removeItem(`${CACHE_KEY}_${email}`);
      }
    } catch (err) {
      console.error('Failed to fetch user role:', err);
      setError('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
    } finally {
      setLoading(false);
    }
  }, [email, uid]);

  useEffect(() => {
    let isMounted = true;
    
    fetchRole();

    // Setup real-time listener if supabase is defined
    if (supabase && email) {
      const channel = supabase
        .channel(`public:user_roles:${email}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_roles', filter: `email=eq.${email}` },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'DELETE') {
              setRole(null);
              localStorage.removeItem(`${CACHE_KEY}_${email}`);
            } else {
              const newRole = payload.new.role as UserRole;
              setRole(newRole);
              localStorage.setItem(`${CACHE_KEY}_${email}`, newRole);
            }
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [email, uid, fetchRole]);

  return {
    role,
    loading,
    error,
    isAdmin: () => role === 'admin',
    isEditor: () => role === 'admin' || role === 'editor',
    isViewer: () => role === 'admin' || role === 'editor' || role === 'viewer',
    hasRole: (requiredRole: UserRole) => role === requiredRole || role === 'admin',
    refreshRole: fetchRole
  };
};
