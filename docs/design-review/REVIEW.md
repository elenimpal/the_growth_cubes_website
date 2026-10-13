# Design and interaction restoration review

Development review, 13 October 2026 (Europe/Athens). Reference: original Git revision `a37e645` (latest committed website source). The accessibility implementation was present as uncommitted changes to that revision; no separate accessibility commit exists to attribute them to. The original source is loaded directly from Git for each comparison, with the original WebM asset. Production was not deployed or used as the reference in this review.

Open [comparison.html](comparison.html) for the paired original/updated screenshots. [comparison.json](comparison.json) contains behavior assertions, layout measurements and targeted axe results. [contrast.json](contrast.json) contains conservative contrast calculations. These files are development review artifacts, separate from the existing DYPA evidence package.

## Exact regression sources and targeted remedies

| Area | Change introduced by accessibility implementation | Remedy and retained accessibility |
| --- | --- | --- |
| Hero appearance | Appended `.hero-overlay` increased the original alpha from `.35` to `.82`. Appended mobile rules replaced the original 140svh sticky stage with a short static hero and forced its mask off. | Original `.35` video tint, original hero typography and original sticky stages restored. A `.5` burgundy gradient backing is confined to the text's vertical band, with transparent edges. Normal playback remains muted, looping and inline. Both decorative videos remain hidden from assistive technology. |
| Playback | HTML `autoplay` was removed; the observer still calls `play()` for visible videos. A persisted pause or OS reduced-motion setting also stops playback. | Testing confirms the JavaScript playback path works without `autoplay`. Keep that controlled path so reduced-motion and no-JavaScript users do not get uncontrolled autoplay. Add a JPEG poster extracted from the existing video for the initial paused state. Keep the global pause/resume button, pressed state and persisted user preference. |
| Text reveal | Appended CSS forced `.reveal-word` to cream and removed its `::after` layer. `isStatic()` returned true on every width <=900px, exiting before reveal updates. | Restore the original word-progress formula on all viewport sizes. Use a clipped background gradient on the original DOM text instead of duplicate generated words. Unrevealed words use `#b8a5ac` (7.23:1 on burgundy), revealed words use cream. Forced-colors, paused and no-JavaScript presentations retain readable text. |
| Services gallery | Mobile CSS forced a column, disabled transforms with `!important`, hid the list switch, and removed sticky height. The mobile height calculation was unreachable because `isStatic()` included mobile widths. Global card overrides removed original minimum proportions. | Original horizontal translation and mobile travel/stage formulas restored. Preserve original 500px desktop cards and phone card widths, with original height targets as minimums so content can expand. Keep list alternative at every width. Add described keyboard arrow/Home/End navigation and a visible gallery focus indicator. |
| How We Work | Final `.hww-step-wrapper` override forced `transform:none`. Mobile `handleScroll()` returned before progress and step illumination. | Restore slide-in, progress and node/card illumination at all widths. Keep full text opacity; the original `.3` dimming fails contrast. Reserve 30px of horizontal room for the slide so unilluminated text remains within the phone viewport. Paused mode presents the complete readable timeline without transitions. |
| Footer overlap | Contact was moved inside `main`, and `.page-end` closed before the sticky footer. Its original containing block and inherited `--footer-tuck` were lost. Once mobile animations return, the sticky footer can show behind transparent early sections. | Give main an opaque burgundy background and explicit stacking above the sticky footer; restore the tuck variable on the footer. Retain main/contact and footer landmarks, footer focus fallback, and the original height-based fallback for a footer that cannot fit the viewport. |
| Reflow and responsive behavior | Static presentation was selected by viewport width alone, affecting every animation. | Width alone no longer disables motion. ResizeObserver measures actual content fit. Only a hero, reveal or gallery that cannot fit its pinned viewport changes to normal flow. Pause, reduced motion and no JavaScript keep their accessible static presentations. |

The existing form labels, autocomplete, validation/focus, status messages, skip link, navigation disclosure behavior, inert closed menu, Escape handling, focus outlines, contrast fixes, funding attribution and accessibility statement remain in place. Form submission behavior was not changed.

## Visual comparison

