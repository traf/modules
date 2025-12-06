# Modules
UI && code component repository

- `/app/` contains website code
- `/modules/` contains published components & utilities

## Components

### Icons
Customizable icon module

```tsx
import { Icon } from '@modules/icons';

<Icon set="huge" name="home-01" color="slate-400" stroke="2" />
```

Available icon sets: `huge`, `pixelart`
Available props: `set`, `name`, `color` (accepts hex or tailwind color names), `stroke`,  and `className`

