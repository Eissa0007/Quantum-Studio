import { useState } from 'react';
import { ShoppingBag, Printer, CreditCard, Tag, CheckCircle, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { setFeatureStatus } from '../utils/fixTracker';

interface MockProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export const QuantumStorePanel = () => {
  const { currentProject } = useStore();
  const [activeTab, setActiveTab] = useState<'products' | 'pod_orders'>('products');
  const [podStatusList, setPodStatusList] = useState<any[]>([
    { id: 'ord-348', item: 'تيشرت رياضي قطني', date: 'منذ ساعتين', status: 'جاري الطباعة', price: 89, title: 'تصميم الصيف المعتمد' },
    { id: 'ord-219', item: 'كوب سيراميك فاخر', date: 'أمس', status: 'تم التسليم', price: 42, title: 'شعار البراند الرئيسي' }
  ]);
  const [orderedNotice, setOrderedNotice] = useState<string | null>(null);

  const mockProducts: MockProduct[] = [
    { id: 'prod-1', name: 'تيشرت كوانتوم ثنائي الألوان', price: 89, category: 'Apparel', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200' },
    { id: 'prod-2', name: 'كوب سيراميك فاخر بمقبض', price: 42, category: 'Drinkware', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200' },
    { id: 'prod-3', name: 'حقيبة كلاسيكية برباط ظهر', price: 54, category: 'Bags', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200' },
  ];

  const triggerPODOrder = (productName: string, price: number) => {
    setFeatureStatus('admin', 'in-progress'); // registers as active activity

    const title = currentProject?.title || 'تصميم بدون عنوان';
    const newOrder = {
      id: `ord-${Math.floor(100 + Math.random() * 900)}`,
      item: productName,
      date: 'الآن',
      status: 'معالجة ومزامنة الطلب',
      price: price,
      title: title
    };

    setPodStatusList(prev => [newOrder, ...prev]);
    setOrderedNotice(`نجح طلب الطباعة! تم إدراج طلبك لـ "${productName}" برقم تتبع ${newOrder.id}`);
    
    setFeatureStatus('admin', 'fixed');

    setTimeout(() => {
      setOrderedNotice(null);
    }, 4500);
  };

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-white dark:bg-[#1A1A2E]" dir="rtl">
      
      {/* Sub tabs */}
      <div className="flex p-1 bg-gray-105 dark:bg-gray-905 m-1.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[11px] font-bold">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'products' ? 'bg-[#FF6B9D] text-white shadow-sm' : 'text-gray-500'}`}
        >
          مصفوفة المنتجات السلعية
        </button>
        <button 
          onClick={() => setActiveTab('pod_orders')}
          className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${activeTab === 'pod_orders' ? 'bg-[#FF6B9D] text-white shadow-sm' : 'text-gray-500'}`}
        >
          طلبات الطباعة والشحن ({podStatusList.length})
        </button>
      </div>

      <div className="h-4" />

      {/* Notice Alert popups */}
      {orderedNotice && (
        <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-450 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} className="shrink-0" />
          <span>{orderedNotice}</span>
        </div>
      )}

      {/* 1. Products Tab workspace */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-gray-400">اطبع تصميمك الحالي على هذه المنتجات:</h4>
          </div>

          <div className="space-y-3">
            {mockProducts.map(p => (
              <div key={p.id} className="p-3 bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100/70 border border-gray-150 dark:border-gray-850 rounded-xl relative overflow-hidden flex gap-3 transition-colors">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-gray-100 dark:border-gray-800" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-extrabold">{p.category}</span>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 mt-1">{p.name}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{p.price} ر.س</span>
                    <button 
                      onClick={() => triggerPODOrder(p.name, p.price)}
                      className="bg-[#FF6B9D] hover:bg-[#eb508c] text-white p-1 px-3 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Printer size={10} />
                      <span>اشحن واطلب</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Order records / POD simulation list */}
      {activeTab === 'pod_orders' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-gray-400">تتبع نشاطات طباعة Merchandise:</h4>
          </div>

          {podStatusList.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">لا توجد طلبات جارية حالياً.</div>
          ) : (
            <div className="space-y-3">
              {podStatusList.map(item => (
                <div key={item.id} className="p-3 bg-gray-900 border border-transparent rounded-xl flex items-start gap-3 justify-between text-white">
                  <div className="flex gap-2.5 items-start">
                    <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg shrink-0 mt-0.5">
                      <Package size={14} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider">{item.id} • {item.date}</span>
                      <h4 className="text-xs font-bold mt-1 text-gray-100">{item.item}</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">التصميم: {item.title}</p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs font-bold text-[#FF6B9D] block">{item.price} ر.س</span>
                    <span className="inline-block bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded text-[8px] font-bold mt-2">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
