---
name: The Sovereign Mind
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#dbc2b0'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#a38c7c'
  outline-variant: '#554336'
  surface-tint: '#ffb77d'
  primary: '#ffb77d'
  on-primary: '#4d2600'
  primary-container: '#d97707'
  on-primary-container: '#432100'
  inverse-primary: '#904d00'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c6c3'
  on-tertiary: '#30312e'
  tertiary-container: '#91918d'
  on-tertiary-container: '#292a28'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e4e2de'
  tertiary-fixed-dim: '#c8c6c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#474744'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.1em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.15em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.8'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  serif-display:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  testimonial-organic:
    fontFamily: Dancing Script
    fontSize: 22px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.2em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  section-gap: 160px
  container-max: 1440px
  gutter: 32px
  margin-mobile: 20px
  blueprint-line-weight: 1px
---

## Brand & Style

This design system embodies the "Sovereign Mind" philosophy: a blend of high-end clinical precision and the raw, personal journey of psychological transformation. The aesthetic is **Ultra-Premium Cinematic Minimalism**, drawing heavily from luxury editorial and architectural blueprints. 

The emotional response is one of gravitas, exclusivity, and profound clarity. We utilize deep shadows to create a sense of focused isolation (the "Sovereign" state) contrasted with sudden shifts into warm, illuminated parchment tones for areas of reflection and breakthrough. Visuals are characterized by heavy whitespace, razor-sharp structural lines, and the juxtaposition of rigid technical typography with organic, handwritten human expressions.

## Colors

The primary state is deep immersion. The palette is anchored by **Zinc-950**, providing a void-like backdrop that eliminates peripheral distraction. 

- **Brushed Gold (#D97706):** Used sparingly for high-value actions, status indicators, and "The Fix: Applied" certification marks.
- **Pristine White (#FFFFFF):** Reserved for primary technical copy and iconography to ensure maximum legibility against the dark void.
- **Warm Parchment (#FDFBF7):** A narrative shift color. When the UI transitions to "The Light" (reflective exercises or historical galleries), the background swaps to this tone to evoke physical paper and enlightenment.
- **Zinc-900:** Used for secondary surface elevation, creating subtle separation for interactive cards and containers.

## Typography

Typography is a structural element. **Montserrat** is the voice of authority—always wide-tracked and uppercase in display settings to mimic high-end fashion and architectural branding. 

**Inter** serves as the functional utility for body text, providing a neutral, "blueprint" feel that balances the more expressive elements. 

For the "Light Mode Shift" (galleries and archival content), **Playfair Display** introduces a layer of historical elegance. **Handwriting fonts** (Dancing Script, etc.) are utilized exclusively for personal testimonials and "marginalia" notes, appearing as if scrawled directly onto the screen to break the rigid digital grid.

## Layout & Spacing

The layout follows a **structured blueprint philosophy**. We use a 12-column grid, but sections are frequently delineated by ultra-thin 1px lines (Zinc-800) that extend to the edge of the viewport, creating a sense of technical drafting.

Whitespace is used aggressively; section gaps are unusually large to force the user to slow down and process information. Content is often center-aligned or placed in asymmetrical "balanced-void" layouts where text occupies one-third of the screen, leaving the rest as negative space. 

On mobile, the grid collapses to a single column, but the "blueprint" lines remain as horizontal separators to maintain the architectural identity.

## Elevation & Depth

This system avoids traditional drop shadows in favor of **Tonal Layering** and **High-Contrast Borders**.

- **Depth through Contrast:** Surfaces do not "float"; they are carved out. Zinc-900 cards sit flush against the Zinc-950 background, separated only by thin 1px gold or white borders.
- **Glassmorphism:** Used exclusively for navigation overlays. A 20px backdrop blur with a 10% opacity white tint creates a "frosted lens" effect over the cinematic background videos.
- **The Stamped Emblem:** Elements like "The Fix: Applied" use a "stamped" effect—inner shadows and high-contrast gold strokes to look like a physical seal of approval pressed into the interface.

## Shapes

The shape language is a study in extremes. Structural containers (cards, sections, images) are **perfectly sharp (0px)** to maintain the architectural blueprint feel. 

However, interactive elements—specifically buttons and primary tags—are **fully pill-shaped**. This contrast makes the interactive elements feel like organic, tactile "objects" resting on a rigid technical surface. Emblems and seals are circular, reinforcing the "stamp" metaphor.

## Components

### Buttons
- **Primary:** Pill-shaped, Brushed Gold background, Black text (Montserrat, Uppercase, 0.15em tracking). No shadow; 1px gold glow on hover.
- **Secondary:** Pill-shaped, Transparent background, 1px White border. White text.

### Cards
- **Luxury Content Cards:** Zinc-900 background, 0px corner radius, 1px Brushed Gold border. These should feature "blueprint" coordinates (e.g., "01 / SEC_A") in the top right corner using `label-caps`.

### Inputs
- **Search & Forms:** Underline-only style. 1px White line that turns Gold on focus. Label floats above in `label-caps`.

### Stamped Emblems
- **The Fix: Applied:** A circular gold badge with a double-ring border. The text is arched around the perimeter. Used as a watermark on completed modules or success stories.

### Handwritten Testimonials
- Floating text blocks using `testimonial-organic`. These are placed with slight rotation (-2 to +2 degrees) and "blue ink" or "white chalk" colors to look like authentic physical notes.