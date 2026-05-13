import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { Product } from '../lib/products';
import { Layout } from '../components/Layout';
import { Plus, Trash2, Edit3, Save, X, Package, Database } from 'lucide-react';

const SEED_DATA: Partial<Product>[] = [
  { name: 'Apex Pro TKL', price: 199.99, stock: 10, category: 'keyboards', imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800', active: true, featured: true, description: 'Teclado mecánico con switches OmniPoint 2.0.' },
  { name: 'Logitech G Pro X', price: 159.00, stock: 15, category: 'mice', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800', active: true, featured: true, description: 'Mouse inalámbrico ultra ligero.' },
  { name: 'DualSense Edge', price: 199.99, stock: 5, category: 'controllers', imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f3580211e?auto=format&fit=crop&q=80&w=800', active: true, featured: true, description: 'Control pro para máxima precisión.' }
];

export const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'curuzumartinez@gmail.com') {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  const handleSeed = async () => {
    if (products.length > 0) {
      if (!window.confirm('Ya existen productos. ¿Deseas añadir los datos de prueba de todas formas?')) return;
    }
    try {
      const batch = writeBatch(db);
      SEED_DATA.forEach((item) => {
        const docRef = doc(collection(db, 'products'));
        batch.set(docRef, item);
      });
      await batch.commit();
      alert('Semillado completado con éxito.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'products'));
  }, []);

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), formData);
      } else {
        await addDoc(collection(db, 'products'), formData);
      }
      setIsAdding(false);
      setEditingId(null);
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

  if (checkingAuth) {
    return (
      <div className="pt-32 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gamer-neon"></div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="pt-32 text-center">
        <h1 className="text-3xl font-display font-bold text-gamer-danger uppercase italic">Acceso Denegado</h1>
        <p className="text-white/40 mt-4 max-w-md mx-auto">Esta sección está restringida exclusivamente para la administración central de Experience.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">Admin Dashboard</h1>
          <p className="text-white/40 text-sm">Gestión de inventario y catálogo.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleSeed}
            className="bg-white/5 text-white/60 px-6 py-3 rounded-xl font-bold flex items-center space-x-2 border border-white/10 hover:border-gamer-neon hover:text-white transition-all"
          >
            <Database size={20} />
            <span>SEMILLAR</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-gamer-accent text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:shadow-[0_0_15px_rgba(112,0,255,0.4)] transition-all"
          >
            <Plus size={20} />
            <span>AÑADIR PRODUCTO</span>
          </button>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-gamer-card border border-gamer-accent rounded-2xl p-8 mb-12 shadow-2xl animate-in fade-in slide-in-from-top-4">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold uppercase">{editingId ? 'Editar Producto' : 'Nuevo Periférico'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-white/40 hover:text-white"><X /></button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                placeholder="Nombre" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <select 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
              >
                <option value="keyboards">Teclado</option>
                <option value="mice">Mouse</option>
                <option value="controllers">Control</option>
              </select>
              <input 
                type="number" 
                placeholder="Precio" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
              <input 
                type="number" 
                placeholder="Stock" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
              <input 
                placeholder="URL Imagen" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none col-span-2"
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
              <textarea 
                placeholder="Descripción" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gamer-neon outline-none col-span-2 h-24"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>
           <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-gamer-neon text-black font-bold px-10 py-4 rounded-xl flex items-center space-x-2 hover:bg-white transition-all"
              >
                <Save size={20} />
                <span>GUARDAR CAMBIOS</span>
              </button>
           </div>
        </div>
      )}

      <div className="bg-gamer-card border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-white/40">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={p.imageUrl} className="w-10 h-10 rounded bg-white/10 object-cover" alt="" />
                    <span className="font-bold text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs uppercase tracking-tighter text-gamer-neon font-bold">{p.category}</td>
                <td className="px-6 py-4 text-sm font-mono">{p.stock}</td>
                <td className="px-6 py-4 text-sm font-bold">${p.price}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => { setEditingId(p.id); setFormData(p); }}
                      className="p-2 hover:bg-gamer-accent rounded transition-colors text-white/40 hover:text-white"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 hover:bg-gamer-danger rounded transition-colors text-white/40 hover:text-white"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-24 flex flex-col items-center text-white/20">
             <Package size={48} strokeWidth={1} />
             <p className="mt-4 font-display font-medium uppercase tracking-widest">Sin inventario</p>
          </div>
        )}
      </div>
    </div>
  );
};
