# Portfolio Revamp — Reference Research Document

> **Scope:** Collect every visual, animation, font, and interaction reference for the upcoming Thoria portfolio revamp. No implementation decisions live here — only observations, open questions, and a baseline of the current site.
> **Last updated:** 2026-07-01

---

## 0. Current Portfolio Baseline

**Files:** `index.html`, `css/tokens.css`, `css/base.css`, `css/effects.css`, `css/themes/*.css`, `js/*.js`.

**Current architecture:**
- Single-page static site, `max-width: 1120px`, section-based (`#bio`, `#experience`, `#builds`, `#skills`, `#contact`, etc.).
- Custom cursor already exists in `js/cursor.js`: two-layer cursor (ring + dot), spring smoothing, magnetic buttons, click ripples.
- Scroll effects in `js/scrollEffects.js`: IntersectionObserver reveals, count-up stats, typewriter name, simple hero parallax.
- Themes system: Default (emerald-on-dark `#0F1115`), Minecraft, Light, Technoblade.
- Current fonts: `Inter` (body), `JetBrains Mono` (mono), `Press Start 2P` (pixel accent).
- Current animation libraries: none; everything is vanilla CSS/JS.

**Existing interactive elements to preserve or evolve:**
- Theme toggle + Technoblade easter-egg toggle
- Custom cursor + magnetic buttons + ripples
- Lightbox proof gallery, PDF modal, FAQ `<details>`, contact ticket form
- Sound toggle and achievement system

**Important note on motion preferences:** Existing code already respects `prefers-reduced-motion`. Any new animation must do the same.

---

## 1. Cappen — https://cappen.com/

### 1.1 Ink mouse overlay (startup / loading screen)

**Requested behavior:**
- After a loading screen, an ink-like mouse overlay appears.
- The ink inverts the colors of the text it passes over.
- The ink has its own fluid physics (not just a rigid circle).

**Research status:** Could not be verified from extracted markup/text alone. The effect is almost certainly driven by WebGL / Canvas / heavy CSS/JS that `WebFetch` does not capture.

**Open questions:**
1. Is the ink a single blob that follows the cursor, or does it trail/drip?
2. Does it invert *only* text, or images and UI too?
3. Is the loading screen a brand intro (logo, percentage, progress bar)?
4. Does the effect live on every page, or only the landing view?

**Implementation hypotheses for later:**
- Canvas/WebGL fluid simulation (Navier-Stokes-ish) drawn behind text using `mix-blend-mode: difference` or `exclusion`.
- Alternative: CSS `backdrop-filter: invert()` clipped to a morphing SVG blob animated with `anime.js` or Spring Physics.
- Reference patterns on Uiverse: liquid blob cursors, inverted text masks.

### 1.2 Works tab physics-based mouse hover / indicator

**Requested behavior:**
- A circular indicator follows the mouse.
- It inverts the colors of the background and text it covers.
- When the mouse moves quickly, the circle morphs into a “geode” / stretched-ball shape, like an animated ball under speed.

**Research status:** Not present in extracted text; confirmed to be a CSS/JS custom-cursor effect.

**Open questions:**
1. Does the indicator snap back to a perfect circle when the mouse stops?
2. Does it stretch based on velocity, acceleration, or both?
3. Is it always visible, or does it appear only inside the Works area?
4. Does it use `mix-blend-mode: difference` for inversion?

**Implementation hypotheses for later:**
- Track mouse velocity (`dx/dt`, `dy/dt`) and apply a non-uniform scale/skew to a circle element.
- Use `anime.js` spring physics (`spring()`) for the morph back to circle.
- Blend mode `difference` is the cheapest inversion; WebGL gives more artistic inversion if needed.

### 1.3 Fonts

**Research status:** Font names not present in extracted text. The site appears to use a clean, bold sans-serif for headings.

**Open questions:**
1. Do you know the exact font names from Cappen? (Inspecting the live site would reveal them.)
2. Are you open to licensing a paid font, or should we find a similar free alternative?

---

## 2. Wodniack — https://wodniack.dev/

### 2.1 Loading screen → main screen transition

**Requested behavior:**
- A loading screen animates into the main page.
- Described as “the animation of it” — likely a mask reveal, split-screen, or wipe.

**Research status:** Could not be verified from extracted text (binary string visible, but animation timing not present).

