import { supabase } from '../lib/supabase';

// Generate 50 dummy templates across categories
export const defaultTemplates = [
  ...Array(20).fill(0).map((_, i) => ({
    title: `قالب بوست اجتماعي ${i + 1}`,
    category: 'Social Media',
    tags: ['instagram', 'facebook', 'post', i % 2 === 0 ? 'business' : 'personal'],
    thumbnail_url: `https://picsum.photos/seed/social${i}/300/400`,
    data: { objects: [{ type: 'rect', fill: '#00C4CC', width: 200, height: 200, left: 100, top: 100 }] },
    is_pro: false
  })),
  ...Array(15).fill(0).map((_, i) => ({
    title: `قالب تسويقي ${i + 1}`,
    category: 'Marketing',
    tags: ['flyer', 'brochure', 'poster'],
    thumbnail_url: `https://picsum.photos/seed/marketing${i}/300/400`,
    data: { objects: [{ type: 'circle', fill: '#7D3CFF', radius: 100, left: 150, top: 150 }] },
    is_pro: i % 3 === 0
  })),
  ...Array(10).fill(0).map((_, i) => ({
    title: `قالب مستند ${i + 1}`,
    category: 'Documents',
    tags: ['resume', 'cv', 'letter'],
    thumbnail_url: `https://picsum.photos/seed/doc${i}/300/400`,
    data: { objects: [{ type: 'rect', fill: '#EEEEEE', width: 400, height: 600, left: 50, top: 50 }] },
    is_pro: false
  })),
  ...Array(5).fill(0).map((_, i) => ({
    title: `قالب تعليمي ${i + 1}`,
    category: 'Education',
    tags: ['worksheet', 'certificate'],
    thumbnail_url: `https://picsum.photos/seed/edu${i}/400/300`,
    data: { objects: [{ type: 'rect', fill: '#FFD700', width: 500, height: 350, left: 100, top: 100 }] },
    is_pro: false
  }))
];

export const seedTemplatesIfEmpty = async () => {
  if (!supabase) return;
  try {
    const { count } = await supabase.from('templates').select('*', { count: 'exact', head: true });
    if (count === 0) {
      console.log('Seeding templates...');
      await supabase.from('templates').insert(defaultTemplates);
      console.log('Templates seeded.');
    }
  } catch (error) {
    console.error('Failed to seed templates', error);
  }
};
