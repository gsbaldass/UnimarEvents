import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  isPending: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  exchangeCodeForSessionToken: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Inicializando...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthProvider: Estado de autenticação mudou:', user ? 'Usuário logado' : 'Usuário não logado');
      setUser(user);
      setIsPending(false);
    });

    return () => {
      console.log('AuthProvider: Limpando listener...');
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('AuthProvider: Iniciando login com Google...');
      setIsPending(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      console.log('AuthProvider: Login com Google bem-sucedido:', result.user);
      if (credential) {
        console.log('AuthProvider: Credencial Google obtida');
      }
    } catch (error: any) {
      console.error('AuthProvider: Erro no login com Google:', error);
      
      // Tratar erros específicos do Google Auth
      if (error.code === 'auth/operation-not-allowed') {
        alert('Google Auth não está habilitado no console do Firebase. Use o login por email.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('Domínio não autorizado. Adicione este domínio no console do Firebase.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('Usuário fechou o popup do Google');
      } else {
        alert('Erro no login com Google: ' + error.message);
      }
      
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Iniciando login com email...');
      setIsPending(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider: Login bem-sucedido:', result.user);
    } catch (error: any) {
      console.error('AuthProvider: Erro no login:', error);
      
      // Se o usuário não existe, tenta criar
      if (error.code === 'auth/user-not-found') {
        try {
          console.log('AuthProvider: Usuário não encontrado, criando conta...');
          const result = await createUserWithEmailAndPassword(auth, email, password);
          console.log('AuthProvider: Conta criada com sucesso:', result.user);
        } catch (createError: any) {
          console.error('AuthProvider: Erro ao criar conta:', createError);
          throw createError;
        }
      } else {
        throw error;
      }
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Fazendo logout...');
      await signOut(auth);
      console.log('AuthProvider: Logout bem-sucedido');
    } catch (error) {
      console.error('AuthProvider: Erro no logout:', error);
      throw error;
    }
  };

  const exchangeCodeForSessionToken = async () => {
    console.log('AuthProvider: exchangeCodeForSessionToken chamado (mock)');
    return Promise.resolve();
  };

  const getIdToken = async () => {
    if (user) {
      console.log('AuthProvider: Obtendo ID token...');
      const token = await user.getIdToken();
      console.log('AuthProvider: Token obtido');
      return token;
    }
    console.log('AuthProvider: Nenhum usuário logado para obter token');
    return null;
  };

  const value: AuthContextType = {
    user,
    isPending,
    signInWithGoogle,
    signInWithEmail,
    logout,
    exchangeCodeForSessionToken,
    getIdToken,
  };

  console.log('AuthProvider: Renderizando com estado:', { 
    hasUser: !!user, 
    isPending, 
    userEmail: user?.email 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