**Open questions:**
1. Is it a full-screen wipe, a circular iris, a vertical split, or content scaling in?
2. Does the loader show a percentage, a logo, or just abstract graphics?
3. Does the transition feel cinematic or minimal/technical?

**Implementation hypotheses for later:**
- SVG/Canvas clip-path reveal using `anime.js` timeline.
- Alternative: `clip-path: polygon()` transition or `mask-image` wipe.

### 2.2 Hero text placement — “Creative Developer”

**Requested behavior:**
- The hero text sits in a specific, intentional location.
- Likely large, centered or off-center, with a star/decorative mark between words.

**Research status:** Confirmed text exists: “Creative Developer” with a decorative star between words.

**Open questions:**
1. Do you want the hero text centered, bottom-left, or somewhere unexpected?
2. Should “Thoria” remain the dominant word, or should the role/label become dominant?

### 2.3 Interactable vertical lines in the middle of the screen

**Requested behavior:**
- Vertical lines in the center of the screen are interactive (mouse/touch reactive).
- They are not the main focus — they act as atmosphere.

**Research status:** Not visible in extracted text.

**Open questions:**
1. Do the lines distort like strings, move like a waveform, or react to proximity?
2. Are they a particle/line system (Canvas/WebGL) or CSS `div` strips?
3. Should they persist across all sections or only the hero?

**Implementation hypotheses for later:**
- Canvas sine-wave lines modulated by mouse X.
- Anime.js staggered height/opacity animation on hover.
- Reference: Uiverse “audio wave” / “equalizer” components.

### 2.4 Work tab scroll transition — window/door + multiplied words

**Requested behavior:**
- User keeps scrolling and is visually “put inside a window/door.”
- The word “WORK” multiplies everywhere during the transition.
- Strong sense of entering a new space.

**Research status:** The spaced heading “W O R K” and 34 numbered project links were visible, but the transition itself is scroll-JS driven and not captured.

**Open questions:**
1. Is this a section-to-section transition, or a pinned scroll-jack sequence?
2. Does the camera appear to move *through* the screen (z-axis), or is it a 2D mask expansion?
3. How long should the transition feel — quick punch, or slow cinematic?

**Implementation hypotheses for later:**
- GSAP ScrollTrigger pinned section with scale/translateZ and duplicated text layers.
- `anime.js` can handle the text duplication/scale, but scroll pinning usually needs ScrollTrigger or a custom scroll observer.

---

## 3. Stiff — https://stiff.madebybuzzworthy.com/

### 3.1 Dynamic non-linear scroll path

**Requested behavior:**
- Scroll does not just move down.
- Sequence observed: left → down → left again.
- Content slides horizontally while the user scrolls vertically during pinned phases.

**Research status:** Structure suggests scroll-hijacked/pinned sections: stacked headline words, repeated “WorkWorkWorkWork…” divider, a work grid, and finally a horizontal news row.

**Open questions:**
1. Do you want the *entire* portfolio to follow this pattern, or only a specific section (e.g., featured builds)?
2. How does navigation/scroll progress feel on mobile? Horizontal scroll maps poorly to touch unless we use swipe.
3. Should the scroll direction change automatically, or respond to free scroll with direction indicators?

**Implementation hypotheses for later:**
- GSAP ScrollTrigger with `pin: true` and `scrub` for horizontal translate.
- Custom scroll controller mapping `scrollY` to `translateX`.
- Anime.js for the decorative parallax elements inside each pinned track.

**Accessibility concern:** Scroll-jacking must respect `prefers-reduced-motion` and provide an alternative linear fallback.

---

## 4. Supersolid — https://www.supersolid.agency/

### 4.1 Hero text hover — warp + RGB chromatic aberration

**Requested behavior:**
- Very large hero text.
- On hover, the text warps (liquifies/distorts).
- It dissolves into RGB color channels — like a 3D movie without glasses.

**Research status:** Hero copy identified: “We create Super x Solid outcomes for brands.” Effect itself is shader/CSS-filter driven and not in extracted text.

**Open questions:**
1. Do you want this effect on your name “THORIA,” on the role text, or both?
2. Should the RGB split happen on hover, on scroll, or on page load?
3. How aggressive should the chromatic aberration be — subtle tint or full channel separation?

