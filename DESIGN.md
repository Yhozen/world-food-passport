# Design System: World Food Passport
**Project ID:** world-food-passport-web

## 1. Visual Theme & Atmosphere
World Food Passport should feel like a playful passport club that people still trust with their real habits and preferences. The visual language blends two metaphors equally: passport artifacts (stamps, visa marks, booklet rhythm) and cartographic cues (routes, pins, region framing). The mood is warm, curious, and social, but never childish. The interface should feel clear and reliable first, with personality introduced through accents and details rather than noise.

The page should read as a real product, not a concept mockup. Product proof must be visible early, and hierarchy should stay clean. Use subtle atmosphere layers and soft surfaces over flat backgrounds. Motion should be gentle and purposeful.

## 2. Color Palette & Roles
- **Passport Paper** (#F5EFE3): Primary page background tone; warm foundation for trust.
- **Ivory Surface** (#FFFDF8): Cards, panels, and elevated content containers.
- **Deep Navy Ink** (#1E3557): Primary buttons, key headings, links, and anchor UI.
- **Ink Slate** (#1F2937): Primary body text and high-readability content.
- **Muted Slate** (#5B6472): Secondary text, helper content, and metadata.
- **Stamp Gold** (#D9A441): Achievement badges, stamp motifs, and limited highlights.
- **Map Teal** (#2E8C8C): Map interaction accents (routes, active pins, subtle data emphasis).
- **Border Mist** (#E4E9F2): Inputs, card borders, separators.
- **Soft Fog** (#F3F6FB): Secondary surfaces and low-emphasis backgrounds.
- **Trust Red** (#D8584F): Destructive and alert actions only.

Functional rules:
- Primary CTA always uses Deep Navy Ink with white text.
- Gold and Teal are supporting accents and should never overpower primary actions.
- Maintain strong contrast in all text and controls.

## 3. Typography Rules
- **Primary and display typeface:** DM Sans only (clean, practical, highly legible).
- **Hierarchy behavior:**
  - Headlines: confident, slightly compact tracking, short line lengths.
  - Body: clear and neutral, optimized for scanning.
  - Labels and metadata: concise, often medium weight.
- **Voice alignment:** copy stays clear and direct with light charm.

## 4. Component Stylings
* **Buttons:** Pill-shaped primary and secondary actions (`rounded-full`). Primary buttons are navy-filled; secondary buttons are white or ivory with subtle borders. Hover states should tighten contrast slightly, not dramatically.
* **Cards/Containers:** Generously rounded corners (12-24px), ivory/white surfaces, soft low-contrast shadows, and thin border outlines. Cards should feel tangible like passport pages, not glossy app tiles.
* **Inputs/Forms:** Clean outlines with Border Mist strokes, clear labels, and calm focus rings in Deep Navy Ink. Form UI should prioritize confidence and completion clarity.
* **Badges/Stamps:** Small rounded badges in Stamp Gold family with restrained use. They communicate status and progress without gamified overload.
* **Map Modules:** Framed map areas should use subtle panel treatment and a clear product-data look. Include route or pin accents with Teal and navy anchors.

## 5. Layout Principles
- **Structure:** Centered content column with strong readability width, balanced for mobile and desktop.
- **Spacing:** Use roomy vertical rhythm between sections to support trust and scanability.
- **Proof-first ordering:** Hero must include immediate product proof (interactive mini-map or realistic preview) near headline + CTA.
- **Section emphasis:** Keep Challenges & Achievements as the strongest secondary section.
- **Density control:** Avoid clutter. Personality appears through curated motifs, not decorative overload.
- **Responsiveness:** Maintain parity across mobile and desktop; do not let either experience feel secondary.

## 6. Interaction & Motion
- Motion style is subtle and polished.
- Preferred patterns: short fade/slide reveals, gentle stamp-pop feedback, restrained route-draw effects.
- Avoid high-energy loops, excessive parallax, or game-like animation density.

## 7. Trust Guardrails
- Avoid cartoonish or childlike illustration style.
- Avoid sterile corporate minimalism.
- Keep copy practical and specific; do not over-index on novelty language.
- Ensure product credibility is visible early through real interface previews and clear navigation paths.

## 8. Page Priorities (Landing)
1. Drive sign-up conversion as the primary action.
2. Show real product proof above the fold.
3. Preserve and elevate Challenges & Achievements narrative.
4. Reinforce social value and recommendation utility.
5. Close with practical trust content (FAQ, privacy, terms, contact).
