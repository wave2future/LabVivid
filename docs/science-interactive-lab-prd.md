# Science Interactive Lab PRD

## 1. Document Info

| Item | Content |
| --- | --- |
| Product Name | LabVivid |
| Product Type | Cross-platform interactive science simulation and learning platform |
| Target Platforms | Web, desktop, mobile |
| Document Version | v0.1 |
| Date | 2026-06-15 |
| Owner | TBD |

## 2. Product Summary

Science Interactive Lab is an interactive model demonstration platform for physics, chemistry, mathematics, and related science subjects. It helps learners understand abstract concepts through real-time simulation, parameter adjustment, visual feedback, data charts, guided experiments, and optional AI explanations.

The product is inspired by interactive science platforms such as PhET, but it does not aim to copy PhET directly. The initial direction is to build a modern Web-first science lab that supports simulation, learning guidance, experiment recording, state sharing, and future extensibility for teachers and model creators.

## 3. Background and Opportunity

Many science concepts are difficult to understand through static text, formulas, or videos alone. Students need to manipulate variables, observe changes, compare results, and connect formulas with visual phenomena.

Existing simulation tools are useful, but many have limitations:

- Some are isolated single-purpose demos with weak experiment tracking.
- Many do not provide personalized explanation based on the current model state.
- Teachers often need better ways to prepare, share, and reuse interactive experiments.
- Mobile and desktop experiences are often inconsistent.
- Custom model creation is usually difficult for non-programmers.

Science Interactive Lab can differentiate by combining interactive simulations, guided inquiry, experiment records, shareable states, and AI-assisted explanation.

## 4. Product Goals

### 4.1 Short-Term Goals

- Build a usable Web-first MVP with several high-quality science models.
- Support real-time parameter adjustment, animation, charts, and experiment reset.
- Support saving and sharing model states.
- Provide lightweight AI explanations for selected simulations.
- Ensure the experience works on desktop and mobile browsers.

### 4.2 Mid-Term Goals

- Add teacher-oriented lesson preparation and classroom demonstration features.
- Add experiment notebooks and student learning reports.
- Expand model coverage across physics, chemistry, and mathematics.
- Package the Web app into desktop and mobile apps.

### 4.3 Long-Term Goals

- Build a model creation ecosystem.
- Support low-code model authoring.
- Allow creators and teachers to publish reusable simulations.
- Build a marketplace or content library for interactive science learning.

## 5. Target Users

### 5.1 Primary Users

#### Students

Students use the product to understand abstract scientific concepts through interaction.

Needs:

- Quickly understand concepts visually.
- Adjust parameters and observe results.
- Get explanations when confused.
- Review experiment history and conclusions.

#### Teachers

Teachers use the product to demonstrate concepts, prepare lessons, and assign interactive experiments.

Needs:

- Quickly find suitable models for a class topic.
- Set initial experiment parameters.
- Share experiment links with students.
- Use simulations during live teaching.

### 5.2 Secondary Users

#### Parents

Parents may use the product to support STEM learning at home.

#### Content Creators

Advanced users may eventually create and publish custom models.

## 6. Product Positioning

Science Interactive Lab should be positioned as:

> A cross-platform interactive science lab that helps students learn by manipulating models, observing outcomes, and receiving guided explanations.

It should not be positioned only as:

- A static course platform.
- A video learning product.
- A pure formula calculator.
- A general chatbot.

## 7. Core User Scenarios

### 7.1 Student Self-Learning

1. Student opens a model such as projectile motion.
2. Student adjusts launch angle and initial velocity.
3. The animation and trajectory chart update immediately.
4. Student compares different parameter settings.
5. Student asks why the range changes.
6. AI explanation references the current model state.
7. Student saves the experiment result.

### 7.2 Teacher Classroom Demonstration

1. Teacher opens a model before class.
2. Teacher selects a preset such as "high speed, low angle".
3. Teacher projects the simulation on screen.
4. Teacher pauses, resumes, and resets the model during explanation.
5. Teacher shares the configured state with students after class.

### 7.3 Guided Experiment

1. Student enters guided mode.
2. The system asks the student to predict what will happen.
3. Student changes one variable.
4. Student runs the simulation.
5. The system compares the observed result with the expected concept.
6. Student receives a short conclusion.

### 7.4 Experiment State Sharing

1. User configures model parameters.
2. User clicks share.
3. The system generates a URL containing the model ID and state.
4. Another user opens the URL and sees the same model configuration.

## 8. MVP Scope

### 8.1 MVP Must-Have Features

#### Model Library

- Show a list of available models.
- Support category filtering by subject.
- Support model detail pages.
- Show model title, description, difficulty, and tags.

#### Interactive Simulation

