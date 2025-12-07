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

## Adding New Icon Sets
<!-- - **Read the documentation first** - Check `modules/icons/README.md` for the complete process
- **Follow the systematic approach** - The README contains step-by-step instructions for adding new icon sets
- **Update all required files** - Component, API route, demo, and types must all be updated
- **Test with existing props** - Ensure new sets work with `color`, `stroke`, and `style` props where applicable
- **Document changes** - Update `modules/icons/CHANGELOG.md` with technical details
 -->

## Adding New Icon Sets

When adding a new icon set, follow these steps to ensure compatibility:

### 1. Add Icons to Public Directory

Place SVG files in `/public/icons/{set-name}/` directory structure.

### 2. Update TypeScript Types

Add the new set to the `IconSet` type in `src/Icon.tsx`:

```tsx
export type IconSet = 'huge' | 'pixelart' | 'phosphor' | 'lucide' | 'new-set';
```

### 3. Update Icon Component Logic

In `src/Icon.tsx`, update the SVG processing logic:

```tsx
// Add set-specific fill handling if needed
if (set !== 'phosphor' && set !== 'lucide' && set !== 'new-set' && !newAttrs.includes('fill=')) {
    newAttrs += ` fill="currentColor"`;
}
```

### 4. Update API Route for Local Development

In `/app/api/icons/[...path]/route.ts`, add support for the new icon set:

#### Add Color Handling Function

```tsx
function applyNewSetColor(svg: string, resolvedColor: string): string {
  // Analyze your icon set's structure:
  // - Does it use stroke="currentColor"? (like Lucide)
  // - Does it use fill attributes? (like Pixelart)
  // - Does it have special variants? (like Phosphor duotone)
  
  if (/stroke="currentColor"/.test(svg)) {
    return svg.replace(/stroke="currentColor"/g, `stroke="${resolvedColor}"`);
  }
  
  if (/fill="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/fill="(?!none)[^"]*"/g, `fill="${resolvedColor}"`);
  }
  
  return applyGenericColor(svg, resolvedColor);
}
```

#### Add to Color Switch Statement

```tsx
switch (iconSet) {
  case 'phosphor':
    return applyPhosphorColor(svg, resolvedColor)
  case 'huge':
    return applyHugeColor(svg, resolvedColor)
  case 'pixelart':
    return applyPixelartColor(svg, resolvedColor)
  case 'lucide':
    return applyLucideColor(svg, resolvedColor)
  case 'new-set':
    return applyNewSetColor(svg, resolvedColor)
  default:
    return applyGenericColor(svg, resolvedColor)
}
```

#### Add Stroke Width Handling

```tsx
switch (iconSet) {
  case 'phosphor':
    // Phosphor has designed weights - don't modify stroke-width
    return svg
  case 'huge':
  case 'pixelart':
  case 'lucide':
  case 'new-set': // Add here if stroke width should be customizable
    if (/stroke="(?!none)[^"]*"/.test(svg)) {
      return svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
    }
    return svg
  default:
    return svg
}
```

### 5. Update Demo Component

Add the new icon set to the demo in `/app/components/SectionIcons.tsx`:

```tsx
const iconSets = {
  huge: ['home-01', 'analytics-01', /* ... */],
  phosphor: ['house', 'chart-bar', /* ... */],
  pixelart: ['home', 'chart', /* ... */],
  lucide: ['home', 'activity', /* ... */],
  'new-set': ['icon1', 'icon2', /* ... */] // Add sample icons
};
```

Update the TypeScript type:
```tsx
set={selectedSet as 'huge' | 'pixelart' | 'phosphor' | 'lucide' | 'new-set'}
```

### 6. Build and Test

```bash
npm run build
```

Test the icons in the demo and verify:
- Icons load correctly from CDN
- Color prop works as expected
- Stroke prop works (if applicable)
- Style variants work (if applicable)
- Local API route handles the new set

### 7. Deploy Icons to CDN

Ensure the new icon set is deployed to `https://icons.modul.es/{set-name}/` before testing.

## Icon Set Characteristics

### Stroke-based Icons (Lucide, some Huge)
- Use `stroke="currentColor"`
- Support `stroke` prop for width customization
- Usually have `fill="none"`

### Fill-based Icons (Pixelart, some Huge)
- Use `fill` attributes for coloring
- Don't typically support stroke customization

### Multi-variant Icons (Phosphor)
- Have multiple style variants (thin, bold, fill, etc.)
- Use `style` prop to select variant
- May have complex coloring rules (duotone)

## Best Practices

1. **Analyze the Icon Structure**: Before adding support, examine a few SVG files to understand how they're structured
2. **Test Color Application**: Ensure colors apply correctly to the intended elements
3. **Preserve Icon Design**: Don't modify stroke-width for sets with designed weights (like Phosphor)
4. **Consistent Naming**: Use kebab-case for icon names
5. **Error Handling**: Icons gracefully return null if they fail to load
6. **Performance**: Icons are cached and use the external CDN by default

## Architecture

- **Component**: `src/Icon.tsx` - Main React component
- **Types**: TypeScript interfaces for props and sets
- **CDN**: Primary source at `https://icons.modul.es/`
- **Local API**: Development fallback at `/api/icons/[...path]`
- **Cache**: SVG content is cached in memory for performance