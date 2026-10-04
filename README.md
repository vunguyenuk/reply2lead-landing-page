# Reply2Lead landing page

A responsive, dependency-free landing page based on the supplied Reply2Lead copy and visual storytelling brief. It uses four custom generated photographs, a controlled cream/green/forest palette, and layered conversation UI to demonstrate how Ray supports customers, develops leads, and hands conversations to people. `refinement.css` contains the denser layout and green visual system.

## Preview

Open `index.html` directly, or run a local server:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Before launch

- Replace the `mailto:hello@reply2lead.com` links with your real signup or onboarding URL.
- Replace the custom arrow mark with the approved Reply2Lead logo when it is available.
- Review platform availability and product claims against the live product.
- Add analytics, legal pages, and social preview metadata if needed.

The scroll stories, support scenarios, handoff, channel setup, knowledge score, test mode, inbox, learning demo, industry examples, and mobile navigation work without a backend. Product UI and connection states shown on the page are illustrative.

## Motion coverage

- Comment detection → public reply → private DM → lead capture, paced by scroll or step buttons.
- Question → source check → answer → resolution, plus refund, repeated question, and low confidence escalations.
- New → Interested → Likely buyer → Qualified, paced by scroll or step buttons.
- AI replying → pausing → Needs you → human takeover, with Ray paused afterward.
- Awaiting customer → scheduled follow-up → message sent.
- Channel connection → unified inbox; knowledge additions → readiness score; owner correction → improved test answer.
- Inbox prioritization and filtering → sales/support routing; knowledge gap → owner answer → score increase.

All motion respects `prefers-reduced-motion` and the examples remain readable without animation.
