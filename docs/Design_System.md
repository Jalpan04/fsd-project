# Tech-Native Design System

## Core Philosophy
The UI should feel like a premium, modern IDE or a developer's dashboard. It uses a "dark mode first" aesthetic with rich, warm undertones (Walnut, Terracotta, Gold) rather than cold grays.

## 1. Color Palette

### Backgrounds
| Semantic Name | Color Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `bg-background` | Smoky Jasper | `#1B1918` | Main page background |
| `bg-card` | Dark Walnut | `#2A2725` | Cards, panels, sidebars |
| `bg-activity` | Deep Walnut | `#242120` | Input fields, active states, code blocks |

### Accents
| Semantic Name | Color Name | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `bg-primary` | Burnt Terracotta | `#A64B2A` | Primary actions, key highlights |
| `text-accent` | Champagne Gold | `#D7C49E` | Icons, special text, focus rings |

### Text / Borders
| Semantic Name | Usage |
| :--- | :--- |
| `text-foreground` | Main content text (Soft Parchment `#E5E0D8`) |
| `text-muted-foreground` | Secondary text, metadata (Dimmed Parchment) |
| `border-border` | Panel borders, dividers (`#3A3632`) |

## 2. Component Patterns

### Cards & Containers
All content blocks must follow this pattern:
```tsx
<div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
  {/* Header (Optional) */}
  <div className="p-4 border-b border-border bg-black/20 flex items-center gap-2">
    <Icon className="text-accent" />
    <h3 className="font-semibold text-foreground">Title</h3>
  </div>
  
  {/* Body */}
  <div className="p-4 sm:p-6">
    {children}
  </div>
</div>
```

### Buttons
**Primary (Action)**:
```tsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
  Action
</button>
```

**Secondary (Ghost/Outline)**:
```tsx
<button className="px-4 py-2 bg-transparent border border-border text-foreground rounded-md hover:bg-secondary/50 transition-colors">
  Cancel
</button>
```
