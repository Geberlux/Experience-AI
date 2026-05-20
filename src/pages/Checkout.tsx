import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ChevronLeft, Loader2, Zap } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { getDirectImageUrl } from '../lib/utils';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCartStore();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<typeof items>([]);
  const [purchasedTotal, setPurchasedTotal] = useState(0);
  const [shippingData, setShippingData] = useState({
    name: user?.displayName || '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });
  
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const matches = val.match(/.{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    setCardData(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) {
      val = `${val.slice(0, 2)} / ${val.slice(2)}`;
    }
    setCardData(prev => ({ ...prev, expiry: val }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setCardData(prev => ({ ...prev, cvv: val }));
  };

  if (items.length === 0 && step !== 3) {
    navigate('/catalog');
    return null;
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const orderData = {
        userId: user?.uid,
        userName: shippingData.name || user?.displayName,
        userEmail: user?.email,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        total,
        status: 'paid', // Mark as paid for mock flow
        shipping: shippingData,
        createdAt: new Date().toISOString(),
        paymentMethod: 'Mock Credit Card',
        paymentLast4: (cardData.number || '').replace(/\s/g, '').slice(-4) || '1234'
      };
      
      await runTransaction(db, async (transaction) => {
        // Read all product docs first
        const productRefsAndData = await Promise.all(
          items.map(async (item) => {
            const productRef = doc(db, 'products', item.id);
            const productSnap = await transaction.get(productRef);
            return { item, ref: productRef, snap: productSnap };
          })
        );

        // Verify stock of all products first before doing any writing
        for (const { item, snap } of productRefsAndData) {
          if (!snap.exists()) {
            throw new Error(`El producto "${item.name}" no existe en el catálogo.`);
          }
          const currentStock = snap.data().stock !== undefined ? snap.data().stock : 0;
          if (currentStock < item.quantity) {
            throw new Error(`Lo sentimos, el producto "${item.name}" no tiene suficiente stock disponible. Restante: ${currentStock}`);
          }
        }

        // Apply writes: decrement stock and increment salesCount
        for (const { item, ref, snap } of productRefsAndData) {
          const currentStock = snap.data().stock !== undefined ? snap.data().stock : 0;
          const currentSales = snap.data().salesCount !== undefined ? snap.data().salesCount : 0;
          transaction.update(ref, {
            stock: currentStock - item.quantity,
            salesCount: currentSales + item.quantity
          });
        }

        // Add the order
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, orderData);
      });

      setPurchasedItems(items);
      setPurchasedTotal(total);
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Error creating order within transaction:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error procesando el pedido.';
      alert(errorMsg);
      if (!(err instanceof Error && err.message.includes('No tiene suficiente stock'))) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'orders_and_products_update');
        } catch (ignored) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const displayItems = step === 3 ? purchasedItems : items;
  const displayTotal = step === 3 ? purchasedTotal : total;

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Form Area */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-gamer-accent/20 rounded-full flex items-center justify-center text-gamer-accent">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">Envío</h2>
                </div>

                <form onSubmit={handleNextStep} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Nombre Completo</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={shippingData.name}
                        onChange={e => setShippingData({...shippingData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Teléfono</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={shippingData.phone}
                        onChange={e => setShippingData({...shippingData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Dirección de Entrega</label>
                    <input 
                      required
                      placeholder="Calle y número..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                      value={shippingData.address}
                      onChange={e => setShippingData({...shippingData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Ciudad</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={shippingData.city}
                        onChange={e => setShippingData({...shippingData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Código Postal</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={shippingData.zip}
                        onChange={e => setShippingData({...shippingData, zip: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-5 bg-gamer-accent text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-gamer-neon hover:text-black transition-all shadow-lg"
                  >
                    CONTINUAR AL PAGO
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center text-white/40 hover:text-white mb-6 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                  <ChevronLeft size={16} className="mr-1" /> Volver a Envío
                </button>

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-10 h-10 bg-gamer-neon/20 rounded-full flex items-center justify-center text-gamer-neon">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-3xl font-display font-bold uppercase tracking-tighter">Pago Mock</h2>
                </div>

                <div className="bg-gradient-to-br from-gamer-accent/80 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-gamer-neon/20 transition-all duration-700" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <Zap className="fill-white" size={32} />
                      <div className="text-[10px] uppercase tracking-[0.3em] font-bold bg-black/30 px-2 py-1 rounded">VIP ELITE CARD</div>
                    </div>
                    <div className="text-2xl font-mono tracking-[0.2em] mb-8">
                      {cardData.number || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end uppercase">
                      <div>
                        <p className="text-[8px] tracking-[0.2em] opacity-60">Titular</p>
                        <p className="text-sm font-bold tracking-widest">{cardData.holder || 'NOMBRE APELLIDO'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] tracking-[0.2em] opacity-60">Expira</p>
                        <p className="text-sm font-bold tracking-widest">{cardData.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Número de Tarjeta</label>
                    <input 
                      required
                      placeholder="4000 0000 0000 0000"
                      maxLength={19}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all font-mono"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Nombre en la Tarjeta</label>
                    <input 
                      required
                      placeholder="EJ: JOHN WICK"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all uppercase"
                      value={cardData.holder}
                      onChange={e => setCardData({...cardData, holder: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">Vencimiento</label>
                      <input 
                        required
                        placeholder="MM / YY"
                        maxLength={7}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={cardData.expiry}
                        onChange={handleExpiryChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-2">CVV</label>
                      <input 
                        required
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-gamer-neon outline-none transition-all"
                        value={cardData.cvv}
                        onChange={handleCvvChange}
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gamer-neon text-black rounded-2xl font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,157,0.3)] flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        <span>PROCESANDO PAGO ELECTRÓNICO...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck />
                        <span>PAGAR ${total}</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-gamer-neon/20 rounded-full flex items-center justify-center text-gamer-neon mx-auto mb-8 animate-pulse shadow-[0_0_50px_rgba(0,255,157,0.4)]">
                   <CheckCircle2 size={64} />
                </div>
                <h2 className="text-4xl font-display font-bold uppercase tracking-tighter mb-4">¡PAGO CONFIRMADO!</h2>
                <p className="text-white/40 max-w-sm mx-auto mb-12 leading-relaxed">
                  Tu pedido ha sido procesado con éxito. Recibirás un correo con el detalle de seguimiento a la brevedad.
                </p>
                <div className="flex flex-col space-y-4 max-w-xs mx-auto">
                   <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-gamer-accent text-white rounded-xl font-bold hover:bg-gamer-neon hover:text-black transition-all"
                   >
                     VOLVER A LA TIENDA
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
           <div className="bg-gamer-card border border-white/10 rounded-3xl p-8 sticky top-32">
              <h3 className="text-xl font-display font-bold uppercase mb-8 border-b border-white/5 pb-4">Resumen de Compra</h3>
              
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {displayItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 items-center">
                    <img 
                      referrerPolicy="no-referrer"
                      src={getDirectImageUrl(item.imageUrl)} 
                      className="w-16 h-16 rounded-xl object-cover bg-white/5" 
                      alt={item.name} 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm leading-tight">{item.name}</p>
                      <p className="text-xs text-white/40 mt-1">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">${item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 px-2 pt-8 border-t border-white/10">
                 <div className="flex justify-between text-sm text-white/40">
                    <span>Subtotal</span>
                    <span>${displayTotal}</span>
                 </div>
                 <div className="flex justify-between text-sm text-white/40">
                    <span>Envío</span>
                    <span className="text-gamer-neon uppercase font-bold text-[10px]">Gratis bonificado</span>
                 </div>
                 <div className="flex justify-between text-xl font-display font-bold pt-4 text-gamer-neon">
                    <span>TOTAL</span>
                    <span>${displayTotal}</span>
                 </div>
              </div>

              {step !== 3 && (
                <div className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gamer-accent/10 rounded-full flex items-center justify-center text-gamer-accent">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest mb-1">Compra Blindada</h4>
                    <p className="text-[10px] text-white/40 leading-tight">Protegemos tu conexión con cifrado de grado militar de 256 bits.</p>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
