# Reply2Lead — UI/UX & design system audit

Baseline reviewed 4 October 2026 after the requested revert. The scores and findings below describe that baseline. The page was subsequently updated in the focused pass summarized here.

## Focused fixes applied

- **CTA clarity and shape:** The hero now opens the live page demo; the final conversion action says “Email us to get started” and opens email. The setup channel controls say “Preview,” show a button-shaped state, and no longer claim to connect an account.
- **Readability:** Inactive story steps retain full text opacity, small product labels were raised, selected filter and Ray avatar text now use dark ink on light green, and buttons share a consistent minimum height and pill shape. The support scenarios expose `role="group"` and `aria-pressed`.
- **Rhythm and brand:** The page retains the existing cream, leaf, and forest composition. Palette and font tokens now have one source in `styles.css`; section spacing, secondary heading size, mobile metrics, and channel controls were tuned without flattening the product scenes.
- **Illustrative data:** The learning example is explicitly labeled as an example instead of implying production usage statistics.

Verification: `node --check script.js`, `git diff --check`, browser review at 320, 390, 768, and 1280px, support and channel state clicks. No horizontal document overflow was observed. The same automated scan fell from **55 to 12 flags**: no contrast or undersized UI-text flags remain; the remaining one tiny-text flag is a decorative separator. Nine padding flags are section-wrapper false positives, and the other two identify the purposeful knowledge-state label and typing animation. This is a focused remediation, not a fresh scored audit or full assistive-technology test.

## Verdict

**Audit health: 12/20 (acceptable, needs a focused pass).** The hero, social marks, photography, and concrete conversation demos give the page an identity. The weaker areas are very small demo text, contrast in inactive and selected states, and a design system distributed over three CSS layers. The page still has a few generic UI treatments (large decorative quote mark, tilted icon tile, repeated rounded cards), but a wholesale visual redesign is not justified by the findings.

| Dimension | Score / 4 | Evidence |
| --- | ---: | --- |
| Accessibility | 2 | Two verified white-on-green contrast warnings; several demo labels are 9–11px; inactive step text uses `opacity: .42`. |
| Performance | 3 | No framework or heavy bundle; five referenced photos, mostly lazy loaded; motion uses transform/opacity and has reduced-motion support. |
| Responsive | 3 | No horizontal overflow at 320, 390, 768, or 1280px; 11 visible links/buttons at 390px have one dimension below 44px. |
| Theming/system | 2 | Tokens exist, but three `:root` layers redefine the palette; 79 distinct `font-size` values and 23 radius values across stylesheets. |
| Anti-patterns | 2 | Hero has a distinct product story; some generic card/shadow treatment and decorative icon/quote elements remain. |
| **Total** | **12/20** | |

The Nielsen heuristic review is **25/40**: visibility 3, real-world match 2, user control 3, consistency 2, error prevention 2, recognition 3, flexibility 3, aesthetic restraint 2, error recovery 2, help/context 3. The lower scores mainly reflect demo states that look like real setup and rules that vary across components.

## Priority findings

### P1 — Primary CTA promises a connection flow that is not present

The hero and final CTA say **“Connect your social accounts”**. The hero only scrolls to the final CTA, whose destination is `mailto:hello@reply2lead.com`. The five “Connect” controls in the setup section only simulate a connected state. A visitor may expect account authorization and misunderstand what clicking will do. The README also identifies this as a prelaunch item.

**Location:** `index.html:44`, `index.html:97–103`, `index.html:122`, `README.md:14`. **Action:** Either link to a real onboarding flow or change the CTA to an honest contact action; label the setup interaction clearly as a preview. `/clarify`.

### P1 — Small UI text and weak inactive states reduce readability

The automated scan raised 41 text-size flags (some refer to the same element): hero chat labels, scene status, filter chips, and learning statistics contain text around 9–11px. The disabled-looking story beats use `opacity: .42` for the entire button, washing out both title and supporting copy. On the 320px preview, the hero message labels are difficult to read.

**Location:** `styles.css:11`, `styles.css:14`, `styles.css:23–24`, `experience.css:82–104`. **Action:** Define a minimum size for content-bearing demo text, then use color or weight to de-emphasize inactive steps while keeping text readable. `/typeset`, `/adapt`.

### P1 — White-on-green text fails contrast in some states

The deterministic scan found two **2.3:1** white-on-green cases. Live computed styles confirmed white text on the brand green in the active inbox filter, Ray avatar, and keyboard skip link. The primary CTA already uses dark text on green and is a better internal precedent.

