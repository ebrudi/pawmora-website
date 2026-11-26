# Pawmora — Official website

Pawmora is an independently developed cozy pet-life simulation game in development.

**Official website:** https://pawmora-website.pages.dev/

## Repository structure

- `index.html`: main landing page
- `press.html`: press information
- `assets/`: website assets
- `storybook.js`: storybook interface
- `functions/`: Cloudflare Pages Functions (API and administration)
- `database/`: database-related files
- `_headers`, `_routes.json`: deployment configuration
- `SECURITY.md`: vulnerability reporting policy

## Deployment

The current public site uses Cloudflare Pages. Connect the repository to a Pages project and use the repository root for the static output. Review existing project settings, function bindings and environment variables before deploying. Never commit credentials. Do not enable paid services without explicit approval.

## Local preview

Open `index.html` for a static preview. Server-side functionality requires the corresponding Cloudflare development environment and bindings.

## Project status

The game is in development. Website artwork is promotional and should not be treated as verified gameplay footage. Demo and gameplay links should only be published after testing. Game source code is maintained separately in a private repository.
