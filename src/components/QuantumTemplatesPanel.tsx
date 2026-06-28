import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { deserializeCanvas } from '../utils/canvasSerializer';
import { Search, Heart, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { getRecommendedTemplates } from '../utils/templateRecommender';
import { seedTemplatesIfEmpty, defaultTemplates } from '../utils/templateSeeder';
import { useAuth } from './AuthProvider';

export const QuantumTemplatesPanel = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const { fabricCanvas, currentProject } = useStore();
  const { user } = useAuth();
  
  const categories = ['All', 'Social Media', 'Marketing', 'Documents', 'Education'];

  useEffect(() => {
    loadData();
  }, [category, user]);

  const loadData = async () => {
    setLoading(true);
    await seedTemplatesIfEmpty();
    await Promise.all([
      fetchTemplates(),
      fetchRecommendations(),
      fetchFavorites()
    ]);
    setLoading(false);
  };

  const fetchTemplates = async () => {
    if (!supabase) {
      // Offline fallback: filter default templates locally
      let filtered = defaultTemplates;
      if (category !== 'All') {
        filtered = defaultTemplates.filter(t => t.category === category);
      }
      setTemplates(filtered);
      return;
    }
    try {
      let query = supabase.from('templates').select('*');
      if (category !== 'All') {
        query = query.eq('category', category);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      setTemplates(data && data.length > 0 ? data : defaultTemplates);
    } catch (err) {
      console.warn('Failed to load templates from Supabase, falling back to local defaults:', err);
      // Fallback
      let filtered = defaultTemplates;
      if (category !== 'All') {
        filtered = defaultTemplates.filter(t => t.category === category);
      }
      setTemplates(filtered);
    }
  };

  const fetchRecommendations = async () => {
    const recs = await getRecommendedTemplates(user?.uid);
    setRecommendations(recs);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    // Attempt database load if supabase is available
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('template_favorites')
          .select('template_id')
          .eq('user_id', user.uid);
          
        if (!error && data) {
          const ids = data.map(d => d.template_id);
          setFavorites(ids);
          localStorage.setItem(`quantum_favorites_${user.uid}`, JSON.stringify(ids));
          return;
        } else if (error) {
          console.warn('Database connection warning during fetchFavorites:', error.message);
        }
      } catch (err) {
        console.warn('Failed to load favorites from Supabase, attempting local fallback...', err);
      }
    }

    // Fallback to localStorage
    try {
      const saved = localStorage.getItem(`quantum_favorites_${user.uid}`);
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    } catch (e) {
      setFavorites([]);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    const isFav = favorites.includes(templateId);
    const newFavorites = isFav 
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];

    // Optimistically update local state & local storage
    setFavorites(newFavorites);
    try {
      localStorage.setItem(`quantum_favorites_${user.uid}`, JSON.stringify(newFavorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }

    // Sync with database if supabase is available
    if (supabase) {
      try {
        if (isFav) {
          const { error } = await supabase
            .from('template_favorites')
            .delete()
            .eq('user_id', user.uid)
            .eq('template_id', templateId);
          if (error) {
            console.warn('Failed to delete favorite from database:', error.message);
          }
        } else {
          const { error } = await supabase
            .from('template_favorites')
            .insert({ user_id: user.uid, template_id: templateId });
          if (error) {
            console.warn('Failed to insert favorite into database:', error.message);
          }
        }
      } catch (err) {
        console.warn('Failed to sync favorite toggle with Supabase:', err);
      }
    }
  };

  const applyTemplate = async (template: any) => {
    if (!fabricCanvas || !template.data) return;
    
    const confirmMsg = "هل أنت متأكد من تطبيق هذا القالب؟ سيتم استبدال التصميم الحالي.";
    if (!window.confirm(confirmMsg)) return;

    try {
      await deserializeCanvas(fabricCanvas, JSON.stringify(template.data));
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('حدث خطأ أثناء تطبيق القالب.');
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-5" dir="rtl">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="ابحث عن قوالب..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-100 dark:bg-[#1A1A2E] text-sm rounded-xl py-2.5 pr-9 pl-4 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-[#00C4CC] transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 border rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              category === cat 
                ? 'bg-[#00C4CC] text-white border-[#00C4CC]' 
                : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat === 'All' ? 'الكل' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#00C4CC]" size={30} />
        </div>
      ) : (
        <>
          {category === 'All' && !searchQuery && recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Sparkles size={16} className="text-[#7D3CFF]" />
                مقترح لك
              </h3>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {recommendations.map(t => (
                  <div 
                    key={`rec-${t.id}`}
                    onClick={() => applyTemplate(t)}
                    className="min-w-[140px] aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-bold truncate">{t.title}</p>
                      <button className="mt-2 bg-[#00C4CC] text-white text-[10px] font-bold py-1 px-2 rounded w-full">تطبيق</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {searchQuery ? 'نتائج البحث' : (category === 'All' ? 'شائع الآن' : category)}
            </h3>
            
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p className="text-sm">لا توجد قوالب مطابقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTemplates.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => applyTemplate(t)}
                    className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
                    
                    <button 
                      onClick={(e) => toggleFavorite(e, t.id)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        favorites.includes(t.id) ? 'bg-white/80 text-red-500' : 'bg-black/20 text-white hover:bg-black/40 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart size={14} className={favorites.includes(t.id) ? 'fill-current' : ''} />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-bold line-clamp-2 leading-tight mb-2">{t.title}</p>
                      <div className="bg-gradient-to-r from-[#00C4CC] to-[#7D3CFF] text-white text-[11px] font-bold py-1.5 px-2 rounded-lg text-center w-full">
                        تخصيص القالب
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
