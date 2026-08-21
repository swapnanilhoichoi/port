# Swapnanil Manna — portfolio

Freelance portfolio for **Swapnanil Manna** — full-stack & AI product engineer, NIT Durgapur '26.
Built with Next.js + Tailwind.

Same design as the static build in `~/Desktop/demo`. Every interaction is live.

## ⚠ Before you publish

Everything personal lives in **`src/data/site.ts`** — one file, no components to touch.

**Five of the eight project deployments were down when I checked them:**

| Project | Status |
|---|---|
| CazzAI · douchat · ImagZZ | ✅ live |
| Conference | ⚠️ HTTP 500 |
| Learnato · Media Manager · AI LOR Generator · Gemini Chatbot | ⚠️ HTTP 503 |

They're marked `live: false` and render an **OFFLINE** chip so nothing links to a
dead page. Redeploy them and flip the flag — a broken link on a portfolio costs
you more than a missing project.

Still to fill in:

| What | Where |
|---|---|
| GitHub / X / resume URLs | `PROFILE.links` — currently `#` |
| Two more references | `NOTES` slots 2 and 3. Slot 1 is Nicole Doyle's real signed reference. |
| Your actual rates | `PLANS` — `$1,200` / `$2,200` are placeholders |
| Project screenshots | the cards use generated stand-in art |

Everything else is drawn from your CV and the Aspir reference letter. I did not
invent testimonials, clients or metrics.


## The loading screen

A Figma frame being selected, on a faint blue graph-paper grid over `#FBFDFF`:

| t | what happens |
|---|---|
| 0.15s | wordmark fades up 8px (`.5s ease`) — first `O` in brand orange |
| 0.25s | progress bar fills, `1.6s cubic-bezier(.5,.1,.2,1)` |
| 0.50s | selection box strokes on left→right via `clip-path: inset(0 100% 0 0)` → `inset(0)` |
| 1.05 / 1.12 / 1.19 / 1.26s | the four corner handles pop in, staggered |
| 1.32s | the `1280 × 196` dimension badge rises in |
| load + 1.6s | `.done` slides the whole panel up: `translateY(-101%)`, `.85s cubic-bezier(.7,0,.2,1)` |

A 2.5s timer is the hard floor in case `load` never fires. The `1280 × 196`
label is static text on the original too, not a live measurement.

## The footer

Rebuilt on a real 12-column grid. The previous version pinned the link columns
with `position:absolute; top:172px`, which is why the email had been shrunk to
50px — it was colliding, and the fix had been to shrink the type rather than fix
the layout. The email is now the full-width focus of the block at up to 68px.

Structure: **identity → the ask → navigation + facts → legal → wordmark**, with
the name bleeding off the bottom edge as the close.

**Nothing dead-ends.** `FOOTER.cols` links whose `href` is still `"#"` are
filtered out at render time, so unset GitHub / X / resume links simply don't
appear — fill one in and it shows up by itself. The DETAILS column holds plain
facts (location, timezone, response time, availability) rather than links, so
there is nothing there to click into a void. The old "2 cursors online" line —
fabricated presence — is now a real live IST clock.

The copy-address button degrades in three steps: async clipboard API →
`execCommand` fallback → an explicit "Press ⌘C" prompt. It never swallows a
click silently.


## The liquid wordmark

Traced from a 13s recording of evasanchez.info's "Get in touch" footer, then
rebuilt in this site's palette (dark `#101C26`, white type, brand-orange first
letter).

**What the reference actually does.** Comparing frames: at rest the type is
crisp; under the pointer the letterforms shear at a horizontal seam, everything
below it lags downward, thin features pinch off into rounded droplets, and by
12s it has sprung fully back to clean type. The soft necking at the seam is the
signature of a gooey filter, not a blur on the whole element.

**How it's built.** The type is baked once to an offscreen canvas, then blitted
back in 3px horizontal bands. Each band is displaced by a smoothstep falloff
around a cut line that eases toward the pointer:

```
t    = clamp((y - cutY) / band, -1, 1)     // -1 above the seam, +1 below
w    = smoothstep((t + 1) / 2)
band = 26 + min(70, |pull.y| * 1.6)        // seam widens as it stretches
draw row y at (w * pull.x, y + w * pull.y)
```