**Implementation hypotheses for later:**
- CSS `text-shadow` layers for simple RGB split.
- SVG filter `<feColorMatrix>` + `<feOffset>` for more control.
- WebGL text texture with shader distortion for the “warp” look.
- Reference: Uiverse “glitch” / “RGB split” text effects.

### 4.2 Scroll-direction motion blur

**Requested behavior:**
- A slight blur appears in the direction of scrolling.
- When scrolling down, the bottom of the screen blurs.
- If combined with Stiff’s horizontal scroll, the leading edge (left side when moving left) should blur.

**Research status:** Image assets named `topsubtle.avif` / `bottomsubtle.avif` exist, likely decorative edge gradients, but the CSS blur rule was not captured.

**Open questions:**
1. Is the blur a directional motion blur, or a static vignette at the scroll edge?
2. How strong should it be? (A hint of speed vs. heavy smear.)
3. Should it affect text readability at all?

**Implementation hypotheses for later:**
- CSS radial/linear gradient overlay + `backdrop-filter: blur()`.
- Canvas motion-blur shader based on scroll velocity.
- Anime.js opacity/scale animation triggered by scroll direction.

### 4.3 Bottom repeated text / logo fade-in

**Requested behavior:**
- Near the footer, three stacked instances of the word/brand (“Supersolid”) sit in the background.
- They fade in gently as the page ends.

**Research status:** Contact section has “Let’s find your ROIdeas®” repeated four times, and footer shows “Supersolid ©2025,” suggesting repeated-text motif but not the exact fade behavior.

**Open questions:**
1. Do you want your name “THORIA” repeated at the bottom, or a different phrase (e.g., “SERVER ADMIN”)?
2. Three layers, or more?
3. Should they be huge outline text, solid text, or semi-transparent?

**Implementation hypotheses for later:**
- Three absolutely positioned oversized text elements with staggered `opacity` / `translateY` on scroll.
- Anime.js `stagger` + `translateY` for the reveal.

### 4.4 Navigation hover animation

**Requested behavior:**
- Navigation links (Home, Work, About, Careers, etc.) have a satisfying hover animation.
- The user wants the same animation style reused in the Contacts place.

**Research status:** Menu markup shows duplicated labels (e.g., “Work Work”), which often powers a slide-up/swap hover animation, but CSS not captured.

**Open questions:**
1. Is the hover animation a text-swap (two identical labels sliding up), an underline draw, or a strikethrough reveal?
2. Should it apply to the main nav links or to contact links/email?
3. Does it need to support both light and dark themes?

**Implementation hypotheses for later:**
- Duplicate-label clip/slide effect is straightforward CSS-only.
- Anime.js for more elaborate staggered letter reveals.

---

## 5. Federico Pian — https://www.federicopian.com/

### 5.1 Hero text font + appearing animation

**Requested behavior:**
- After loading, the hero text has a stunning font and reveal animation.
- The same animation repeats when scrolling to the next project.

**Research status:** Only plain text captured; font names and keyframes not present. Visible hero: “Ciao, I’m Fede! A freelance creative developer and co-founder at Overpx.”

**Open questions:**
1. Can you describe the animation in more detail? (e.g., letters fly in, fade up, split from center, mask reveal?)
2. Is the font a serif, a display sans, or something experimental?
3. Should the repeating animation happen for every section title in our portfolio, or only project names?

**Implementation hypotheses for later:**
- Anime.js `stagger` on characters with `translateY` + `opacity` + `rotateX`.
- CSS `clip-path` reveal for a cleaner mask effect.
- Variable-font weight animation if we choose a variable typeface.

### 5.2 Clickable project names → expanded details

**Requested behavior:**
- Project names are clickable.
- Clicking reveals a lot more information about the project (possibly inline expansion or modal).
- Suggested use case: Featured Builds page.

**Research status:** Extracted content shows project titles as links to `/projects/...` paths with agency/year label, description, and “Visit” link — not necessarily an in-place expand. User wants this adapted to their needs.

**Open questions:**
1. Inline expansion within the builds list, or a dedicated project detail view/page?
2. What extra info should appear? (Screenshots, tech stack, role, duration, outcomes, proof gallery?)
3. Should the expansion animate with `height: auto` or a panel slide?

