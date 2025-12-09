---
layout: default
title: 'Accessibility in Interactive Fiction: Screen Readers'
description: >-
  What I learned about making text-based stories work with screen readers—and
  why it's not as simple as you'd think.
---
# Accessibility in Interactive Fiction: Screen Readers

You'd think text would be the most accessible form of media. If you can't see it, you can listen to it. If you can't hear it, you can read it. Text is the universal fallback, the thing we convert everything else into when accessibility matters.

So interactive fiction—a medium that's *literally* just text and choices—should be accessible by default, right?

I thought so too.

## The Horrible Noise

I should mention: my background is in backend systems programming. When I started building this template, I knew almost nothing about web development. I was learning as I went, figured things out through trial and error, and eventually got something that looked good and worked well on desktop and mobile. I was pretty happy with it.

Then one day I thought, "Hey, I should test this with a screen reader, just for fun."

It was *not* fun.

At first I couldn't even figure out how to use the screen reader. Turns out you're supposed to navigate with the keyboard, not the mouse. I didn't know that.

So I started pressing `Tab` to move through the interface, and immediately discovered my first problem: the menu buttons in the navigation bar? `Tab` skipped right over them. They didn't exist as far as keyboard navigation was concerned.

## The Impostor Buttons

The issue was that I'd built those menu buttons as styled `<a>` elements—they *looked* like buttons, but they weren't actually real `<button>` elements. (And they weren't even real links without an `href`, either!)

The browser had no idea they were interactive. A sighted mouse user would never notice, but for anyone navigating by keyboard, those controls simply weren't there.

```html
<!-- Before: invisible to keyboards -->
<a id="settings-btn" title="Settings">
    <span class="material-icons-outlined nav-icon">settings</span>
</a>

<!-- After: a real button! -->
<button id="settings-btn" type="button" aria-label="Settings">
    <span class="material-icons-outlined nav-icon" aria-hidden="true">settings</span>
</button>
```

Okay, easy fix. I made them real buttons, added proper `aria-label` attributes so screen readers would announce "Settings" instead of... nothing helpful at all. Problem solved!

Except no.

## Background Tabbing

Next I discovered that when I opened the settings modal, I could still `Tab` through the story text to the choices and navigation buttons *behind* the modal. The focus wasn't trapped inside the dialog. I was supposed to be navigating the settings menu, but instead I was wandering around the background content while this overlay sat there doing nothing useful.

So I learned about focus trapping—making sure that when a modal is open, keyboard focus stays inside it until you close it. Fixed that.

Now, surely, *now* it would work properly with a screen reader.

Nope. Better, definitely better, but still a mess.

First: no skip link. Every single time a screen reader user landed on the page, they'd have to `Tab` through the entire navigation bar—restart button, saves button, settings button—just to get to the actual story content. Sighted users can just glance past the nav, but keyboard users have to traverse it manually. The fix is a tiny invisible "Skip to content" link just for screen readers and keyboard users.

```html
<a href="#main-content" class="skip-link">Skip to story content</a>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
}
```

It's one of those things that seems minor until you realize someone has to sit through your entire menu on every single page.

## Choices, Choices

Then there were choices. Choices are the whole point of interactive fiction, and I'd given them no thought whatsoever from an accessibility perspective. After all, they're just links, right?

Yup. A screen reader user would hear a list of links with no context that these were, in fact, *choices*, no indication of how many options existed, no sense that this was a decision point in a story rather than a navigation menu.

Choices in IF carry more weight than regular links—they're often irreversible, they shape the narrative—and that context was completely missing. All they were missing was a tiny label to describe them: `aria-roledescription="choice"`. Done!

And then came... the tone indicators.

## "local_fire_department Greet Them With a Smirk"

One of the features I'd added recently were tone indicators—little icons next to choices that hint at the emotional flavor of a response. Pretty common in IF. A fire emoji for flirty, a heart for romance, a warning icon for risky choices, that kind of thing. Visually, they worked great. Little icons, nice and subtle, helpful for readers who wanted the extra context and writers who wanted to provide it.

With a screen reader? Absolute chaos.

The screen reader would just announce the icon name. So instead of hearing "choice: Greet them with a smirk," a user would hear "choice: local_fire_department Greet them with a smirk." That's the Material Icons name for [a fire symbol](https://materialui.co/icon/local-fire-department), by the way.

Completely meaningless. Totally immersion-breaking. If you used emoji instead of Material Icons, it wasn't much better—"choice: fire emoji Greet them with a smirk" is not *that* much of an improvement.

The fix was to hide the visual icon from screen readers entirely (`aria-hidden="true"`) and provide a separate text label that only screen readers can see (using the common `.sr-only` CSS pattern).

```html
<a href="#" role="button" aria-roledescription="choice">
    <span class="tone-indicator-leading" aria-hidden="true">
        <span class="material-icons tone-icon">local_fire_department</span>
    </span>
    <span class="choice-key-hint">1.</span> Wink and smile
    <span class="sr-only"> (flirty)</span>
</a>
```

Now instead of "local_fire_department", users hear "flirty." It's not perfect, but at least it communicates something useful.

## A Lot of Little Thoughts

This is when I started to realize: accessibility is just a lot of little thoughts. Not one big thing you bolt on at the end, but dozens of small considerations—each one pretty simple on its own.

The long winding journey I just described—buttons that weren't buttons, focus escaping modals, missing skip links, choices without context, icons announcing gibberish—each fix was pretty simple once I heard the problem. The hard part was knowing to listen for it.

## TL;DR for the Next Person Making an IF Template

If you're building something similar and want to skip the part where you turn on a screen reader out of the blue one day and despair, here's what I wish I'd known from the start:

- **Use real HTML elements.** A `<button>` is a button. A `<nav>` is navigation. Don't make clickable `<div>`s or `<span>`s and expect the browser to figure it out.
- **Pay attention to keyboard navigation** and focus trap in modals. When a dialog opens, `Tab` should cycle through its contents, not wander off into the background.
- **Add a skip link.** One hidden link that jumps past your nav. It's like five lines of HTML and CSS combined.
- **Mark dynamic content.** When new content appears, add `aria-live="polite"` to the container so screen readers notice.
- **Hide decorative icons.** Slap `aria-hidden="true"` on anything visual-only. Provide `.sr-only` text labels for icons that convey meaning.
- **Think about choices as choices.** They're not just links. Give them some context.

That's basically it. It's HTML and CSS. There's no magic, no framework, no complicated tooling. Just clean markup and a few invisible elements for screen readers to latch onto.

The journey to figure all this out was long and circuitous. But the actual implementation? Not that bad. If I can stumble through it with no web development background, you can probably do it too.

---

One last thing: I'm not a screen reader user myself—that much is clear if you got to this point. I learned all this through testing and reading documentation, not lived experience. If you do use a screen reader regularly and if you try [this template](https://remy-vim.itch.io/ink-template) and something's annoying or broken or just weird—please let me know. Now that I've got my bearings with how this stuff works, I can probably fix it.

[Open an issue](https://github.com/RemyVim/ink-if-story-template/issues) or reach out however works for you.

---

If you want to learn more about web accessibility:

- Turn on your system's screen reader (VoiceOver on Mac, Narrator on Windows, Orca on Linux) and try navigating some websites. It's eye-opening.
- [WebAIM](https://webaim.org/) has excellent practical guides.
- The [A11y Project checklist](https://www.a11yproject.com/checklist/) is a good starting point for auditing your own work.
