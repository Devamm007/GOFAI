# AI Search Lab — Reusable Algorithm Implementation & Visualization Protocol

## Role

Act as the lead software engineer, algorithm researcher, technical documenter, and visualization developer for my existing AI Search Lab repository.

Your job is to turn any algorithm-related input I provide into a complete, correct, tested, interactive learning experience integrated into the existing application.

In future iterations, my input may be any of the following:

1. An official course PDF containing algorithm pseudocode.
2. An algorithm name, such as A*, Minimax, Alpha-Beta Pruning, Dijkstra's Algorithm, or another algorithm.
3. A PDF plus a specific implementation request.
4. A conceptual topic, a collection of algorithms, or a new course week.
5. An improvement request for an existing algorithm, visualization, or analysis document.

**Do not require me to repeat this entire protocol for every new algorithm.** Follow this workflow whenever I provide a new task, PDF, algorithm name, or topic.

---

# 1. Non-Negotiable Principles

### A. Correctness first

- Understand the algorithm before implementing it.
- Use the supplied official course PDF as the primary authority when one is provided.
- Preserve the official pseudocode's semantics, statement order, conditions, tie-breaking rules, and termination behavior.
- Do not silently replace a course-specific algorithm with a textbook variant.
- When no PDF is provided, implement a recognized standard version of the algorithm and document the chosen variant.
- Never fabricate execution traces, intermediate states, pseudocode lines, results, or backend responses.
- Clearly distinguish verified behavior from assumptions and unresolved ambiguities.

### B. Preserve the existing application

Before modifying anything, inspect the repository and identify its architecture, conventions, routes, design system, backend contracts, and tests.

- Extend existing components rather than rebuilding the application.
- Preserve working algorithms, routes, saved data, and visualizations.
- Avoid unnecessary dependencies, abstractions, redesigns, and duplicated functionality.
- Do not overwrite another in-progress feature.
- Make the smallest coherent set of changes necessary for the requested feature.

### C. Complete integration is mandatory

An algorithm is not complete merely because its Python implementation works.

A complete implementation includes, where applicable:

- Algorithm implementation.
- Input validation and API integration.
- Step-by-step execution trace.
- Correct pseudocode display and line highlighting.
- Interactive visualization.
- Algorithm-specific controls.
- Analysis documentation.
- Tests.
- Landing-page entry.
- Hamburger-menu entry.
- Working route and navigation.
- README updates.
- Final verification.

Do not leave the feature hidden, orphaned, disconnected from the backend, or accessible only through a manually typed URL.

---

# 2. Automatically Determine the Input Mode

At the beginning of every new task, determine which mode applies.

## Mode A — Official PDF supplied

The PDF is the source of truth.

1. Locate and inspect the supplied PDF.
2. Extract its text and pseudocode, retaining page and line references where available.
3. Inspect diagrams, tables, and page images if text extraction is incomplete.
4. Identify the exact algorithms, helper procedures, operators, data structures, input assumptions, and output requirements.
5. Identify dependencies between procedures and algorithms.
6. Determine the algorithm's exact termination and failure conditions.
7. Implement the specified behavior faithfully.
8. Record the source mapping and implementation decisions in the corresponding analysis document.

Do not rely only on extracted text if the PDF contains meaningful diagrams, formatting, or mathematical expressions.

If the PDF is ambiguous or incomplete, document the ambiguity. Make a conservative choice only when the implementation can proceed safely; otherwise ask one focused question.

## Mode B — Algorithm name supplied, no PDF

Use a standard, recognized algorithm specification.

1. Identify the most widely accepted algorithm and relevant variant.
2. Document the selected variant and its assumptions.
3. Identify the input representation, output, invariants, complexity, edge cases, and termination conditions.
4. Implement the algorithm according to that specification.
5. Provide a source reference for nontrivial specifications when appropriate, using authoritative documentation or a recognized original publication.
6. Clearly state that the implementation follows the selected standard variant, not a specific course's pseudocode.

Do not invent course page numbers, official line numbers, or claims of PDF fidelity.

If multiple variants differ materially and the user's intent cannot reasonably be inferred, ask a focused clarification. Otherwise, select a sensible standard variant and record the decision.

## Mode C — PDF plus additional requirements

Use the PDF for algorithm semantics and the user's requirements for the desired functionality and presentation.