Pointer travel feeds a decaying `target`; `pull` springs toward it (`k = 0.16`,
damping `0.80`) and settles at zero. Displacement is capped at **34px** — the
sheet sags, it does not come apart.

An SVG `feGaussianBlur` → `feColorMatrix` alpha-contrast welds neighbouring
bands together, which is what turns the seam into liquid and pinches thin
features into droplets. **The filter is only attached while `|pull| > 0.7`** —
alpha-contrast rounds corners and would soften resting type otherwise, and the
reference is crisp at rest.

Single-pointer travel is clamped to 60px per event so a cursor teleport can't
detonate the sheet.

Two smaller borrowings from the same reference: footer links decode from random
glyphs on hover (left-to-right lock-in, monospace so nothing reflows), and the
cursor reads **"let's talk"** over the wordmark.

## The heading typeface

The reference image is a **commercial display serif** — my identification is
**Ogg** (Sharp Type), or a very close sibling. The tells: extreme thick/thin
contrast with vertical stress (Didone lineage), but *blade-cut* terminals rather
than ball terminals, a strikingly high crossbar on the `A`, pointed apexes, and
a lowercase `a` with a swooping flag-like top over a tiny bowl. Ogg is drawn
from Oscar Ogg's pen-and-brush lettering, which is exactly that
calligraphic-Didone hybrid.

Ogg is licensed software. It can't be downloaded or bundled here.

So the headings use **Gloock** (Google Fonts, OFL, free), picked by rendering
and comparing ~25 candidates side by side against the reference — Bodoni Moda,
Libre Bodoni, Playfair Display, Fraunces, Prata, DM Serif Display, Yeseva One,
Gilda Display, Italiana, Cormorant, Marcellus, Bellefair, Instrument Serif,
Antic Didone, Rozha One, Bona Nova, Young Serif, Newsreader, Abril Fatface, plus
Zodiak / Boska / Gambetta from Fontshare. Gloock was the only one carrying all
four tells: the high `A` crossbar, blade terminals, the swooping `a`, and the
condensed high-waisted proportions.

`text-transform` is `none` here on purpose — this face lives in its lowercase,
and uppercasing throws away the `a` and the terminals that make it look like the
reference at all.

**To swap in a licensed face**, self-host the files and change one line:

- Next: `--font-heading` in `globals.css`
- Static: `--heading` in `css/style.css`

Nothing else references the heading family.

### The footer email

The third reference ("Let's Create Solve Love") is the **same category as the
Sydney poster** — serifless, extreme contrast, sharp wedge terminals, flared
tapers instead of serifs. Tested again on the actual address string against
Gloock, Prata, Gilda Display, Marcellus, Cormorant Garamond, Playfair Display,
Bodoni Moda, Antic Didone, Instrument Serif and Melodrama: every one of those
carries real serifs, which the reference does not. **Italiana** matched, same as
the drag box.

That's the useful result — it means no eighth family. Both references resolve to
one deco voice, shared by `.ph-sub` and the footer email via `--font-deco`.

Set at `clamp(26px, 5vw, 72px)`, which fills the 1212px content column exactly
at desktop without wrapping.

**Known trade-off:** Italiana ships a single numeral set that reads as oldstyle,
so the `0` in `06694` looks like a lowercase `o`. There is no lining-figure set
to switch to — `font-variant-numeric: lining-nums` is a no-op, verified. It
doesn't affect correctness (the `mailto:` href and the copy button both carry
the exact string) but anyone transcribing by eye could mistype it. Revert this
one line if that matters more than the look.

### The drag box

The second reference (a Sydney Film Festival poster) carries a **high-contrast
deco display face — serifless**, which is the key tell: the `S`, the `d`
ascender and the `n` stems all terminate in flared tapers rather than serifs,
and the `y` descender is a straight thin diagonal. That rules out the whole
Didone-serif family it superficially resembles.

Tested against Poiret One, Julius Sans One, Tenor Sans, Marcellus, Cormorant,
Gilda Display, Antic Didone, Jost, Cinzel, plus Melodrama and Quilon from
Fontshare. **Italiana** (Google Fonts, OFL) matched on skeleton, contrast
distribution, the flared strokes and the long thin `y` tail. Melodrama was the
runner-up but is more condensed with a different `S`.

