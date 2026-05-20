import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../lib/products';
import { useCartStore } from '../store/useCartStore';
import { getDirectImageUrl } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (p: Product) => void;
  onDelete?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin, onEdit, onDelete }) => {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
      className="bg-gamer-card border border-white/10 rounded-2xl overflow-hidden group hover:border-gamer-neon transition-colors relative cursor-pointer"
    >
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(product); }}
            className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-gamer-accent transition-colors"
          >
            <Eye size={16} className="hidden" /> {/* Placeholder icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(product.id); }}
            className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-gamer-danger transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        <img 
          referrerPolicy="no-referrer"
          src={getDirectImageUrl(product.imageUrl)} 
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
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCardClick(); }}
             className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gamer-neon transition-colors"
           >
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
        <span className="text-[10px] text-gamer-neon font-bold uppercase tracking-widest mb-1 block capitalize">
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
