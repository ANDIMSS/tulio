# BarberHub — SaaS Multi-Tenant para Barbearias

BarberHub é uma plataforma SaaS multi-tenant moderna e robusta para barbearias, desenvolvida com React 19, TypeScript, Vite, Tailwind CSS e Firebase.

---

## 🚀 Arquitetura e Tecnologias

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **Autenticação**: Firebase Authentication (Google Auth com vinculação de perfil)
- **Banco de Dados**: Cloud Firestore (Modelagem Multi-Tenant Zero-Trust)
- **Armazenamento**: Firebase Storage (Segregação pública/privada de assets)
- **Segurança da Aplicação**: Firebase App Check (reCAPTCHA Enterprise)
- **Nível de Custo**: **100% Compatível com Firebase Spark (Plano Gratuito)**
  - *Sem Cloud Functions*
  - *Sem Cloud Run*
  - *Sem plano Blaze obrigatório*
  - *Sem APIs ou gateways de terceiros pagos*

---

## 🔒 Hardening de Segurança Concluído (P0.1 a P0.9)

1. **P0.1 — RBAC & Super Admin**: Separação estrita entre `platformRole: "super_admin"` global e administradores locais do tenant (`isAdmin: true`).
2. **P0.2 — Firebase App Check**: Proteção com reCAPTCHA Enterprise para atestar integridade do cliente.
3. **P0.3 — Hardening de Agendamento Público**: Validação de allowlist rígida para novos agendamentos e status inicial seguro (`Pendente`).
4. **P0.4 — Proteção Atômica de `occupied_slots`**: Bloqueio determinístico de slots (`date_time_barber`) para prevenção definitiva de duplo agendamento.
5. **P0.5 — RBAC Granular por Módulo**: 15 permissões específicas (`appointments.*`, `finance.*`, `crm.*`, `settings.*`, `landing.*`, etc.).
6. **P0.6 — Hardening do Firebase Storage**: Controle de caminhos (`/public/` vs `/private/`), limites de tamanho (5MB para imagens, 10MB para relatórios) e validação de tipos MIME.
7. **P0.7 — Trilha de Auditoria Imutável**: Coleções append-only (`tenant_audit_logs` e `platform_audit_logs`) com bloqueio total de `update` e `delete`.
8. **P0.8 — Sincronização e Atomicidade**: Uso de `writeBatch` e `runTransaction` para sincronização consistente entre painel de gestão e landing page.
9. **P0.9 — Auditoria Final de Segurança**: Validação de zero-trust multi-tenant, bloqueio de escalada de privilégio e proteção contra manipulação de datas e licenças.

---

## 🛡️ Robustez Operacional (P1)

- **Centralized Error Handler (`src/lib/errorHandler.ts`)**: Categorização automática de falhas (rede, permissões, concorrência, timeouts) com mensagens amigáveis em português e sem vazamento de dados internos.
- **React Error Boundary (`src/components/ErrorBoundary.tsx`)**: Recuperação graciosa de componentes sem desconectar a sessão do usuário.
- **Detector de Conexão (`src/components/NetworkStatusIndicator.tsx`)**: Alertas transparentes de offline/online em tempo real.
- **Atomicidade Transacional**: Agendamentos e configurações gravados com consistência atômica via Firestore Transactions e Batches.
- **Limpeza de Recursos**: Todos os listeners `onSnapshot` possuem encerramento automático em desmontagens e trocas de tenant.

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação de Dependências
```bash
npm install
```

### Execução em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor será iniciado em `http://localhost:3000`.

### Verificação de Tipos e Build de Produção
```bash
npm run lint    # Executa tsc --noEmit
npm run build   # Compila o bundle para produção em /dist
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` baseado no exemplo abaixo:

```env
# Configurações Públicas do Firebase Web SDK
VITE_FIREBASE_API_KEY=sua_api_key_publica
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Firebase App Check (reCAPTCHA Enterprise)
VITE_RECAPTCHA_SITE_KEY=sua_recaptcha_enterprise_site_key
```

> **Nota de Segurança**: Nenhuma chave privada, credencial de Service Account ou segredo administrativo deve ser colocado em variáveis `VITE_*` no frontend.