Set on `.ph-sub` at 26px — Italiana has a small x-height, so it needs roughly a
third more size than the grotesque it replaced to hold the same optical weight.

The small blue **"do not drag"** chip is deliberately still Space Mono. It's a
Figma-UI affordance in the canvas metaphor rather than editorial copy, and a
display face at 9.5px is illegible. Say the word and I'll switch it.

**To swap in a licensed face**: `--font-deco` (Next) / `--deco` (static).

## Section heads & the heading animation

Every section head is the same three-part unit:

```html
<div class="sec-head">
  <span class="scribble" data-hw="services"></span>   <!-- traced handwriting -->
  <h2>What we make</h2>                               <!-- split into .word > .ltr -->
  <span class="note">Three services, one canvas…</span>
</div>
```

**Handwritten eyebrow.** An inline SVG stroke whose path carries `pathLength="1"`,
so drawing it on is just `stroke-dashoffset: 1 → 0` over `4.6s
cubic-bezier(.5,0,.5,1)` — no path measuring. An IntersectionObserver adds
`.writing` the first time it scrolls into view.

**Magnetic letters.** The `<h2>` is split into `.word` → `.ltr` spans, then each
letter is pulled toward the cursor:

```
fs      = computed font-size (78px at desktop)
maxLift = min(22, fs * 0.30)
R       = fs * 2.6 + 70
t       = max(0, 1 - distance / R)
lift    = t²
transform = translateY(-lift * maxLift) rotate(±lift * 2deg)
```

The rotation sign flips either side of the cursor, so letters tilt *away* from
it. Resting state is `transition: transform .26s cubic-bezier(.2,.8,.2,1)`; on
`mouseleave` every letter springs back with `.55s cubic-bezier(.34,1.56,.64,1)`
and the inline transition is cleared 560ms later. Skipped entirely for coarse
pointers and `prefers-reduced-motion`.

**Reveal.** `.reveal` is `opacity 0 / translateY(26px) / blur(8px)` easing to
rest over `.7s` — the blur is what makes sections resolve rather than just fade.

## The hero particle headline

Same algorithm as the original: "IMPOSSIBLE / TO IGNORE ." is rendered to an
offscreen canvas in Anton, sampled on a 2–3px grid, and every opaque pixel becomes
a particle.

```
spring     ax = (target.x - x) * 0.02
repulsion  radius 92px, force (R-d)/R * 4.5
damping    v = (v + a) * 0.86
palette    3/5 orange, 1/5 ink, 1/5 blue
```

Particles start scattered and converge in ~1.5s; the cursor pushes them apart.

## Why some CSS isn't a utility class

`globals.css` keeps a small `@layer components` block for things that genuinely
don't belong in `className`: data-URI SVG artwork (clouds, the eyes mark, tick
icons), `@keyframes`, mask-image icons, and `::before` pseudo-elements like the
hover-revealed Figma layer chips. Everything else — layout, spacing, type,
colour, borders, shadows, breakpoints — is Tailwind utilities in the JSX.

## What's live

Figma-style loading intro (see above) · particle headline (cursor repels the dots) · dual cursors with hover/drag
labels · ruler scroll-meter that reads `SHIPPED` at 100% · draggable + keyboard
carousel with snap · scroll-driven pinned service pan · service accordions ·
count-up metrics · staggered chat · draggable pricing lever with real plan state
· single-open FAQ · bouncing poke physics · live IST studio clock · tab-title
teasing when you leave · back-to-top.

## Known gaps

**Project screenshots and video stills** are generated stand-ins — a mock site UI
over a tinted gradient — at the right dimensions. Swap in real images.

The handwritten eyebrow strokes are the studio's own traced artwork, copied verbatim so the section heads match exactly.

The clouds are the original's exact artwork — four circles over a wide ellipse,
blurred by `feGaussianBlur stdDeviation='9'`/`'10'` *inside* the SVG rather than
by a CSS filter — with its nine `top`/size/opacity/duration values verbatim.

## Notes

- `<html suppressHydrationWarning>` is set because browser extensions commonly
  stamp attributes onto `<html>` before React hydrates. It suppresses nothing
  the app itself produces.
- `npx tsc --noEmit` and `npx eslint src` both run clean, including the React
  Compiler rules that ship with Next 16.
