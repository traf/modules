# Icons Module

A simple icon system supporting multiple icon sets with consistent props and styling.

## Icon Sets

- **huge**
- **phosphor**
- **lucide**
- **pixelart**

## Basic Usage

```tsx
import { Icon } from '@modul-es/icons';

// Basic usage
<Icon set="huge" name="home-01" color="slate-400" stroke="2" />

// Phosphor with weight variants
<Icon set="phosphor" name="heart" style="thin" color="white" />
<Icon set="phosphor" name="heart" style="bold" color="white" />
<Icon set="phosphor" name="heart" style="fill" color="ef4444" />
<Icon set="phosphor" name="heart" style="duotone" color="fbbf24" />

// Lucide with color variants
<Icon set="lucide" name="heart" color="red-500" />
<Icon set="lucide" name="zap" color="yellow-400" />
```

## Props
- **set**
- **color** (accepts hex & tailwind color names)
- **stroke**
- **style** (does not apply to all sets)