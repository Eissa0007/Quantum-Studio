export const freeIllustrations = [
  { id: 'ill-1', name: 'Business Analysis', url: 'https://undraw.co/api/illustrations/business_analytics', category: 'Business' },
  { id: 'ill-2', name: 'Web Developer', url: 'https://undraw.co/api/illustrations/programming', category: 'Tech' },
  { id: 'ill-3', name: 'Education', url: 'https://undraw.co/api/illustrations/education', category: 'Education' },
  { id: 'ill-4', name: 'Creative Team', url: 'https://undraw.co/api/illustrations/team', category: 'Business' },
  { id: 'ill-5', name: 'Marketing', url: 'https://undraw.co/api/illustrations/marketing', category: 'Marketing' }
];

export const getIllustrationsByCategory = (category: string) => {
  if (category === 'All') return freeIllustrations;
  return freeIllustrations.filter(ill => ill.category === category);
};
