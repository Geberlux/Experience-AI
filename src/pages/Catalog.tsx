import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Product, subscribeToProducts } from '../lib/products';
import { SlidersHorizontal, Search } from 'lucide-react';

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(catParam || 'all');

  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
        <div className="flex space-x-4">
          <div className="relative group">
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

      <div className="flex overflow-x-auto space-x-4 pb-8 no-scrollbar scroll-smooth">
        {['all', 'keyboards', 'mice', 'controllers'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-gamer-neon text-black border-gamer-neon shadow-[0_0_15px_rgba(0,242,255,0.4)]' 
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
            }`}
          >
            {cat === 'all' ? 'Ver Todo' : cat === 'keyboards' ? 'Teclados' : cat === 'mice' ? 'Mouses' : 'Controles'}
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
            <ProductCard key={product.id} product={product} />
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
