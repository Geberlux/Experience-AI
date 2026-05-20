import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product, subscribeToProducts } from '../lib/products';
import { SlidersHorizontal, Search, Plus, X, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getDirectImageUrl } from '../lib/utils';
import { motion } from 'motion/react';

export const Catalog = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(catParam || 'all');

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'keyboards',
    imageUrl: '',
    active: true,
    featured: false
  });

  const uniqueCategories = Array.from(new Set(['keyboards', 'mice', 'controllers', ...products.map(p => p.category).filter(Boolean)]));

  const getCategoryLabel = (cat: string) => {
    const customLabels: Record<string, string> = {
      all: 'Ver Todo',
      keyboards: 'Teclados',
      mice: 'Mouses',
      controllers: 'Controles'
    };
    return customLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    try {
      const finalCategory = showNewCategoryInput ? customCategory.trim().toLowerCase() : formData.category;
      if (!finalCategory) {
        alert('Por favor especifica una categoría válida.');
        return;
      }
      const finalData = {
        ...formData,
        category: finalCategory
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), finalData);
      } else {
        await addDoc(collection(db, 'products'), finalData);
      }
      setIsAdding(false);
      setEditingId(null);
      setShowNewCategoryInput(false);
      setCustomCategory('');
      setFormData({ name: '', description: '', price: 0, stock: 0, category: 'keyboards', imageUrl: '', active: true, featured: false });
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'products');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-6 md:space-y-0">
        <div>
           <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Arma tu Setup</h1>
           <p className="text-white/40 text-sm mt-2">Explora la selección premium de periféricos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-gamer-accent text-white px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-all order-last md:order-first w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              <span>AÑADIR PRODUCTO</span>
            </button>
          )}
          <div className="relative group flex-1 md:flex-none">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gamer-neon transition-colors" size={20} />
             <input 
               type="text" 
               placeholder="Buscar periférico..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-gamer-card border border-white/10 rounded-full pl-10 pr-6 py-3 text-sm focus:outline-none focus:border-gamer-neon focus:ring-1 focus:ring-gamer-neon/30 w-full md:w-64 transition-all"
             />
          </div>
          <button className="bg-gamer-card border border-white/10 p-3 rounded-full hover:border-gamer-neon transition-colors">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gamer-card border border-gamer-accent rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">{editingId ? 'Editar Producto' : 'Nuevo Periférico'}</h3>
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-white/40 hover:text-gamer-danger transition-colors"><X /></button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Nombre</label>
                  <input 
                    placeholder="Ej: Apex Pro TKL" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Categoría</label>
                  <select 
                    className="w-full bg-[#121118] text-white border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none"
                    value={showNewCategoryInput ? '__new__' : (formData.category || 'keyboards')}
                    onChange={e => {
                      if (e.target.value === '__new__') {
                        setShowNewCategoryInput(true);
                      } else {
                        setShowNewCategoryInput(false);
                        setFormData({...formData, category: e.target.value});
                      }
                    }}
                  >
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat} className="bg-[#121118] text-white font-sans py-2">
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                    <option value="__new__" className="bg-[#121118] text-gamer-neon font-sans py-2 font-bold">+ Crear nueva categoría...</option>
                  </select>

                  {showNewCategoryInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      <input 
                        placeholder="Nombre de la nueva categoría (ej: Auriculares)" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all text-xs"
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                      />
                    </motion.div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Precio ($)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Stock Disponible</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">URL Imagen</label>
                  <div className="flex space-x-4 items-center">
                    <input 
                      placeholder="https://drive.google.com/... o https://images.unsplash.com/..." 
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    />
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                       {formData.imageUrl ? (
                          <img referrerPolicy="no-referrer" src={getDirectImageUrl(formData.imageUrl)} className="w-full h-full object-cover" alt="Preview" />
                       ) : (
                          <ImageIcon className="text-white/20" size={20} />
                       )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Descripción</label>
                  <textarea 
                    placeholder="Detalles sobre switches, sensores, etc..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none h-24 resize-none transition-all"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
             </div>
             <div className="mt-10 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="bg-gamer-neon text-black font-bold px-12 py-4 rounded-full flex items-center justify-center space-x-3 hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                >
                  <Save size={20} />
                  <span>GUARDAR CAMBIOS</span>
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto space-x-4 pb-8 no-scrollbar scroll-smooth">
        {['all', ...uniqueCategories].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-gamer-neon text-black border-gamer-neon shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {[1,2,3,4,5,6,7,8].map((i) => (
             <div key={i} className="bg-gamer-card rounded-2xl h-[400px] animate-pulse border border-white/5" />
           ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isAdmin={isAdmin}
              onEdit={(p) => { setEditingId(p.id); setFormData(p); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
           <p className="text-white/40 italic">No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  );
};
