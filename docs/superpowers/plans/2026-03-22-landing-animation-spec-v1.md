# Landing Animation Spec v1

## Scope
Landing page motion system for `app/page.tsx` and its immediate child preview component (`app/_components/map-example.tsx` using `components/map.tsx`).

This spec follows the locked direction:
- proof-first landing
- fast and subtle motion only
- signature pattern: stamp-pop + route-draw
- trust-first behavior (no decorative loops)

## Global Motion Tokens
- `duration.fast`: `0.16s`
- `duration.base`: `0.22s`
- `duration.slow`: `0.32s`
- `ease.standard`: `cubic-bezier(0.22, 1, 0.36, 1)`
- `ease.out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `spring.press`: `{ type: "spring", stiffness: 520, damping: 32, mass: 0.6 }`

### Interaction limits
- default transitions should be in `150-400ms`
- no infinite loops
- no parallax
- no bounce-heavy springs except tiny press feedback

## Accessibility Rules
- Respect `prefers-reduced-motion: reduce`.
- In reduced mode:
  - remove route-draw and stamp-pop transforms
  - keep instant state changes with optional quick opacity transition (`<=120ms`)
  - disable stagger sequencing
  - keep hover/focus visible via color, border, and ring only

## Section-Level Motion Plan

### 1) Hero + Product Proof
**Goal:** Immediate confidence and energy without visual noise.

Animations:
- hero eyebrow, heading, subheading, CTA row reveal with short upward fade
  - start offset: `y: 10`
  - end: `y: 0, opacity: 1`
  - stagger: `40ms` between elements
  - trigger: initial page load only
- mini-map panel reveal
  - opacity fade + tiny scale in (`0.985 -> 1`)
  - starts after heading appears
- primary CTA press feedback
  - scale to `0.98` on tap/click
  - return with `spring.press`

### 2) Emotional Journey
**Goal:** Calm narrative transition after proof.

Animations:
- section container reveal-on-scroll once
  - fade + rise (`y: 8 -> 0`)
  - duration `0.22s`
- no decorative icon motion

### 3) Challenges & Achievements
**Goal:** Tease momentum while preserving trust.

Animations:
- section reveal-on-scroll once
- challenge cards stagger in (`40ms` gap)
- coming-soon badge micro stamp-pop on first reveal only
  - scale `0.96 -> 1.02 -> 1`
  - total `260ms`
  - single run only

### 4) Social Planning
**Goal:** Light liveliness, no gimmicks.

Animations:
- section reveal-on-scroll once
- social teaser callout fade + rise with delayed start (`80ms`)

### 5) FAQ
**Goal:** Stable and practical close.

Animations:
- section reveal-on-scroll once
- optional accordion states (if introduced later): height + opacity only, no bounce

## Map Animation Spec

## Initial Route-Draw (signature)
- Trigger: once on initial map load only
- Behavior:
  - render 1-2 subtle route overlays between a few visited regions
  - stroke animate from `pathLength: 0 -> 1`
  - duration per route: `0.7s`
  - stagger routes by `120ms`
  - opacity cap: `<=0.55`
- Do not replay on hover.

## Stamp-Pop Feedback (signature)
- Trigger: first interactive map hover/click on a visited country, and for coming-soon badges where used.
- Behavior:
  - quick scale pulse `0.98 -> 1.03 -> 1`
  - total `200-260ms`
  - no repeated pulsing

## Country Hover/Focus
- Hover: color shift only + current stroke emphasis
- Focus (keyboard): clear ring/outline and higher contrast stroke
- No movement of geography shapes

## Trigger Policy
- Hero and map intro: run once on page load.
- Content sections: run once when entering viewport (`amount ~0.2`).
- No replay on scroll back.

## Suggested Implementation Map
- `app/page.tsx`
  - wrap section blocks in lightweight motion wrappers
  - apply shared variants for reveal-once patterns
- `app/_components/map-example.tsx`
  - host introductory route-draw overlay timing state
- `components/map.tsx`
  - keep geography interactions stable; add motion only through overlays or wrapper layers

## QA Checklist
- Motion feels fast and subtle on both mobile and desktop.
- No looping decorative animation appears.
- `prefers-reduced-motion` removes route-draw and stamp-pop.
- Keyboard focus states remain obvious without relying on motion.
- CTA press feedback is tactile but unobtrusive.