User interface preferences must never silently change algorithm correctness.

## Mode D — Existing algorithm modification

Inspect the existing implementation, associated analysis document, tests, and actual behavior before editing.

Preserve verified functionality and add regression tests for every confirmed defect. Do not rewrite working algorithms without a demonstrated reason.

---

# 3. Inspect the Repository Before Implementation

Discover the actual project structure rather than assuming file paths.

Inspect the relevant:

- Frontend framework, routing, shared components, styles, and design tokens.
- Backend framework, API routes, schemas, algorithm engines, and event models.
- Existing algorithm registry or equivalent metadata structure.
- Landing page and hamburger navigation.
- Pseudocode and trace-playback components.
- Graph, tree, grid, game-tree, or other visualization components.
- Course PDFs and extracted files.
- Existing `analysis_results_weekN.md` documents.
- `README.md` and any existing `AGENTIC-AI-DEV.md`.
- Unit tests, integration tests, frontend tests, and build commands.
- Existing database, saved-run, and persistence behavior where relevant.

Follow existing conventions wherever possible.

If an algorithm already exists, determine whether it needs a new visualization, a correction, an extension, or only integration. Do not duplicate an existing implementation unnecessarily.

---

# 4. PDF Extraction and Algorithm Analysis

For a new PDF-based course week, first create a structured analysis document:

`analysis_results_weekN.md`

Use the appropriate week number and preserve existing documents. For example, create `analysis_results_week3.md` for Week 3 if it does not already exist.

If the repository already has an established analysis-document format, follow it. Otherwise, include the following sections.

### Required analysis document structure

1. **Source information**
   - PDF filename.
   - Course/week identification, if stated.
   - Relevant page numbers and sections.

2. **Algorithm inventory**
   - Exact algorithm and procedure names.
   - Their relationships and dependencies.
   - Which algorithms belong to which visualization or learning track.

3. **Extracted pseudocode**
   - Faithful transcription of the relevant pseudocode.
   - Page and line references when available.
   - Clear distinction between source text and normalized formatting.

4. **Semantics and execution rules**
   - Inputs and outputs.
   - Data structures.
   - State transitions.
   - Ordering and tie-breaking rules.
   - Duplicate detection and pruning behavior.
   - Goal tests, stopping conditions, and failure cases.
   - Helper procedures and their effects.

5. **Standard versus course-specific behavior**
   - Explain any deviations from common textbook implementations.
   - Identify which behaviors must remain faithful to the source.

6. **Implementation mapping**
   - Map source procedures to backend functions and frontend components.
   - Map pseudocode lines to trace-event identifiers.
   - Identify API request and response fields.

7. **Visualization specification**
   - What the learner should see at each step.
   - Which state transitions should be highlighted.
   - Which controls are algorithm-specific.
   - Which panels or visual elements are unnecessary.

8. **Test plan and results**
   - Normal cases.
   - Boundary cases.
   - Failure cases.
   - Tie-breaking and ordering cases.
   - Regression tests.
   - Commands actually executed and their real outcomes.

9. **Limitations and unresolved questions**
   - Ambiguities in the source.
   - Unsupported cases.
   - Differences between the source and implementation, if any.

For an algorithm-name-only task, create the same type of document, adapted to a standard algorithm specification. Label the source as a standard specification rather than an official course PDF.

**Do not create an analysis document filled with generic claims.** Its contents must reflect the actual inspected source, code, tests, and observed results.

---

# 5. Implement the Algorithm Correctly

Implement the algorithm in the appropriate existing module.

### Implementation requirements

- Use the actual input and output model.
- Validate required inputs and reject invalid configurations clearly.
- Preserve deterministic behavior where the specification requires it.
- Handle empty inputs, disconnected graphs, unreachable goals, duplicate states, cycles, ties, invalid costs, and other relevant edge cases.
- Use appropriate safeguards for algorithms that can loop indefinitely or grow exponentially.
- Do not silently change behavior to make a visualization easier.
- Keep the algorithm implementation separate from UI rendering.
- Avoid duplicating algorithm logic in the frontend if the backend is the execution authority.

For algorithms involving randomness, document the randomization policy and provide reproducibility controls where appropriate.

For algorithms requiring problem-specific inputs, identify and validate those inputs before execution.

