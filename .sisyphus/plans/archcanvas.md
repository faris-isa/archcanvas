# ArchCanvas — Intent-Driven Data Pipeline Architect

## TL;DR

> **Quick Summary**: Build ArchCanvas — a React Flow canvas tool where users drag agnostic pipeline nodes, set intent properties, and get AI-recommended transport protocols via Gemini. Vite+ monorepo (apps/web uses `vp` toolchain + Vitest, apps/api uses Bun + `vp test run`), SQLite persistence, TDD throughout.
>
> **Deliverables**:
> - Monorepo scaffold (Vite+ workspace with apps/web and apps/api)
> - React Flow drag-and-drop canvas with 3 node categories (7-8 node types)
> - Intent property editing per node (4 properties: throughput-rate, environment, latency-tolerance, network-reliability)
> - Hono API backend with Gemini integration + mock mode
> - AI protocol recommendation: batch-analyze all edges, return protocol + explanation per connection
> - SQLite persistence via Drizzle ORM — save/load pipeline designs (Excalidraw-like UX)
> - Dark tech-industrial UI theme
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Task 1 → Task 5 → Task 4 → Task 7 → Task 10 → Task 13 → Task 15 → Task 16 → FINAL

---

## Context

### Original Request
Build ArchCanvas — an intent-driven data pipeline architecting tool. Users drag agnostic components (Factory Floor Sensor, High-Speed Sink, Stream Processor) onto a canvas, define intent properties (throughput-rate, environment, latency-tolerance, network-reliability), and AI (Gemini) automatically recommends the optimal transport protocol (MQTT, OPC UA, Kafka, gRPC) for each connection with an engineering explanation.

### Interview Summary
**Key Discussions**:
- **MVP Scope**: Core pipeline first — canvas + AI recommendation on all connections. Not full production.
- **Persistence**: SQLite via Drizzle ORM — Excalidraw-like save/load. Sidebar list + save button UX.
- **AI Output**: Protocol name + engineering explanation per edge. Batch analysis (all edges at once).
- **Mock Mode**: Fallback Gemini service for dev without API key.
- **Testing**: TDD (red-green-refactor) for every feature.
- **UI**: Dark tech-industrial aesthetic designed by agent from description.

**Research Findings**:
- **React Flow v12**: Use `@xyflow/react`. Key patterns: Zustand store with `applyNodeChanges`/`applyEdgeChanges`. Drag-and-drop uses `onDragStart` + `onDrop` + `screenToFlowPosition`. Edge data mutation does NOT trigger re-render — must create new objects.
- **Hono**: Node.js server via `@hono/node-server`. Middleware stack (cors, logger, bodyLimit). Error handling via `HTTPException`.
- **Gemini**: `@google/genai` SDK with API key auth. Structured output via `responseMimeType: 'application/json'` + `responseSchema`. Only certain models support structured output — use `gemini-2.0-flash` or `gemini-1.5-pro`.
- **SQLite + Drizzle**: No native JSON column type — use TEXT columns with manual JSON serialization for canvas state.
- **VitePlus**: React TypeScript scaffolding with Vite proxy support.

### Metis Review
**Identified Gaps** (addressed):
- **Batch vs per-edge analysis**: Decided — batch analysis (one API call for all edges). Simpler UX and fewer API calls.
- **Stale recommendation handling**: When intent properties change after analysis, mark recommendations as "stale" with visual indicator.
- **Initial canvas state**: Empty canvas, no template.
- **Connection validation**: Basic — source handle to target handle only.
- **Mock service behavior**: Returns realistic hardcoded recommendations with engineering explanations for known node type pairs.
- **Edge data immutability**: React Flow requires creating new edge objects (not mutating) to trigger re-renders. Plan must enforce this.
- **Gemini model availability**: Use `gemini-2.0-flash` as default (supports structured output, fast, cost-effective). Fallback to `gemini-1.5-pro`.
- **Viewport persistence**: Must use `reactFlowInstance.toObject()` to capture viewport/zoom state on save.

---

## Work Objectives

### Core Objective
Build a working MVP of ArchCanvas: a canvas-based tool where data engineers drag generic pipeline nodes, configure intent properties, connect them, and get AI-recommended transport protocols — all persisted to SQLite.

### Concrete Deliverables
- `apps/web/` — Vite+ React frontend with React Flow canvas, sidebar, node library, property panel
- `apps/api/` — Hono backend with Gemini integration, mock service, and Drizzle ORM persistence
- `packages/shared/` — Shared types between frontend and backend
- SQLite database with `pipelines` table storing canvas state as JSON text
- Working end-to-end flow: drag → connect → set properties → analyze → see recommendations → save

### Definition of Done
- [x] User can drag nodes from sidebar onto canvas
- [x] User can set 4 intent properties per node
- [x] User can connect nodes with edges
- [x] User can click "Analyze" and see AI-recommended protocols per edge
- [x] Mock mode works without Gemini API key
- [x] User can save/load pipeline designs via sidebar
- [ ] All tests pass (`vp test` in both apps)
- [x] Dark tech-industrial UI theme applied throughout

### Must Have
- React Flow drag-and-drop from sidebar to canvas
- Custom IntentNode with 4 editable properties
- Edge labels showing recommended protocol after analysis
- Batch analysis (all edges at once) via Hono → Gemini
- Mock service fallback when no API key provided
- SQLite save/load via Drizzle ORM
- Vite proxy to Hono (no CORS)
- Dark theme throughout
- TDD — every feature has tests