- Render model animation in real time.
- Provide parameter controls such as sliders, switches, numeric inputs, and dropdowns.
- Support pause, resume, reset, and step execution where applicable.
- Support responsive layout for desktop and mobile.

#### Data Visualization

- Show key calculated values.
- Show charts for selected models.
- Support at least line charts and simple data tables.

#### Experiment State

- Store current parameter state in the URL or local storage.
- Support reset to default.
- Support copy/share link.

#### AI Explanation

- Provide a text-based explanation panel.
- Explain current phenomenon based on selected model and parameter state.
- Support suggested questions.
- Keep AI responses grounded in the model context.

#### Basic Experiment Notes

- Allow users to save simple notes locally.
- Save model name, parameters, timestamp, and optional observation text.

### 8.2 MVP Nice-to-Have Features

- Screenshot export.
- Compare two experiment runs.
- Full-screen classroom mode.
- Offline PWA support.
- Basic multilingual interface.

### 8.3 Out of MVP Scope

- Full teacher classroom management.
- Student accounts and grading.
- Low-code model editor.
- Creator marketplace.
- Payment system.
- Advanced LMS integration.

## 9. Recommended MVP Model Set

The MVP should start with 4 high-quality models rather than many shallow models.

### 9.1 Physics: Projectile Motion

Concepts:

- Initial velocity
- Launch angle
- Gravity
- Horizontal and vertical components
- Range and maximum height

Controls:

- Launch angle
- Initial speed
- Gravity
- Air resistance toggle, optional in v2

Views:

- Motion animation
- Trajectory chart
- Real-time values

### 9.2 Physics: Ohm's Law Circuit

Concepts:

- Voltage
- Current
- Resistance
- Power

Controls:

- Voltage slider
- Resistance slider
- Circuit open/closed toggle

Views:

- Circuit diagram
- Current visualization
- Formula panel
- Data values

### 9.3 Chemistry: Acid-Base Titration

Concepts:

- pH
- Neutralization
- Concentration
- Equivalence point

Controls:

- Acid concentration
- Base concentration
- Added volume
- Indicator type

Views:

- Beaker animation
- pH curve
- Current pH value

### 9.4 Mathematics: Function Transformation

Concepts:

- Translation
- Scaling
- Reflection
- Function parameters

Controls:

- Function type
- Horizontal shift
- Vertical shift
- Scale factor
- Reflection toggle

Views:

- Coordinate graph
- Formula display
- Parameter effect hints

## 10. Functional Requirements

### 10.1 Model Library

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | Users can browse all available models. | P0 |
| FR-002 | Users can filter models by subject. | P0 |
| FR-003 | Users can search models by keyword. | P1 |
| FR-004 | Each model shows title, description, subject, difficulty, and tags. | P0 |

### 10.2 Simulation Runtime

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-005 | The runtime can load a model definition and render its UI controls. | P0 |
| FR-006 | Parameter changes update the simulation in real time. | P0 |
| FR-007 | Users can pause, resume, and reset simulations. | P0 |
| FR-008 | Users can step through simulation frames when supported by the model. | P1 |
| FR-009 | The runtime supports deterministic reset to default state. | P0 |

### 10.3 Visualization

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-010 | Models can render 2D animation using Canvas or SVG. | P0 |
| FR-011 | Models can display line charts. | P0 |
| FR-012 | Models can display current numeric values. | P0 |
| FR-013 | Models can show formula references. | P1 |
| FR-014 | Future versions can support 3D models. | P2 |

### 10.4 Experiment State and Sharing

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-015 | Current model parameters can be serialized. | P0 |
| FR-016 | Users can copy a shareable link for the current model state. | P0 |
| FR-017 | Opening a shared link restores the model and parameters. | P0 |
| FR-018 | Users can save experiment notes locally. | P1 |

### 10.5 AI Explanation

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-019 | Users can request an explanation for the current model state. | P0 |
| FR-020 | AI explanation includes current parameter values when relevant. | P0 |
| FR-021 | AI response should avoid unsupported claims outside the model context. | P0 |
| FR-022 | The system can provide suggested questions. | P1 |
| FR-023 | AI explanation can be disabled by configuration. | P1 |

### 10.6 Cross-Platform

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-024 | The Web app works on modern desktop browsers. | P0 |
| FR-025 | The Web app works on mobile browsers. | P0 |
| FR-026 | The layout adapts to touch input. | P0 |
| FR-027 | The product can be packaged as a desktop app in a later phase. | P1 |
| FR-028 | The product can be packaged as a mobile app in a later phase. | P1 |

## 11. Non-Functional Requirements

### 11.1 Performance

- Initial page load should be fast enough for classroom use.
- Parameter changes should feel immediate.
- Target simulation frame rate: 60 FPS for simple 2D models on desktop, 30 FPS or higher on common mobile devices.
- Heavy AI requests should not block simulation interaction.

