import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, runTransaction } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Clock, CheckCircle2, Truck, XCircle, ChevronRight, Eye, X, AlertTriangle, User, Mail, CreditCard } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  mercadopagoId?: string;
  shipping?: {
    name: string;
    address: string;
    city: string;
    zip: string;
    phone: string;
  };
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-yellow-500/85', bg: 'bg-yellow-500/10', icon: Clock },
  paid: { label: 'Pagado', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  shipped: { label: 'En Camino', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
  completed: { label: 'Finalizado', color: 'text-gamer-neon', bg: 'bg-gamer-neon/15', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle }
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const isCritical = newStatus === 'cancelled';
    const message = isCritical 
      ? '¿ESTÁS SEGURO? Esta acción cancelará la venta, restaurará el stock de los productos y es irreversible.' 
      : `¿Cambiar estado a ${newStatus.toUpperCase()}?`;

    if (!window.confirm(message)) return;

    try {
      if (newStatus === 'cancelled') {
        const orderRef = doc(db, 'orders', orderId);
        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) {
            throw new Error('El pedido no existe.');
          }
          const orderData = orderSnap.data() as Order;
          if (orderData.status === 'cancelled') {
            return; // Already cancelled
          }

          // Restore product stock
          if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
              const productRef = doc(db, 'products', item.id);
              const productSnap = await transaction.get(productRef);
              if (productSnap.exists()) {
                const currentStock = productSnap.data().stock !== undefined ? productSnap.data().stock : 0;
                const currentSales = productSnap.data().salesCount !== undefined ? productSnap.data().salesCount : 0;
                transaction.update(productRef, {
                  stock: currentStock + item.quantity,
                  salesCount: Math.max(0, currentSales - item.quantity)
                });
              }
            }
          }

          transaction.update(orderRef, { status: 'cancelled' });
        });
      } else {
        await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'orders');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeSelectedOrder = selectedOrder ? orders.find(o => o.id === selectedOrder.id) || selectedOrder : null;

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Gestión de Pedidos</h1>
          <p className="text-white/40 text-sm mt-2">Monitorea y actualiza el estado de las ventas.</p>
        </div>

        <div className="flex flex-wrap gap-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gamer-neon transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ID, Nombre o Email..." 
                className="bg-gamer-card border border-white/10 rounded-full pl-10 pr-6 py-3 text-sm focus:outline-none focus:border-gamer-neon w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <select 
            className="bg-[#121118] text-white border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-gamer-neon"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
           >
             <option value="all" className="bg-[#121118] text-white font-sans">Todos los Estados</option>
             <option value="paid" className="bg-[#121118] text-white font-sans">Pagados</option>
             <option value="shipped" className="bg-[#121118] text-white font-sans">En Camino</option>
             <option value="completed" className="bg-[#121118] text-white font-sans">Finalizados</option>
             <option value="cancelled" className="bg-[#121118] text-white font-sans">Cancelados</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;
              const isCancelled = order.status === 'cancelled';

              return (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-gamer-card border ${isCancelled ? 'border-red-500/30' : 'border-white/5'} rounded-2xl p-6 hover:border-gamer-neon/30 hover:bg-white/5 cursor-pointer transition-all active:scale-[0.995] group`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center ${config.color}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                           <h4 className="font-bold text-sm uppercase tracking-tight group-hover:text-gamer-neon transition-colors">#{order.id.slice(0, 8)}</h4>
                           <span className={`text-[10px] uppercase font-bold py-1 px-2 rounded ${config.bg} ${config.color}`}>
                             {config.label}
                           </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {new Date(order.createdAt).toLocaleString()} • {order.items.length} items • ${order.total}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                       <select 
                         disabled={order.status === 'cancelled'}
                         className="bg-[#121118] text-white border border-white/10 rounded-lg px-4 py-2 text-xs focus:border-gamer-neon outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                         value={order.status}
                         onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                       >
                         <option value="pending" disabled className="bg-[#121118] text-white font-sans opacity-50">Pendiente</option>
                         <option value="paid" className="bg-[#121118] text-white font-sans">Marcar Pagado</option>
                         <option value="shipped" className="bg-[#121118] text-white font-sans">Marcar En Camino</option>
                         <option value="completed" className="bg-[#121118] text-white font-sans">Marcar Finalizado</option>
                         <option value="cancelled" className="bg-[#121118] text-white font-sans">Cancelar Pedido</option>
                       </select>

                       <button 
                         onClick={() => setSelectedOrder(order)}
                         className="p-2 text-white/40 hover:text-gamer-neon transition-colors"
                       >
                         <Eye size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center border border-white/5 border-dashed rounded-3xl">
               <p className="text-white/40 italic">No se encontraron pedidos con estos criterios.</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && activeSelectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gamer-card border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                   <h3 className="text-2xl font-display font-bold uppercase tracking-tighter">Detalle de Pedido</h3>
                   <p className="text-xs text-white/40 mt-1">ID: {activeSelectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-white/40 hover:text-gamer-danger transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                {/* Client Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 bg-gamer-accent/10 rounded-lg flex items-center justify-center text-gamer-accent">
                        <User size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Cliente</p>
                        <p className="font-bold">{activeSelectedOrder.userName || 'Usuario Elite'}</p>
                     </div>
                  </div>
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 bg-gamer-neon/10 rounded-lg flex items-center justify-center text-gamer-neon">
                        <Mail size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Email</p>
                        <p className="font-bold">{activeSelectedOrder.userEmail || 'N/A'}</p>
                     </div>
                  </div>
                </div>

                {/* Status Warning if Cancelled */}
                {activeSelectedOrder.status === 'cancelled' && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center space-x-3">
                     <AlertTriangle className="text-red-500" />
                     <p className="text-sm font-bold text-red-500">ESTE PEDIDO FUE CANCELADO POR EL CLIENTE O UN ADMINISTRADOR (NUEVO STOCK REINTEGRADO).</p>
                  </div>
                )}

                {/* Shipping Info */}
                {activeSelectedOrder.shipping && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 px-2">Datos de Entrega</h4>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold">Destinatario</p>
                            <p className="text-sm font-bold">{activeSelectedOrder.shipping.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-white/40 font-bold">Teléfono</p>
                            <p className="text-sm font-bold">{activeSelectedOrder.shipping.phone}</p>
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold">Dirección</p>
                          <p className="text-sm font-bold">{activeSelectedOrder.shipping.address}, {activeSelectedOrder.shipping.city} ({activeSelectedOrder.shipping.zip})</p>
                       </div>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4 px-2">Productos</h4>
                  <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <table className="w-full text-left text-sm">
                       <thead>
                         <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                           <th className="px-6 py-4">Producto</th>
                           <th className="px-6 py-4 text-center">Cant.</th>
                           <th className="px-6 py-4 text-right">Precio</th>
                           <th className="px-6 py-4 text-right">Total</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {activeSelectedOrder.items.map((item) => (
                           <tr key={item.id}>
                             <td className="px-6 py-4 font-bold">{item.name}</td>
                             <td className="px-6 py-4 text-center">{item.quantity}</td>
                             <td className="px-6 py-4 text-right text-white/60">${item.price}</td>
                             <td className="px-6 py-4 text-right text-gamer-neon font-bold">${item.price * item.quantity}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest flex items-center">
                        <CreditCard size={12} className="mr-1" /> Método de Pago
                      </p>
                      <p className="text-sm font-bold">MercadoPago {activeSelectedOrder.mercadopagoId && `(#${activeSelectedOrder.mercadopagoId})`}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Total Transacción</p>
                      <p className="text-4xl font-display font-bold text-gamer-neon">${activeSelectedOrder.total}</p>
                   </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
                 <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors"
                 >
                   CERRAR DETALLE
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
