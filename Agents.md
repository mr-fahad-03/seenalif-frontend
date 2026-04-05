# NPM Skill (Client)

## Purpose
Agent ko batana ke `client` app par npm ke through kaam ka sahi flow kya hai.

## Workflow
1. `npm install` (jab dependencies missing hon).
2. `npm run dev` (local development).
3. Code change ke baad `npm run lint`.
4. Release ya major UI change par `npm run build`.
5. Zarurat par `npm run preview`.

## Available Scripts
- `dev`: Vite dev server
- `build`: production build
- `lint`: eslint check
- `preview`: build preview

## Rules
- Sirf `package.json` mein defined npm scripts chalani hain.
- Default package manager `npm` hi rahega.
