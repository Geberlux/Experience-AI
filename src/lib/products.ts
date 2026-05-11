import { onSnapshot, collection, query, where, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: 'keyboards' | 'mice' | 'controllers';
  active: boolean;
  featured: boolean;
}

export async function getProducts() {
  const path = 'products';
  try {
    const q = query(collection(db, path), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void) {
  const path = 'products';
  const q = query(collection(db, path), where('active', '==', true));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function createOrder(orderData: any) {
  const path = 'orders';
  const orderId = crypto.randomUUID();
  try {
    await setDoc(doc(db, path, orderId), {
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
