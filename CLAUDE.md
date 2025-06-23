# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EphemNotes is a Next.js 15.3.4 application using the App Router architecture with TypeScript and Tailwind CSS v4. The application uses Supabase for backend services including authentication and database functionality.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Format code with Prettier
npx prettier --write .

# Check formatting
npx prettier --check .

# Run unit/integration tests
npm test

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI**: React 19.0.0
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Supabase Client**: @supabase/ssr for Next.js integration
- **Code Formatting**: Prettier

### Testing Stack

- **Unit/Integration Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright
- **API Mocking**: MSW (Mock Service Worker)
- **Testing Utilities**: @testing-library/user-event, @testing-library/jest-dom

### Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/lib/` - Shared utilities and configurations
  - `supabase.ts` - Supabase client configuration
- `src/test/` - Test setup and utilities
  - `setup.ts` - Vitest setup with jest-dom and Next.js mocks
- `tests/` - E2E test files (Playwright)
- `public/` - Static assets
- `@/*` - Path alias for `src/*` directory
- `.env.local` - Environment variables (Supabase credentials)
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration

### Key Conventions

- Use App Router patterns (layout.tsx, page.tsx)
- TypeScript strict mode is enabled
- Tailwind CSS for styling with mobile-first approach
- CSS custom properties for theming (--background, --foreground)
- Geist font family (Sans and Mono variants)
- Prettier for consistent code formatting (no semicolons, single quotes)
- Environment variables prefixed with `NEXT_PUBLIC_` for client-side access

## Development Notes

- Development server runs on http://localhost:3000
- Turbopack is used for faster development builds
- ESLint is configured with Next.js recommended rules
- Supabase environment variables required in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing Guidelines

### Unit/Integration Tests
- Place component tests next to the component files (e.g., `Button.test.tsx` next to `Button.tsx`)
- Use Vitest for unit and integration testing
- Tests run in jsdom environment with React Testing Library
- Global test utilities available via `src/test/setup.ts`

### E2E Tests
- Place E2E tests in the `tests/` directory
- Playwright runs tests against the development server (http://localhost:3000)
- Tests run in Chromium, Firefox, and WebKit by default

### Running Tests
- Before running tests, ensure the development server is not running (for E2E tests)
- Run `npm test` for unit/integration tests in watch mode
- Run `npm run test:e2e` for E2E tests
- Use the UI versions (`test:ui`, `test:e2e:ui`) for interactive debugging
