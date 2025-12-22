# Modules
Components && utilities

- `/app/` contains website code
- `/modules/` contains published components & utilities

## Important Rules

### Published NPM Modules (`/modules/*`)
**NEVER add localhost or environment-specific logic to published modules**

Published NPM packages (like `modules/icons/`) are used by external developers who don't have access to local development infrastructure. These modules must:
- Always use production URLs (e.g., `https://modul.es/api/icons/`)
- Never detect or use localhost/development environments
- Work standalone without any local dependencies

### Website Code (`/app/*`)
The website/app code CAN use local APIs during development:
- Use relative paths like `/api/icons/` for local testing
- Switch to production URLs before deploying
- Test changes locally before pushing to production

## Links
- [Icons](https://modul.es/icons)
- [Domains](https://modul.es/domains)