### Must NOT Have (Guardrails)
- NO auto-re-analysis on property change (stale indicator only — re-analysis is explicit button click)
- NO shared types package in `/packages/shared/` unless types are genuinely duplicated across apps (use inline types in each app first)
- NO user authentication or authorization
- NO multi-user collaboration features
- NO deployment infrastructure (Docker, CI/CD, cloud config)
- NO Gemini API key hardcoded in source (env vars only)
- NO mutation of React Flow edge data directly — always create new objects
- NO `as any` or `@ts-ignore` without explicit justification comment
- NO excessive comments or AI-generated documentation boilerplate

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield — scaffold from scratch)
- **Automated tests**: TDD (red-green-refactor)
- **Framework**: **Vitest via `vp test`** for both frontend and backend (Vite+ unified toolchain)
- **Configuration**: Both `apps/web/vite.config.ts` and `apps/api/vite.config.ts` have `test` blocks
- **Running tests**: `vp test run` from each app, or `vp run -r test` from root for all
- **TDD flow**: Each task follows RED (write failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Integration**: Use Bash — Start both servers, test end-to-end flows

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1a (Start Immediately — foundation):
├── Task 1: Monorepo scaffold + dev tooling [quick]
├── Task 2: Hono API skeleton + health endpoint [quick]  (after Task 1)
├── Task 3: Drizzle ORM setup + migrations + pipeline schema [quick]  (after Task 1)
└── Task 5: Shared types package for API contracts [quick]  (after Task 1)

Wave 1b (After Wave 1a — types available):
└── Task 4: Zustand canvas store + types [quick]  (after Tasks 1, 5)

Wave 2 (After Wave 1 — core features, MAX PARALLEL):
├── Task 6: React Flow canvas + drag-and-drop from sidebar [visual-engineering]
├── Task 7: IntentNode custom component + property editing [visual-engineering]
├── Task 8: Hono pipeline CRUD endpoints [unspecified-high]
├── Task 9: Gemini service + mock service [deep]
└── Task 10: /api/analyze-architecture endpoint [unspecified-high]

Wave 3 (After Wave 2 — integration + persistence + theme):
├── Task 11: Edge protocol labels + analysis trigger UI [visual-engineering]
├── Task 12: Save/Load pipeline UX (sidebar list + save button) [visual-engineering]
├── Task 13: Frontend API client + integration [unspecified-high]
└── Task 14: Dark tech-industrial theme [visual-engineering]

Wave 4 (After Wave 3 — end-to-end integration + polish):
├── Task 15: End-to-end flow: drag → connect → analyze → save [unspecified-high]
└── Task 16: Stale recommendation indicators + edge cases [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 2, 3, 4, 5 |
| 2 | 1 | 8, 9, 10 |
| 3 | 1 | 8 |
| 4 | 1, 5 | 6, 7, 11 |
| 5 | 1 | 4, 9, 10, 13 |
| 6 | 1, 4 | 11, 15 |
| 7 | 1, 4 | 11, 15 |
| 8 | 2, 3 | 12, 15 |
| 9 | 2, 5 | 10 |
| 10 | 2, 5, 9 | 11, 13, 15 |
| 11 | 6, 7, 10 | 15 |
| 12 | 8 | 15 |
| 13 | 5, 10 | 15 |
| 14 | — | 15 |
| 15 | 6, 7, 8, 10, 11, 12, 13 | 16 |
| 16 | 15 | FINAL |

### Agent Dispatch Summary

| Wave | Tasks | Profiles |
|------|-------|----------|
| 1a | 4 | T1 → `quick`, T2 → `quick`, T3 → `quick`, T5 → `quick` |
| 1b | 1 | T4 → `quick` |
| 2 | 5 | T6 → `visual-engineering`, T7 → `visual-engineering`, T8 → `unspecified-high`, T9 → `deep`, T10 → `unspecified-high` |
| 3 | 4 | T11 → `visual-engineering`, T12 → `visual-engineering`, T13 → `unspecified-high`, T14 → `visual-engineering` |
| 4 | 2 | T15 → `unspecified-high`, T16 → `unspecified-high` |
| FINAL | 4 | F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

- [x] 1. Monorepo scaffold + dev tooling

  **What to do**:
  - Initialize Vite+ monorepo structure with workspace config for `apps/*`
  - Scaffold `apps/web` with VitePlus React TypeScript template
  - Scaffold `apps/api` with Hono Node.js template
  - Install root dev dependencies: `typescript`
  - Install web dependencies: `@xyflow/react`, `zustand`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`
  - Install api dependencies: `@hono/node-server`, `@google/genai`, `drizzle-orm`, `better-sqlite3`, `drizzle-kit`
  - Configure `tailwind.config.ts` with dark theme base colors
  - Configure Vite proxy: `/api` → `http://localhost:3000`
  - Add root `package.json` scripts: `"dev": "vp run -r dev"`, `"test": "vp run -r test"`
  - Configure `test` block in both `apps/web/vite.config.ts` and `apps/api/vite.config.ts`
  - Ensure `vp install` and `vp run -r dev` both work from root

  **Must NOT do**:
  - NO shared types package yet (that's Task 5)
  - NO application code — only scaffold and config
  - NO `as any` or `@ts-ignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vite-plus`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundational — all other tasks depend on this)
  - **Parallel Group**: Wave 1
  - **Blocks**: 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  - User's plan Phase 0 commands — monorepo init, VitePlus scaffold, Hono scaffold, proxy config
  - Vite proxy: `https://vitejs.dev/config/server-options.html#server-proxy`
  - pnpm workspaces: `https://vite-plus.dev/guide/monorepo`

  **Acceptance Criteria**:
  - [ ] `vp install` succeeds from root with zero errors
  - [ ] `vp run -r dev` starts both web (port 5173) and api (port 3000) concurrently
  - [ ] `apps/web/vite.config.ts` contains proxy for `/api` → `http://localhost:3000`
  - [ ] Both apps have `vp test run` configured

  **QA Scenarios**:
  ```
  Scenario: Monorepo installs and starts
    Tool: Bash
    Preconditions: Fresh clone, Node.js and vp installed
    Steps:
      1. Run `vp install` from project root
      2. Assert exit code 0
      3. Run `vp run -r dev` from project root
      4. Wait 5 seconds
      5. Curl `http://localhost:5173` — assert 200
      6. Curl `http://localhost:3000/api/health` — assert 200
    Expected Result: Both servers start, both respond OK
    Failure Indicators: Exit code non-zero, servers fail to start
    Evidence: .sisyphus/evidence/task-1-monorepo-start.txt

  Scenario: Vite proxy forwards to Hono
    Tool: Bash
    Preconditions: Both servers running
    Steps:
      1. Curl `http://localhost:5173/api/health`
      2. Assert response status 200
    Expected Result: Vite proxy successfully forwards /api requests to Hono
    Failure Indicators: 404, 502, or CORS error on proxied request
    Evidence: .sisyphus/evidence/task-1-proxy-test.txt

  Scenario: Vitest (vp test) runs in both apps
    Tool: Bash
    Preconditions: Both apps scaffolded
    Steps:
      1. `cd apps/web && vp test run`
      2. Assert exit code 0 (no test files yet, but Vitest initializes)
      3. `cd apps/api && vp test run`
      4. Assert exit code 0
    Expected Result: Vitest initializes in both apps without errors
    Failure Indicators: Config errors, missing dependencies, Vitest not found
    Evidence: .sisyphus/evidence/task-1-vp-test.txt
  ```

  **Commit**: YES
  - Message: `feat(scaffold): initialize Vite+ monorepo with vp test and vp dev`
  - Files: Root config, `apps/web/`, `apps/api/`
  - Pre-commit: `vp install && vp test run`

---

- [x] 2. Hono API skeleton + health endpoint

  **What to do**:
  - TDD: Write test for `GET /api/health` returning `{ status: "ok", timestamp: "..." }`
  - Implement Hono app in `apps/api/src/app.ts` (separate from server entry)
  - Implement health endpoint in `apps/api/src/routes/health.ts`
  - Wire up in `apps/api/src/index.ts` (server entry with `@hono/node-server`)
  - Add CORS middleware, logger middleware, error handling middleware returning `{ error: string, status: number }`
  - Ensure `vp test run` (from apps/api) passes

  **Must NOT do**:
  - NO pipeline endpoints (Task 8), NO Gemini logic (Task 9), NO database logic (Task 3)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`backend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 3, 4, 5)
  - **Parallel Group**: Wave 1
  - **Blocks**: 8, 9, 10
  - **Blocked By**: 1

  **References**:
  - Hono Node.js setup: `https://hono.dev/docs/getting-started/node-api`
  - Hono middleware: `https://hono.dev/docs/guides/middleware`

  **Acceptance Criteria**:
  - [ ] `GET /api/health` returns `{ "status": "ok", "timestamp": "<ISO string>" }`
  - [ ] `vp test run` (from apps/api) passes
  - [ ] CORS and logger middleware configured
  - [ ] Error handler returns structured JSON for unhandled routes

  **QA Scenarios**:
  ```
  Scenario: Health endpoint responds correctly
    Tool: Bash (curl)
    Preconditions: API server running on port 3000
    Steps:
      1. `curl -s http://localhost:3000/api/health`
      2. Assert status 200, JSON contains "status": "ok"
    Expected Result: Health check returns valid JSON
    Evidence: .sisyphus/evidence/task-2-health-endpoint.txt

  Scenario: Error handling returns structured JSON
    Tool: Bash (curl)
    Preconditions: API server running
    Steps:
      1. `curl -s http://localhost:3000/api/nonexistent`
      2. Assert status 404, JSON contains "error" key
    Expected Result: 404 with structured error response
    Evidence: .sisyphus/evidence/task-2-error-handling.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add Hono skeleton with health endpoint`
  - Files: `apps/api/src/**`
  - Pre-commit: `cd apps/api && vp test run`

---

- [x] 3. Drizzle ORM setup + migrations + pipeline schema

  **What to do**:
  - TDD: Write tests for pipeline CRUD operations (create, read, list, delete)
  - Create `apps/api/src/db/schema.ts` with `pipelines` table: `id` (text, pk), `name` (text, not null), `canvas_state` (text, JSON-serialized), `created_at` (integer), `updated_at` (integer)
  - Create `apps/api/src/db/connection.ts` for SQLite via `better-sqlite3`
  - Create `apps/api/src/db/queries.ts` with typed CRUD functions
  - Configure `drizzle-kit` in `apps/api/drizzle.config.ts`
  - Use TEXT column for canvas_state with manual JSON.stringify/parse (no native SQLite JSON type)

  **Must NOT do**:
  - NO Hono routes for pipelines (Task 8), NO Gemini logic, NO shared types (Task 5)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`drizzle-orm`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 4, 5)
  - **Parallel Group**: Wave 1
  - **Blocks**: 8
  - **Blocked By**: 1

  **References**:
  - Drizzle ORM SQLite: `https://orm.drizzle.team/docs/get-started-sqlite`
  - Drizzle Kit: `https://orm.drizzle.team/docs/migrations`

  **Acceptance Criteria**:
  - [ ] `pipelines` table schema defined with all columns
  - [ ] `canvas_state` is TEXT column storing serialized JSON
  - [ ] `vp test run` (from apps/api) passes with CRUD tests
  - [ ] `vp drizzle-kit generate` creates migration files
  - [ ] `vp drizzle-kit push` applies schema to SQLite

  **QA Scenarios**:
  ```
  Scenario: Pipeline CRUD operations work
    Tool: Bash (vp test run)
    Steps:
      1. Run `vp test run` (from apps/api) — pipeline schema tests
      2. Assert create/read/delete all pass
      3. Verify canvas_state round-trips with JSON parse/stringify
    Expected Result: All CRUD operations pass their tests
    Evidence: .sisyphus/evidence/task-3-drizzle-crud.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add Drizzle ORM + pipeline schema + migrations`
  - Files: `apps/api/src/db/**`, `apps/api/drizzle.config.ts`
  - Pre-commit: `cd apps/api && vp test run`

---

- [x] 4. Zustand canvas store + types

  **What to do**:
  - TDD: Write tests for store actions — addNode, removeNode, updateNodeData, addEdge, removeEdge, onNodesChange, onEdgesChange, setAnalysisResults
  - Create `apps/web/src/store/useCanvasStore.ts` with Zustand store
  - Create `apps/web/src/types/canvas.ts` with types:
    - `IntentProperty`: `'throughput-rate' | 'environment' | 'latency-tolerance' | 'network-reliability'`
    - `IntentValues`: `{ 'throughput-rate': 'high'|'medium'|'low', 'environment': 'edge'|'cloud', 'latency-tolerance': 'low'|'medium'|'high', 'network-reliability': 'stable'|'unstable'|'volatile' }`
    - `ArchNodeData`: `{ label: string, category: string, intentProperties: IntentValues }`
    - `ArchEdgeData`: `{ recommendedProtocol?: string, engineeringExplanation?: string, isStale?: boolean }`
  - Use `applyNodeChanges`/`applyEdgeChanges` from React Flow for change handlers
  - Ensure NODE data updates create new object references (not mutations) for React Flow re-rendering

  **Must NOT do**:
  - NO React Flow canvas component (Task 6), NO custom nodes (Task 7), NO API calls (Task 13)
  - NO mutating objects directly — always create new references

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on shared types from Task 5)
  - **Parallel Group**: Wave 1b
  - **Blocks**: 6, 7, 11
  - **Blocked By**: 1, 5

  **References**:
  - React Flow v12 state management: `https://reactflow.dev/learn/customization/state-management`
  - Zustand docs: `https://zustand.docs.pmnd.rs/get-started/introduction`

  **Acceptance Criteria**:
  - [ ] All types defined in `apps/web/src/types/canvas.ts`
  - [ ] Store with all actions defined in `apps/web/src/store/useCanvasStore.ts`
  - [ ] `updateNodeData` creates new object (not mutation)
  - [ ] `setAnalysisResults` creates new edge objects
  - [ ] `onNodesChange`/`onEdgesChange` use React Flow's `applyNodeChanges`/`applyEdgeChanges`

  **QA Scenarios**:
  ```
  Scenario: Store actions modify state correctly
    Tool: Bash (vp test run)
    Steps:
      1. Run `vp test run` (from apps/web) — store tests
      2. Assert addNode/removeNode/updateNodeData work
      3. Assert immutability: new references after updates
    Expected Result: All store actions pass with correct state transitions
    Evidence: .sisyphus/evidence/task-4-store-actions.txt
  ```

  **Commit**: YES
  - Message: `feat(web): add Zustand canvas store + shared types`
  - Files: `apps/web/src/store/**`, `apps/web/src/types/**`
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 5. Shared types package for API contracts

  **What to do**:
  - Create `packages/shared/` with `package.json`, `tsconfig.json`
  - Create `packages/shared/src/types.ts` with shared API types:
    - `AnalyzeRequest`: `{ nodes: ArchNodeData[], edges: { source: string, target: string, sourceData: ArchNodeData, targetData: ArchNodeData }[] }`
    - `AnalyzeResponse`: `{ edges: { edgeId: string, recommendedProtocol: string, engineeringExplanation: string }[] }`
    - `PipelineSummary`: `{ id: string, name: string, createdAt: string, updatedAt: string }`
    - `PipelineDetail`: `{ id: string, name: string, canvasState: string, createdAt: string, updatedAt: string }`
  - Export via `packages/shared/src/index.ts`
  - Configure both apps to depend on `@archcanvas/shared` via workspace protocol

  **Must NOT do**:
  - NO business logic — types/interfaces only. NO React or Hono imports.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3, 4)
  - **Parallel Group**: Wave 1
  - **Blocks**: 4, 9, 10, 13
  - **Blocked By**: 1

  **References**:
  - pnpm workspace protocol: `https://vite-plus.dev/guide/monorepo`

  **Acceptance Criteria**:
  - [ ] Both apps can `import { AnalyzeRequest } from '@archcanvas/shared'`
  - [ ] `vp install` succeeds with workspace linking
  - [ ] TypeScript compilation succeeds in both apps

  **QA Scenarios**:
  ```
  Scenario: Shared types importable from both apps
    Tool: Bash
    Steps:
      1. `vp install` — assert success
      2. `tsc --noEmit` in both apps — assert zero errors
    Expected Result: Both apps compile with shared type imports
    Evidence: .sisyphus/evidence/task-5-shared-types.txt
  ```

  **Commit**: YES
  - Message: `feat(shared): add shared types package for API contracts`
  - Files: `packages/shared/**`, root workspace config update
  - Pre-commit: `vp install && vp build`

---

- [x] 6. React Flow canvas + drag-and-drop from sidebar

  **What to do**:
  - TDD: Write tests for drag-and-drop behavior
  - Create `apps/web/src/components/canvas/ArchFlow.tsx` — main canvas with `useCanvasStore` bound
  - Create `apps/web/src/components/sidebar/NodeLibrary.tsx` — 3 categories with 2-3 items each:
    - Edge Devices: "Factory Floor Sensor", "Edge Gateway", "PLC Controller"
    - Transport Layers: "Message Broker", "Stream Processor"
    - Storage/Sinks: "Time-Series DB", "Data Lake", "High-Speed Sink"
  - Create `apps/web/src/components/layout/AppLayout.tsx` — Sidebar (left) + Canvas (center) + Detail placeholder (right)
  - Create `apps/web/src/App.tsx` — wires ArchFlow + AppLayout
  - Implement `onDrop` using `screenToFlowPosition` and `addNode`
  - Implement `onDragOver` to prevent default

  **Must NOT do**:
  - NO custom node component (Task 7), NO analysis UI (Task 11), NO save/load (Task 12)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 7, 8, 9, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: 11, 15
  - **Blocked By**: 1, 4

  **References**:
  - React Flow drag-and-drop: `https://reactflow.dev/learn/drag-and-drop`
  - React Flow v12 API: `https://reactflow.dev/api-reference/react-flow`

  **Acceptance Criteria**:
  - [ ] ArchFlow renders canvas with store-bound nodes/edges
  - [ ] NodeLibrary displays 3 categories with 2-3 items each (7-8 total)
  - [ ] Dragging from sidebar to canvas adds a node
  - [ ] Store `onNodesChange`/`onEdgesChange` wired to React Flow handlers

  **QA Scenarios**:
  ```
  Scenario: Drag node from sidebar and drop on canvas
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:5173
      2. Assert sidebar shows "Edge Devices" category with "Factory Floor Sensor"
      3. Drag "Factory Floor Sensor" from sidebar to canvas at position (300, 200)
      4. Assert canvas shows 1 node with label "Factory Floor Sensor"
    Expected Result: Node appears on canvas at drop location
    Evidence: .sisyphus/evidence/task-6-drag-drop.png
  ```

  **Commit**: YES
  - Message: `feat(web): add React Flow canvas with drag-and-drop sidebar`
  - Files: `apps/web/src/components/canvas/**`, `sidebar/**`, `layout/**`
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 7. IntentNode custom component + property editing

  **What to do**:
  - TDD: Write tests for IntentNode rendering and property editing
  - Create `apps/web/src/components/nodes/IntentNode.tsx` — custom React Flow node with:
    - Label and category display
    - 4 intent property dropdowns: throughput-rate, environment, latency-tolerance, network-reliability
    - Collapsible property panel
    - Handle components for edge connections
  - Register `intentNode` in React Flow `nodeTypes`
  - Set default intent properties per category when adding nodes via store
  - Ensure property edits create new node data objects (not mutations)

  **Must NOT do**:
  - NO edge labels (Task 11), NO analysis (Task 13), NO `as any`

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 8, 9, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: 11, 15
  - **Blocked By**: 1, 4

  **References**:
  - React Flow custom nodes: `https://reactflow.dev/learn/customization/custom-nodes`

  **Acceptance Criteria**:
  - [ ] IntentNode renders with label, category, and 4 property dropdowns
  - [ ] Changing dropdown calls `updateNodeData` with new object
  - [ ] Default intent properties set per node category
  - [ ] Handle components present for edge connections

  **QA Scenarios**:
  ```
  Scenario: Edit intent properties on a node
    Tool: Playwright
    Steps:
      1. Drag "Factory Floor Sensor" onto canvas
      2. Click the node — assert 4 property dropdowns visible
      3. Change "throughput-rate" from "medium" to "high"
      4. Assert store updated and node re-renders
    Expected Result: Property changes update store and re-render
    Evidence: .sisyphus/evidence/task-7-property-edit.png
  ```

  **Commit**: YES
  - Message: `feat(web): add IntentNode custom component with property editing`
  - Files: `apps/web/src/components/nodes/**`
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 8. Hono pipeline CRUD endpoints

  **What to do**:
  - TDD: Write tests for all pipeline endpoints
  - Create `apps/api/src/routes/pipelines.ts` with Hono router:
    - `GET /api/pipelines` — list all (returns `PipelineSummary[]`)
    - `GET /api/pipelines/:id` — get single (returns `PipelineDetail`)
    - `POST /api/pipelines` — create (body: `{ name, canvasState }`)
    - `PUT /api/pipelines/:id` — update
    - `DELETE /api/pipelines/:id` — delete
  - Use `@archcanvas/shared` types and `apps/api/src/db/queries.ts`
  - Auto-update `updated_at` on PUT

  **Must NOT do**:
  - NO analysis endpoints (Task 10), NO frontend integration (Task 13)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`backend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 9, 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: 12, 15
  - **Blocked By**: 2, 3

  **References**:
  - Hono routing: `https://hono.dev/docs/api/routing`

  **Acceptance Criteria**:
  - [ ] All 5 CRUD endpoints return correct status codes
  - [ ] `POST` returns 201 with generated ID
  - [ ] `GET` missing ID returns 404
  - [ ] `POST` with invalid body returns 400
  - [ ] `vp test run` (from apps/api) passes

  **QA Scenarios**:
  ```
  Scenario: Full pipeline CRUD cycle
    Tool: Bash (curl)
    Steps:
      1. POST create pipeline → assert 201 with ID
      2. GET pipelines list → assert includes created pipeline
      3. GET pipeline by ID → assert full detail
      4. PUT update name → assert 200
      5. DELETE → assert 204
      6. GET by deleted ID → assert 404
    Expected Result: Full CRUD cycle works
    Evidence: .sisyphus/evidence/task-8-pipeline-crud.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add pipeline CRUD endpoints`
  - Files: `apps/api/src/routes/pipelines.ts`
  - Pre-commit: `cd apps/api && vp test run`

---

- [x] 9. Gemini service + mock service

  **What to do**:
  - TDD: Write tests for both GeminiService and MockAnalysisService
  - Create `apps/api/src/services/geminiService.ts`:
    - Initialize GoogleGenAI with `process.env.GEMINI_API_KEY`
    - Use `gemini-2.0-flash` model
    - Method `analyzeArchitecture(edges)` returning `AnalyzeResponse`
    - System prompt: Principal Data Engineer role, analyze intent properties, recommend protocol (MQTT/OPC UA/gRPC/Kafka)
    - Configure `responseMimeType: 'application/json'` + `responseSchema`
  - Create `apps/api/src/services/mockAnalysisService.ts`:
    - Same interface, returns hardcoded realistic recommendations for known category pairs
    - Edge Device → Storage: "MQTT", Edge → Transport: "OPC UA", Transport → Storage: "Kafka"
  - Create `apps/api/src/services/analysisService.ts`: factory returning GeminiService or MockAnalysisService based on `GEMINI_API_KEY`

  **Must NOT do**:
  - NO endpoint routes (Task 10), NO hardcoded API key, NO markdown in response

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8, 10 wait—blocked by 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: 10
  - **Blocked By**: 2, 5

  **References**:
  - Google GenAI structured output: `https://ai.google.dev/gemini-api/docs/structured-output`
  - Gemini models: `https://ai.google.dev/gemini-api/docs/models/gemini`

  **Acceptance Criteria**:
  - [ ] `GeminiService.analyzeArchitecture()` returns typed `AnalyzeResponse`
  - [ ] `MockAnalysisService` returns realistic hardcoded responses per category pair
  - [ ] Factory returns correct service based on env var
  - [ ] Gemini uses structured output configuration
  - [ ] `vp test run` (from apps/api) passes

  **QA Scenarios**:
  ```
  Scenario: Mock service returns correct protocols
    Tool: Bash (vp test run)
    Steps:
      1. Call mockAnalysisService with sample edges
      2. Assert each edge has valid protocol (MQTT/OPC UA/gRPC/Kafka)
      3. Assert each edge has non-empty engineeringExplanation
    Expected Result: Mock returns valid recommendations
    Evidence: .sisyphus/evidence/task-9-mock-service.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add Gemini service + mock service`
  - Files: `apps/api/src/services/**`
  - Pre-commit: `cd apps/api && vp test run`

---

- [x] 10. /api/analyze-architecture endpoint

  **What to do**:
  - TDD: Write tests for analyze endpoint
  - Create `apps/api/src/routes/analyze.ts`: `POST /api/analyze-architecture`
  - Validate request body: must have `nodes` and `edges` arrays
  - Call `analysisService.analyzeArchitecture(edges)`
  - Return `AnalyzeResponse` with protocol + explanation per edge
  - Error handling: 400 invalid body, 500 Gemini failure, 503 service unavailable
  - Wire into main app

  **Must NOT do**:
  - NO auto-re-analysis, NO frontend UI (Task 11), NO batch queuing

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`backend-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8)
  - **Parallel Group**: Wave 2
  - **Blocks**: 11, 13, 15
  - **Blocked By**: 2, 5, 9

  **References**:
  - Analysis service (Task 9): `analysisService.analyzeArchitecture(edges)`
  - Shared types (Task 5): `AnalyzeRequest`, `AnalyzeResponse`

  **Acceptance Criteria**:
  - [ ] `POST /api/analyze-architecture` returns `AnalyzeResponse` with protocol per edge
  - [ ] Returns 400 for invalid body
  - [ ] Returns 500 for Gemini failure
  - [ ] Mock mode works without API key

  **QA Scenarios**:
  ```
  Scenario: Analyze with mock service
    Tool: Bash (curl)
    Steps:
      1. POST to /api/analyze-architecture with valid edges
      2. Assert 200 with edges array containing recommendedProtocol
    Expected Result: Mock analysis returns valid protocols
    Evidence: .sisyphus/evidence/task-10-analyze-mock.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add /api/analyze-architecture endpoint`
  - Files: `apps/api/src/routes/analyze.ts`
  - Pre-commit: `cd apps/api && vp test run`

---

- [x] 11. Edge protocol labels + analysis trigger UI

  **What to do**:
  - TDD: Write tests for edge label rendering and analysis trigger
  - Create `ProtocolEdge.tsx`: custom edge showing protocol name + tooltip with explanation + stale indicator
  - Create `AnalyzeButton.tsx`: button triggering batch analysis, shows loading state, updates store via `setAnalysisResults`
  - Register `protocolEdge` in React Flow `edgeTypes`
  - Add "Analyze Architecture" button to AppLayout
  - Edge data updates use new object references (not mutations)

  **Must NOT do**:
  - NO auto-re-analysis, NO save/load (Task 12), NO API client refactor (Task 13)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: 15
  - **Blocked By**: 6, 7, 10

  **References**:
  - React Flow custom edges: `https://reactflow.dev/learn/customization/custom-edges`
  - Store (Task 4): `setAnalysisResults` action

  **Acceptance Criteria**:
  - [ ] ProtocolEdge displays protocol name on edges
  - [ ] Hover shows engineering explanation tooltip
  - [ ] Stale edges have distinct styling
  - [ ] "Analyze Architecture" button triggers API call
  - [ ] Successful analysis updates all edges
  - [ ] Error shows user-friendly message

  **QA Scenarios**:
  ```
  Scenario: Analyze and see protocol labels
    Tool: Playwright
    Steps:
      1. Add 2 nodes, connect them, click "Analyze Architecture"
      2. Assert edge shows protocol label (MQTT/OPC UA/gRPC/Kafka)
      3. Hover over edge — assert tooltip shows explanation
    Expected Result: Protocol labels and explanations visible
    Evidence: .sisyphus/evidence/task-11-analysis-ui.png
  ```

  **Commit**: YES
  - Message: `feat(web): add edge protocol labels + analysis trigger UI`
  - Files: `apps/web/src/components/canvas/**`
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 12. Save/Load pipeline UX (sidebar list + save button)

  **What to do**:
  - TDD: Write tests for save/load functionality
  - Create `PipelineList.tsx`: fetches pipeline list, displays with name + timestamp, click to load, delete button
  - Create `SaveButton.tsx`: serializes canvas via `reactFlowInstance.toObject()`, creates or updates pipeline
  - Include viewport in serialization (NOT just nodes/edges)
  - Update AppLayout with PipelineList in sidebar

  **Must NOT do**:
  - NO analysis changes, NO auto-save, NO dark theme (Task 14)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 11, 13, 14)
  - **Parallel Group**: Wave 3
  - **Blocks**: 15
  - **Blocked By**: 8

  **References**:
  - Pipeline endpoints (Task 8): all CRUD routes
  - React Flow toObject(): `https://reactflow.dev/api-reference/types/react-flow-instance#to-object`

  **Acceptance Criteria**:
  - [ ] PipelineList fetches and displays pipelines
  - [ ] Clicking pipeline loads canvas state with viewport
  - [ ] Save creates/updates pipeline
  - [ ] Delete removes pipeline from list and backend
  - [ ] Canvas serialization includes viewport/zoom

  **QA Scenarios**:
  ```
  Scenario: Save and load pipeline
    Tool: Playwright
    Steps:
      1. Create canvas with 2 nodes connected
      2. Click "Save" → enter "Test Pipeline" → confirm
      3. Assert "Test Pipeline" in sidebar list
      4. Reload page → click "Test Pipeline" in sidebar
      5. Assert canvas restores with nodes, edges, and viewport
    Expected Result: Save/load preserves full canvas state
    Evidence: .sisyphus/evidence/task-12-save-load.png
  ```

  **Commit**: YES
  - Message: `feat(web): add save/load pipeline UX`
  - Files: `apps/web/src/components/sidebar/**`
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 13. Frontend API client + integration

  **What to do**:
  - TDD: Write tests for API client functions
  - Create `apps/web/src/api/client.ts` with: `analyzeArchitecture`, `listPipelines`, `getPipeline`, `createPipeline`, `updatePipeline`, `deletePipeline`
  - Create `apps/web/src/api/errors.ts` — typed error classes
  - All functions use relative paths (Vite proxy handles routing)
  - Replace inline fetch calls from Tasks 11 and 12 with client module

  **Must NOT do**:
  - NO new endpoints, NO new logic — just refactor to use client

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`fe-patterns`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 11, 12, 14)
  - **Parallel Group**: Wave 3
  - **Blocks**: 15
  - **Blocked By**: 5, 10

  **References**:
  - Analyze endpoint (Task 10), Pipeline endpoints (Task 8), Shared types (Task 5)

  **Acceptance Criteria**:
  - [ ] All 6 API functions exported
  - [ ] Relative paths used (no hardcoded base URL)
  - [ ] Typed errors with status and message
  - [ ] Tasks 11 and 12 refactored to use client
  - [ ] `vp test run` (from apps/web) passes

  **QA Scenarios**:
  ```
  Scenario: API client functions work
    Tool: Bash (vp test run)
    Steps:
      1. Run client tests — assert all functions return correct types
      2. Assert error handling throws typed errors
    Expected Result: All API client functions work correctly
    Evidence: .sisyphus/evidence/task-13-api-client.txt
  ```

  **Commit**: YES
  - Message: `feat(web): add frontend API client + integration`
  - Files: `apps/web/src/api/**`, `apps/web/src/components/**` (refactored)
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 14. Dark tech-industrial theme

  **What to do**:
  - Create `apps/web/src/styles/theme.css` with dark theme variables:
    - Background: dark charcoal (#0a0a0f), Surface: (#1a1a2e)
    - Primary accent: electric blue/cyan (#00d4ff), Secondary: amber (#ff8c00)
    - Text: light gray (#e0e0e0), Borders: subtle (#2a2a3e)
    - Node category colors: blue (Edge Devices), purple (Transport), green (Storage)
  - Update `tailwind.config.ts` with custom colors
  - Apply theme to all components: AppLayout, NodeLibrary, IntentNode, ProtocolEdge, PipelineList, SaveButton, AnalyzeButton
  - Add monospace for protocol names, subtle grid background on canvas
  - Add hover/focus states for interactive elements
  - Use CSS variables for central theme control

  **Must NOT do**:
  - NO light mode toggle (dark only), NO third-party UI library, NO per-component themes

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 11, 12, 13)
  - **Parallel Group**: Wave 3
  - **Blocks**: 15
  - **Blocked By**: None

  **References**:
  - All component files from Tasks 6, 7, 11, 12

  **Acceptance Criteria**:
  - [ ] All components use dark theme
  - [ ] Node categories have distinct colors
  - [ ] Canvas has grid background
  - [ ] Interactive elements have hover/focus states
  - [ ] Protocol names in monospace, theme via CSS variables

  **QA Scenarios**:
  ```
  Scenario: Dark theme applied consistently
    Tool: Playwright
    Steps:
      1. Navigate to app, take full-page screenshot
      2. Assert dark backgrounds, light text, distinct category colors
      3. Hover over sidebar items — assert visual feedback
    Expected Result: Consistent dark tech-industrial theme
    Evidence: .sisyphus/evidence/task-14-dark-theme.png
  ```

  **Commit**: YES
  - Message: `feat(web): apply dark tech-industrial theme`
  - Files: `apps/web/src/styles/**`, `tailwind.config.*`, component files
  - Pre-commit: `cd apps/web && vp test run`

---

- [x] 15. End-to-end flow: drag → connect → analyze → save

  **What to do**:
  - Integration test for full user flow
  - Create `apps/web/tests/e2e/full-flow.test.ts`: drag nodes → connect → edit properties → analyze → verify labels → save → reload → load → verify restored state
  - Create `apps/api/tests/e2e/api-flow.test.ts`: create pipeline → analyze → update → verify
  - Fix any integration issues (data flow mismatches, type inconsistencies, missing error handling)

  **Must NOT do**:
  - NO new features — only integration fixes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on most previous tasks)
  - **Parallel Group**: Wave 4
  - **Blocks**: 16
  - **Blocked By**: 6, 7, 8, 10, 11, 12, 13

  **References**:
  - All previous tasks — this is the integration task

  **Acceptance Criteria**:
  - [ ] E2E test covers: drag → connect → edit → analyze → save → reload → load
  - [ ] All nodes, edges, and protocol labels restore after load
  - [ ] Viewport preserved after save/load
  - [ ] API integration test covers: create → analyze → update → verify

  **QA Scenarios**:
  ```
  Scenario: Full end-to-end pipeline
    Tool: Playwright
    Steps:
      1. Drag 3 nodes (Factory Floor Sensor, Stream Processor, Data Lake)
      2. Connect: Sensor → Processor → Data Lake
      3. Edit intent properties on Sensor node
      4. Click "Analyze Architecture"
      5. Assert protocol labels on both edges
      6. Save as "Production Pipeline"
      7. Reload → load "Production Pipeline"
      8. Assert all nodes, edges, labels, viewport restored
    Expected Result: Full flow works end-to-end
    Evidence: .sisyphus/evidence/task-15-e2e-flow.png
  ```

  **Commit**: YES
  - Message: `feat(e2e): end-to-end flow integration`
  - Files: `apps/web/tests/e2e/**`, `apps/api/tests/e2e/**`
  - Pre-commit: `vp test run`

---

- [x] 16. Stale recommendation indicators + edge cases

  **What to do**:
  - TDD: Write tests for stale detection and edge cases
  - Create `apps/web/src/hooks/useStaleRecommendations.ts`: when intent properties change after analysis, mark connected edges as "stale"
  - Update IntentNode: show "needs re-analysis" indicator when connected edges are stale
  - Update ProtocolEdge: dashed/dimmed style + stale badge for stale recommendations
  - Update AnalyzeButton: clear stale flags after re-analysis, disable during request, show "mock mode" banner when no API key
  - Handle edge cases: empty canvas, no edges, network errors, concurrent analysis clicks

  **Must NOT do**:
  - NO auto-re-analysis (stale indicator only), NO debounce/throttle

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: FINAL
  - **Blocked By**: 15

  **References**:
  - ProtocolEdge (Task 11): add stale styling
  - AnalyzeButton (Task 11): add disabled states
  - Store (Task 4): `updateNodeData` triggers stale detection

  **Acceptance Criteria**:
  - [ ] Editing intent properties after analysis marks edges stale
  - [ ] Stale edges show visual indicator
  - [ ] Re-analysis clears stale flags
  - [ ] "Analyze" disabled when no edges
  - [ ] Mock mode banner visible without API key
  - [ ] Button disabled during analysis
  - [ ] Network errors show friendly message

  **QA Scenarios**:
  ```
  Scenario: Stale indicator after property change
    Tool: Playwright
    Steps:
      1. Run analysis on connected nodes
      2. Change a node's intent property
      3. Assert connected edge shows stale indicator
      4. Click "Analyze Architecture" again
      5. Assert stale indicator cleared
    Expected Result: Stale detection works, re-analysis clears stale
    Evidence: .sisyphus/evidence/task-16-stale-indicator.png

  Scenario: Edge cases handled
    Tool: Playwright
    Steps:
      1. Empty canvas — assert "Analyze" disabled
      2. Nodes without edges — assert button shows "Connect nodes first"
      3. No GEMINI_API_KEY — assert mock banner visible
      4. During analysis — assert button disabled
    Expected Result: All edge cases handled gracefully
    Evidence: .sisyphus/evidence/task-16-edge-cases.png
  ```

  **Commit**: YES
  - Message: `fix(web): stale recommendation indicators + edge cases`
  - Files: `apps/web/src/hooks/**`, `apps/web/src/components/**` (updated)
  - Pre-commit: `vp test run`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `vp test run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `feat(scaffold): initialize Vite+ monorepo with vp test and vp dev` | Root config, both app dirs | `vp install && vp test run` |
| 2 | `feat(api): add Hono skeleton with health endpoint` | `apps/api/src/**` | `cd apps/api && vp test run` |
| 3 | `feat(api): add Drizzle ORM + pipeline schema + migrations` | `apps/api/src/db/**` | `cd apps/api && vp test run` |
| 4 | `feat(web): add Zustand canvas store + shared types` | `apps/web/src/store/**`, `packages/shared/**` | `cd apps/web && vp test run` |
| 5 | `feat(shared): add shared types package for API contracts` | `packages/shared/**` | `vp install && vp test run` |
| 6 | `feat(web): add React Flow canvas with drag-and-drop sidebar` | `apps/web/src/components/**` | `cd apps/web && vp test run` |
| 7 | `feat(web): add IntentNode custom component with property editing` | `apps/web/src/components/nodes/**` | `cd apps/web && vp test run` |
| 8 | `feat(api): add pipeline CRUD endpoints` | `apps/api/src/routes/**` | `cd apps/api && vp test run` |
| 9 | `feat(api): add Gemini service + mock service` | `apps/api/src/services/**` | `cd apps/api && vp test run` |
| 10 | `feat(api): add /api/analyze-architecture endpoint` | `apps/api/src/routes/analyze.ts` | `cd apps/api && vp test run` |
| 11 | `feat(web): add edge protocol labels + analysis trigger UI` | `apps/web/src/components/canvas/**` | `cd apps/web && vp test run` |
| 12 | `feat(web): add save/load pipeline UX` | `apps/web/src/components/sidebar/**` | `cd apps/web && vp test run` |
| 13 | `feat(web): add frontend API client + integration` | `apps/web/src/api/**` | `cd apps/web && vp test run` |
| 14 | `feat(web): apply dark tech-industrial theme` | `apps/web/src/styles/**`, `tailwind.config.*` | `cd apps/web && vp test run` |
| 15 | `feat(e2e): end-to-end flow integration` | E2E test files | `vp test run` |
| 16 | `fix(web): stale recommendation indicators + edge cases` | `apps/web/src/**` | `vp test run` |

---

## Success Criteria

### Verification Commands
```bash
vp run -r test                   # Expected: all tests pass across both apps
cd apps/web && vp test run       # Expected: all frontend tests pass
cd apps/api && vp test run       # Expected: all backend tests pass
cd apps/web && vp build          # Expected: successful production build
cd apps/api && vp run dev        # Expected: server starts on port 3000
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Dark theme applied throughout
- [ ] Drag-and-drop works: sidebar → canvas
- [ ] Intent properties editable per node
- [ ] AI analysis returns protocol + explanation per edge
- [ ] Mock mode works without API key
- [ ] Save/load works: create, list, load, delete pipelines
- [ ] Vite proxy to Hono works (no CORS errors)