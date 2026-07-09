# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

**Devcomp** (Développement de Compétences) manages interactive learning modules and trainings. It covers:

- **Modules** — interactive learning content stored as JSON files, delivered through grains and elements
- **Passages** — user sessions tracking progress through a module
- **Trainings** — curated resources (modules, external links) tied to target profiles and recommendation triggers
- **Tutorials** — supplementary learning content users can save and rate
- **Recommendations** — trigger-based engine suggesting trainings based on user competency levels

## Commands

From `api/`:

```bash
# Run all devcomp tests
npm run test:api:unit -- --grep devcomp

# Run a specific test file
npm run test:api -- tests/devcomp/unit/domain/usecases/get-module_test.js

# Validate module JSON files
npm run modulix:test

# Load only DevComp seeds (faster local DB reset)
export SEEDS_CONTEXT=DEVCOMP
npm run db:reset
```

## Architecture

### Module content

Modules are stored as JSON files in `infrastructure/datasources/learning-content/modules/` (72 modules). They are loaded at startup into an in-memory datasource (`module-datasource.js`) and never persisted to the database. A SHA256 hash of the content serves as the module version.

The `ModuleFactory` (`infrastructure/factories/module-factory.js`) recursively builds the full domain object tree: `Module → Sections → Grains → Components → Elements`. Element type dispatch happens here.

### Element types

Elements are either **non-answerable** (Text, Video, Audio, Image, Separator, Expand…) or **answerable** (QCM, QCU, QCUDeclarative, QCUDiscovery, QROCM, Embed, Flashcards, QAB). Answerable elements have an `assess()` method and a corresponding `Validator*` class in `domain/models/validator/`.

### Passage lifecycle

1. `createPassage()` — creates a DB row, returns a `Passage` with `id`, `moduleId`, `userId`
2. `verifyAndSaveAnswer()` — delegates to `ElementAnswer` which calls `element.assess()`; saves result
3. `recordPassageEvents()` — stores typed events (`PassageEvent` subclasses) with `sequenceNumber` and `contentHash` (the module version hash)
4. `terminatePassage()` — sets `terminatedAt`

### Training recommendation

`TrainingTrigger` has type `PREREQUISITE` or `GOAL` and a skill threshold. `isFulfilled()` checks knowledge elements against that threshold. `Training.shouldBeObtained()` iterates triggers to determine if a training applies. The recommendation event flow goes through `handleTrainingRecommendation()`.

### Cross-context integration

Devcomp imports external repositories by name (injected via DI) from:

- `prescription` context — campaigns, target profiles
- `shared` context — knowledge elements, skills, tubes
- `identity-access-management` context — users

These are never imported directly; they arrive as injected parameters.

### Domain errors

Defined in `domain/errors.js`: `ModuleDoesNotExistError`, `PassageDoesNotExistError`, `PassageTerminatedError`, `ModuleInstantiationError`, `ElementInstantiationError`.

## Key files

| Concern            | Path                                                               |
| ------------------ | ------------------------------------------------------------------ |
| Route registration | `routes.js`                                                        |
| Usecase DI wiring  | `domain/usecases/index.js`                                         |
| Repository exports | `infrastructure/repositories/index.js`                             |
| Module datasource  | `infrastructure/datasources/learning-content/module-datasource.js` |
| Module factory     | `infrastructure/factories/module-factory.js`                       |
| Domain errors      | `domain/errors.js`                                                 |
