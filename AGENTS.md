# AGENTS.md

## Project Context

This is a React + Vite project.

The agent must help with development, refactoring, debugging, documentation, and code review while preserving the existing project structure and conventions.

Redux must be used as the default state-management solution for shared application state. Do not introduce alternative state-management libraries such as Zustand, MobX, Jotai, Recoil, or TanStack Query unless explicitly approved by the user.

## Project Goals

Here’s what the website should include:

- A timer that can be configured by the user
- The timer can be paused and resumed
- References to meditation (images, text, etc.)
- A simple and easy-to-use UI and UX
- A well-organized and easy-to-understand app structure
- Responsive design

## Working Agreement

Before making any code change, explain the proposed modification in detail.

The explanation must include:

- which files will be touched;
- what will be changed in each file;
- why the change is needed;
- possible side effects or risks;
- commands that should be run after the change.

Proceed with the actual modification only after the user has explicitly approved it.

For analysis-only tasks, inspect the codebase and provide findings without changing files.

If the user asks for an implementation directly, still provide a short implementation plan before editing unless the user has already approved the exact change.

## Git Rules

Do not create a new branch unless the user explicitly approves it.

Do not commit changes unless the user explicitly approves the commit.

Do not create, update, push, or merge a pull request unless the user explicitly approves it.

Do not run destructive Git commands unless explicitly approved by the user. This includes, but is not limited to:

- `git reset --hard`
- `git clean`
- `git checkout -- .`
- `git restore .`
- `git rebase`
- `git push --force`
- deleting branches

Before suggesting Git commands, inspect the current Git status when relevant.

Respect the existing branch, file path, and folder naming conventions already used in the project.

## Code Style

Use camelCase for variable names, function names, object properties, hooks, handlers, and local constants.

Use PascalCase for React components.

Use UPPER_SNAKE_CASE only for true constants that are configuration-like or environment-like.

Prefer clear and descriptive names over abbreviations.

Keep functions small and focused.

Avoid deeply nested logic when early returns make the code clearer.

Do not introduce unused variables, unused imports, dead code, or commented-out code.

Before answering any question verify the latest version of the project by scanning all the files involved in the project.

## React Guidelines

Use functional components.

Prefer composition over large monolithic components.

Keep component responsibilities narrow.

Extract reusable logic into custom hooks only when the logic is actually reused or when extraction makes the component significantly clearer.

Do not use `useEffect` for derived state that can be computed during render.

Use `useEffect` only for real side effects such as subscriptions, external synchronization, timers, or imperative browser APIs.

Do not mutate props, state, Redux state, or imported data directly.

When adding forms, handle loading, error, empty, and success states when applicable.

When adding UI interactions, consider keyboard accessibility and semantic HTML.

## Redux Guidelines

Use Redux for shared state that is needed across multiple parts of the app.

Keep local UI-only state inside components when it is not needed globally.

Prefer Redux Toolkit patterns if Redux Toolkit is already installed in the project.

Keep slices focused by domain or feature.

Use clear action and selector names.

Prefer selectors instead of reading nested state directly in many components.

Do not place non-serializable values in Redux state.

Do not introduce Redux for state that is only used by one small component.

## Vite Guidelines

Don't change Vite configuration. Inspect the existing `vite.config.*`, `package.json`, and any `tsconfig.*` or `jsconfig.*` files and ask for changes if needed.

Do not change aliases, build configuration, environment handling, or plugin configuration without explaining the impact.

Use `import.meta.env` for Vite environment variables.

Never expose secrets in frontend code.

Only variables explicitly intended for the client should use the Vite public prefix configured by the project.

## File and Folder Conventions

Follow the existing folder structure before creating new folders.

Before adding a new component, check whether an existing component can be reused or extended.

Before adding a new utility, check whether an existing utility already solves the problem.

Keep feature-specific files close to the feature when the project structure supports it.

Use consistent file naming with the existing project.

Do not reorganize folders unless the user explicitly asks for a structural refactor.

## Styling Guidelines

Respect the styling approach already used in the project, such as CSS, SCSS, CSS Modules, Tailwind, Bootstrap, or another existing approach.

Do not introduce a new styling framework without explicit approval.

Prefer reusable classes or components over duplicated styling.

Avoid inline styles unless they are necessary for dynamic values or already used consistently in the project.

When modifying responsive layout, preserve existing breakpoints and mobile behavior unless the user requests otherwise.

## Dependencies

Do not install, remove, or upgrade dependencies without explicit user approval.

Before proposing a new dependency, explain:

- why it is needed;
- whether the same result can be achieved with existing dependencies;
- bundle-size or maintenance implications;
- whether it is a production or development dependency.

Prefer existing project dependencies over new packages.

## Environment and Secrets

Never read, print, modify, or expose `.env` files unless the user explicitly asks and the configured permissions allow it.

Never include API keys, tokens, passwords, private URLs, or credentials in code examples, logs, commits, documentation, or messages.

Use placeholder values when discussing secrets.

Do not modify `.env`, `.env.local`, `.env.production`, or similar files without explicit approval.

## Testing and Quality Checks

When changing code, identify the relevant checks to run.

Prefer existing project scripts from `package.json`, such as:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run preview`

Do not assume a script exists. Inspect `package.json` first.

After making approved changes, summarize which checks were run and their result.

If checks were not run, explain why.

For bug fixes, include the likely cause of the bug and how the change addresses it.

For UI changes, describe the expected visual or behavioral result.

## Documentation

Update documentation only when behavior, setup, scripts, architecture, or public usage changes.

Do not create excessive documentation for small internal changes.

When adding comments, prefer comments that explain why something is done, not comments that repeat what the code already says.

## Code Review Rules

When reviewing changes, focus on:

- correctness;
- regressions;
- maintainability;
- naming consistency;
- React rendering behavior;
- Redux state design;
- accessibility;
- error/loading/empty states;
- unnecessary dependencies;
- security and secret exposure.

Do not flag purely stylistic issues if they are already handled by linting or formatting tools.

When reporting issues, include:

- file path;
- exact problem;
- why it matters;
- suggested fix.

## Communication Style

Be precise and concrete.

Do not make broad refactors when the user asked for a targeted change.

Do not silently change unrelated files.

When unsure about project conventions, inspect existing files before proposing a solution.

If multiple implementation paths exist, briefly compare them and recommend the safest one.

Always distinguish between:

- analysis;
- proposed changes;
- changes actually made;
- checks run;
- remaining risks.
