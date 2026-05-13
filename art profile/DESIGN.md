---
name: Vivid Dark Mode
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-margin: 32px
  gutter: 24px
---

## Brand & Style

This design system is built for a high-energy creative community where content and creators are the focal point. The brand personality is immersive, sophisticated, and technologically progressive, evoking the atmosphere of a premium digital gallery or a high-end music production studio.

The visual style combines **High-Contrast / Bold** aesthetics with **Glassmorphism**. By layering ultra-saturated accents over a deep, obsidian-like foundation, the UI creates a sense of depth and focus. The experience is designed to feel like a native mobile application even when viewed on the web, utilizing tactile surfaces and smooth transitions to establish a "pro-tool" environment for artists and enthusiasts.

## Colors

The palette is centered on a "Deep Night" philosophy. The primary background is a deep charcoal (#0A0A0B), ensuring that the high-saturation primary accent—**Electric Violet** (#8B5CF6)—pops with maximum luminosity. 

- **Primary:** Electric Violet is used for calls to action, active states, and brand-heavy elements.
- **Secondary:** A vivid Cyan is reserved for success states or secondary interactive highlights.
- **Neutral:** A scale of charcoals and deep greys provides structural hierarchy without breaking the dark-mode immersion.
- **Glass Tint:** Semi-transparent layers use white at 5-10% opacity with heavy background blurs to create the signature glass effect.

## Typography

The typographic system utilizes **Epilogue** for headings to deliver a bold, geometric, and editorial feel. These headers should always be set with tight letter spacing to emphasize their heavy weight. 

**Plus Jakarta Sans** is used for body text and interface labels. Its modern, open counters and friendly curves balance the aggressive nature of the headers, maintaining high legibility even in low-light environments. Hierarchy is established through extreme weight contrast rather than size alone, with labels often utilizing semi-bold weights at smaller scales.

## Layout & Spacing

This design system employs a **Fluid Grid** with generous safe areas to reinforce the "app-like" feel. The layout relies on an 8px rhythmic scale, with significant padding (32px+) used at the container level to provide content with breathing room.

Margins are wide to focus the eye toward the center of the screen, creating a cinematic framing effect for creative assets. Layout transitions should feel spacious; components are never crowded, ensuring that the heavy corner radii have room to define the silhouette of every card and section.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and tonal layering rather than traditional drop shadows. 

1.  **Base Layer:** The deepest charcoal background.
2.  **Surface Layer:** Slightly lighter charcoal (#171719) with a 1px interior border (low-opacity white) to define edges.
3.  **Glass Layer:** Used for floating navigation, modals, and overlays. These surfaces feature a `backdrop-filter: blur(24px)` and a background color of `rgba(255, 255, 255, 0.08)`.
4.  **Interactive Glow:** Primary buttons may use a subtle, color-matched outer glow (0px 4px 20px) using the Electric Violet hex at 30% opacity to simulate light emission.

## Shapes

The shape language is defined by extreme roundedness. All primary containers—including cards, modals, and content wrappers—utilize a corner radius between **24px and 32px**. 

Small interactive elements like buttons, chips, and input fields must be **pill-shaped** (fully rounded ends). This softness contrasts with the heavy, sharp-edged typography, creating a sophisticated tension that feels both high-tech and approachable.

## Components

-   **Buttons:** Fully pill-shaped. Primary buttons use a solid Electric Violet fill with white text. Secondary buttons use a glass effect with a subtle white border.
-   **Cards:** 32px corner radius. Features a subtle 1px border (`rgba(255, 255, 255, 0.1)`) and a very slight gradient fill to simulate a physical surface.
-   **Chips:** Small, pill-shaped tags used for categories or metadata. Use semi-transparent backgrounds to blend into the glass aesthetic.
-   **Input Fields:** Pill-shaped with a dark, recessed background. On focus, the border glows with the primary violet color.
-   **Navigation:** Floating glass bars with high backdrop blur and centered pill-shaped active indicators.
-   **Music/Media Players:** Incorporate waveform visualizations using the primary and secondary neon colors, housed within large-radius glass containers.