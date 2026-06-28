import { supabase } from '../lib/supabase';
import { defaultTemplates } from './templateSeeder';

export const getRecommendedTemplates = async (userId?: string) => {
  if (!supabase) {
    // Return a subset of default templates as recommendations in offline/demo mode
    return [...defaultTemplates].sort(() => 0.5 - Math.random()).slice(0, 6);
  }
  
  try {
    // In a real application, this would use a more complex recommendation algorithm
    // analyzing past user behaviors, favorites, and current design context.
    
    // For now, return a randomized mix or highly rated trending ones
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .limit(6);
      
    if (error) throw error;
    
    // Shuffle the array to simulate recommendations
    return data.sort(() => 0.5 - Math.random());
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Return a local subset fallback on database errors
    return [...defaultTemplates].sort(() => 0.5 - Math.random()).slice(0, 6);
  }
};
