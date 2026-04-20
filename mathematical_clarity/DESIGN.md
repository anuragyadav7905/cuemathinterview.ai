# High-End Digital Experience Design System

This design system serves as the definitive structural and aesthetic guide for the brand's digital ecosystem. It is engineered to transcend the "standard" EdTech look, moving away from rigid grids and generic layouts toward a high-end, editorial-inspired experience.

## 1. Creative North Star: "The Illuminator"
The Creative North Star for this system is **"The Illuminator."** Much like a premium publication or a curated gallery, the UI should feel authoritative yet warm. We achieve this through:
*   **Intentional Asymmetry:** Breaking the expected 12-column repetition to highlight key content.
*   **Tonal Depth:** Replacing harsh lines with sophisticated surface layering.
*   **Commanding Typography:** Using oversized, tight-letterspaced displays against generous, rhythmic whitespace.

The goal is a "Premium Academic" aesthetic—professional enough for educators, yet vibrant and modern enough for a forward-thinking digital platform.

---

## 2. Colors
Our palette balances a high-energy primary yellow with a sophisticated range of neutral surfaces to create a sense of focus and hierarchy.

### The Palette
*   **Primary:** `#FFD000` (The "Golden Spark" – used for high-impact CTAs and core branding).
*   **On-Primary:** `#FFFFFF` (Ensuring crisp legibility on golden surfaces).
*   **Surface:** `#FCF9F8` (A warm, off-white base that feels more "paper-like" and premium than pure white).
*   **Surface Container (Low to High):** `#F6F3F2` to `#EBE7E7` (Used for layering content).
*   **Inverse Surface:** `#313030` (For the "Dark Sidebar" and high-contrast admin views).

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts or subtle tonal transitions. A card should be distinguishable from the background because it sits on a `surface-container-low` tier, not because it has a grey stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Level 0 (Base):** `surface` (`#FCF9F8`).
*   **Level 1 (Sectioning):** `surface-container-low` (`#F6F3F2`) for background blocks.
*   **Level 2 (Interaction):** `surface-container-lowest` (`#FFFFFF`) for cards sitting on Level 1.

### Glass & Gradient
To provide visual "soul," use a 15% linear gradient on primary CTAs (`primary` to `primary-container`). For floating navigation or modal overlays, apply **Glassmorphism**: use a semi-transparent surface color with a `20px` backdrop-blur to allow the content beneath to bleed through softly.

---

## 3. Typography
We utilize a pairing of **Plus Jakarta Sans** for authority and **Inter** for functional clarity.

| Level | Token | Font Family | Size | Weight | Character Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Plus Jakarta Sans | 3.5rem | Bold (700) | -0.04em |
| **Headline** | `headline-lg` | Plus Jakarta Sans | 2rem | Semi-Bold (600) | -0.02em |
| **Title** | `title-lg` | Inter | 1.375rem | Medium (500) | 0 |
| **Body** | `body-lg` | Inter | 1rem | Regular (400) | 0 |
| **Label** | `label-md` | Inter | 0.75rem | Bold (700) | +0.05em (Caps) |

**Editorial Note:** Use `display-lg` sparingly to "anchor" a page. Headlines should feel tight and urgent, while body text requires generous line-height (1.6) for maximum readability.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional structural shadows.

*   **The Layering Principle:** Avoid shadows on standard cards. Instead, place a `#FFFFFF` card on a `#F6F3F2` background. This creates a "soft lift."
*   **Ambient Shadows:** For "Active" states or floating elements, use a highly diffused shadow:
    *   `box-shadow: 0 12px 40px rgba(28, 27, 27, 0.06);` (A tinted shadow using the `on-surface` color).
*   **The "Ghost Border":** If a boundary is required for accessibility, use the `outline-variant` (`#D5C4AC`) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Large Action Buttons
*   **Primary:** Rounded `12px`. Background: `primary`. Text: `on-primary` (Bold). No border. Apply a subtle inner-glow (top-down white gradient at 10% opacity) for a "tactile" feel.
*   **Secondary:** Ghost style. No background. Border: Ghost Border (15% `outline-variant`). 

### Form Fields
*   **Styling:** Forgo the 4-sided box. Use a "Field-Surface" approach: a `surface-container` background with a `2px` bottom-only stroke in `primary` that activates on focus. 
*   **Labels:** Use `label-sm` positioned 8px above the field, never inside as placeholder text.

### Info Cards
*   **Rule:** No dividers. 
*   **Layout:** Use generous internal padding (`xl` scale). Use background shifts to separate the "Header" area of the card from the "Body" area.
*   **Corner Radius:** Consistently `12px` (md) for internal cards, `16px` (lg) for major sections.

### Admin Sidebar
*   **Color:** `inverse-surface` (`#313030`).
*   **Active State:** Use the `primary` yellow as a vertical "indicator bar" on the left edge (4px wide) rather than highlighting the entire row. This keeps the look clean and professional.

---

## 6. Do's and Don'ts

### Do
*   **Do** use "Breathing Room." If you think there is enough margin, add 16px more.
*   **Do** overlap elements. Allow a card to slightly "bleed" over a background color transition to break the grid.
*   **Do** use high-contrast text ratios. Large black headlines against a soft cream background are our signature.

### Don't
*   **Don't** use pure black (`#000000`). Use `on-background` (`#1C1B1B`) to keep the "warm" feel.
*   **Don't** use standard 1px grey dividers (`<hr>`). Use a 24px vertical gap or a change in surface color.
*   **Don't** use "Drop Shadows" that look like dark smudges. Keep them ambient, wide, and almost invisible.