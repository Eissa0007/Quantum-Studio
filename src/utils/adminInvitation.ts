import { supabase } from '../lib/supabase';

export const generateInvitation = async (email: string, role: string, invitedBy: string) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitedBy,
        status: 'pending'
      })
      .select('token')
      .single();
      
    if (error) throw error;
    
    // In a real scenario, this would trigger an Edge Function to send an email.
    console.log(`Generated invitation token for ${email}: ${data.token}`);
    
    return data.token;
  } catch (err) {
    console.error('Failed to generate invitation:', err);
    return null;
  }
};

export const acceptInvitation = async (token: string, userId: string) => {
  if (!supabase) return false;
  try {
    // 1. Verify token
    const { data: invite, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
      
    if (fetchError || !invite) throw new Error('دعوة غير صالحة أو منتهية الصلاحية');
    
    // Check expiration
    if (new Date(invite.expires_at) < new Date()) {
      await supabase.from('invitations').update({ status: 'expired' }).eq('id', invite.id);
      throw new Error('الدعوة منتهية الصلاحية');
    }
    
    // 2. Grant role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        email: invite.email,
        role: invite.role,
        granted_by: invite.invited_by
      });
      
    if (roleError) throw roleError;
    
    // 3. Mark as accepted
    await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invite.id);
    
    return true;
  } catch (err: any) {
    console.error('Failed to accept invitation:', err);
    throw err;
  }
};
