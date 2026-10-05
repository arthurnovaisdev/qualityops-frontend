# QualityOps AI — frontend

Frontend React/Vite/TypeScript integrado aos contratos do backend em `C:\Projects\qualityops`.

## Desenvolvimento

```bash
npm install
npm run dev
```

O Vite encaminha `/api` para `http://localhost:8080` por padrão. Para outra porta local, defina `VITE_API_PROXY_TARGET` ao iniciar o servidor. Em produção, sirva frontend e `/api` na mesma origem via proxy reverso para que os cookies funcionem corretamente.

## Segurança e sessão

- O backend define `access_token` como cookie HttpOnly. O frontend não lê nem persiste o JWT.
- Antes de cada requisição mutável, o cliente chama `GET /api/auth/csrf`. O Axios lê o cookie `XSRF-TOKEN` e envia `X-XSRF-TOKEN`, conforme `csrf.spa()` no backend.
- A identidade do usuário fica apenas em memória e é restaurada por `GET /api/auth/me` enquanto o cookie HttpOnly for válido.
- A interface limita opções por perfil para usabilidade; o backend continua responsável por toda autorização.

## Limitações dos contratos atuais

- Histórico do caso: não há endpoint de eventos. A tela mostra apenas datas e estado atual da reclamação.
- Evidências: o backend aceita `fileUrl` como texto, sem endpoint de upload.
- Auditoria da IA usa `GET /api/admin/agent-executions` e permanece restrita a `ADMIN`.
- Casos semelhantes usam `GET /api/complaints/{complaintId}/similar` para `ADMIN` e `QUALITY_ANALYST`.
- A resposta da análise da IA não possui endpoint de consulta posterior; fica visível apenas na sessão atual da página.
