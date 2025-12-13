# icons.Module();

A simple, modular icon component supporting multiple sets with consistent props & styling.


## Supported sets

`huge` `phosphor` `lucide` `pixelart`

## Usage

```tsx
import { Icon } from '@modul-es/icons';

// Basic usage
<Icon set="huge" name="home-01" />

// Colors (Tailwind/hex)
<Icon set="lucide" name="sun" color="yellow-400" />
<Icon set="lucide" name="moon" color="#1e293b" />

// Size variants (xs, sm, md, lg, xl)
<Icon set="phosphor" name="spade" size="xs" />
<Icon set="phosphor" name="spade" size="sm" />
<Icon set="phosphor" name="spade" size="md" />
<Icon set="phosphor" name="spade" size="lg" />
<Icon set="phosphor" name="spade" size="xl" />

// Phosphor style variants
<Icon set="phosphor" name="heart" style="thin" />
<Icon set="phosphor" name="heart" style="light" />
<Icon set="phosphor" name="heart" style="bold" />
<Icon set="phosphor" name="heart" style="fill" color="red-500" />
<Icon set="phosphor" name="heart" style="duotone" color="purple-500" />

// Stroke width (for stroke-based icons)
<Icon set="lucide" name="circle" stroke="1" />
<Icon set="lucide" name="circle" stroke="1.5" /> (default)
<Icon set="lucide" name="circle" stroke="2" />
<Icon set="lucide" name="circle" stroke="2.5" />

// ClassName for custom styling
<Icon set="pixelart" name="command" className="rotate-45 opacity-50" />
```

## Site

Search & copy icon names, SVGs, and components → [modul.es/icons](https://modul.es/icons).