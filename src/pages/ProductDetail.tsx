import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowLeft, Shield, Zap, Sparkles, AlertCircle, Check, Loader2, Minus, Plus } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Product } from '../lib/products';
import { useCartStore } from '../store/useCartStore';
import { getDirectImageUrl } from '../lib/utils';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          setQuantity(1);

          // Fetch related products of the same category
          const q = query(
            collection(db, 'products'),
            where('category', '==', prodData.category),
            where('active', '==', true),
            limit(3)
          );
          const querySnap = await getDocs(q);
          const related = querySnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== prodData.id);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    // Clear and add or just add
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl,
    });
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-gamer-neon mb-4" size={48} />
        <p className="text-sm text-white/40 uppercase tracking-widest">Cargando arsenal gamer...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="text-rose-500 mb-6" size={64} />
        <h2 className="text-3xl font-display font-bold uppercase tracking-tighter mb-4">Producto no encontrado</h2>
        <p className="text-white/40 max-w-md mx-auto mb-8 leading-relaxed">
          El periférico o producto seleccionado podría haber sido retirado del inventario o modificado por la administración.
        </p>
        <Link 
          to="/catalog" 
          className="px-6 py-3 bg-gamer-accent text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all"
        >
          Volver al Catalogo
        </Link>
      </div>
    );
  }

  const categoryLabel = product.category === 'keyboards' ? 'Teclados' : product.category === 'mice' ? 'Mouses' : product.category === 'controllers' ? 'Controles' : product.category;

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-4">
      {/* Back Button */}
      <Link 
        to="/catalog" 
        className="inline-flex items-center text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
        {/* Visual Showcase Frame */}
        <div className="lg:col-span-6 relative group">
          <div className="absolute -inset-4 bg-gamer-accent/15 blur-3xl opacity-60 rounded-full group-hover:opacity-100 transition-opacity" />
          <div className="bg-gamer-card border border-white/10 rounded-3xl aspect-square overflow-hidden relative z-10 flex items-center justify-center shadow-2xl">
            <img 
              referrerPolicy="no-referrer"
              src={getDirectImageUrl(product.imageUrl)} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {product.featured && (
              <span className="absolute top-6 left-6 bg-gamer-neon text-black text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,157,0.4)]">
                Best Seller ⭐
              </span>
            )}
          </div>
        </div>

        {/* Configurations, Specifications and CTAs */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <span className="text-xs text-gamer-neon font-bold uppercase tracking-widest mb-2 block border-l-2 border-gamer-neon pl-3">
              {categoryLabel}
            </span>
            <h1 className="text-4xl lg:text-5xl font-display font-bold uppercase tracking-tighter text-white mt-1 mb-4 leading-none">
              {product.name}
            </h1>
            <p className="text-2xl font-display font-bold text-white/90">
              ${product.price}
            </p>
          </div>

          <div className="border-t border-b border-white/10 py-6 space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Descripción del Equipo</h4>
            <p className="text-sm text-white/70 leading-relaxed font-sans font-normal">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Disponibilidad</h4>
                {product.stock > 0 ? (
                  <p className="text-sm font-semibold text-gamer-neon">En Stock ({product.stock} unidades)</p>
                ) : (
                  <p className="text-sm font-semibold text-rose-500">Sin Stock disponible</p>
                )}
              </div>

              {product.stock > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Cantidad</h4>
                  <div className="flex items-center border border-white/10 bg-white/5 rounded-xl h-12 overflow-hidden">
                    <button 
                      onClick={handleDecrease}
                      className="w-10 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-4 font-bold text-sm w-12 text-center text-white">{quantity}</span>
                    <button 
                      onClick={handleIncrease}
                      className="w-10 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {product.stock > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold uppercase tracking-widest hover:border-gamer-accent hover:bg-gamer-accent/10 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingCart size={18} />
                  <span>Añadir al carrito</span>
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-gamer-accent text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-gamer-neon hover:text-black transition-all shadow-[0_4px_30px_rgba(112,0,255,0.3)] flex items-center justify-center space-x-2"
                >
                  <Sparkles size={18} />
                  <span>Comprar ahora</span>
                </button>
              </div>
            ) : (
              <button 
                disabled
                className="w-full py-4 bg-white/10 text-white/40 rounded-2xl font-bold uppercase tracking-widest cursor-not-allowed border border-white/5"
              >
                No Disponible
              </button>
            )}

            {addedMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gamer-neon/10 border border-gamer-neon/30 text-gamer-neon p-4 rounded-xl flex items-center space-x-3"
              >
                <Check size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">¡{quantity} {product.name} agregado(s) a tu carrito de batalla!</span>
              </motion.div>
            )}
          </div>

          {/* Core Values Badge */}
          <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/10 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-gamer-accent/10 rounded-full flex items-center justify-center text-gamer-accent mx-auto">
                <Shield size={18} />
              </div>
              <h5 className="text-[9px] uppercase font-bold tracking-widest text-white/80">12 Meses Garantía</h5>
              <p className="text-[9px] text-white/40">Garantía oficial y cambio inmediato</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-gamer-neon/10 rounded-full flex items-center justify-center text-gamer-neon mx-auto">
                <Zap size={18} />
              </div>
              <h5 className="text-[9px] uppercase font-bold tracking-widest text-white/80">Envío Gratis</h5>
              <p className="text-[9px] text-white/40">Envío express seguro bonificado</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 mx-auto">
                <Sparkles size={18} />
              </div>
              <h5 className="text-[9px] uppercase font-bold tracking-widest text-white/80">Satisfecho o Reintegro</h5>
              <p className="text-[9px] text-white/40">30 días de prueba garantizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-white/10 pt-16">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-10 text-white flex items-center">
            <Sparkles className="text-gamer-neon mr-3" size={24} />
            Periféricos Relacionados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map(prod => (
              <Link 
                to={`/product/${prod.id}`}
                key={prod.id}
                className="bg-gamer-card border border-white/10 rounded-2xl overflow-hidden group hover:border-gamer-neon transition-colors block text-left"
              >
                <div className="relative aspect-square overflow-hidden bg-white/5">
                  <img 
                    referrerPolicy="no-referrer"
                    src={getDirectImageUrl(prod.imageUrl)} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-display font-bold text-base text-white group-hover:text-gamer-neon transition-colors line-clamp-1">{prod.name}</h4>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-white/40 font-sans uppercase text-[10px] tracking-wider">{prod.category}</span>
                    <span className="font-display font-bold text-white text-base">${prod.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
