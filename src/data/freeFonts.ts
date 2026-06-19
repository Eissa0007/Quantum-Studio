export const freeFonts = [
  { name: 'Inter', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  { name: 'Roboto', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
  { name: 'Open Sans', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' },
  { name: 'Lato', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { name: 'Montserrat', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap' },
  { name: 'Poppins', category: 'Sans Serif', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap' },
  { name: 'Playfair Display', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap' },
  { name: 'Merriweather', category: 'Serif', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' },
  { name: 'Roboto Mono', category: 'Monospace', url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap' },
  { name: 'Fira Code', category: 'Monospace', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap' },
  { name: 'Cairo', category: 'Arabic', url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap' },
  { name: 'Tajawal', category: 'Arabic', url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap' }
];

export const loadFont = (family: string) => {
  const font = freeFonts.find(f => f.name === family);
  if (font && !document.getElementById(`font-${font.name}`)) {
    const link = document.createElement('link');
    link.id = `font-${font.name}`;
    link.href = font.url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};