**Implementation hypotheses for later:**
- `<details>`/`<summary>` pattern with CSS grid transition.
- Anime.js height/opacity animation for smooth expansion.
- Dedicated project modal with scrollable content.

### 5.3 Organic, messy background glows

**Requested behavior:**
- Background glows exist but are not perfect circles.
- They feel “messy, weird but human” — organic, blobby, slightly imperfect.

**Research status:** Glow shape/color not captured in extracted text.

**Open questions:**
1. How many glows should there be?
2. Do they move slowly, react to mouse, or stay fixed?
3. What colors? Monochrome to match theme, or accent color?

**Implementation hypotheses for later:**
- CSS `radial-gradient` with multiple layered blur filters and slow `anime.js` position drift.
- SVG noise-filtered blobs for the “imperfect” look.
- WebGL metaballs for the most organic result.
- Reference: Uiverse “blob” / “gradient orb” components.

---

## 6. Animation Libraries — Reference, Not Dependency

### 6.1 Anime.js — https://animejs.com/

**Role in the revamp:**
- Timeline-based orchestration (page load sequence, section reveals).
- Spring physics for cursor morph-back effects.
- Staggered text/letter animations.
- SVG path morphing if we build the ink/blob cursor with SVG.

**What it is NOT ideal for:**
- Scroll-driven pinning (use GSAP ScrollTrigger or a custom scroll observer instead).
- Heavy physics simulation (ink fluid) — for that, Canvas/WebGL is better.

### 6.2 Uiverse — https://uiverse.io/

**Role in the revamp:**
- Source of component/animation patterns: buttons, loaders, cards, hover states, cursors, glows, text effects.
- We will adapt patterns rather than copy-paste, so the result matches the portfolio’s own design system.

---

## 7. Cross-Cutting Design Questions to Resolve Before Planning

These questions are blocking enough that they should be answered before a design plan is finalized:

1. **What is the primary theme/lighting?** All reference sites are dark and high-contrast. Do we stay dark-first, or do you want a light-mode-first revamp?
2. **Which references are must-haves vs. nice-to-haves?** The Cappen ink cursor, Stiff scroll path, and Supersolid RGB hero are all heavy. Trying to do all five sites at once risks a chaotic page.
3. **Mobile behavior:** Many of these effects (custom cursor, horizontal scroll, RGB text) are desktop-first. What is the mobile experience?
4. **Performance budget:** Fluid ink + WebGL glows + scroll-jacking can hurt performance. Do we have a target device/connection profile?
5. **Content freeze:** Will the existing sections (Bio, Experience, Builds, Skills, FAQ, References, Contact) stay the same, or are you rewriting copy?
6. **Font budget/licensing:** Some reference fonts are commercial. Are you open to purchasing a font, or should we use free Google/Adobe alternatives?
7. **Loader presence:** Several references have an intro loader. Do you want a loading screen, or should the page be instant?

---

## 8. User Clarifications (2026-07-01)

These answers supersede the open questions above.

### 8.1 Cappen — confirmed scope
- **Ink cursor overlay with color inversion** is wanted on the **startup page only** (the loading/intro screen).
- **Works-tab geode/stretch cursor** is wanted on **the other tabs after the user passes the initial “Thoria | Professional Server Manager” page** — i.e., the custom cursor morphs into the geode shape when moving fast, and it inverts background/text colors.
- The user will provide videos of the Cappen effects in the next message so exact physics/timing can be matched.

### 8.2 Wodniack + Stiff — confirmed scope
- **Stiff non-linear scroll path** is the main navigation model: sections do not simply scroll down; the path moves in different directions.
- **Wodniack WORK door transition** is used **once, at the very start of the portfolio**, to transition between scroll paths. It also serves as the trigger point where the **Cappen circle mouse-follow cursor starts**.
- **Wodniack cinematic loading → hero transition** is wanted at the very beginning.
- **Wodniack interactable vertical lines are NOT wanted.**
- The user will provide videos of the Wodniack/Stiff behaviors in the next message.

