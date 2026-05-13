import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, Chrome, CheckCircle } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirebaseError } from 'firebase/app';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'options';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkEmailInUse = async (emailToHero: string) => {
    if (!emailToHero || !emailToHero.includes('@')) return;
    setEmailStatus('checking');
    try {
      // We query the 'personas' collection to see if this email is already registered
      const q = query(collection(db, 'personas'), where('email', '==', emailToHero));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setEmailStatus('taken');
        setError('Este correo ya está asociado a una cuenta.');
      } else {
        setEmailStatus('available');
        setError('');
      }
    } catch (err) {
      // If we can't query (because of rules), we'll assume it's okay and let the Auth provider handle it
      console.warn('Silent skip of firestore email check:', err);
      setEmailStatus('idle');
    }
  };

  const reset = () => {
    setMode('options');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setLoading(false);
    setIsSuccess(false);
  };

  const syncUserToFirestore = async (user: any) => {
    const userRef = doc(db, 'personas', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || displayName,
        role: user.email === 'curuzumartinez@gmail.com' ? 'admin' : 'client',
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      // Delay reset slightly after closing to avoid flickering
      setTimeout(reset, 200);
    }, 1500);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserToFirestore(result.user);
      handleSuccess();
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/account-exists-with-different-credential') {
          setError('Este correo ya está asociado a un método de ingreso diferente.');
        } else {
          setError('Error al conectar con Google.');
        }
      } else {
        setError('Error al conectar con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await syncUserToFirestore(result.user);
      handleSuccess();
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            setError('No existe una cuenta con este correo.');
            break;
          case 'auth/wrong-password':
            setError('Contraseña incorrecta.');
            break;
          case 'auth/invalid-credential':
            setError('Credenciales inválidas. Verifica tu correo y contraseña.');
            break;
          default:
            setError('Error al ingresar. Intenta de nuevo.');
        }
      } else {
        setError('Error inesperado al ingresar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailStatus === 'taken') {
      setError('Este correo ya está en uso.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await syncUserToFirestore(result.user);
      handleSuccess();
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/email-already-in-use') {
          setError('El correo ya está asociado a otra cuenta (Local o Google).');
        } else if (err.code === 'auth/weak-password') {
          setError('La contraseña es demasiado débil (mínimo 6 caracteres).');
        } else {
          setError('Error al registrar. Verifica los datos.');
        }
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading && !isSuccess ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gamer-card border border-white/10 rounded-3xl p-8 z-[201] shadow-2xl shadow-gamer-accent/20"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-20 h-20 bg-gamer-neon rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                >
                  <CheckCircle size={48} className="text-black" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold uppercase tracking-tighter mb-2">Ingreso Exitoso</h2>
                <p className="text-white/40 font-medium">Bienvenido al Team Experience.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tighter">
                    {mode === 'options' ? 'Acceso Elite' : mode === 'login' ? 'Ingresar' : 'Unirse al Team'}
                  </h2>
                  <button onClick={onClose} className="p-2 hover:text-gamer-danger transition-colors">
                    <X />
                  </button>
                </div>

                {error && (
                  <div className="bg-gamer-danger/10 border border-gamer-danger text-gamer-danger p-3 rounded-lg text-xs font-bold mb-6">
                    {error}
                  </div>
                )}

                {mode === 'options' && (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setMode('login')}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:border-gamer-neon transition-all group"
                    >
                      <LogIn className="group-hover:text-gamer-neon" />
                      <span className="font-bold">Ingresar</span>
                    </button>
                    <button 
                      onClick={() => setMode('register')}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center space-x-3 hover:border-gamer-accent transition-all group"
                    >
                      <UserPlus className="group-hover:text-gamer-accent" />
                      <span className="font-bold">Crear Cuenta</span>
                    </button>
                    <div className="py-4 flex items-center space-x-4">
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">O continúa con</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>
                    <button 
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-4 bg-gamer-neon text-black rounded-2xl flex items-center justify-center space-x-3 font-bold hover:bg-white transition-all transform active:scale-95"
                    >
                      <Chrome size={20} />
                      <span>Ingresar con Google</span>
                    </button>
                  </div>
                )}

                {(mode === 'login' || mode === 'register') && (
                  <form onSubmit={mode === 'login' ? handleEmailLogin : handleRegister} className="space-y-4">
                    {mode === 'register' && (
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gamer-neon" size={18} />
                        <input 
                          required
                          placeholder="Tu nombre real"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:border-gamer-neon focus:outline-none transition-all"
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gamer-neon" size={18} />
                      <input 
                        required
                        type="email"
                        placeholder="Email"
                        className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-4 focus:outline-none transition-all ${
                          mode === 'register' && emailStatus === 'taken' ? 'border-gamer-danger shadow-[0_0_10px_rgba(255,0,85,0.2)]' : 
                          mode === 'register' && emailStatus === 'available' ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 
                          'border-white/10 focus:border-gamer-neon'
                        }`}
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (mode === 'register') setEmailStatus('idle');
                        }}
                        onBlur={() => mode === 'register' && checkEmailInUse(email)}
                      />
                      {mode === 'register' && emailStatus === 'checking' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-gamer-neon border-t-transparent" />
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gamer-neon" size={18} />
                      <input 
                        required
                        type="password"
                        placeholder="Contraseña"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:border-gamer-neon focus:outline-none transition-all"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gamer-accent text-white rounded-2xl font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all"
                    >
                      {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarme'}
                    </button>

                    <div className="py-2 flex items-center space-x-4">
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest text-center">O</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center space-x-3 font-bold hover:bg-white hover:text-black transition-all transform active:scale-95"
                    >
                      <Chrome size={18} />
                      <span className="text-sm">Continuar con Google</span>
                    </button>

                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-xs text-white/40 hover:text-gamer-neon underline"
                      >
                        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
                      </button>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setMode('options')}
                      className="w-full text-[10px] text-white/20 uppercase font-bold tracking-widest mt-4 hover:text-white"
                    >
                      Volver a opciones
                    </button>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

  );
};
