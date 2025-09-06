# UnimarEvents

Sistema de Agendamento de Eventos da UNIMAR

## 🚀 Funcionalidades

- **Autenticação**: Login com Google e Email
- **Agendamento**: Sistema completo de solicitação de eventos
- **Administração**: Painel para aprovação/rejeição de eventos
- **Eventos Públicos**: Visualização de eventos aprovados
- **Verificação de Disponibilidade**: Prevenção de conflitos de horário

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend**: Cloudflare Workers + Hono
- **Banco de Dados**: Firebase Firestore
- **Autenticação**: Firebase Auth
- **Estilização**: Tailwind CSS

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🎯 Como Usar

1. **Login**: Use Google Auth ou Email/Senha
2. **Solicitar Evento**: Acesse a página de agendamento
3. **Visualizar**: Veja seus agendamentos em "Meus Agendamentos"
4. **Administração**: Login admin para aprovar/rejeitar eventos

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run check` - Verificação de tipos e build 
