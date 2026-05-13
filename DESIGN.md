---
name: LIZI Design System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c9c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474646'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
---

## Brand & Style
The brand personality is immersive, sophisticated, and community-driven, designed to mirror the "flow state" of a creator. The visual identity draws heavily from modern music streaming interfaces, prioritizing content—the art—above the chrome of the UI. 

The design style is a hybrid of **Minimalism** and **Glassmorphism**. By using deep, infinite backgrounds and translucent layers, the design system creates a sense of spatial depth that allows artwork to pop. The aesthetic is "Premium Amateur," providing high-end tools to emerging artists to make their work feel professional and celebrated. The emotional response should be one of focus, inspiration, and exclusivity.

## Colors
The palette is rooted in a "True Dark" philosophy to minimize eye strain during long creative sessions and to maximize the vibrancy of user-generated content. 

- **Basics:** Use `#050505` for the primary background to create an infinite canvas feel. 
- **Surfaces:** Use `#121212` for primary containers and `#1E1E1E` for elevated cards or secondary sections.
- **Action:** The primary action color is high-contrast White (`#FFFFFF`), ensuring absolute visibility. 
- **Accent:** A secondary high-visibility accent (e.g., a "Vibrant Lime" `#E0FF4F`) is reserved for critical feedback, active states, or "New" indicators to maintain the high-energy aesthetic of a collaboration platform.
- **Text:** Use high-grade whites for headers and mid-tone grays for metadata to establish a clear hierarchy.

## Typography
This design system utilizes **Inter** across all levels to achieve a systematic, utilitarian aesthetic that feels contemporary and clean. 

The hierarchy is intentionally dramatic. Display and Headline styles use heavy weights (Bold to Black) with tight letter spacing to mimic editorial layouts. Body text is kept spacious with a 1.6 line-height to ensure readability against dark backgrounds. Labels and metadata should be used sparingly, often in uppercase or medium weights, to provide structure without cluttering the visual field.

## Layout & Spacing
The layout philosophy follows a **Fluid Grid** model with generous negative space to prevent the dark UI from feeling cramped. 

- **Grid:** Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Rhythm:** An 8px linear scale governs all spacing.
- **Margins:** Large 24px or 32px external margins ensure content never feels pressured by the screen edges.
- **Negative Space:** Elements are grouped logically with tight internal spacing (8px-16px) but separated by large "breathing rooms" (48px+) to signify different content streams or artist portfolios.

## Elevation & Depth
Depth in this design system is achieved through **Glassmorphism** and tonal stacking rather than traditional drop shadows.

- **Surface Levels:** The base layer is `#050505`. Floating elements use `#1E1E1E` with a subtle 1px inner border (10% white opacity) to define edges.
- **Glass Effects:** Floating navigation bars and header overlays must use a `backdrop-filter: blur(20px)` with a semi-transparent background (`rgba(18, 18, 18, 0.7)`).
- **Shadows:** Use only "Ambient Shadows"—ultra-diffused, 15% opacity black shadows with a 30px-40px blur—exclusively for floating modals or primary action menus to lift them off the background.

## Shapes
The shape language is defined by extreme roundness, conveying a friendly yet futuristic feel. 

- **Primary Radius:** All large cards and containers use a **32px** corner radius.
- **Pills:** Navigation elements, buttons, and filter chips utilize a full "pill" radius (height / 2) to maintain a sleek, organic appearance.
- **Consistency:** Avoid mixing sharp and rounded corners; every interactive element must feel soft to the touch, reinforcing the "streaming app" aesthetic.

## Components

- **Buttons:** Primary buttons are pill-shaped, using high-contrast White backgrounds with black text. Secondary buttons should use a glass effect (semi-transparent gray) with white text.
- **Floating Navigation:** The main navigation is a floating pill-shaped bar anchored at the bottom of the viewport. It uses a heavy backdrop blur and sits 24px above the screen edge.
- **Edge-to-Edge Cards:** Portfolio and artwork cards should span the full width of their containers. They feature 32px rounded corners and use an image-dominant layout where metadata is overlaid via a subtle bottom-to-top gradient.
- **Search Bars:** Sleek, pill-shaped inputs with an `#1E1E1E` background and subtle internal padding. The search icon should be low-opacity white.
- **Filter Chips:** Small, fully rounded chips. Active states use the primary white background; inactive states use a subtle stroke or dark gray fill.
- **Collaboration Indicators:** Small, circular avatars with vibrant ring borders to show who is currently "jamming" or collaborating on a piece of art.