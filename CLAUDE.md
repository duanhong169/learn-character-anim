# Project Instructions

> React Three Fiber + TypeScript + Tailwind CSS project template for 3D applications.

## Tech Stack

- **3D Engine**: Three.js + React Three Fiber (R3F) + Drei helpers
- **Framework**: React 19+ with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 — for HTML overlay UI only; wired via `@tailwindcss/vite` in `vite.config.ts` (no plugin = utility classes silently won't compile)
- **State**: Zustand — global state, especially for Canvas↔UI communication
- **Build**: Vite
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **Dev Tools**: Leva (parameter GUI) + r3f-perf (performance monitor)

## File & Folder Structure

```
src/
├── components/
│   ├── canvas/           # 3D components (rendered inside <Canvas>)
│   │   ├── Scene/        # Main scene setup (lights, env, controls)
│   │   └── InteractiveBox/
│   └── ui/               # HTML overlay components
│       └── Overlay/
├── hooks/                # Shared custom hooks
├── store/                # Zustand stores
├── utils/                # Pure utility functions
├── types/                # Shared TypeScript types/interfaces
├── lib/                  # Third-party wrappers & configs
├── constants/            # App-wide constants
├── App.tsx               # Canvas + Overlay composition
└── main.tsx              # Entry point
```

Rules:
- **Canvas/UI separation**: `components/canvas/` = R3F components (mesh, group, light), `components/ui/` = HTML/Tailwind overlay components. Never mix them.
- One component per file
- Colocate component + test in a folder when non-trivial
- Use barrel exports (`index.ts`) for public APIs

## Canvas / UI Separation — Critical Rule

This is the most important architectural constraint:

- `components/canvas/` — **Only** R3F/Three.js elements. These render inside `<Canvas>` and must never use DOM elements (`div`, `button`, etc.)
- `components/ui/` — **Only** HTML/Tailwind components. These render as overlay on top of Canvas. Use `pointer-events-none` on the container, `pointer-events-auto` on interactive elements.
- Communication between Canvas and UI goes through **Zustand stores** — never through React context or prop drilling across the Canvas boundary.

## Naming Conventions

| Thing              | Convention           | Example                         |
|--------------------|----------------------|---------------------------------|
| Component files    | PascalCase           | `SpinningCube.tsx`              |
| Component names    | PascalCase           | `export function SpinningCube()`|
| Hook files         | camelCase            | `useOrbitAnimation.ts`          |
| Hook names         | `use` prefix         | `useOrbitAnimation`             |
| Store files        | camelCase            | `useAppStore.ts`                |
| Store hooks        | `use...Store`        | `useAppStore`                   |
| Utility files      | camelCase            | `math.ts`                       |
| Utility functions  | camelCase            | `lerp()`, `clamp()`            |
| Constants          | UPPER_SNAKE_CASE     | `DEFAULT_CAMERA_POSITION`       |
| Types/Interfaces   | PascalCase           | `Tuple3`, `SceneConfig`         |
| Type files         | camelCase            | `common.ts`                     |
| Boolean vars       | `is/has/should`      | `isSelected`, `hasLoaded`       |
| Event handlers     | `handle` prefix      | `handleClick`, `handlePointerOver` |
| Props callbacks    | `on` prefix          | `onClick`, `onSelect`           |
| 3D position props  | `Tuple3` type        | `position?: [number, number, number]` |
| Test files         | `.test.tsx`          | `InteractiveBox.test.tsx`       |

## TypeScript Patterns

- Enable `strict: true` — never turn it off
- Prefer `interface` for component props, `type` for unions/intersections
- Export prop interfaces: `export interface BoxProps { ... }`
- Avoid `any` — use `unknown` and narrow
- Use `Tuple3` (`[number, number, number]`) for position/rotation/scale props
- Import Three.js types with `import type`: `import type { Mesh, Group } from 'three'`

## 3D Component Structure

Every canvas component should follow this order:

```tsx
// 1. React/R3F imports
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

// 2. Three.js type imports
import type { Mesh } from 'three';

// 3. Internal imports
import { useAppStore } from '@/store/useAppStore';

// 4. Props interface
export interface SpinningBoxProps {
  position?: [number, number, number];
  color?: string;
  speed?: number;
}

// 5. Component (named export, function declaration)
export function SpinningBox({ position = [0, 0, 0], color = '#ff6b35', speed = 1 }: SpinningBoxProps) {
  // 5a. Refs
  const meshRef = useRef<Mesh>(null);

  // 5b. State & store
  const [hovered, setHovered] = useState(false);

  // 5c. Frame loop (mutation only, no setState!)
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * speed;
  });

  // 5d. Event handlers
  const handleClick = () => { /* ... */ };

  // 5e. Return JSX (Three.js elements)
  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

Rules:
- **Named exports only** — no `export default`
- Function declarations for components
- `useFrame` callback: mutate refs only, **never call setState** (causes re-render every frame)
- Read Zustand state in useFrame via `useAppStore.getState()` (non-reactive)
- Keep components < 150 lines; extract sub-components or hooks if longer

## Performance Rules

### useFrame (60fps render loop)
- **DO**: Mutate refs (`meshRef.current.rotation.y += delta`)
- **DO**: Read store with `useAppStore.getState().someValue`
- **DON'T**: Call `setState`, `set()`, or any function that triggers React re-render
- **DON'T**: Create new objects (vectors, matrices) — reuse via refs or module-level variables

### ESLint react-hooks 7.x gotchas (strict — `--max-warnings 0`)
- `react-hooks/immutability`: never mutate a value from `useState`/`useMemo`, nor any value listed in a hook's dep array. To mutate a stable singleton inside an effect/`useFrame`, fetch it *inside* the callback (e.g. `getThing()`), not via deps.
- `react-hooks/refs`: never read/write `ref.current` during render — only in effects/handlers.
- For objects mutated every frame (geometry, temp vectors), prefer module-level consts over `useState`/`useMemo`/`useRef`.
- `strict` + `noUncheckedIndexedAccess`: array/tuple access is `T | undefined` — guard or assert (`arr[i]!`).

### Geometry & Material
- Reuse geometries/materials with `useMemo` when shared across components
- Use Drei prebuilt components (`<RoundedBox>`, `<Sphere>`, etc.) when available
- For 100+ identical objects, use `<Instances>` from Drei

### Loading
- Wrap model/texture loading in `<Suspense>`
- Use `useGLTF.preload('/models/xxx.glb')` for critical models
- Dispose resources in cleanup: `useEffect(() => () => geometry.dispose(), [])`

## Import Order

Group and sort imports in this order (separated by blank lines):

```ts
// 1. React / R3F
import { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

// 2. Third-party libraries
import { useControls } from 'leva';
import { create } from 'zustand';

// 3. Internal aliases (@/ paths)
import { useAppStore } from '@/store/useAppStore';
import { lerp } from '@/utils/math';

// 4. Relative imports
import { SubComponent } from './SubComponent';

// 5. Type-only imports (at end of each group)
import type { Mesh, Group } from 'three';
import type { Tuple3 } from '@/types/common';
```

## Zustand Store Patterns

```ts
import { create } from 'zustand';

interface SceneState {
  // State
  selectedId: string | null;
  isPlaying: boolean;

  // Actions
  select: (id: string | null) => void;
  togglePlay: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  selectedId: null,
  isPlaying: true,
  select: (id) => set({ selectedId: id }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
}));
```

Usage:
- **In UI components** (reactive): `const selected = useSceneStore((s) => s.selectedId)`
- **In useFrame** (non-reactive): `const selected = useSceneStore.getState().selectedId`
- **Always use selectors** — never `useSceneStore()` without a selector (causes full re-render on any change)

## UI Overlay Guidelines

- Overlay container: `fixed inset-0 pointer-events-none z-10`
- Interactive elements: add `pointer-events-auto` individually
- Use Tailwind for all styling — same design tokens as React template
- Glass-morphism style: `bg-black/60 backdrop-blur-sm border border-white/10 rounded-md`
- Text on 3D backgrounds: always use `drop-shadow-md` or dark overlay for readability

## Tailwind CSS Guidelines

- **No inline styles** — use Tailwind classes for HTML overlay components
- **Use `cn()` utility** for conditional classes
- **Design tokens**: use CSS variables, don't use arbitrary values
- **Dark mode**: use `dark:` variant
- Only applies to `components/ui/` — canvas components don't use Tailwind

## Leva Debug Controls

- Use `useControls('GroupName', { ... })` to group related parameters
- Place controls close to the component that uses them
- Common patterns:
  ```ts
  const { speed, visible } = useControls('Animation', {
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    visible: true,
  });
  ```
- Leva panel auto-renders in the DOM — no setup needed

## Markdown & Code Block Rendering

**Critical rule**: The moment a feature involves rendering Markdown, a `<pre><code>` block, a snippet viewer, a chat/LLM message area, a docs page, or any surface that displays source code — syntax highlighting MUST be wired up in the same change. Never ship "plain `<pre>` now, highlight later". Unhighlighted code blocks are considered a bug.

### When this rule triggers
- Any component that renders user-authored or LLM-authored Markdown (e.g. chat bubbles, AI response panels, doc viewers).
- Any component that renders code verbatim (tutorial steps, config previews, error stack traces, diff views).
- Any `dangerouslySetInnerHTML` or `ReactMarkdown` that could receive ```` ``` ```` fences.

### Default stack (pick one, don't mix)

1. **Preferred — Shiki (via `react-shiki` or `shiki` + `rehype-shiki`)**
   - Best fidelity (VS Code TextMate grammars), SSR-friendly, themeable (`github-dark` / `github-light`).
   - Install: `npm i react-markdown remark-gfm rehype-shiki shiki`
   - Use with `react-markdown`:
     ```tsx
     import ReactMarkdown from 'react-markdown';
     import remarkGfm from 'remark-gfm';
     import rehypeShiki from '@shikijs/rehype';

     <ReactMarkdown
       remarkPlugins={[remarkGfm]}
       rehypePlugins={[[rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]]}
     >
       {markdown}
     </ReactMarkdown>
     ```

2. **Lightweight alternative — highlight.js (via `rehype-highlight`)**
   - Use only when bundle size is critical or Shiki's async load is unacceptable.
   - Install: `npm i react-markdown remark-gfm rehype-highlight highlight.js`
   - Import a theme CSS once at app root: `import 'highlight.js/styles/github-dark.css'`.

### Implementation checklist (must all be true before merging)
- [ ] A highlighter is installed and wired into the Markdown/code-rendering component.
- [ ] A theme (light and/or dark) is loaded — verify with a `js`, `ts`, `tsx`, `bash`, `json` sample.
- [ ] Fenced blocks without a language (```` ``` ````) still render with monospace + background, not as naked text.
- [ ] Inline code (`` `foo` ``) is styled (padded, tinted background) — separate from block styling.
- [ ] Long lines wrap or scroll horizontally (`overflow-x-auto`), never break layout.
- [ ] Dark mode variant matches the app's `dark:` theme.
- [ ] A "copy code" button is considered for block-level code in chat/doc contexts.

### Canvas/UI boundary
- Markdown and code blocks are **HTML overlay** concerns — they live in `components/ui/` only.
- Never attempt to render code inside `<Canvas>`; use Drei's `<Html>` if absolutely required, and even then keep the Markdown component in `components/ui/`.

### Testing
- Snapshot test a Markdown component with at least one fenced ` ```tsx ` block and assert the highlighted token spans (e.g. `.hljs-keyword` or Shiki's inline `style` colors) are present in the output. A snapshot with plain `<code>` text is a regression.

## Asset Management

- **3D Models**: `public/models/` — use `.glb` format (smaller than `.gltf`)
- **Textures**: `public/textures/`
- **Load models**: `const { scene } = useGLTF('/models/myModel.glb')`
- **Preload**: `useGLTF.preload('/models/myModel.glb')` at module level
- **HDRI environments**: use Drei's `<Environment preset="..." />` instead of custom HDRI files

## Error Handling

- **Model loading**: wrap in `<Suspense>` with appropriate fallback
- **WebGL context**: handle context loss gracefully
- **Async operations**: try/catch with user-friendly messages in UI overlay
- Pattern:
  ```ts
  try {
    const data = await fetchData(id);
    setState({ status: 'success', data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    setState({ status: 'error', error: message });
  }
  ```

## Git Workflow

### Commit Messages (Conventional Commits)

```
feat: add orbit animation to planet model
fix: resolve z-fighting on ground plane
refactor: extract camera controls into hook
chore: upgrade three.js to r175
```

- Subject line: imperative mood, lowercase, < 72 chars, no period
- Body (optional): explain *why*, not *what*

## Testing Guidelines

- Canvas components: smoke test with `<Canvas>` wrapper
- UI components: test with React Testing Library as usual
- Utility functions: pure unit tests
- Name tests descriptively: `it('bounces when clicked')`
- Arrange-Act-Assert pattern

## Comment Guidelines

- **Don't comment what** — the code should be self-explanatory
- **Do comment why** — explain non-obvious decisions, workarounds
- **TODO format**: `// TODO: description`
- No commented-out code in commits
