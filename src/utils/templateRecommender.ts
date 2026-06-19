import { supabase } from '../lib/supabase';

export const getRecommendedTemplates = async (userId?: string) => {
  if (!supabase) return [];
  
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
    return [];
  }
};