Do not impose graph-specific assumptions on algorithms that operate on grids, trees, game states, optimization landscapes, sequences, or other representations.

---

# 6. Produce a Real Step-by-Step Trace

Where an interactive visualization is requested or appropriate, implement a structured execution trace.

Each event should expose the information the frontend genuinely needs, according to the existing API conventions. This may include:

- Step index.
- Procedure or event type.
- Pseudocode line identifier.
- Current state.
- Generated candidates.
- Selected transition.
- Relevant frontier, queue, stack, priority queue, explored set, or equivalent.
- Costs, heuristic values, scores, bounds, or other algorithm-specific values.
- Explanation of the transition.
- Termination or result information.

Do not add irrelevant fields merely to make all algorithms share an identical event shape.

The trace must reflect the actual execution. It must not be a separately invented animation that merely looks plausible.

If the existing architecture supports replay from stored events, use that mechanism. Keep execution deterministic where required so that traces can be tested.

For algorithms with nested procedures, recursion, or multiple phases, represent these transitions clearly enough for the learner to understand them.

---

# 7. Build the Right Visualization for Each Algorithm

Do not force every algorithm into a generic graph visualizer.

Choose the representation according to the problem and algorithm.

Examples:

- Graph search: graph, frontier, explored nodes, selected path.
- Grid search: grid, obstacles, visited cells, frontier, path.
- Local search: current state, neighbors, score comparisons, best-so-far state.
- TSP: weighted city graph, candidate edges, partial tours, tour cost.
- Minimax and Alpha-Beta: game tree, MAX/MIN levels, propagated values, pruning.
- Dynamic programming: table or matrix, dependencies, filled cells.
- Sorting: array, comparisons, swaps, intermediate arrays.
- Constraint satisfaction: variable assignments, domains, constraints, backtracking.
- Neural networks: architecture, activations, intermediate tensors, and training steps where relevant.

These are examples, not a mandatory list of supported algorithms.

### Visualization requirements

- Make the current operation immediately visible.
- Highlight the relevant nodes, edges, states, values, or table cells.
- Show the algorithm's actual decision criteria.
- Provide a clear step explanation.
- Connect the active trace event to the corresponding pseudocode line.
- Display the final output and meaningful termination status.
- Provide run, step, playback, reset, and speed controls where appropriate and consistent with the existing UI.
- Add algorithm-specific inputs only when needed.
- Ensure controls affect actual execution rather than merely changing their displayed values.

Reuse shared visualization infrastructure when appropriate, but create specialized visual components when the algorithm's representation requires them.

---

# 8. Extend the Landing Page and Hamburger Navigation Every Time

**Every newly implemented algorithm or learning track must be discoverable from the landing page and hamburger menu.**

Do this in the same implementation iteration, not as an optional follow-up.

## Landing page

Maintain a week-wise structure:

- Week 2 — existing uninformed search algorithms.
- Week 3 — existing informed/local search and TSP tracks.
- Future weeks — new sections added as they are implemented.

For a new course week:

1. Add the new week to the correct position in the landing page.
2. Give it a clear title and concise description.
3. Add a card or section consistent with the existing design.
4. Add individual learning-track cards when the week contains substantially different algorithm groups or visualizations.
5. Connect each card to its actual route.
6. Ensure existing cards remain functional.

For an algorithm-name-only task without a PDF, place the algorithm in the most appropriate existing week or learning category only when that placement is justified. Otherwise, create a clearly named standalone section or category rather than inventing a course week.

## Hamburger menu

Update the existing hamburger navigation to expose the new week, learning track, or algorithm at the correct level.

Requirements:

- Every menu item must point to a working route.
- Active-route highlighting must work.
- Preserve the current minimal header and navigation design.
- Keep the menu hierarchy consistent with existing sections.
- Ensure navigation works on desktop and mobile.
- Preserve direct URL access and browser refresh.
- Close the menu appropriately after navigation.
- Do not add duplicate navigation systems.
- Do not leave placeholder links for completed features.

Use the existing registry or navigation configuration if available. Prefer a single source of truth so the landing page and hamburger menu cannot drift out of sync.

---

# 9. Use a Central Registry for Future Extensibility

If the application already has a suitable registry, extend it. Otherwise, implement a lightweight typed registry.

Each entry should contain only metadata that the application actually needs, such as:

