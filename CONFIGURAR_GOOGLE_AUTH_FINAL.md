# 🔧 Configurar Google Auth no Firebase

## 🎯 **Objetivo:**
Reativar o login com Google que agora está implementado no código.

## ✅ **Status Atual:**
- [x] **Código implementado** - Login com Google funcionando
- [x] **Interface atualizada** - Botões com ícone do Google
- [x] **Tratamento de erros** - Mensagens específicas para cada erro
- [ ] **Google Auth habilitado** - Precisa ser configurado no console

## 🚀 **Passo a Passo para Habilitar:**

### 1. **Acesse o Console do Firebase**
- Vá para: https://console.firebase.google.com/
- Selecione o projeto **"unimarevents"**

### 2. **Configure Authentication**
- Clique em **"Authentication"** no menu lateral
- Vá para a aba **"Sign-in method"**
- Clique em **"Google"**
- Clique em **"Enable"**
- Configure o **"Project support email"** (seu email)
- Clique em **"Save"**

### 3. **Configure Domínios Autorizados**
- Na mesma página, vá para **"Authorized domains"**
- Adicione os domínios:
  - `localhost` (para desenvolvimento)
  - Seu domínio de produção (quando tiver)

### 4. **Teste o Login**
- Execute o projeto: `npm run dev`
- Clique em **"Entrar com Google"** no header
- Ou clique em **"Acesso Empresarial"** na página inicial
- Selecione **"Entrar com Google"**

## 🔍 **Possíveis Erros e Soluções:**

### ❌ **"Google Auth não está habilitado"**
- **Solução**: Siga o passo 2 acima
- **Status**: Google não foi habilitado no console

### ❌ **"Domínio não autorizado"**
- **Solução**: Siga o passo 3 acima
- **Status**: Domínio não está na lista de autorizados

### ❌ **"Popup fechado pelo usuário"**
- **Solução**: Tente novamente
- **Status**: Usuário fechou o popup do Google

### ❌ **Outros erros**
- **Solução**: Verifique o console do navegador (F12)
- **Status**: Erro específico do Firebase

## 📱 **Onde Testar:**

### **Header (Desktop e Mobile)**
- Botão **"Entrar com Google"** no canto superior direito
- Ícone do Google + texto

### **Página Inicial**
- Clique em **"Acesso Empresarial"** ou **"Começar Agora"**
- Modal com botão **"Entrar com Google"**
- Separador **"ou"** para escolher entre Google e Email

## 🎉 **Resultado Esperado:**

Após configurar no console do Firebase:
1. **Clique em "Entrar com Google"**
2. **Popup do Google abre**
3. **Selecione sua conta Google**
4. **Login bem-sucedido**
5. **Redirecionamento para o sistema**

## 🆘 **Se Não Funcionar:**

1. **Verifique o console do navegador** (F12)
2. **Confirme que o Google está habilitado** no console do Firebase
3. **Verifique os domínios autorizados**
4. **Teste em modo incógnito** (para evitar cache)

## 📋 **Checklist Final:**

- [ ] Google Auth habilitado no console
- [ ] Domínios autorizados configurados
- [ ] Projeto rodando (`npm run dev`)
- [ ] Teste de login com Google
- [ ] Login bem-sucedido

---

**🎊 Após seguir estes passos, o login com Google estará funcionando perfeitamente!** 🎊
