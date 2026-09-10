# Axion Science Ecosystem — Execution Plan

Status: active implementation plan
Owner: ecosystem core / Science Hub

## Goal

Build one scientific environment from four focused applications without turning them into one inseparable codebase:

```text
Science Hub → Project context → Math / Notebook / Writer
                              ↘ Scientific Objects
```

The primary cross-app rule is object-first: applications exchange the original Scientific Object and references to it. Markdown, rendered images, HTML, and publication blocks are projections, never the canonical transfer format.

## Current state

- `Problem-library` owns the local Project flow, Explore/Problems, and the canonical ecosystem contract.
- `Mathematics-Frontend` owns the Laboratory UI and local computation. It has no dedicated backend.
- `Notebook` has a Django/PostgreSQL/Redis/worker execution stack and a typed notebook UI. Its current backend remains legacy execution infrastructure during migration.
- `Writer` owns papers and publishing, but also contains a duplicated `backend/laboratory/` solver stack. No new solver work belongs there.
- All apps already contain local Scientific Object code using the same IndexedDB database name. This works only when deployed under one browser origin.
- A transitional Writer bridge and local Project/Object store already exist.

## Architectural decisions

### 1. One product, separate bounded applications

The user sees one ecosystem. Each app keeps ownership of its domain:

| App | Owns | Must not own |
| --- | --- | --- |
| Science Hub | Projects, Explore, ecosystem entry | Math solver or notebook runtime |
| Math | mathematical composition, solve, simulation, visualization | Writer documents or shared identity |
| Notebook | reasoning, evidence, typed blocks, Jupyter session integration | Math solver implementation |
| Writer | manuscript, citations, publication/export | compute engine or Math database |

No app reads another app's database directly.

### 2. Scientific Object is the canonical handoff

Every handoff preserves:

- object ID and Project ID;
- schema version;
- complete payload;
- all available revisions;
- provenance, inputs, parameters, assumptions, and execution target;
- artifacts and content hashes;
- renderer-independent visualization scene/data where available.

Apps create references (`live`, `pinned`, `frozen`) rather than silently flattening objects into text. Markdown/PNG/SVG/HTML are explicit derived projections for display or export.

### 3. Local-first first, Platform Core later

The first reliable topology is one browser origin with path routing:

```text
science.example/             Science Hub
science.example/math/        Math
science.example/notebook/   Notebook
science.example/writer/     Writer
```

If separate origins are needed, the same object contract travels through an explicit bundle or a sync API. IndexedDB is never assumed to work across subdomains or ports.

### 4. Notebook uses a Jupyter adapter, not a second solver platform

Notebook execution targets are explicit:

```text
this-device   → Web Worker / Pyodide / JupyterLite for light, local work
local-python  → user-managed local kernel when needed
jupyter-kernel→ Jupyter Server or JupyterHub for persistent sessions
external-server / hpc-cluster → optional heavy execution target
```

Jupyter owns kernel/session execution. The ecosystem owns Project/Object metadata and provenance. A kernel result is converted into a Scientific Object without changing the original notebook artifact.

### 5. Backend boundaries

When cloud capabilities become necessary, add a small Platform Core for:

- identity and permissions;
- Projects;
- Scientific Object metadata, revisions, references, and sync;
- artifact storage metadata and sharing;
- search/index metadata.

Keep domain persistence separate where it provides real value. Platform Core is not a SymPy, GPU, notebook, or visualization engine. Redis is used for queues/cache only when an actual asynchronous workload exists.

## Delivery phases

### Phase 0 — Contract and design foundation

1. Keep the canonical `ScientificObject` and transfer envelope versioned.
2. Add object validation, hash checks, and round-trip tests.
3. Keep the ecosystem shell and page primitives aligned across all apps.
4. Define stable app navigation and Project context semantics.

### Phase 1 — Complete object bridge

