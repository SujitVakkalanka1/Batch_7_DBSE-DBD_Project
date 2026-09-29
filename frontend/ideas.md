# Society Portal — Design Ground Truth

This project is a reference-driven reproduction of the supplied mobile apartment/society management UI. The provided visual direction overrides alternate exploration: a white residential header transitions into a near-black activity canvas, with electric lime widgets as the ownable accent. The interface is mobile-first, compact but breathable, and must scale into a centered app shell on desktop without losing the stacked mobile rhythm.

## Reference Spec

The top area is a warm white panel containing a resident/admin avatar, greeting, society name, compact chat and notification actions, and a rounded search field. Two rounded neon-lime highlight cards sit below the greeting, arranged side-by-side on mobile and allowed to become a wider two-column summary on desktop. The lower canvas is charcoal black with horizontally scrollable category chips, a dark announcement card with white copy, a small time badge, and a Read More action. A Quick Actions area uses restrained icon cards. A floating bottom navigation pill contains five touch-friendly icons and remains visually distinct from the dark canvas through glass blur, edge lighting, and shadow.

## Chosen Approach: Editorial Utility / Night Courtyard

### Design Movement
Contemporary editorial utility design, borrowing the calm hierarchy of Swiss information systems and the tactile material cues of a premium mobile banking interface. The result should feel like a trusted building noticeboard translated into a polished resident app.

### Core Principles
1. **Quiet top, energetic signal:** keep the white header calm and use lime only where action or status needs attention.
2. **Asymmetric rhythm:** align content to a readable left rail, offset summary widgets, and use intentional gaps rather than a uniform dashboard grid.
3. **Tactile clarity:** controls must look pressable with restrained borders, soft shadows, and visible active feedback.
4. **Role integrity:** Resident and Admin use the same visual language but never leak each other's data, labels, or actions.

### Color Philosophy
White is used as a social, welcoming surface for identity and search. Charcoal (#121212) is a quiet, high-contrast activity field that lets announcements and navigation feel focused at night. Electric lime (#CCFF00, branded as Courtyard Lime) communicates money, attention, and movement; it is reserved for high-value summary widgets, active states, and key action marks so it stays ownable rather than decorative.

### Layout Paradigm
A two-field composition: identity and discovery live in a white upper field, while operational content is anchored to a dark lower field. On mobile the dark field reads as a vertically scrolling canvas with floating navigation; on desktop it becomes a max-width app shell with a generous left content rail, a narrower right-side activity rail, and a bottom navigation dock that keeps the mobile reference's signature intact.

### Signature Elements
- Courtyard Lime summary widgets with a black circular arrow button.
- A thin lime rule and timestamp badge used as an editorial marker on announcements.
- A smoked-glass bottom navigation dock with one lime active icon tile.

### Interaction Philosophy
Every chip, button, card action, and navigation icon acknowledges the user's intent. Primary actions open a focused modal or update a visible state; utility actions provide a toast-like in-app response. Interactions are immediate, compact, and never rely on hover alone.

### Animation
Use 180–240ms ease-out transitions for button press, chip selection, and modal entry. Summary widgets lift by 2px on hover and compress to 0.97 on active. Dashboard sections cascade in with 40ms staggered opacity/translate entrances only when reduced motion is not requested. The navigation dock should ease between active states without layout jumps. Never animate layout dimensions; animate transform and opacity only.

### Typography System
Use **Space Grotesk** for display headlines, labels, numbers, and navigation; use **DM Sans** for supporting copy and long-form announcement text. Headline hierarchy is compact and weight-led: 12px uppercase eyebrow, 24–30px semibold section titles, 34–52px bold financial values, 14–15px body copy, and 11–12px metadata. Letter spacing is slightly expanded for uppercase utility labels and tight for large numeric values.

### Brand Essence
A calm, high-signal control center for apartment life — built for residents who want fewer follow-ups and administrators who need clearer operations. Personality: **attentive, lucid, grounded**.

### Brand Voice
Headlines are direct and warm, CTAs are specific, and microcopy sounds like a helpful building coordinator rather than a generic SaaS dashboard. Avoid filler such as “Welcome to our website.”

Example lines:
- “Your building, at a glance.”
- “One tap closer to a quieter evening.”

### Wordmark & Logo
The mark is a compact four-corner courtyard symbol: four rounded lime blocks create an open square with a charcoal center, suggesting apartments around a shared space. Use the mark without text in the UI and pair it with a custom spaced wordmark reading “COURTYARD” when a full brand lockup is needed.

### Signature Brand Color
**Courtyard Lime — #CCFF00.** It should be recognizable even when used as a small line, active navigation tile, or arrow button.

## File-level Reminder
Every CSS/component/page file should keep a short comment referencing the Editorial Utility / Night Courtyard system, Courtyard Lime, Space Grotesk + DM Sans, white-to-charcoal split, and role isolation.

## Style Decisions

- The gateway must show the actual Night Courtyard product system, including a miniature header, Courtyard Lime summary cards, a noticeboard marker, and dock rhythm before a user selects a role.
- Courtyard Lime is reserved for operational meaning: status, money, active navigation, priority, and action affordances; it is not used as an abstract decorative gradient.
- Architectural imagery remains atmospheric and secondary to the product UI surfaces and building-specific language.

Checkpoint note: the first verified build includes desktop and phone QA captures for the landing gateway, Resident view, and Admin view.
