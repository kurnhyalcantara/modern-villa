# Strict Implementation Rules

## General Rules

- Use TypeScript strict mode
- Never use any type
- Never use mock data unless explicitly requested
- Avoid duplicated business logic
- Use reusable components
- Keep components small and modular

## Architecture Rules

- Separate repository and service layers
- Business logic must not exist inside components
- Database access only through repositories
- Server Actions only for mutations

## Validation Rules

- Validate everything with Zod
- Never trust frontend validation alone

## Styling Rules

- No inline styles
- Use Tailwind utilities
- Use shared design system

## API Rules

- Use typed responses
- Use centralized error handling
- Use proper HTTP status codes

## Database Rules

- Use transactions for critical operations
- Prevent race conditions
- Use indexes where needed

## Security Rules

- Never expose secrets
- Never trust client input
- Always sanitize uploaded files

## Performance Rules

- Avoid unnecessary re-renders
- Use pagination
- Optimize images

## Code Quality Rules

- Follow ESLint rules
- Follow Prettier formatting
- Use meaningful naming
- Keep functions focused
