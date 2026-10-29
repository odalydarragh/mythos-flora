---
name: Mythos Flora
description: A mobile herbarium reel where each outdoor turn is one pressed voucher sheet.
colors:
  rag: "#f1e8d7"
  rag-warm: "#ede2cd"
  rag-card: "#efe7d5"
  pill: "#efe9d8"
  ink: "#18221b"
  ink-title: "#16190d"
  ink-primary: "#1e2111"
  ink-quiet: "#474737"
  ink-binomial: "#3b3e30"
  botanical: "#27291b"
  rule: "#2b2e20"
  hairline: "#3b3c2e"
  vermilion: "#904035"
  vermilion-press: "#7e3125"
  vermilion-inset: "#cc8f80"
  seal-paper: "#f6e6d9"
typography:
  display:
    fontFamily: "Cormorant Garamond, Petrona, Georgia, serif"
    fontSize: "5.55cqw"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Cormorant Garamond, Petrona, Georgia, serif"
    fontSize: "3.75cqw"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Petrona, Cormorant Garamond, Georgia, serif"
    fontSize: "2.85cqw"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "Petrona, Cormorant Garamond, Georgia, serif"
    fontSize: "2.48cqw"
    fontWeight: 400
    lineHeight: 1.32
  label:
    fontFamily: "Petrona, Cormorant Garamond, Georgia, serif"
    fontSize: "2.95cqw"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "0.055em"
rounded:
  none: "0px"
  inset: "3px"
  control: "4px"
  pill: "9999px"
spacing:
  inset: "3px"
  rule: "1px"
  sheet-gutter: "5%"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.seal-paper}"
    rounded: "{rounded.control}"
    padding: "3px"
  button-primary-hover:
    backgroundColor: "{colors.vermilion-press}"
    textColor: "{colors.seal-paper}"
    rounded: "{rounded.control}"
    padding: "3px"
  button-satchel:
    backgroundColor: "{colors.pill}"
    textColor: "{colors.ink-title}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "40px"
  input-field:
    backgroundColor: "#f7f2e4"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  card-forage:
    backgroundColor: "{colors.rag-card}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.none}"
    padding: "0"
---

# Design System: Mythos Flora

## Overview

**Creative North Star: "The Kew Herbarium Voucher Sheet"**

Each turn of a walk is one pressed sheet, not a stack of cards. The page is cotton rag, hairline-ruled, and held to a single viewport. The photograph is a mounted specimen. The words underneath are a ledger: common name, binomial, folklore, the thing you can pick up, and the path that opens once you have it.

The sheet is outdoor equipment. Satchel, pressed vouchers, and indoor reference specimens live in a drawer, off the page you hold up on the trail. Later turns reuse the same tape, rules, vermilion action, and path rows. They are the same object with a new specimen, not a second visual system.

The early direction named a warmer ground and a brighter wax red. The built sheet uses the rag and vermilion measured from the approved sheet. Those measured values are the system.

**Key Characteristics:**

- One `100dvh` voucher per turn, in a vertical snap reel
- Cotton rag ground with a full-bleed paper texture
- Archival hairlines, not cards with drop shadows
- Vermilion reserved for the collect action and the wax seal
- Shaded botanical marks in the margin, set in the same ink as the rules

## Colors

The palette is a pressed sheet: rag paper, forest ink, and one wax red.

### Primary

- **Wax Vermilion** (`{colors.vermilion}`): The collect button and the wax seal. Pressed state is `{colors.vermilion-press}`. The button's inner rule is `{colors.vermilion-inset}`, and its lettering sits on `{colors.seal-paper}`.

### Neutral

- **Cotton Rag** (`{colors.rag}`): Page ground, theme color, and the reel behind every sheet. `{colors.rag-warm}` is the warmer wash. `{colors.rag-card}` fills the forage compartment. `{colors.pill}` fills the satchel pill.
- **Archival Ink** (`{colors.ink}`): Body default. Species titles use `{colors.ink-title}`. Forage and path headings use `{colors.ink-primary}`. Secondary lines use `{colors.ink-quiet}`. Binomials use `{colors.ink-binomial}`.
- **Botanical Ink** (`{colors.botanical}`): Filled marginal drawings.
- **Ledger Rule** (`{colors.rule}`): Forage box and path rules. Header rules use `{colors.hairline}`.

### Named Rules

**The One Wax Rule.** Vermilion appears on the collect control and the seal. It is not a link color, a tab color, or a background wash.

## Typography

**Display Font:** Cormorant Garamond (with Petrona, then Georgia)
**Body Font:** Petrona (with Cormorant Garamond, then Georgia)
**Label Font:** Petrona, small caps tracking

