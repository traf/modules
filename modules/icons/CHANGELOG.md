# Changelog

All notable changes to the Icon module will be documented in this file

## [0.2.7] - 2026-02-08

### Fixed
- Check SVG cache synchronously during render instead of in useEffect to eliminate flash on cached icons

## [0.2.6] - 2026-02-06

### Fixed
- Added in-memory SVG cache and failed URL tracking to prevent redundant fetches and reduce request volume that triggers CDN protection

## [0.2.5] - 2026-02-03

### Fixed
- Bug fixes and improvements

## [0.2.4] - 2025-01-14

### Fixed
- Fixed icon wrapper adding extra vertical spacing in parent elements by simplifying container styles

## [0.2.3] - 2025-01-12

### Fixed
- Fixed layout shift (CLS) by reserving space with wrapper dimensions before SVG loads

## [0.2.2] - 2025-01-09

### Fixed
- Fixed jagged/aliased icon rendering in Firefox by only applying `shape-rendering="crispEdges"` to pixelart icons instead of all icon sets

## [0.2.1] - 2025-12-13

### Fixed
- Fixed hardcoded colors in SVG files not being replaced with currentColor or custom colors globally across all icon sets

## [0.2.0] - 2025-12-13

### Changed
- Updated README with improved examples and documentation
- Added MIT license to package.json

### Fixed
- Resolved npm installation issues from 0.1.9 tarball

## [0.1.9] - 2024-12-09

### Fixed
- Fixed `className` being rendered as lowercase `classname` in HTML - now properly uses `class` in HTML string which browsers handle correctly

## [0.1.8] - 2024-12-09

### Fixed
- Fixed `class` attribute not being converted to `className` in rendered SVG, causing React warnings and styling issues

## [0.1.7] - 2024-12-09

### Added
- Size presets: `xs` (16px), `sm` (20px), `md` (24px), `lg` (32px), `xl` (40px)

### Changed
- className now applies to SVG element instead of wrapper div for proper Tailwind support
- Height set to auto to maintain aspect ratio when width is overridden
- Default size changed to `md` (24px)
- Removed unnecessary inline-block and imageRendering styles from wrapper

## [0.1.6] - 2024-12-08

### Changed
- Removed localhost detection to always use fast CDN for better performance

## [0.1.5] - 2024-12-08

### Added
- Localhost support for local development (auto-detects localhost/127.0.0.1)

### Changed
- Removed console error logs for cleaner output

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