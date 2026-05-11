import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../lib/products';
import { useCartStore } from '../store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-gamer-card border border-white/10 rounded-2xl overflow-hidden group hover:border-gamer-neon transition-colors"
    >
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
           <button 
             onClick={handleAddToCart}
             className="w-12 h-12 bg-gamer-neon text-black rounded-full flex items-center justify-center hover:bg-white transition-colors"
           >
             <ShoppingCart size={20} />
           </button>
           <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gamer-neon transition-colors">
             <Eye size={20} />
           </button>
        </div>
        {product.featured && (
          <span className="absolute top-4 left-4 bg-gamer-accent text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">
            Destacado
          </span>
        )}
      </div>
      <div className="p-6">
        <span className="text-[10px] text-gamer-neon font-bold uppercase tracking-widest mb-1 block">
          {product.category}
        </span>
        <h3 className="font-display font-bold text-lg mb-2">{product.name}</h3>
        <p className="text-white/40 text-xs line-clamp-2 mb-4 h-8">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-display font-bold text-white">${product.price}</span>
          <button 
            onClick={handleAddToCart}
            className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-tighter"
          >
            Añadir +
          </button>
        </div>
      </div>
    </motion.div>
  );
};
