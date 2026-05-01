# Onyx — Explain Like I'm 5

This file helps you give a friendly presentation about the Onyx project. First we'll explain it like you're 5, then we'll show the grown-up technical parts, trade-offs, and a short demo script.

---

## 1) Explain it to a 5-year-old

- Imagine a friendly toy that helps you take care of your body — it remembers what you ate, when you slept, and the games (exercises) you played.
- The app is like that toy: you tell it about your food, sleep, and workouts, and it keeps everything in little boxes so you can look later.
- There are small parts (like toy blocks): one block checks your size and weight (`BMICalculator`), one counts food (`CalorieTracker`), one helps plan meals (`MealPlanner`), and one shows everything on a board (`Dashboard`).
- When you press buttons, the toy updates its boxes and shows pretty cards and buttons so it’s easy to use.

---

## 2) Simple analogy for the audience

- App = toyhouse.
- Rooms = pages (Dashboard, Sleep, Workout).
- Toys in each room = components (BMICalculator, MealPlanner).
- Notebook the toy uses to remember things = local storage (a small memory inside your browser).

---

## 3) Where the important parts live (quick links)

- Main app folder: [app/](app)
- Example components: [app/components/BMICalculator.tsx](app/components/BMICalculator.tsx#L1), [app/components/CalorieTracker.tsx](app/components/CalorieTracker.tsx#L1), [app/components/Dashboard.tsx](app/components/Dashboard.tsx#L1)
- Layout and entry: [app/layout.tsx](app/layout.tsx#L1), [app/page.tsx](app/page.tsx#L1)
- Shared UI helpers: [components/ui](components/ui)
- Local storage helper: [lib/local-storage.ts](lib/local-storage.ts#L1)
- External AI/service helper (if used): [services/geminiService.ts](services/geminiService.ts#L1)

---

## 4) High-level architecture (short & simple)

- Built with Next.js (app router) and React components.
- Organized by pages (`app/`) and small reusable pieces (`components/` and `components/ui/`).
- State and small data saved on the browser using `lib/local-storage.ts` (so data stays on your computer unless you choose otherwise).
- Optional service calls (e.g., `geminiService`) for advanced features like AI suggestions.

Visual: User -> UI components -> local storage / service -> Dashboard

---

## 5) Logic flow (what happens when you use it)

1. You open the app (Dashboard page shows up).
2. You click or type (e.g., add a meal or weight).
3. The component (like `CalorieTracker`) updates its local state.
4. The app saves the data to local storage (`lib/local-storage.ts`).
5. The Dashboard reads saved data and shows updated cards and charts.

---

## 6) Trade-offs and why things were chosen (grown-up friendly)

- Client-side storage (local storage):
  - Pros: Simple, private (data stays in the browser), no server needed.
  - Cons: Data is tied to one device/browser and can be lost if the user clears it.

- Next.js + app router:
  - Pros: Modern structure, good for mixing server and client code, routing is simple.
  - Cons: Slight learning curve; mixing server/client rendering must be managed carefully.

- Small reusable UI components:
  - Pros: Easier testing, consistent look and reuse across pages.
  - Cons: More files to manage and document; can be over-abstracted if not careful.

- Optional external AI/service (`geminiService`):
  - Pros: Adds helpful suggestions (e.g., meal ideas), can enhance UX.
  - Cons: Requires network, adds privacy and cost considerations.

---

## 7) Architecture decisions — short reasons

- Keep user data local by default: easier privacy and faster local feedback.
- Use small components (`components/ui/*`) for consistent visuals and to make slides/demos predictable.
- Use a service layer (`services/`) to isolate network or AI calls so UI code remains simple.

---

## 8) Presentation structure / speaker notes (2–3 minute demo)

- Slide 1 (30s): What it is — "A friendly toy that helps track health" + quick demo promise.
- Slide 2 (30s): Show Dashboard and one interaction — add weight or log a meal.
  - Talking point: "See how I type and the numbers appear instantly?"
- Slide 3 (30s): Show BMICalculator: explain simply what BMI means (size vs weight).
- Slide 4 (30s): Quick architecture: "Lots of small building blocks (components) make the app." Show file links.
- Slide 5 (30s): Trade-offs: local storage vs server, privacy, and demo idea using AI (optional).
- Closing (10s): Invite questions and offer to show the code files.

Demo script example (live):
1. Open the Dashboard.
2. Click "Add Meal" and enter 1 snack.
3. Show the Dashboard updating immediately.
4. Open `BMICalculator` and show how changing height/weight updates BMI.

---

## 9) Quick Q&A cheat-sheet (answers to likely questions)

- Q: "Where is my data stored?"
  - A: In your browser (local storage). If you switch browsers or devices it won’t be there unless synced.
- Q: "Can it do AI suggestions?"
  - A: There is a service helper that can call an AI, but it’s optional (network + cost).
- Q: "How do I add a new page?"
  - A: Create a file in `app/` (Next.js app router) and add components from `components/`.

---

## 10) Quick code pointers for the presenter (where to look live)

- UI entry and layout: [app/layout.tsx](app/layout.tsx#L1)
- Dashboard page: [app/dashboard/page.tsx](app/dashboard/page.tsx#L1) (or [app/page.tsx](app/page.tsx#L1))
- Small widget example: [app/components/BMICalculator.tsx](app/components/BMICalculator.tsx#L1)
- Storage helper: [lib/local-storage.ts](lib/local-storage.ts#L1)
- Service helper: [services/geminiService.ts](services/geminiService.ts#L1)

---

## 11) Closing — one-liner to finish your slide

"Onyx is a small, friendly health helper made of simple building blocks — easy to show, tweak, and explain." 

---

## Next steps I can do for you

- Turn this into slides (PowerPoint or PDF).
- Make a one-page printable speaker notes.
- Expand a code walkthrough (e.g., annotate `BMICalculator`).