**Character:** The species name is a herbarium display face, lighter than a poster. Labels and folklore are a book face at a small size, set to wrap in even pairs of lines.

### Hierarchy

- **Display** (weight 500, `5.55cqw`, line-height 1): Common name on the ruled species bar.
- **Headline** (italic 400, `3.75cqw`, line-height 1): Binomial, to the right of a vertical rule.
- **Title** (weight 500, `2.85cqw`, line-height 1.15): Forage and path headings.
- **Body** (weight 400, `2.48cqw`, line-height 1.32): Folklore, two paragraphs of two lines.
- **Label** (weight 400, `2.95cqw`, tracking `0.055em`, uppercase): Sheet number, satchel count, swipe cue.

### Named Rules

**The Pair of Lines Rule.** Folklore is two paragraphs, each wrapping to two lines. If a third line appears, the size comes down before the forage box moves.

## Layout

The reel is `100dvh`, `snap-y`, mandatory. Each section is one viewport. The voucher frame is `height: 100dvh`, `max-height: 100dvh`, `width: auto`, `max-width: 100%`, aspect `720 / 1280`, centered. On a short desktop window the sheet shrinks to the height and sits in rag margins. On a narrow phone it fills the width and stays inside the viewport.

Regions are percentages of that frame, taken from the approved 720×1280 sheet. Type inside the frame is `cqw`, so it scales with the sheet rather than with the device.

The next turn is a swipe down. Completed sheets are a swipe up. Indoor tools do not take a turn of their own.

### Named Rules

**The One Sheet Rule.** A turn shows its photograph, its ledger, and its actions without scrolling inside the sheet.

## Elevation & Depth

Depth is physical, not shadowed. The specimen sits on the rag, held by four tape strips, with the wax seal overlapping the print. Compartments are separated by hairline rules. Buttons press in (`translateY(1.5px)` and a slight scale) instead of lifting.

### Named Rules

**The Flat Ledger Rule.** The voucher does not use drop shadows to separate regions. A rule, a tape strip, or the seal does that work.

## Shapes

Corners are square except where an object is literally round. The satchel control is a full pill. The collect button is a 4px rectangle with a 3px inner frame. Rules, the forage box, and the specimen mount are square. The seal is a circle because it is a seal.

### Named Rules

**The Square Sheet Rule.** Do not round the voucher, the photograph, or the ledger boxes.

## Components

### Buttons

- **Shape:** Square with a slight corner (4px) for the collect action; a pill for the satchel.
- **Primary:** Wax vermilion field, 3px padding, inner rule in the inset pink, label in seal-paper, Petrona at `3.15cqw`, weight 600. Hover darkens to the pressed vermilion. Active state uses the archival press.
- **Secondary:** The satchel pill is rag-filled, hairline-bordered, uppercase Petrona.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Forage compartment is rag-card at partial opacity over the paper texture.
- **Shadow Strategy:** None on the voucher. See Elevation.
- **Border:** 1px ledger rule on all four sides of the forage box. Path rows are bottom rules only.
- **Internal Padding:** The frame gutter is 5% of the sheet. Marginal drawings sit in the left of the forage box and the path rows.

### Inputs / Fields

- **Style:** Square field, hairline border, warm paper fill, small Petrona.
- **Focus:** Vermilion outline, 2px, offset 2px, from the page focus rule.

### Navigation

The reel is the navigation. A centered swipe line with flanking hairlines sits at the foot of the sheet. The satchel pill opens the drawer. The drawer is the same rag and ink, with tabs for the bag, pressed vouchers, and the field lab.

### Voucher Sheet

The signature object. Full-bleed paper texture, header rules, sheet number, satchel pill, taped specimen with wax seal, species bar, folklore, forage box, two path rows, swipe foot. New turns copy this object. They do not invent a new chrome.

## Do's and Don'ts

### Do:

- **Do** keep each turn inside one `100dvh` frame at aspect 720/1280.
- **Do** tile the rag texture across the whole sheet, behind the rules.
- **Do** set species names in Cormorant Garamond at weight 500, and folklore in Petrona.
- **Do** draw marginal marks as filled botanical ink, in `{colors.botanical}`.

### Don't:

- **Don't** scroll inside a sheet to reach its actions.
- **Don't** put judge presets, model names, or species overrides on the outdoor sheet. They belong in the drawer.
- **Don't** introduce a second red. The collect control and the seal share one vermilion.
- **Don't** replace the paper, the tape, or the seal with a dark themed frame.
