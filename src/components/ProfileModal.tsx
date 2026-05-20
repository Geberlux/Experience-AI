import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, ClipboardList, Trash2, Calendar, ShieldAlert, Loader2, CheckCircle2, Truck, Clock, XCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ClientOrder {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
  paid: { label: 'Pagado', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  shipped: { label: 'En Camino', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
  completed: { label: 'Finalizado', color: 'text-gamer-neon', bg: 'bg-gamer-neon/15', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle }
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;

    setLoadingOrders(true);
    // Subscribing to user's orders list
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClientOrder));
      setOrders(ordersData);
      setLoadingOrders(false);
    }, (error) => {
      console.warn('Silent skip of orders fetch (likely no index or rules limit):', error);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    setErrorMsg('');
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete();
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error deleting account:', err);
      if (err?.code === 'auth/requires-recent-login') {
        setErrorMsg('Por seguridad, esta acción requiere haber iniciado sesión recientemente. Por favor, cierra sesión e ingresa nuevamente para borrar tu cuenta.');
      } else {
        setErrorMsg('Error al eliminar la cuenta. Por favor intente más tarde.');
      }
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gamer-card border border-gamer-accent rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px]"
        >
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 bg-black/30 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-row md:flex-col justify-start md:space-y-2 shrink-0 gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('profile'); setDeleteConfirm(false); setErrorMsg(''); }}
              className={`flex-1 md:flex-initial flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'profile'
                  ? 'bg-gamer-accent text-white shadow-[0_0_15px_rgba(112,0,255,0.3)]'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User size={16} />
              <span>Mi Perfil</span>
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setDeleteConfirm(false); setErrorMsg(''); }}
              className={`flex-1 md:flex-initial flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'orders'
                  ? 'bg-gamer-accent text-white shadow-[0_0_15px_rgba(112,0,255,0.3)]'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ClipboardList size={16} />
              <span>Mis Pedidos</span>
            </button>
            
            <div className="hidden md:block flex-1" />

            <button
              onClick={onClose}
              className="md:w-full flex items-center justify-center space-x-2 px-4 py-3 border border-white/10 hover:border-gamer-danger font-bold text-xs uppercase tracking-widest text-white/40 hover:text-gamer-danger rounded-xl transition-all"
            >
              <X size={16} />
              <span>Cerrar</span>
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 p-8 flex flex-col min-h-0 overflow-y-auto">
            <div className="md:hidden flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Gamer Hub</h4>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white"><X size={20} /></button>
            </div>

            {activeTab === 'profile' ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-8 bg-gradient-to-r from-white via-white to-gamer-neon bg-clip-text text-transparent">
                    Tu Cuenta Elite
                  </h3>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6 mb-8">
                    <div className="flex items-center space-x-6">
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`}
                        className="w-16 h-16 rounded-full border-2 border-gamer-neon shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                        alt="Profile Avatar"
                      />
                      <div>
                        <h4 className="text-lg font-bold font-sans">{user.displayName || 'Gamer No Identificado'}</h4>
                        <p className="text-xs text-white/40 capitalize">Miembro de la comunidad</p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="text-white/40" size={16} />
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 leading-none">Correo Electrónico</p>
                          <p className="text-sm text-white/80 mt-1">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Deletion Area */}
                <div className="border-t border-white/10 pt-6">
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      className="flex items-center space-x-2 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest border border-rose-500/20"
                    >
                      <Trash2 size={16} />
                      <span>Eliminar Mi Cuenta</span>
                    </button>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start space-x-3 text-rose-400">
                        <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                        <div>
                          <h4 className="font-bold text-sm uppercase tracking-tight">¿Deseas eliminar permanentemente tu cuenta?</h4>
                          <p className="text-xs text-rose-400/80 mt-1 leading-relaxed">
                            Esta acción es irreversible y perderás el acceso a tus pedidos, perfiles y membresías de inmediato.
                          </p>
                        </div>
                      </div>

                      {errorMsg && (
                        <p className="text-xs text-rose-300 bg-black/30 p-3 rounded-lg leading-relaxed font-bold">
                          {errorMsg}
                        </p>
                      )}

                      <div className="flex items-center space-x-4">
                        <button
                          disabled={deleting}
                          onClick={handleDeleteAccount}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              <span>PROCESANDO...</span>
                            </>
                          ) : (
                            <span>SÍ, ELIMINAR CUENTA</span>
                          )}
                        </button>
                        <button
                          disabled={deleting}
                          onClick={() => { setDeleteConfirm(false); setErrorMsg(''); }}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tighter mb-6">
                  Historial de Pedidos
                </h3>

                {loadingOrders ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-gamer-neon" size={32} />
                    <p className="text-xs text-white/40 uppercase tracking-widest">Cargando pedidos...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {orders.map((order) => {
                      const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                      const Icon = config.icon;
                      return (
                        <div key={order.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono font-bold text-white/60">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`text-[9px] uppercase font-bold py-0.5 px-2 rounded ${config.bg} ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-white/40 text-xs">
                              <Calendar size={12} />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="border-t border-b border-white/5 py-3 space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-white/70">{item.name} <span className="text-white/30">x{item.quantity}</span></span>
                                <span className="font-bold text-white/90">${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-xs text-white/40">Monto Final</span>
                            <span className="font-display font-bold text-gamer-neon text-base">${order.total}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-white/40 italic text-sm">Aún no has realizado ninguna compra.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