**Location:** `styles.css:8`, `styles.css:15`, `styles.css:23`; the base green is overridden in `experience.css:1–17`. **Action:** Use dark forest text on light green for small labels and the skip link; reserve white text for the dark green surface. Check all interactive states, not just default buttons. `/audit`, `/colorize`.

### P2 — Token rules are difficult to maintain

`styles.css`, `refinement.css`, and `experience.css` each redefine core colors. `--blue` and `--peach` now resolve to green or cream hues, so the token name no longer describes the rendered surface. A source scan found 79 distinct font-size values, 23 radius values, and 71 padding declarations; responsive rules account for some of this, but component sizing has no stable scale.

**Location:** `styles.css:1–7`, `refinement.css:2–22`, `experience.css:1–18`. **Action:** Establish one palette and semantic surface tokens, a compact type ramp, radius choices, and spacing roles; then migrate components incrementally without changing their composition. `/polish`.

### P2 — Scenario controls lack a clear programmatic selected state

The support scenario buttons visibly change active style, but unlike the story beats and inbox filters, they do not expose `aria-pressed`. The labeled wrapper is a generic `div`, so assistive technology may not announce it as a control group. This also creates a state-system inconsistency.

**Location:** `index.html:85`, `script.js:139–173`. **Action:** Give the control group a semantic role and update `aria-pressed` with the active scenario. `/audit`.

### P2 — Repeated card styling and generous section gaps dilute the strongest scenes

At 1280px, the setup panel places five bordered channel cards inside another rounded white card. In the qualification section, a large top gap precedes the green quote card and a giant decorative quote mark competes with the actual status story. This makes those sections feel less precise than the hero. The previous broad flattening pass was rejected; retain the current layouts and adjust only measured spacing, type, and surface roles.

**Location:** `styles.css:16`, `styles.css:20`, `experience.css:48–65`. **Action:** Define distinct roles for scene, product window, control, and status; tune gap and ornament per section after the token pass. `/layout`, `/distill`.

## Design review

- **What works:** The first screen tells a specific story with a person, real social logos, a customer question, Ray’s answer, and human handoff. The headline is clear and the primary action is visually identifiable.
- **Information flow:** The page covers acquisition, support, intent, handoff, setup, and inbox. The setup tabs progressively disclose complexity. However, six industry tabs and several consecutive interactive sections increase cognitive load; a first-time visitor may not know which interaction matters most.
- **Brand feel:** The cream/leaf/forest palette is cohesive in the rendered page. Product UI inside photography is more convincing than abstract AI imagery. The tilted industry icon and decorative quote are the two clearest template-like details.
- **Trust:** Simulated setup and unverified-looking statistics (“19”, “12”, “7”, knowledge score) need explicit context if they remain illustrative. Avoid presenting demo values as real customer outcomes.

### Persona checks

- **Small business owner on a phone:** Can grasp the hero quickly, but the tiny chat labels and 37px inbox filter chips are hard to read and tap. The promised connection CTA opens email rather than account setup.
- **Team lead evaluating handoff:** The refund demo and takeover control show ownership well. The status changes need clearer accessible announcements and a consistent selected-state pattern.
- **Keyboard or screen-reader user:** Skip link, headings, tabs, focus styles, and many `aria-pressed` states are present. Support scenarios are the most obvious missing selection state; contrast and opacity remain the primary barriers.

## Detector notes and test coverage

`npx --no-install impeccable --json index.html` returned **55 flags**: 2 contrast, 17 tiny text, 24 undersized UI text, 9 cramped padding, 1 tight tracking, 1 kicker, 1 pulsing dot. The text findings overlap. Several padding flags are false positives because a full-width section contains an inset `.shell`. “Knowledge gap detected” is a meaningful product-state label, and the animated dots occur during an actual typing state, so those two pattern flags should not drive removal by themselves.

Visual and DOM checks covered 320px, 390px, 768px, and 1280px. No document-level horizontal overflow was found. The five referenced photographs loaded in the inspected views; offscreen lazy images were not treated as failures. The audit did not run a full screen-reader session or network performance trace.

Accessibility reference: [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires 4.5:1 for ordinary text and 3:1 for qualifying large text. [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) is 24×24 CSS pixels with exceptions; the 44px measurement above is a usability target, not an AA failure count.

## Recommended order

1. `/clarify`: make CTA and demo status truthful before launch.
2. `/typeset` and `/colorize`: fix small demo text, inactive opacity, and contrast with localized changes.
3. `/audit`: add support-scenario state semantics and recheck keyboard/screen-reader behavior.
4. `/layout` and `/distill`: tune the few overly decorative or spacious sections without flattening the whole design.
5. `/polish`: consolidate tokens and verify all breakpoints and motion states.