### 11.2 Usability

- Controls must be clear and touch-friendly.
- Reset and pause actions must be easy to find.
- The model should be understandable without reading a long manual.
- Mobile layout should prioritize the simulation first, then controls and explanation.

### 11.3 Reliability

- Invalid parameter values should be clamped to safe ranges.
- Shared state URLs should fail gracefully if parameters are invalid.
- AI errors should show a simple fallback message.

### 11.4 Accessibility

- Core controls should be keyboard accessible.
- Charts should provide textual summaries where possible.
- Color should not be the only way to convey important information.

### 11.5 Localization

- UI text should be prepared for future localization.
- First version can support Chinese and English if resources allow.

## 12. Proposed Information Architecture

```text
Home / Model Library
  ├─ Physics
  │   ├─ Projectile Motion
  │   └─ Ohm's Law Circuit
  ├─ Chemistry
  │   └─ Acid-Base Titration
  └─ Mathematics
      └─ Function Transformation

Model Page
  ├─ Simulation Canvas
  ├─ Parameter Controls
  ├─ Data and Charts
  ├─ AI Explanation
  ├─ Experiment Notes
  └─ Share / Reset / Full Screen
```

## 13. Suggested Technical Architecture

### 13.1 Architecture Principle

Use a Web-first architecture. The core simulation runtime, UI, model definitions, and AI explanation system should run in the Web app. Desktop and mobile apps can later wrap the same Web core.

```text
Web Core
  ├─ Model Runtime
  ├─ Simulation Renderer
  ├─ Parameter Control System
  ├─ Chart and Data Layer
  ├─ Experiment State Manager
  ├─ AI Explanation Client
  └─ Model Library UI

Distribution
  ├─ Browser Web App
  ├─ PWA
  ├─ Desktop Wrapper: Tauri or Electron
  └─ Mobile Wrapper: Capacitor
```

### 13.2 Recommended Stack

| Layer | Recommendation |
| --- | --- |
| Frontend | React + TypeScript or Vue + TypeScript |
| App Framework | Next.js if SEO/content pages matter, Vite if simulation app speed matters |
| 2D Rendering | Canvas, SVG, PixiJS |
| 3D Rendering | Three.js in later phases |
| Physics Engine | Matter.js, Planck.js, Rapier, or custom equations per model |
| Charts | ECharts, D3, or Observable Plot |
| Formula Rendering | KaTeX or MathJax |
| Backend | Node.js/NestJS or FastAPI |
| Database | PostgreSQL |
| AI | OpenAI API or compatible LLM provider |
| Desktop | Tauri preferred for lightweight packaging |
| Mobile | PWA first, Capacitor later |

### 13.3 Model Definition Concept

Each model should have a structured definition for metadata, variables, controls, views, presets, and runtime logic.

Example:

```json
{
  "id": "projectile-motion",
  "title": "Projectile Motion",
  "subject": "physics",
  "difficulty": "middle-school",
  "variables": {
    "angle": 45,
    "speed": 20,
    "gravity": 9.8
  },
  "controls": [
    { "type": "slider", "key": "angle", "min": 0, "max": 90, "step": 1 },
    { "type": "slider", "key": "speed", "min": 1, "max": 100, "step": 1 },
    { "type": "slider", "key": "gravity", "min": 1, "max": 20, "step": 0.1 }
  ],
  "views": ["animation", "chart", "data"],
  "presets": [
    { "name": "Default", "variables": { "angle": 45, "speed": 20, "gravity": 9.8 } },
    { "name": "Low Angle", "variables": { "angle": 20, "speed": 25, "gravity": 9.8 } }
  ]
}
```

## 14. AI Explanation Design

### 14.1 AI Input Context

The AI system should receive:

- Model ID and title.
- Subject and target level.
- Current parameter values.
- Current calculated results.
- Model-specific concept notes.
- User question.

### 14.2 AI Output Requirements

AI responses should:

- Explain the current phenomenon.
- Reference visible values when helpful.
- Use age-appropriate language.
- Avoid pretending to run calculations that are not provided.
- Encourage observation and comparison.

### 14.3 Example AI Prompt Shape

```text
You are a science tutor. Explain the current simulation state to a student.

Model: Projectile Motion
Level: Middle school
Parameters:
- angle: 45 degrees
- speed: 20 m/s
- gravity: 9.8 m/s^2

Calculated results:
- range: 40.8 m
- max height: 10.2 m

User question:
Why does the range change when I change the angle?

Answer clearly, briefly, and grounded in the provided simulation state.
```

## 15. UX Principles

- The simulation should be the main visual focus.
- Controls should be close to the part of the model they affect.
- Charts and data should support observation, not overwhelm the user.
- AI explanation should be optional and secondary to interaction.
- Mobile design should avoid dense sidebars.
- Classroom mode should reduce visual clutter.