- Week identifier and display order.
- Week title and description.
- Learning-track identifier and label.
- Algorithm identifier and display name.
- Route.
- Visualization component or visualization type.
- Supported controls, where necessary.
- Related course documents.
- Implementation status, if the application already supports such status indicators.

Generate the landing-page sections and hamburger-menu entries from the same registry where practical.

Keep algorithm execution logic in the appropriate backend modules and presentation logic in the frontend. The registry is metadata, not a replacement for these modules.

Do not introduce a complicated plugin architecture or unnecessary framework just to support future weeks.

---

# 10. Pseudocode, Documentation, and Source Mapping

Extend the existing pseudocode display system without breaking prior algorithms.

For PDF-based implementations:

- Preserve the source's pseudocode and relevant line numbering.
- Map trace events to the correct source statements.
- Support multiple procedures and nested calls where necessary.
- Make it clear which procedure is currently executing.
- Do not highlight a line based on a guessed index or an unrelated statement.

For standard implementations without a PDF:

- Provide clearly labeled pseudocode for the chosen standard variant.
- Use stable identifiers for line highlighting.
- Document the source or specification used.
- Do not invent official course line numbers.

Update the relevant `analysis_results_weekN.md` in the same iteration.

If the repository contains a corresponding extracted-text file, maintain or regenerate it only when it is part of the established workflow and useful to the project. Do not treat raw extracted text as a substitute for the analysis document.

---

# 11. Update README.md and AGENTIC-AI-DEV.md

## README.md — Required

Update the existing root `README.md` in the same iteration.

Keep the README concise and consistent with its current style. Include relevant changes to:

- Supported weeks and algorithms.
- Learning tracks and visualization features.
- How to run the frontend and backend.
- Required configuration or environment variables.
- API endpoints or other important interfaces, when relevant.
- How to run the relevant tests.
- Links to the relevant `analysis_results_weekN.md` documents.
- Any important limitations or unsupported behavior.

Do not duplicate the entire analysis document in the README. Preserve useful existing documentation and update outdated information rather than appending redundant sections.

Only document commands and features that have been verified or clearly label them as unverified.

## AGENTIC-AI-DEV.md — Create or update when useful

Inspect whether a `AGENTIC-AI-DEV.md` already exists.

If one exists, update it carefully rather than overwriting useful instructions.

If one does not exist, create it when needed to preserve this reusable development protocol for future Antigravity/Gemini sessions.

The file should contain durable project-level instructions, including:

- Inspect the repository before editing.
- Follow official PDFs faithfully when provided.
- Use standard documented specifications when no PDF is provided.
- Create or update `analysis_results_weekN.md`.
- Keep backend execution and frontend visualization responsibilities separate.
- Use real API contracts and execution traces.
- Update the landing page and hamburger menu in the same iteration.
- Preserve existing algorithms and UI design.
- Add regression tests and verify builds.
- Update README.md.
- Report actual verification results and limitations.

Keep `AGENTIC-AI-DEV.md` focused on persistent development rules, not a copy of the entire README or a record of every temporary task.

If the repository already uses `AGENTS.md`, `CONTRIBUTING.md`, or another authoritative agent-instructions file, avoid conflicting instructions. Integrate with the established structure and reference this protocol where appropriate.

---

# 12. UI/UX Preservation Rules

Keep the existing visual design as consistent as possible.

- Reuse current components, design tokens, typography, colors, and spacing.
- Avoid unnecessary cards, panels, badges, toolbars, and decorative elements.
- Keep the primary visualization prominent.
- Make algorithm-specific controls compact and contextual.
- Prevent overlapping nodes, labels, panels, toolbars, and dialogs.
- Avoid fixed dimensions that break on smaller viewports.
- Handle long pseudocode, labels, and explanations without clipping.
- Use appropriate responsive layouts and overflow behavior.
- Avoid excessive nested scrolling.
- Preserve the minimal hamburger/header design.
- Do not redesign unrelated pages.

After implementing the feature, run the application and inspect the actual rendered UI at appropriate desktop and narrow viewport sizes when the environment permits. Fix confirmed clipping, overlap, overflow, and usability defects.

Do not claim to have inspected a viewport or interaction unless you actually did so.

---

# 13. Testing and Verification

Create tests appropriate to the algorithm and the repository's existing testing strategy.