### 8.3 Supersolid + Federico — confirmed scope
- **Federico project expansion** applies to the **Featured Builds section** (Kleos and Iustitia). Clicking a project name reveals more information.
- **Supersolid RGB chromatic hero text warp** replaces the Wodniack vertical-lines spot in the middle of the screen. The text should read **“THORIA”** instead of “SUPERSOLID.”
- **Scroll-direction blur/vignette** is wanted, aligned to the current scroll direction (e.g., blur on the leading edge when the Stiff path moves left).
- **Supersolid bottom repeated text** should read **“As MANAGEMENT.”**
- **Supersolid nav hover animation** is reused for the **Contact section links**: `officialthoria@gmail.com`, `github.com/thoriadevelopment`, `discord @inrising`.
- **Federico typography + reveal animation** is used for the RGB hero text — specifically the startup effect that writes “Thoria” first.
- **Federico organic background glows** are wanted — imperfect, blobby, human-feeling glows behind content.
- The user will provide videos of the Supersolid/Federico effects in the next message.

### 8.4 Theme direction
- Portfolio should **start light-first**.
- The **existing multi-theme system must remain** (Default, Minecraft, Light, Technoblade) and be toggleable via the theme switcher.
- The revamp should therefore be designed as a cohesive light-first system that still supports all current dark/theme variants.

### 8.5 Blocking next step — resolved
- Reference videos have been provided and analyzed below.
- Remaining clarifying questions are listed in section 11; planning will begin after those are answered.

## 9. Next Step

## 9. Video Observations (2026-07-01)

All recordings are 1920×1080 at 60 fps.

### 9.1 Cappen (`2026-07-01 11-50-19.mp4`)
- **Startup ink overlay (0–~4 s):** Page loads from near-white. A dark liquid/ink blob materializes in the center and expands outward while fragmenting into smaller shapes. Tiny thumbnails fly in from edges toward the center then scatter. A custom solid black circular cursor is already visible during the load and follows the mouse with slight inertia. Text `HUMAN THINKERS` (left) and `DIGITAL MAKERS` (right) fades in around 1.5–2 s in a condensed grotesque sans-serif. The white overlay dissolves into the main page by ~3.5–4 s.
- **Hero ink effect:** A large black ink splatter is masked over/behind the stacked headline `BUILDING / TOMORROW / FOR / TODAY`. The ink continuously morphs like a fluid sim, with tendrils stretching, detaching, and re-forming. A square dark hypnotic video loop is clipped inside the word block.
- **Works cursor (57–63 s):** In the dark project list (`Omnium Blockchain`, `Cocay Branding`, etc.), the cursor stays a small black dot while moving, but on project interaction it scales up like a viewfinder. The “geode” feel comes from circular media masks and crystalline/3D reveals inside the project panel. Hover/click transitions take ~300–500 ms; the media panel slides in from the left.
- **Palette:** Stark black and white with occasional red/orange accent thumbnails.
- **Font:** Extra-bold condensed grotesque for headlines, clean geometric sans for body.
- **Timing:** Startup ink dissolve ~2.5–3.5 s ease-out cubic; headline ink morph continuous/looped.

### 9.2 Wodniack (`2026-07-01 11-51-52.mp4`)
- **Loading transition (0–~2.5 s):** Solid saturated magenta/red (`#E60036` range) fills the viewport. Thin black contour/wavy lines animate across the screen like a warping topographic mesh/fabric; hand-drawn, jittery, depth-creating. At ~2 s the lines settle and hero content fades in.
- **Hero placement:** `CREATIVE DEVELOPER` sits extremely low, almost touching the bottom edge, in a heavy black sans-serif. A small star/asterisk replaces the space between words. Top-left logo `AW` + `ALIGNING PIXELS. CAREFULLY.`; top-right nav `ABOUT | WORK | CONTACT`, social icons, mode toggle, QR code. Right metadata: `Coding globally from France.` + `Available for freelance work → Hire me`. Bottom strip: ticker-like binary/encoded characters below headline.
- **WORK door / multiplying-word transition (24–34 s):** Screen fills with a grid of giant repeated letters: rows of `W`, `O`, `R`, `K` in bright magenta on black. Project cards float into view at semi-random positions over the letter grid (browser-window-shaped screenshots: *edstal*, *Rudl und Schwarm*, *BLACK HOLE*, *VANGUARD*, *404 Error*). Cards drift with subtle parallax and scale slightly on hover. The letter grid remains static but acts as a typographic wallpaper/door.
- **Timing:** Loading line warp ~1.5 s elastic ease; hero fade-in ~400 ms after lines settle; work cards drift continuously with scroll.

