# Food Passport

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime/Package Manager**: Bun
- **Language**: TypeScript
- **Database**: Neon (Postgres)
- **ORM**: Prisma
- **Authentication**: Neon Auth
- **UI**: React, Shadcn UI, Tailwind CSS, Framer Motion

## Expertise

You are an expert in TypeScript, Next.js 16 App Router, React, Shadcn UI, Tailwind CSS, Framer Motion, Prisma, and Neon.

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

- Naming Conventions
  - All components should go in src/components and be named like new-component.tsx
  - Use lowercase with dashes for directories (e.g., components/auth-wizard).
  - Favor named exports for components.

- TypeScript Usage
  - Use TypeScript for all code; prefer interfaces over types.
  - Avoid enums; use maps instead.
  - Use functional components with TypeScript interfaces.

- Syntax and Formatting
  - Use the "function" keyword for pure functions.
  - Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
  - Use declarative JSX.

- UI and Styling
  - Use Shadcn UI, and Tailwind for components and styling.
  - Implement responsive design with Tailwind CSS; use a mobile-first approach.

- Performance Optimization
  - Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
  - Wrap client components in Suspense with fallback.
  - Use dynamic loading for non-critical components.
  - Optimize images: use WebP format, include size data, implement lazy loading.

## Database & Authentication

- Use Prisma as the ORM for all database operations.
- Use Neon Auth for authentication - follow Neon Auth patterns and best practices.
- Database queries should be performed in Server Components or Server Actions.
- Use Prisma's type-safe client for all database interactions.

## Key Conventions

- Use `bun` for all package management and script execution (not npm/yarn/pnpm).
- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
  - Favor server components and Next.js SSR.
  - Use only for Web API access in small components.
  - Avoid for data fetching or state management.
- Follow Next.js docs for Data Fetching, Rendering, and Routing.
  - While creating placeholder images as a part of your seed data, use https://placekitten.com/
  - Place both the /app and /components folders under a /src directory. This organization offers several benefits:
    - It helps maintain a clean and organized project structure.
    - It allows for easier navigation and management of components and pages.
    - It adheres to common industry standards, making it easier for other developers to understand and contribute to the project.
    - It provides a clear separation between application logic (in /src/app) and UI components (in /src/components), improving code readability and reusability.
    - It simplifies the process of creating new pages and components, as you can easily find the corresponding files in the /src directory.
    - It makes the project more modular and easier to scale as the application grows.
    - It adheres to the principle of separation of concerns, where different aspects of the application are handled by different directories.

## Components Organization

Within the /src/components folder, consider organizing components by type or feature:

By Type: Group components like forms, buttons, layout elements, etc.

By Feature: For larger applications, group components related to specific features or domains

For example:

/src/components
├── /ui
│ ├── /button
│ ├── /modal
│ └── /card
├── /forms
│ ├── /text-field
│ └── /select
└── /layout
├── /navbar
└── /footer

- Private Components: For components used only within specific pages, you can create a \_components folder within the relevant /app subdirectory.

- Shared Components: The /src/components folder should contain reusable components used across multiple pages or features.

- Modular Approach: As your project grows, consider adopting a more modular structure, where each feature or domain has its own folder containing components, hooks, and utilities specific to that feature.

## Ask Me Anything

When unclear about requirements or implementation details, ask clarifying questions before proceeding. This includes:

- Business logic and feature requirements
- Data model relationships and constraints
- UI/UX preferences and design decisions
- Authentication and authorization requirements
- Performance requirements and optimization priorities
- Third-party integrations and API design

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for all commands.

Core workflow:

1. `agent-browser open <url>` - Navigate to page
2. `agent-browser snapshot -i` - Get interactive elements with refs (@e1, @e2)
3. `agent-browser click @e1` / `fill @e2 "text"` - Interact using refs
4. Re-snapshot after page changes