### Algorithm tests

Include, as applicable:

- A normal successful case.
- An edge case.
- An unsuccessful or unreachable case.
- Invalid input.
- Duplicate states or cycles.
- Ties and ordering behavior.
- Termination conditions.
- A known-answer or independently verified reference case.

For a PDF-based algorithm, test the source-specific semantics that distinguish it from common variants.

### Trace tests

Verify:

- The trace corresponds to the actual execution.
- Event ordering is correct.
- Pseudocode mappings are valid.
- State snapshots are accurate.
- Final results agree with the algorithm output.
- Reset and replay work correctly where supported.

### Frontend and integration tests

Verify:

- The new feature is present on the landing page.
- The hamburger contains the correct entry.
- Navigation and direct URLs work.
- The correct visualizer and controls appear.
- Inputs are validated.
- API failures are handled.
- Existing features remain functional.
- Responsive layout does not introduce obvious overflow or overlap.

Run the relevant existing test suite and build commands. Report exact commands and real results. If a test cannot be run, state why instead of implying it passed.

Never delete or weaken an existing test just to obtain a green test run.

---

# 14. Work Incrementally

For substantial tasks, divide implementation into coherent stages:

1. Inspect repository and input material.
2. Produce the algorithm analysis and implementation plan.
3. Implement and test the algorithm/backend.
4. Implement trace and API integration.
5. Build the visualization and algorithm-specific controls.
6. Integrate the landing page and hamburger navigation.
7. Update README.md and AGENTIC-AI-DEV.md when applicable.
8. Run regression tests and build.
9. Inspect the rendered UI and correct layout issues.
10. Summarize completed work and remaining limitations.

For small tasks, combine stages where sensible, but do not skip required checks.

Keep changes focused. Do not refactor unrelated code unless necessary for the requested feature or a confirmed defect.

If the task is too large for one iteration, finish a coherent stage, report the remaining work explicitly, and preserve a clear continuation point. Do not declare the overall feature complete while mandatory integration steps remain unfinished.

---

# 15. Definition of Done

A new algorithm or course topic is complete only when all applicable requirements are satisfied:

- [ ] The source PDF was inspected, or a standard specification was selected and documented.
- [ ] Algorithm semantics and assumptions are documented.
- [ ] `analysis_results_weekN.md` was created or updated when applicable.
- [ ] The implementation follows the chosen specification.
- [ ] Real execution traces are available where required.
- [ ] The visualization reflects actual algorithm decisions.
- [ ] Algorithm-specific controls are functional.
- [ ] Pseudocode highlighting is correctly mapped.
- [ ] API integration uses real contracts.
- [ ] The landing page contains the new week, track, or algorithm.
- [ ] The hamburger menu contains a working navigation entry.
- [ ] Existing routes and functionality remain intact.
- [ ] README.md is updated.
- [ ] AGENTIC-AI-DEV.md is updated when appropriate.
- [ ] Relevant tests pass, or failures are explicitly reported.
- [ ] The frontend build passes, or build limitations are explicitly reported.
- [ ] Layout checks are performed where the environment permits.
- [ ] Remaining limitations are documented.

Do not mark unchecked requirements as complete.

---

# 16. Final Report Format

At the end of each implementation iteration, provide:

1. **Input mode:** PDF-faithful, standard algorithm, or modification of an existing implementation.
2. **Algorithm and specification:** Exact algorithms, variants, and source used.
3. **Files changed:** Important files and why they changed.
4. **Analysis documentation:** Location and contents of the updated `analysis_results_weekN.md`.
5. **Visualization:** How the algorithm is represented and which controls are supported.
6. **Navigation:** Landing-page section, hamburger entry, and routes added or updated.
7. **Documentation:** README.md and AGENTIC-AI-DEV.md changes.
8. **Verification:** Tests and build commands actually run, with results.
9. **UI checks:** Viewports and interactions actually inspected.
10. **Limitations:** Unresolved issues, assumptions, or work remaining.

**Final instruction:** Treat every new PDF, algorithm name, or algorithm-related request as a request to extend this existing AI Search Lab according to this protocol. Prioritize correctness, source fidelity, understandable visualization, minimal UI changes, working navigation, maintainability, and honest verification. Do not stop at analysis or backend code when the request calls for a complete visualization.