### 9.3 Stiff (`2026-07-01 11-52-48.mp4`)
- **Scroll path:** The viewport steers along a 2D path rather than scrolling vertically.
  1. Rightward intro (0–~3 s): `Stiff` script logo on cream background → pans right to hero panel.
  2. Hero panel: dark navy with stacked headline `WE MAKE / LAUGHS / THAT LOOK / DAMN / GOOD` (cream + bold red). Cartoon tooth/mouth mascot sits on the `G`. Vertical `WORK WORK WORK...` text runs down the right edge.
  3. Downward scroll through case studies (~6–12 s): project cards (`RE/MAX Astrology`, `Running`, `Be Your Own Hero`, `Same Day`, `In Your Feed`).
  4. Leftward to contact (~14–20 s): `HIT US UP` / `STIFF FILMS` panel; vertical `WORK` text now on the left edge.
- **Typography/logo:** Handwritten script “Stiff” in dark navy; ultra-heavy condensed slab/sans for headlines; chunky playful all-caps body paragraphs.
- **Interactions:** Mascot small bounce/peace-sign animation; project cards slide in along the path.
- **Palette:** Navy `#1A1F2B`, cream `#F2F0E4`, bright red `#E41E3A`, with vintage photo/video stills.
- **Implementation feel:** GSAP ScrollTrigger/ScrollSmoother horizontal camera with nested vertical pins; smooth eased scroll interpolation.

### 9.4 Supersolid (`2026-07-01 11-54-13.mp4`)
- **Hero RGB chromatic text:** Near-black background. Top-left intro paragraph. Giant `SUPERSOLID` spans full width in bold rounded sans-serif. Letters are white but split into cyan/magenta/yellow RGB layers offset horizontally and vertically, creating a glass/refraction look. A liquid displacement wave moves through the text, warping letterforms like water/prism.
- **Scroll-direction distortion:** As the user scrolls, RGB offsets shift direction — scrolling down makes color trails drag upward, and vice versa. The wave distortion travels left-to-right then right-to-left, reacting to scroll velocity.
- **Work section:** Large split-screen project cards (e.g., *Caption by Hyatt*, *NRL / Club Rugby League*). `your ROIdeas` text also has chromatic distortion over a dark architectural image.
- **Bottom repeated text (54–57 s):** Massive stacked `SUPERSOLID` words repeat in lighter gray, filling the lower viewport as a typographic texture.
- **Nav hover:** Footer nav (`Home | Work | About | Careers | Systems | Contact`) shows subtle color shift/underline; top nav likely has chromatic shimmer or arrow on hover.
- **Timing:** Chromatic wave cycle ~2–3 s, tied to scroll; blur intensity increases with scroll speed.
- **Palette:** Near-black, white, RGB split accents (cyan `#00FFFF`, magenta `#FF00FF`, yellow `#FFFF00`).

### 9.5 Federico Pian (`2026-07-01 11-56-42.mp4`)
- **Loading/reveal (0–~6 s):** Page starts on flat light gray. Circular progress indicator bottom-left counts up (12%, 37%, 98%). Text `CIAO, I'M FEDE! A FREELANCE CREATIVE DEVELOPER AND CO-FOUNDER AT OVERPX.` types/fades in below the loader. After loading, the background morphs into a soft organic gradient and the first project slides in.
- **Layout:** Minimal top bar with `F / P` logo, live clock, `PROJECTS / ABOUT`, dark circular icon. Each project fills the viewport as a full-screen slide.
- **Typography:** Project titles use an elegant italic serif (Freight-like, high-contrast italic) in large centered type: `airbag studio`, `darko bratina`, `musical hugs`. Meta line `AGENCY. OVERPX / YEAR. 2023` centered under title; short paragraph left-aligned below; `VISIT` pill button with arrow.
- **Project dial:** Large circular dial bottom-left showing `01`, `02`, `05`, etc., with `PROJECT` and `NUMBER` labels and left/right arrows.
- **Organic glows:** Soft diffused gradient backgrounds in pastel tones (warm pink/rose, cool blue-gray, warm peach/cream). They behave like Gaussian blobs, slowly shifting and breathing behind content.
- **Project expansion/transitions:** Smooth horizontal slide with background color morph. Circular project image on the right scales up gently as the slide settles. Navigating between projects updates the dial number with a rotation animation.
- **Timing:** Loader ~4–5 s, percentage tied to asset loading; project slide transition ~600–800 ms ease-in-out; background blob drift continuous ~8–12 s cycle.

