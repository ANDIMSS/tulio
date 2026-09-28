# Especificação de Segurança, Autenticação, Autorização e Isolamento Multi-Tenant (P0)

## 1. Matriz de Acesso e Personas

### Persona 1: MASTER (Super Admin / Conecta DEV)
- **Identificação**:
  - `isSuperAdmin()` via e-mail verificado em token (`conecdevce@gmail.com`, `conectdevce@gmail.com`) ou credencial autenticada no backend/regras.
- **Privilégios Globais**:
  - Acesso TOTAL e IRRESTRITO a todos os tenants, coleções, subcoleções e arquivos de Storage.
  - **Invariante Crítica**: O Master NUNCA é bloqueado por:
    - `tenant.status` (`pending`, `suspended`, `expired`, etc.)
    - `tenant.accessMode` (`landing_only`, `blocked`, `full`)
    - Licença comercial vencida ou pendente.
    - `masterMaintenanceEnabled` do tenant.
  - **Capacidades Operacionais**:
    - Listar, criar, atualizar, ativar, suspender e deletar tenants.
    - Operar em modo `system_maintenance` em qualquer empresa (leitura/gravação irrestrita de agendamentos, CRM, financeiro, configurações).
    - Operar em modo `landing_preview` em qualquer empresa (renderização da landing page pública isolada com cabeçalho de encerramento de preview).
    - Operar em modo `landing_editor` (edição dos dados de apresentação da landing page do tenant).
    - Criar, aprovar, vincular, desvincular e transferir usuários entre empresas de forma atômica e explícita.

### Persona 2: USUÁRIO COMUM (Proprietário, Gerente, Barbeiro)
- **Identificação**:
  - Usuário autenticado (`request.auth.uid != null`).
  - Possui documento de perfil em `users/{uid}`.
- **Requisitos Cumulativos para Acesso ao Sistema Interno (Dashboard/CRM/Agenda)**:
  1. `users/{uid}.isApproved == true`
  2. `users/{uid}.tenantId == tenantId`
  3. Associação ativa em `tenants/{tenantId}/members/{uid}` com `active == true`
  4. `tenants/{tenantId}.status == 'active'`
  5. `tenants/{tenantId}.accessMode == 'full'`
  6. Licença não expirada (`tenant.licenseStatus != 'suspended'` e `licenseExpiresAt >= now` ou `lifetime`)
- **Restrições Rígidas (Zero-Trust)**:
  - Usuário comum NUNCA pode ler ou escrever dados de outro tenant (`tenants/{otherTenantId}/...`).
  - Usuário comum NUNCA pode alterar seus próprios privilégios (`isAdmin`, `isApproved`, `tenantId`, `license*`).
  - Usuário de tenant com `accessMode == 'landing_only'` é direcionado para a tela informativa `LandingOnlyScreen` e tem leitura bloqueada a agendamentos, CRM e financeiro.
  - Usuário desativado/removido pelo Master tem acesso revogado de forma instantânea e atômica.

### Persona 3: PÚBLICO / ANÔNIMO (Clientes da Landing Page)
- **Identificação**:
  - Visitante não autenticado ou autenticado como cliente final.
- **Acessos Permitidos**:
  - Leitura pública dos metadados da empresa:
    - `publicTenants/{tenantId}`
    - `domainMappings/{domain}`
    - `tenants/{tenantId}/settings/landing`, `business`, `timeSlots`
    - `tenants/{tenantId}/services/*`
    - `tenants/{tenantId}/barbers/*`
    - `tenants/{tenantId}/testimonials/*`
    - `tenants/{tenantId}/differentials/*`
    - Arquivos de Storage em `/tenants/{tenantId}/*` (logos, fotos de serviços e barbeiros)
  - Criação de novo agendamento com validação estrita dos campos obrigatórios:
    - `client` (string não-vazia)
    - `phone` (string não-vazia)
    - `date`, `time`, `service`
- **Acessos Proibidos**:
  - Leitura de agendamentos de outros clientes.
  - Leitura de leads e métricas de CRM.
  - Leitura de notificações e configurações privadas do sistema.

---

## 2. Invariantes de Dados e Ciclos de Vida Operacionais

### 2.1 Remoção e Revogação de Membro (Anti-Zumbi)
- **Problema Anterior**:
  - Remover documento de membro em `tenants/{tenantId}/members/{uid}` sem atualizar `users/{uid}` permitia que o usuário fizesse login e `resolveTenantForUser` recriasse seu membership automaticamente.
