# Configuração do Firebase para UnimarEvents

## Status Atual

✅ **Migração do Mocha AI concluída com sucesso!**

O projeto foi migrado do Mocha AI para o Firebase. Atualmente, está usando implementações mock para permitir que o projeto compile e funcione. Para usar o Firebase real, siga as instruções abaixo.

## Próximos Passos para Implementar Firebase Real

### 1. Instalar Firebase SDK

```bash
npm install firebase
```

### 2. Configurar Firebase Auth

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto "unimarevents"
3. Vá em "Authentication" > "Sign-in method"
4. Habilite "Google" como provedor de autenticação
5. Configure os domínios autorizados

### 3. Atualizar Configuração do Firebase

Substitua o conteúdo de `src/react-app/firebase/config.ts`:

```typescript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBesCGFzvzKWHWW-RfNvjTwZPlzESb_EqE",
  authDomain: "unimarevents.firebaseapp.com",
  projectId: "unimarevents",
  storageBucket: "unimarevents.firebasestorage.app",
  messagingSenderId: "805955244979",
  appId: "1:805955244979:web:743d43b2db8039579231c6",
  measurementId: "G-7E4BW96FYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
```

### 4. Atualizar Contexto de Autenticação

Substitua o conteúdo de `src/react-app/contexts/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsPending(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsPending(true);
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential) {
        console.log('User signed in:', result.user);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const exchangeCodeForSessionToken = async () => {
    return Promise.resolve();
  };

  const getIdToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    isPending,
    signInWithGoogle,
    logout,
    exchangeCodeForSessionToken,
    getIdToken,
  };

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
```

### 5. Implementar Verificação de Token no Worker

Para implementar a verificação real de tokens Firebase no worker, você precisará:

1. Instalar dependências adicionais:
```bash
npm install jose
```

2. Atualizar o middleware de autenticação em `src/worker/index.ts` para verificar tokens JWT do Firebase

### 6. Configurar Firestore (Opcional)

Se quiser usar Firestore para armazenar dados:

1. No Console do Firebase, vá em "Firestore Database"
2. Crie um banco de dados
3. Configure as regras de segurança
4. Use o `db` exportado do arquivo de configuração

## Funcionalidades Implementadas

✅ Login com Google (mock)
✅ Contexto de autenticação
✅ Hook para requisições autenticadas
✅ Middleware de autenticação no worker
✅ Remoção completa das dependências do Mocha AI
✅ Compilação bem-sucedida

## Como Testar

1. Execute o projeto:
```bash
npm run dev
```

2. Acesse a aplicação e teste o login (atualmente usando dados mock)

3. Para implementar o Firebase real, siga os passos acima

## Notas Importantes

- O projeto está configurado para funcionar com dados mock
- A autenticação real do Firebase requer configuração adicional
- O worker está simplificado para permitir compilação
- Todos os endpoints retornam dados mock por enquanto

## Suporte

Se precisar de ajuda com a implementação do Firebase real, consulte a [documentação oficial do Firebase](https://firebase.google.com/docs).
