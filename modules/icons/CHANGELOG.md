# Changelog

All notable changes to the Icon module will be documented in this file

## [0.1.4] - 2024-12-08

### Changed
- Simplified CDN to use `modul.es/api/icons/` directly instead of subdomain
- Removed unnecessary rewrite complexity from infrastructure

## [0.1.3] - 2024-12-07

### Fixed
- **Standalone element coloring** - Circle, ellipse, and other standalone SVG elements now properly inherit colors when no explicit `fill` or `stroke` is set
- **Default color handling** - Elements without color attributes now use `fill="currentColor"` for proper inheritance when no color prop is provided
- **Hardcoded color replacement** - All hardcoded hex colors in strokes (e.g., `stroke="#000000"`) are now properly replaced with custom colors across all icon sets

### Changed
- **Removed in-memory caching** - Simplified component by removing unnecessary `svgCache` Map, relying on standard browser HTTP caching instead
- **Removed cache complexity** - Eliminated `cacheKey` and cache checking logic for more predictable behavior

### Technical Details
- Added `normalizeStandaloneElements()` function to ensure standalone SVG elements default to `currentColor`
- Enhanced `applyPhosphorColor()`, `applyHugeColor()`, and `applyLucideColor()` to replace hardcoded hex stroke values
- Added regex patterns to apply fill/stroke to standalone elements: `<(circle|ellipse|rect|polygon|path|line|polyline)>`
- Removed `cache: 'force-cache'` from fetch requests to prevent stale SVG issues
- Browser HTTP caching now handles all SVG caching automatically

## [0.1.1] - 2024-12-07

### Added
- **Lucide icon set support** - Added full support for Lucide icons with stroke-based styling
- **Stroke width customization** - Lucide icons support the `stroke` prop for custom stroke widths
- **API route enhancement** - Added Lucide-specific color and stroke handling in local development API
- **Documentation** - Comprehensive README with guidelines for adding new icon sets

### Changed
- Updated `IconSet` type to include `'lucide'`
- Enhanced SVG processing to handle stroke-based icons without adding unwanted fill attributes
- Updated demo component to showcase Lucide icons

### Technical Details
- Lucide icons use `stroke="currentColor"` and support stroke width customization
- Color application replaces `stroke="currentColor"` with resolved color values
- No fill attributes are added to Lucide icons (preserving their stroke-only design)
- Local API route includes `applyLucideColor()` function for proper color handling

## [0.1.0] - Initial Release

### Added
- Icon component with support for huge, phosphor, and pixelart icon sets
- Color customization with Tailwind color support
- Style variants for phosphor icons (thin, light, bold, fill, duotone)
- Sharp variants for huge icons
- CDN-first architecture with local API fallback
- SVG caching for performance
- TypeScript support with proper type definitions