1. Export/import complete objects without changing IDs or revisions.
2. Add a same-origin bridge for automatic handoff.
3. Add cross-origin bundle fallback with clear source Project handling.
4. Replace direct Math-to-Writer markdown insertion with a reference-backed import flow.
5. Let Notebook and Writer inspect the original object, revisions, artifacts, and provenance.
6. Add contract compatibility tests for calculation, simulation, dataset, visualization, and scene objects.

### Phase 2 — Notebook/Jupyter integration

1. Define a `KernelAdapter` interface and execution target metadata.
2. Use JupyterLite/Pyodide or Web Workers for lightweight local execution.
3. Add an optional Jupyter Server/JupyterHub adapter for persistent sessions and larger resources.
4. Store notebook cells and kernel outputs as original notebook artifacts plus Scientific Object links.
5. Keep execution history, timeout, cancellation, and resource limits explicit.
6. Do not copy Mathematics solver code into Notebook.

### Phase 3 — Writer publication integration

1. Keep the manuscript as the primary surface.
2. Insert object references for equations, tables, figures, and results.
3. Resolve `live` and `pinned` references during editing.
4. Resolve `frozen` references from a durable revision/snapshot for publication.
5. Export derived PDF/DOCX/LaTeX while retaining the source object identity and provenance.
6. Retire duplicated `Writer/backend/laboratory/` only after all active consumers use the Math/Project path.

### Phase 4 — Platform Core and cloud sync

Start only when users need cross-device access, login, collaboration, durable sharing, or cloud backup.

1. Mirror the local Project/Object contract on the server.
2. Add an outbox/inbox sync protocol with idempotent object and revision writes.
3. Add object storage for large artifacts and content-hash verification.
4. Add permissions and share links.
5. Keep anonymous/local Projects usable and exportable.

### Phase 5 — Production hardening

1. Put all apps behind one origin/path gateway where possible.
2. Add base-path aware builds and deployment checks.
3. Add backups for server data and artifacts.
4. Add end-to-end tests for Math → Notebook → Writer with object identity assertions.
5. Measure local compute performance, bundle size, kernel resource use, and artifact transfer size.

## Current implementation start

The first implementation slice is Phase 0 plus the foundation of Phase 1:

- canonical transfer envelope exists in all four apps;
- export/import preserves object ID, Project ID, payload, provenance, artifacts, and revisions;
- the ecosystem shell is centralized behaviorally;
- Notebook and Writer have explicit handoff entry points;
- Writer now persists validated `scientific_object_references` with each paper, while the imported markdown remains an editable projection;
- Notebook blocks can retain `scientific_object_reference` and execution metadata through the Django API;
- Notebook now has an explicit Pyodide adapter for `this-device` and a Jupyter Server WebSocket adapter for `jupyter-kernel`;
- remaining work is durable original-artifact rendering, revision-aware reference resolution in the Writer editor, and wiring the new kernel adapter into the primary notebook session UI.

## Implementation log

### Slice 1 — reference and runtime boundary

- Added strict transfer-envelope parsing: malformed JSON, missing current revision, duplicate revisions, and revisions without provenance are rejected.
- Added a Writer paper field and migration for validated object references; the server stores links but does not attempt to read browser-local object databases.
- Added Notebook block reference preservation and execution-target metadata (`this-device`, `jupyter-kernel`, `external-server`, `hpc-cluster`).
- Added a client-side Pyodide adapter and a Jupyter Server kernel-channels adapter. Both return structured execution metadata; neither changes the notebook source artifact.
- Added local Notebook execution persistence as a Scientific Object when a Project is active.

## Definition of done for the bridge

The bridge is not complete until this test passes under same-origin and bundle fallback modes:

```text
Math creates object O, revision 1
Math appends revision 2
Notebook opens O without rewriting its payload
Writer opens O without rewriting its payload
Notebook/Writer references O or a chosen revision
Export/import returns the same O, revisions, hashes, and provenance
```

## Non-goals for now

- one giant backend for all apps;
- mandatory cloud compute;
- a second authentication system in every repository;
- database-to-database coupling;
- rewriting all working visualizers or editors;
- migrating legacy data before a real consumer requires it.
