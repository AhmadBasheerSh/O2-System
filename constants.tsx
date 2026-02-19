
import { MenuItem, Table } from './types';

export const CATEGORIES = [
  { id: 'all', name: 'الكل', icon: '🍽️' },
  { id: 'grills', name: 'مشاوي', icon: '🍢' },
  { id: 'burgers', name: 'وجبات سريعة', icon: '🍔' },
  { id: 'pizza', name: 'بيتزا', icon: '🍕' },
  { id: 'drinks', name: 'مشروبات', icon: '🥤' },
  { id: 'desserts', name: 'حلويات', icon: '🍰' },
];

export const MENU_ITEMS: MenuItem[] = [
  { 
    id: '1', name: 'Classic Burger', nameAr: 'برجر كلاسيك بريميوم', price: 25, category: 'burgers', 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',
    descriptionAr: 'قطعة لحم أنجوس مشوية مع خبز البطاطس الهش، خس، طماطم، صوص السرياتشا المميز.',
    popular: true,
    dietary: { spicyLevel: 1 },
    sizes: [{ name: 'صغير', price: 25 }, { name: 'وسط', price: 32 }, { name: 'كبير', price: 40 }],
    addons: [{ name: 'جبنة زيادة', price: 5 }, { name: 'بدون بصل', price: 0 }]
  },
  { 
    id: '7', name: 'Mix Grills', nameAr: 'مشاوي مشكلة عائلية', price: 85, category: 'grills', 
    image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80',
    descriptionAr: 'تشكيلة من كباب اللحم، كباب الدجاج، والشيش طاووق مع الخبز المحمص والسلطات.',
    popular: true,
    addons: [{ name: 'صوص ثوم إضافي', price: 3 }, { name: 'حمص صغير', price: 10 }]
  },
  { 
    id: '2', name: 'Margherita Pizza', nameAr: 'بيتزا مارجريتا إيطالية', price: 35, category: 'pizza', 
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
    descriptionAr: 'عجينة نابولي التقليدية مع صلصة البندورة الطازجة، ريحان، وجبنة الموزاريلا الفاخرة.',
    dietary: { vegan: true },
    sizes: [{ name: 'وسط', price: 35 }, { name: 'كبير', price: 55 }]
  },
  { 
    id: '3', name: 'Fresh Orange', nameAr: 'عصير برتقال طبيعي', price: 12, category: 'drinks', 
    image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500&q=80',
    descriptionAr: 'عصير برتقال طازج معصور يومياً بدون سكر مضاف.'
  },
  { id: '4', name: 'French Fries', nameAr: 'بطاطس مقلية مملحة', price: 10, category: 'starters', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80' },
  { id: '5', name: 'Chocolate Fondue', nameAr: 'فوندو الشوكولاتة الساخن', price: 18, category: 'desserts', image: 'https://images.unsplash.com/photo-1511910849309-0dffb8c83742?w=500&q=80', descriptionAr: 'كيك شوكولاتة ذائب مع الآيس كريم.' },
  { id: '8', name: 'Zinger Burger', nameAr: 'زنجر حار دبل', price: 28, category: 'burgers', image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94bb?w=500&q=80', descriptionAr: 'صدر دجاج مقرمش حار جداً مع الصوص الخاص.', dietary: { spicyLevel: 3 } },
];

export const TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t-${i + 1}`,
  number: i + 1,
  status: i % 4 === 0 ? 'OCCUPIED' : (i % 6 === 0 ? 'RESERVED' : 'EMPTY'),
  capacity: i < 6 ? 4 : 8,
}));