- **Nova Regra de Negócio (Atômica)**:
  1. O Master ou Admin do tenant invoca `removeUserFromTenant(tenantId, uid)`.
  2. Em um `writeBatch`:
     - O documento `tenants/{tenantId}/members/{uid}` é desativado (`active: false, removedAt: now`).
     - O documento `users/{uid}` é desvinculado (`tenantId: '', isApproved: false`).
     - Se o usuário era o `ownerUid` do tenant, o campo `ownerUid` é limpo.
  3. Ao fazer login, `resolveTenantForUser`:
     - Verifica se o membership do usuário está ativo em `tenants/{tenantId}/members/{uid}`.
     - Se o documento não existir ou `active != true`, a função **NÃO recria** o membership e retorna `null`. O usuário é direcionado para a tela `pending` / `blocked`.

### 2.2 Transferência Explícita de Usuário
- **Problema Anterior**:
  - Vincular um usuário existente a outro tenant podia sobrescrever silenciosamente seu vínculo anterior sem limpar permissões ou desativar o registro na empresa antiga.
- **Nova Regra de Negócio (Atômica)**:
  1. Descobrir tenant anterior em `users/{uid}.tenantId`.
  2. Se `oldTenantId != newTenantId`:
     - Desativar associação anterior (`tenants/{oldTenantId}/members/{uid}.active = false`).
     - Se era proprietário do tenant antigo, desvincular `oldTenant.ownerUid`.
  3. Atualizar `users/{uid}.tenantId = newTenantId` e `isApproved = true`.
  4. Criar ou ativar o membership no novo tenant (`tenants/{newTenantId}/members/{uid}.active = true`).
  5. Se o cargo for `owner`, atualizar `newTenant.ownerUid = uid`.
  6. Tudo executado em um único `writeBatch`.

### 2.3 Prevenção de Troca Silenciosa de Tenant por Mesmo E-mail
- **Problema Anterior**:
  - Se o Master cadastrasse uma nova empresa com o mesmo e-mail de um usuário existente, o sistema vinculava o usuário à nova empresa sem confirmação.
- **Nova Regra de Negócio**:
  - Em `createCompanyByMaster`:
    - Se o `ownerEmail` já pertencer a um usuário com `tenantId` ativo, a criação **NÃO transfere** o usuário silenciosamente.
    - É lançado um erro explícito:
      `"O e-mail [email] já está vinculado à empresa [Nome]. Faça uma transferência de tenant antes de vinculá-lo a uma nova empresa."`

---

## 3. Matriz de Teste "Dirty Dozen" (Payload-First TDD)

| # | Operação / Payload | Ator | Condição | Resultado Esperado |
|---|-------------------|------|----------|-------------------|
| 1 | `get(/tenants/tenantA/appointments/app1)` | Usuário do `tenantB` | Acessando tenant de terceiro | **REJEITADO (403)** |
| 2 | `get(/tenants/tenantA/appointments/app1)` | Master (`conecdevce@gmail.com`) | Tenant `status=suspended`, `accessMode=landing_only` | **PERMITIDO (200)** |
| 3 | `update(/users/uid1)` alterando `isApproved: true`, `tenantId: 'tenantB'` | Próprio usuário comum | Tentativa de auto-promoção | **REJEITADO (403)** |
| 4 | `create(/tenants/tenantA/appointments/appNew)` com `client: 'Carlos', phone: '88999999999', date: '2026-03-25', time: '10:00', service: 'Corte'` | Visitante anônimo | Tenant ativo com landing page pública | **PERMITIDO (200)** |
| 5 | `create(/tenants/tenantA/appointments/appNew)` com payload vazio `{}` | Visitante anônimo | Campos obrigatórios ausentes | **REJEITADO (403)** |
| 6 | `get(/tenants/tenantA/crm_leads)` | Visitante anônimo ou usuário comum com `accessMode=landing_only` | Dados de CRM confidenciais | **REJEITADO (403)** |
| 7 | `get(/tenants/tenantA/services)` | Visitante anônimo | Catálogo público da landing page | **PERMITIDO (200)** |
| 8 | `update(/tenants/tenantA/members/uidX)` alterando `role: 'owner'` | Usuário comum com role `'barber'` | Tentativa de elevação de privilégio | **REJEITADO (403)** |
| 9 | `write(/storage/tenants/tenantA/logo.png)` | Usuário ativo do `tenantB` | Tentativa de sobrescrever logo de outra empresa | **REJEITADO (403)** |
| 10 | `write(/storage/tenants/tenantA/logo.png)` | Master | Manutenção global de arquivos | **PERMITIDO (200)** |
| 11 | `update(/tenants/tenantA)` alterando `accessMode: 'full'` ou `licenseExpiresAt` | Proprietário comum do tenant | Tentativa de estender licença sem autorização do Master | **REJEITADO (403)** |
| 12 | `login` após remoção de membro pelo Master | Usuário removido | Membership com `active: false` | **BLOQUEADO (Não recria membro)** |
