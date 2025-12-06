# Project Instructions

## App
- Modules is a UI & code component library, similar to https://ui.shadcn.com
- This app is a monorepo, anything inside the `app` is for the site and anything inside `modules` is a published component

## Code
- Use Next.JS best practices when building & Tailwind for styling
- Remove all AI generated slop, including extra comments humans wouldn't add
- Always use our own components within the app when applicable

## Components
- We're starting with an icon component
- More components will be released periodically

## CRITICAL: Icon Component Usage
- **NEVER use local API fallbacks** - The icon component must ONLY use https://icons.modul.es
- **Test exactly like users would** - We dogfood our own product, no special local handling
- **No baseUrl prop needed** - Component should always default to external CDN
- **If CDN fails, component returns null** - No fallbacks, fix the CDN instead