## 10. Implementation Hypothesis Table

| Effect | Likely technique for our portfolio |
|---|---|
| Cappen startup ink | SVG filter `feTurbulence` + `feDisplacementMap` on a morphing blob, or a lightweight Canvas fluid sim; custom black cursor with spring smoothing. |
| Cappen geode cursor | Scaled cursor div with `mix-blend-mode: difference` or `backdrop-filter` invert; velocity-driven scaleX/scaleY/skew spring via `anime.js`. |
| Wodniack loader | SVG/Canvas animated wavy contour lines with sine displacement on a solid light background. |
| Wodniack WORK door | CSS Grid or SVG repeating `WORK` letter tiles; project cards float in with parallax. |
| Stiff scroll path | GSAP ScrollTrigger horizontal camera with nested vertical pins. |
| Supersolid RGB text | CSS `text-shadow` RGB layers + SVG displacement filter; scroll velocity drives offset amplitude and blur. |
| Supersolid scroll blur | CSS `backdrop-filter` gradient overlay or canvas motion-blur in scroll direction. |
| Supersolid bottom text | Three stacked oversized text layers with staggered `opacity`/`translateY` on scroll. |
| Supersolid nav hover | Duplicate-label clip/slide-up swap or underline draw. |
| Federico loader | Percentage counter with `requestAnimationFrame`; clip-path or opacity reveal. |
| Federico organic glows | Large blurred gradient divs (`filter: blur(80px+)`) with slow position/scale drift via CSS or `anime.js`. |
| Federico project expansion | Accordion/grid expansion or modal with `anime.js` height/opacity animation. |

## 11. Final Clarifications (2026-07-01)

### 11.1 Responsive & performance
- **Mobile:** Simplified linear-scroll version with a touch-friendly cursor. All scroll-jacking, horizontal tracks, custom cursor inversion, and RGB chromatic effects are desktop-only.
- **Low-power / legacy downgrading:** Effects auto-downgrade on tablets, mobile, and anything running Windows 7 or lower. Detection via user-agent, hardware-concurrency, `prefers-reduced-motion`, and touch/no-WebGL checks.

### 11.2 Content scope
- Keep the existing sections: **Bio, Experience, Builds, Skills, FAQ, References, Contact**.
- Rewrite, restructure, and add context freely. A detailed About Me source file is at `Assets/About Me`.
- For **Kleos** and **Iustitia** deep-dive, inspect their project folders:
  - `C:\Users\deniz\OneDrive\Desktop\Projects\Kleos`
  - `C:\Users\deniz\OneDrive\Desktop\Projects\Iustitia`

### 11.3 Loader & brand intro
- Use the **Wodniack loading aesthetic** (saturated color + warping contour lines) and its logo/brand behavior.
- Loader length: match Wodniack’s quick punch (~2.5 s).

### 11.4 Typography — finalized
- Use **Fontshare and Google Fonts** only — no paid font purchases.
- Lemon Milk is **not safely licensed** for commercial/public use; avoid it.
- **Display sans:** `Cabinet Grotesk` (Fontshare, 9 weights, variable, wide neo-grotesque) as the primary bold/fashion/professional voice.
  - Alternatives for Google-CDN-only fallback: `Space Grotesk` (Google Fonts, 5 weights, variable).
- **Elegant italic serif:** `Fraunces` (Google Fonts, variable with `wght`/`opsz`/`SOFT`/`WONK` axes, true italics) for hero and project text. It can feel editorial, high-contrast, and slightly playful when needed.
  - Dark/professional alternative: `Bodoni Moda` (Google Fonts, Didone, crisp italics).
- **Mono:** keep `JetBrains Mono` (already in the project) for labels, captions, and technical details.
- Avoid Inter, Roboto, Arial, system fonts as primary typefaces.

**Type moods:**
- Bold / fashion statement: Cabinet Grotesk Black/ExtraBold, all caps, tight leading + Fraunces italic subline.
- Dark / professional: Cabinet Grotesk Medium/Regular + Fraunces at low `WONK`/`SOFT`.
- Artistic / colorful: Fraunces with `WONK` on and `SOFT` high, JetBrains Mono for labels.

