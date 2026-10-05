# QualityOps AI Frontend

Frontend for **QualityOps AI**, a quality management platform focused on complaints, investigations, corrective actions and AI-assisted analysis.

Built with **React, Vite and TypeScript**, the interface connects to the QualityOps AI backend and provides a complete workflow for quality teams.

## Features

- Authentication with JWT via HttpOnly cookies
- CSRF protection
- Role-based interface
- Dashboard
- Customer management
- Product management
- Lot management
- Complaint management
- Complaint workspace
- Evidence management
- Human-led investigations
- Corrective action tracking
- AI-assisted investigation analysis
- AI suggestions with human review
- Semantic similar-case search
- AI execution audit
- Session restoration after page refresh

## AI Integration

The frontend integrates with the QualityOps AI agent to provide:

- Investigation hypotheses
- Missing information detection
- Suggested next steps
- AI-generated suggestions
- Similar complaint discovery

AI outputs are presented as assistance only.

The AI cannot independently:

- confirm root cause;
- close investigations;
- close complaints;
- change business status;
- make final quality decisions.

Final decisions remain under human control.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- React Query
- React Hook Form
- Zod
- Material UI

## Security

The frontend follows the security model implemented by the backend:

- JWT stored only in HttpOnly cookies
- No JWT storage in localStorage or sessionStorage
- CSRF protection for mutating requests
- Role-based UI
- Backend remains responsible for authorization
- No secrets or credentials stored in frontend code

## User Roles

- `ADMIN`
- `QUALITY_ANALYST`
- `USER`

Administrative features such as user management and AI audit are restricted according to backend permissions.
