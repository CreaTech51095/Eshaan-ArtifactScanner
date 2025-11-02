<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (Initial constitution creation)
Modified principles: N/A (all new)
Added sections: Technology Standards, Development Workflow
Removed sections: N/A
Templates requiring updates:
  ✅ constitution.md - Updated with web app principles and generic project name
  ✅ plan-template.md - Updated agent references to be generic
  ✅ spec-template.md - No changes needed (generic)
  ✅ tasks-template.md - No changes needed (generic)
  ✅ agent-file-template.md - No changes needed (generic)
  ✅ constitution.md command - Updated agent reference to be generic
Follow-up TODOs: None
-->

# Web Application Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)
Every feature MUST follow TDD: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. No production code without corresponding tests. Contract tests for all API endpoints, integration tests for user flows, unit tests for business logic.

### II. API-First Design
All functionality MUST be exposed via well-defined REST APIs before UI implementation. OpenAPI specifications required for all endpoints. API contracts must be versioned and backward-compatible. Frontend and backend teams work independently using API contracts as the interface.

### III. Component-Based Architecture
Frontend MUST use reusable, composable components. Each component must be independently testable and documented. Shared components go in design system, feature-specific components in feature modules. No direct DOM manipulation outside component boundaries.

### IV. Security by Design
Authentication and authorization MUST be implemented from day one, not added later. All user inputs MUST be validated and sanitized. HTTPS required for all communications. Security headers mandatory. Regular dependency updates and vulnerability scanning required.

### V. Performance & Scalability
Page load times MUST be under 2 seconds, API responses under 200ms p95. Database queries MUST be optimized and indexed. Frontend assets MUST be minified and cached. Monitoring and alerting required for performance metrics.

### VI. Documentation & Maintainability
Every API endpoint MUST have documentation. Code MUST be self-documenting with clear naming. README files required for each major component. Architecture decisions MUST be documented in ADR format. Code reviews required for all changes.

## Technology Standards

**Frontend**: React 18+ with TypeScript, Vite build system, Tailwind CSS for styling, React Query for state management, React Testing Library for testing.

**Backend**: Node.js with Express/Fastify, TypeScript, PostgreSQL database, Redis for caching, JWT for authentication, Prisma ORM.

**DevOps**: Docker containers, GitHub Actions for CI/CD, AWS/Vercel for deployment, automated testing in pipeline.

**Quality Gates**: 90%+ test coverage, zero linting errors, all security scans pass, performance budgets met.

## Development Workflow

**Branch Strategy**: Feature branches from main, PR reviews required, automated testing must pass before merge.

**Code Review**: All changes require 2+ approvals, security review for auth/permission changes, performance review for database changes.

**Testing Requirements**: Unit tests for all business logic, integration tests for API endpoints, E2E tests for critical user flows, contract tests for API compatibility.

**Deployment**: Staging environment for testing, production deployments via automated pipeline, rollback capability required, monitoring and alerting active.

## Governance

This constitution supersedes all other development practices. Amendments require team consensus, documentation of rationale, and migration plan for existing code. All team members must verify compliance in code reviews. Use `.specify/templates/` for development guidance and templates.

**Version**: 1.0.0 | **Ratified**: 2024-12-19 | **Last Amended**: 2024-12-19