Desktop screenshots use 1440 × 900; phone screenshots use 390 × 844. The hero video is paused at one second only while capturing paired screenshots, after independently verifying actual playback and advancing time. Captures normalize the scroll position before each section.

Original and updated normal-mode stage heights match: desktop hero 2250px, reveal 1350px, services 2700px; phone hero 1182px, reveal 928px, services 2172px. Services are captured at the start, midpoint and end; text is captured during its wipe; the timeline is captured with illuminated and unilluminated steps. The normal phone gallery remains horizontal.

Intentional differences from the original are the visible pause/list controls, a contrast-safe header backing and hero text scrim, brighter unrevealed words and timeline text, content-expanding card heights, and extra room for the timeline's slide. Existing form and funding additions also remain. These are accessibility accommodations, not attempts at pixel-identical reproduction of inaccessible states.

The disclosure menu remains the accessible implementation rather than the original full-screen overlay. Short landscape and very short reflow viewports use a fitting gallery list; this is based on measured available height, not mobile width. Other animations continue where their own content fits.

## Validation and limits

Results: 72 scripted checks passed, 17 targeted axe scans returned no A/AA violations, all 10 contrast bounds passed, and HTML validation and JavaScript syntax checks passed. Axe retains incomplete results requiring human interpretation; this is not a full compliance claim.

The browser test covers normal desktop/phone playback and time progression, word reveal, horizontal travel, timeline progress/slides, keyboard gallery first/last navigation, optional list round trip, keyboard motion pause/resume, persisted pause, live and initial OS reduced motion, mobile menu Escape/focus/inertness, forced colors, no-JavaScript content, skip link and retained form error focus. It also checks 320 × 800, 844 × 390, 320 × 256 (400% reflow equivalent), 768 × 1024, and both sides of the 900px breakpoint, plus increased text spacing and simulated 200% text enlargement.

The [W3C pause/stop guidance](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html) supports keeping a functioning pause control for continuous background video. The [W3C reflow guidance](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html) informs the content-fitting fallbacks.

Relevant criteria retested: 1.1.1 decorative media semantics; 1.3.1 structure; 1.4.3 text contrast; 1.4.4 text enlargement; 1.4.10 reflow; 1.4.11 focus contrast; 1.4.12 text spacing; 2.1.1/2.1.2 keyboard operation and escape; 2.2.2 pause/stop; 2.4.1/2.4.3/2.4.7 skip link, focus order and visibility; 4.1.2 control names/states. Automated scans and scripted keyboard checks are partial verification, not a full WCAG conformance assessment.

Contrast bounds: the hero subtitle is at least 5.17:1 over a hypothetical white video frame with the original tint plus text scrim; header text is 7.61:1; unrevealed words are 7.23:1; timeline descriptions are 10.92:1. These bounds do not replace inspection of every masked/fading animation frame.

Remaining manual verification:

- VoiceOver/Safari and NVDA/Firefox reading, word segmentation and gallery/list discoverability; DOM text and semantics are preserved, but actual assistive-technology output was not tested.
- Real iPhone/Android playback policies, power/data-saving restrictions and changing browser chrome. Browser policy can still refuse `play()`; the poster remains available.
- Physical touch scrolling and orientation changes; tests use Chromium viewport emulation, not physical devices.
- Actual browser zoom at 200% and 400%; automated tests use font enlargement and equivalent reduced viewports, which are useful proxies.
- Full visual inspection of video flashing thresholds (2.3.1), every intermediate hero mask state, and complete production verification. No new video or flashing animation was introduced.
- Persistent pause/list changes can change page height and scroll position. They preserve readable content, but screen-reader announcements and reading-position continuity need a human check.

No deployment occurred. Existing `docs/accessibility` reports and DYPA submission files were not regenerated; their previous conclusions must not be treated as verification of this new source. The simplified Greek submission report and final production evidence remain deferred.

## Reproduce

```sh
node tools/design-review/compare.cjs
node tools/design-review/contrast.cjs
npm run test:html
```

Chrome and the installed Playwright/axe development dependencies are required. The comparison starts a temporary local HTTP server, reads the original revision with `git show`, and writes only to `docs/design-review`. It does not submit forms or contact production. To deliberately re-extract the poster from the existing video, run `EXTRACT_POSTER=1 node tools/design-review/compare.cjs`.
