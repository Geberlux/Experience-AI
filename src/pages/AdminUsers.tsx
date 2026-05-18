import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Shield, User, Mail, ShieldAlert, Trash2, X, Check, AlertCircle, Ban } from 'lucide-react';

interface Persona {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'client';
  createdAt: string;
  status?: 'active' | 'suspended';
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'role' | 'delete' | 'ban', userId: string, extra?: any } | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'personas'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as Persona)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'personas');
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    try {
      await updateDoc(doc(db, 'personas', userId), { role: newRole });
      setConfirmAction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'personas');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'personas', userId));
      setConfirmAction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'personas');
    }
  };

  const handleToggleBan = async (userId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await updateDoc(doc(db, 'personas', userId), { status: newStatus });
      setConfirmAction(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'personas');
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter">Gestión de Usuarios</h1>
          <p className="text-white/40 text-sm mt-2">Administra roles, accesos y seguridad de la comunidad.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gamer-neon transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            className="bg-gamer-card border border-white/10 rounded-full pl-10 pr-6 py-3 text-sm focus:outline-none focus:border-gamer-neon w-full md:w-80 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gamer-card border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
                <th className="px-8 py-6">Usuario</th>
                <th className="px-8 py-6">Estado / Rol</th>
                <th className="px-8 py-6">Registro</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className={`hover:bg-white/[0.02] transition-colors ${user.status === 'suspended' ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=7000FF&color=fff`} 
                          className="w-10 h-10 rounded-xl"
                          alt="Avatar"
                        />
                        <div>
                           <p className="font-bold text-sm">{user.displayName || 'Usuario Elite'}</p>
                           <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center space-x-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${user.role === 'admin' ? 'bg-gamer-accent text-white shadow-[0_0_10px_rgba(112,0,255,0.3)]' : 'bg-white/10 text-white/60'}`}>
                            {user.role}
                          </span>
                          {user.status === 'suspended' && (
                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-red-500/20 text-red-500 border border-red-500/30">
                              Baneado
                            </span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-white/40">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setConfirmAction({ type: 'role', userId: user.uid, extra: user.role })}
                            className="p-2 text-white/40 hover:text-gamer-neon transition-colors"
                            title="Cambiar Rol"
                          >
                            <Shield size={18} />
                          </button>
                          <button 
                            onClick={() => setConfirmAction({ type: 'ban', userId: user.uid, extra: user.status })}
                            className="p-2 text-white/40 hover:text-yellow-500 transition-colors"
                            title={user.status === 'suspended' ? 'Activar' : 'Suspender'}
                          >
                            <Ban size={18} />
                          </button>
                          <button 
                            onClick={() => setConfirmAction({ type: 'delete', userId: user.uid })}
                            className="p-2 text-white/40 hover:text-gamer-danger transition-colors"
                            title="Eliminar Usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="px-8 py-24 text-center text-white/20 italic">No se encontraron usuarios.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-gamer-card border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
            >
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                 confirmAction.type === 'delete' ? 'bg-red-500/20 text-red-500' : 'bg-gamer-accent/20 text-gamer-accent'
               }`}>
                  {confirmAction.type === 'delete' ? <ShieldAlert size={32} /> : <AlertCircle size={32} />}
               </div>
               
               <h3 className="text-xl font-display font-bold uppercase mb-4">
                 {confirmAction.type === 'delete' ? '¿ELIMINAR DEFINITIVAMENTE?' : 
                  confirmAction.type === 'role' ? '¿CAMBIAR ROL?' : '¿MODIFICAR ACCESO?'}
               </h3>
               
               <p className="text-sm text-white/40 mb-10 leading-relaxed">
                 {confirmAction.type === 'delete' ? 'Esta acción borrará todos los datos del usuario y es irreversible.' :
                  confirmAction.type === 'role' ? `El usuario pasará de ser ${confirmAction.extra.toUpperCase()} a ser ${confirmAction.extra === 'admin' ? 'CLIENTE' : 'ADMIN'}.` :
                  confirmAction.extra === 'suspended' ? 'El usuario recuperará el acceso a la plataforma.' : 'El usuario no podrá ingresar hasta ser reactivado.'}
               </p>

               <div className="flex flex-col space-y-3">
                  <button 
                    onClick={() => {
                      if (confirmAction.type === 'delete') handleDeleteUser(confirmAction.userId);
                      if (confirmAction.type === 'role') handleRoleChange(confirmAction.userId, confirmAction.extra);
                      if (confirmAction.type === 'ban') handleToggleBan(confirmAction.userId, confirmAction.extra);
                    }}
                    className={`py-4 rounded-xl font-bold transition-all shadow-lg ${
                      confirmAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-gamer-neon text-black hover:bg-white'
                    }`}
                  >
                    SÍ, ESTOY SEGURO
                  </button>
                  <button 
                    onClick={() => setConfirmAction(null)}
                    className="py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors"
                  >
                    CANCELAR
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