## 16. Page-Level UX Outline

### 16.1 Model Library Page

Primary elements:

- Subject tabs or filters.
- Search input.
- Model cards.
- Difficulty and tag indicators.
- Continue recent experiment, optional.

### 16.2 Model Page

Desktop layout:

- Left or center: simulation area.
- Right: parameter controls.
- Bottom or side: charts and data.
- Collapsible panel: AI explanation and notes.

Mobile layout:

- Top: simulation area.
- Middle: compact controls.
- Bottom: tabs for data, AI explanation, and notes.

### 16.3 Classroom Mode

Primary elements:

- Large simulation.
- Minimal controls.
- Full-screen support.
- Larger labels and values.

## 17. Data Model Draft

### 17.1 Model Metadata

```ts
type ModelMetadata = {
  id: string;
  title: string;
  subject: "physics" | "chemistry" | "math" | "biology" | "engineering";
  description: string;
  difficulty: string;
  tags: string[];
  defaultVariables: Record<string, number | string | boolean>;
};
```

### 17.2 Experiment State

```ts
type ExperimentState = {
  modelId: string;
  variables: Record<string, number | string | boolean>;
  timestamp: string;
  notes?: string;
};
```

### 17.3 AI Explanation Request

```ts
type AIExplanationRequest = {
  modelId: string;
  modelTitle: string;
  level: string;
  variables: Record<string, unknown>;
  computedValues: Record<string, unknown>;
  userQuestion: string;
};
```

## 18. Success Metrics

### 18.1 Product Metrics

- Number of completed simulation sessions.
- Average interaction time per model.
- Number of shared experiment links.
- Number of saved experiment notes.
- AI explanation usage rate.

### 18.2 Learning-Oriented Metrics

- Percentage of users who complete guided experiments.
- Correct prediction rate before and after interaction.
- Teacher reuse rate for classroom mode.
- Student self-reported understanding improvement.

### 18.3 Technical Metrics

- Simulation frame rate.
- Page load time.
- AI response latency.
- Error rate for shared links.
- Mobile interaction success rate.

## 19. Milestones

### Phase 0: Product and Technical Design

Estimated duration: 1 week

Deliverables:

- Final PRD.
- Technical architecture document.
- Model runtime design.
- MVP model calculation specs.
- UX wireframes.

### Phase 1: MVP Prototype

Estimated duration: 3 to 4 weeks

Deliverables:

- Web app shell.
- Model library page.
- Shared model runtime.
- Projectile motion model.
- Function transformation model.
- Basic responsive layout.

### Phase 2: MVP Completion

Estimated duration: 3 to 4 weeks

Deliverables:

- Ohm's law model.
- Acid-base titration model.
- Charts and data panels.
- Shareable model state.
- Local experiment notes.
- AI explanation panel.

### Phase 3: Packaging and Polish

Estimated duration: 2 to 3 weeks

Deliverables:

- PWA support.
- Desktop packaging prototype.
- Mobile layout polish.
- Classroom mode.
- Performance optimization.
- Basic analytics.

### Phase 4: Expansion

Estimated duration: ongoing

Deliverables:

- More models.
- Teacher lesson tools.
- Guided experiment templates.
- User accounts.
- Cloud experiment history.
- Low-code model editor exploration.

## 20. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope becomes too large | Delayed MVP | Limit MVP to 4 high-quality models |
| Simulation accuracy issues | Loss of trust | Define formula specs and test cases per model |
| Mobile interactions feel crowded | Poor adoption | Design mobile layout from the start |
| AI gives inaccurate explanations | Learning risk | Ground AI prompts in model state and concept notes |
| Model implementation becomes inconsistent | Maintenance cost | Build shared runtime and model definition format early |
| Too much focus on platform before content | Weak user value | Ship useful models before low-code authoring |

## 21. Open Questions

1. Should the first target user be students, teachers, or both?
2. Should the first version use Chinese, English, or bilingual UI?
3. Should AI explanation be mandatory in MVP or optional after the first prototype?
4. Should experiment history be local-only first or cloud-backed from day one?
5. Should the first technical stack be React/Vite or Next.js?
6. Should desktop packaging be included in MVP or after Web validation?

## 22. Recommended MVP Decision

Recommended first version:

- Target user: students and teachers, with student self-learning as the primary flow.
- Platform: Web app first.
- Packaging: PWA first, desktop and mobile wrappers later.
- Models: projectile motion, function transformation, Ohm's law, acid-base titration.
- AI: lightweight explanation panel, optional and non-blocking.
- Storage: local experiment notes and shareable URL state first.

This keeps the first release focused, testable, and extensible while leaving room for a larger teacher platform and model creation ecosystem later.

