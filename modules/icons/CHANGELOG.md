# Changelog

All notable changes to the Icon module will be documented in this file.

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