### 11.5 Themes & color philosophy
- **Remove the theme switcher.** The existing Default/Minecraft/Light/Technoblade toggle is gone.
- The site should be **alive and creative**: different sections can have different palettes — artistic and colorful in some spots, dark and professional in others, bold and fashion-statement in others.
- Reference palettes can be mixed per section (Wodniack magenta, Federico pastels, Cappen black/white, Stiff navy/cream/red, Supersolid near-black + RGB).

### 11.6 Sound & easter eggs
- **Remove the sound toggle.** Sound is on by default (or removed entirely if no audio assets are planned).
- **Technoblade easter egg stays**, but only as a theme after the whole implementation is over (post-launch redesign/add-on).

## 12. Content Sources for Planning

### 12.1 About Me (`Assets\About Me\Resume.txt`)
Key facts to weave into the Bio/Experience sections:
- Thoria, 20 years old, EU · Turkey, Turkish (native) + English (practically native).
- 3+ years Minecraft server administration & media management.
- Currently managing ArchMC Network (~1,000 avg players, 42k+ Discord) and VoidSentMC Network (~250 avg players, 3,500 Discord).
- Managed staff teams of up to 50 people; interviewed and guided accepted staff.
- Managed 30+ content creators; moderated 42,000+ Discord users; handled 600+ support tickets; issued ~2,700 punishments; conducted ~100 manual screenshares.
- Documented 100+ bugs; built ArchMC's official Community Guidelines from scratch.
- Developed a JavaScript payment-allocation program for content creators.
- Open to paid or volunteer work; limits roles to at most 4 servers for focus.
- References: Velt, MacDonald, Namen, Sencinion (Discord IDs in the file).
- Reachable via Discord @1284495349267959828, officialthoria@gmail.com, GitHub, YouTube.

### 12.2 Kleos (`C:\Users\deniz\OneDrive\Desktop\Projects\Kleos`)
A desktop media-management dashboard built with **Python + PyQt6**.
- **Purpose:** Track content creators across YouTube and Twitch from a single dashboard, replacing spreadsheet chaos.
- **Key capabilities:**
  - Offline-first SQLite per-profile storage.
  - YouTube Data API v3 + Twitch Helix integration.
  - Multi-profile support for separate communities.
  - Creator cards with role colors, tags, notes, sparklines, new-activity alerts.
  - Per-creator history: sort/filter/search media, paginated lists, deferred charts.
  - Leaderboard + analytics with interactive matplotlib charts.
  - AI verification (Claude / Gemini) and keyword-based verification.
  - HTML export of shareable community boards.
  - Milestone notifications for subscriber/view thresholds.
  - Import/export JSON profiles and creators with merge/dedup.
  - First-run wizard, dark-themed design tokens, global QSS.
- **Why it matters for the portfolio:** Thoria didn't just use tools — built the exact tool the role needed, from API integration to UI design.

### 12.3 Iustitia (`C:\Users\deniz\OneDrive\Desktop\Projects\Iustitia`)
A purely client-sided **Minecraft Fabric anti-cheat mod** for Java 1.21.11.
- **Purpose:** Observe other players through server-rebroadcast packets and flag impossible interactions, with zero outgoing packets, zero telemetry, and zero server install.
- **Key capabilities:**
  - 32 detection checks (14 combat, 18 movement/rotation/packet).
  - Read-only packet mixin; fail-open architecture; never crashes the client.
  - Protocol awareness for 1.8-era and modern combat via ViaFabricPlus.
  - Chat alerts with severity scaling; nametag tier prefixes (green/yellow/red) + confidence score.
  - Observer tools: `/ius spectate` follow-cam, instant replay (`/ius replay`), evidence clips (`.iusclip`), sonar directional audio alerts, player notes, session reports.
  - Render overlays: target highlight, ghost trail, burst sparks, crosshair confidence HUD, tab-list badges, offender selfie.
  - YACL config screen, 12 keybinds, first-launch wizard.
- **Why it matters for the portfolio:** Demonstrates deep systems thinking, packet-level understanding of cheats, and building ethical tooling (detection, not enforcement).

## 13. Next Step

1. Enter Plan Mode using `frontend-design`, `code-review`, and `superpowers` skills.
2. Produce a detailed design + implementation plan for user approval before writing any code.
