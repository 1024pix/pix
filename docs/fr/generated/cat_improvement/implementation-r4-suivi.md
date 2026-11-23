# Règle R4 : suivi de l'implémentation

Ce qui est fait et ce qu'il reste à faire pour la règle R4 (R1 + R3) dans le CAT de certification v3.

Documents parents :

- [regle-r4-echecs-capacite.md](./regle-r4-echecs-capacite.md) : étude de faisabilité de R4 ;
- [regles-arret-cat.md](./regles-arret-cat.md) : panorama des règles d'arrêt.

Branche : `poc-early-diag-escape`.

## Sommaire

1. [Règle implémentée](#1-règle-implémentée)
2. [Ce qui est fait](#2-ce-qui-est-fait)
3. [Choix faits par défaut](#3-choix-faits-par-défaut)
4. [Ce qu'il reste à faire](#4-ce-quil-reste-à-faire)

---

## 1. Règle implémentée

Une fois que le candidat a répondu à au moins `n_min` questions, le test s'arrête si **les deux** conditions sont vraies :

- **R1 :** les `k` dernières réponses sont des échecs consécutifs.
- **R3 :** P(θ < θ_seuil | réponses) ≥ 1 − α.

R3 est calculée par **approximation normale** (section 3.3.2 de l'étude) : la distribution a posteriori est assimilée à N(`capacity`, `errorRate`), et la probabilité vaut Φ((θ_seuil − `capacity`) / `errorRate`). Le code de `flash.js` n'est pas modifié.

---

## 2. Ce qui est fait

### 2.1 Commits

Chaque commit contient une seule fonctionnalité et ses tests. Tous les tests passent après chaque commit.

| Commit | Contenu |
|---|---|
| `7b3ad4324b` | `normalCdf` : fonction de répartition de la loi normale |
| `f5a43110e4` | `countTrailingFailures` : compteur d'échecs consécutifs |
| `b46056d421` | `getProbabilityBelowThreshold` : P(θ < θ_seuil) par approximation normale |
| `c558347f83` | `hasConsecutiveFailures` : condition R1 |
| `73cc77ad4d` | `isCapacityProbablyBelowThreshold` : condition R3 |
| `2778843136` | `shouldStopEarly` : règle R4 |
| `ff7052f1f8` | Paramètres optionnels dans `FlashAssessmentAlgorithmConfiguration` |
| `a41daff752` | Branchement dans `FlashAssessmentAlgorithm.getPossibleNextChallenges` |

### 2.2 Fonctions pures

Fichier : `api/src/certification/evaluation/domain/services/algorithm-methods/early-stop.js`

| Fonction | Rôle |
|---|---|
| `normalCdf(z)` | Fonction de répartition de la loi normale (Abramowitz & Stegun 7.1.26, erreur < 1,5·10⁻⁷). Ne dépend d'aucune bibliothèque |
| `countTrailingFailures(answers)` | Nombre d'échecs consécutifs à la fin de la liste des réponses |
| `getProbabilityBelowThreshold({ capacity, errorRate, threshold })` | P(θ < seuil) par approximation normale. `errorRate` a un plancher, pour gérer `NaN`, 0 ou une valeur négative |
| `hasConsecutiveFailures({ answers, consecutiveFailures })` | **R1** |
| `isCapacityProbablyBelowThreshold({ capacity, errorRate, capacityThreshold, confidence })` | **R3** |
| `shouldStopEarly({ answers, capacity, errorRate, consecutiveFailures, minimumLength, capacityThreshold, confidence })` | **R4** : `n_min` atteint, puis R1 ET R3 |

Tests : `api/tests/certification/evaluation/unit/domain/services/algorithm-methods/early-stop_test.js` (24 tests).

- Φ est testée sur des valeurs de référence : Φ(0) = 0,5, Φ(1,645) ≈ 0,95, Φ(±1,96) et les extrêmes.
- Le compteur est testé sur une liste vide, une série coupée par une réussite et une réponse `SKIPPED`.
- Les autres tests couvrent le plancher de `errorRate` et chaque cas où R4 ne se déclenche pas.

### 2.3 Configuration

Fichier : `api/src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js`

| Paramètre | Notation | Validation |
|---|---|---|
| `earlyStopConsecutiveFailures` | k | entier ≥ 1 ou `null`. **`null` désactive la règle**, c'est la valeur par défaut |
| `earlyStopMinimumLength` | n_min | entier ≥ 0, obligatoire si k est renseigné |
| `earlyStopCapacityThreshold` | θ_seuil | nombre, obligatoire si k est renseigné |
| `earlyStopConfidence` | 1 − α | nombre strictement entre 0 et 1, obligatoire si k est renseigné |

Le getter `isEarlyStopEnabled` indique si la règle est active.

Tests : `FlashAssessmentAlgorithmConfiguration_test.js`. Ils vérifient :

- la désactivation par défaut ;
- l'activation quand tous les paramètres sont renseignés ;
- les paramètres manquants ou invalides.

Le test d'intégration `version-repository_test.js:278` vérifiait l'égalité exacte avec un objet qui n'a pas ces champs. Il utilise maintenant `deep.include` au lieu de `deep.equal`.

### 2.4 Branchement

Fichier : `api/src/certification/evaluation/domain/models/FlashAssessmentAlgorithm.js`

- `getPossibleNextChallenges` récupère maintenant `errorRate` en plus de `capacity`.
- Si la règle est active et que R4 se déclenche, la méthode renvoie `[]`. `get-next-challenge` lève alors `AssessmentEndedError`, comme à la fin normale d'un test.
- Comme il n'y a pas d'`abortReason`, le scoring ne dégrade pas la capacité et ne rejette pas le test pour manque de réponses (section 2.2 de l'étude).

Tests : `FlashAssessmentAlgorithm_test.js`. Trois cas sont couverts :

- R4 se déclenche : la méthode renvoie `[]` et ne sélectionne aucune question ;
- la capacité n'est pas basse : la méthode renvoie les questions suivantes ;
- la règle est désactivée : la méthode renvoie les questions suivantes.

### 2.5 Vérifications

Environnement : Node 24.22.3 (version exigée par le projet), `npm ci`, Postgres 17 et Redis, base de test recréée avec `npm run test:db:reset`.

| Vérification | Résultat |
|---|---|
| Suite unitaire complète (`npm run test:api:unit`) | ✅ 9 630 tests OK |
| Tests d'intégration et d'acceptation de `tests/certification/**` et `assessment-controller-get-next-challenge-for-certification_test.js` | ✅ 1 000 tests OK |
| `lint:js`, `lint:format`, `lint:types`, `lint:dependencies` | ✅ |
| `lint:context-deps` (`depcruise`) | ✅ aucune violation de dépendance |
| `lint:filenames` | ⚠️ échoue uniquement sur des dossiers locaux qui ne viennent pas de la branche (`--cache-strategy`, `.zed`) |

---|---|
| Tests unitaires qui touchent la configuration et l'algorithme (15 fichiers) | ✅ 131 tests OK |
| `eslint` et `oxfmt` sur les fichiers modifiés | ✅ |
| Tests d'intégration et d'acceptation | ⚠️ Non lancés : Redis et Postgres étaient éteints en local |
| `depcruise` | ⚠️ Non lancé : la version de Node locale (25.5) n'est pas supportée. L'import ajouté reste dans le contexte `evaluation` |
| Suite unitaire complète | ⚠️ Non lancée : les `node_modules` locaux ne sont pas à jour (`zip-stream` manquant) |

---

## 3. Choix faits par défaut

Ces choix correspondent à des questions ouvertes de l'étude (section 4). Ils restent à valider.

| Sujet | Choix actuel | Alternative |
|---|---|---|
| Statuts comptés comme échecs | Tout statut autre que `OK`, y compris `SKIPPED`, `TIMEDOUT` et `FOCUSEDOUT` | Compter `KO` seulement |
| Questions neutralisées ou avec alerte | Non traitées : elles comptent selon leur statut | Les ignorer, ou remettre le compteur à zéro |
| Réponses trop rapides | Non traitées | Les exclure du compteur |
| Fréquence des contrôles | À chaque question à partir de `n_min` | Contrôles à des points fixes (12, 16, 20, 24) pour limiter les faux arrêts |
| R3 | Approximation normale | Somme exacte de la masse a posteriori (section 3.3.3 de l'étude) |

> ⚠️ Avec un contrôle à chaque question, un niveau de confiance de « 0,95 » arrête 12 à 42 % des candidats situés au seuil dans les simulations (section 3.3.4 de l'étude). Il faut calibrer `earlyStopConfidence` par rejeu ; on ne peut pas l'interpréter comme un risque de 5 %.

---

## 4. Ce qu'il reste à faire

### 4.1 Pour rendre la règle utilisable

| Tâche | Où | Remarque |
|---|---|---|
| Lire et enregistrer les 4 paramètres | `version-repository.js` (fonction `_toDomain`, ligne ~183) | **Sans cette tâche, la règle est toujours inactive**, car les paramètres ne sont jamais lus depuis la base |
| Accepter les paramètres à la mise à jour d'une version | `Version.js` (`update`, ligne ~134), usecase `update-version` | |
| Exposer les paramètres en lecture | `version-details-repository.js` | |
| Modifier les paramètres depuis l'admin | front admin, route de mise à jour de version | Optionnel si la configuration se fait par script |
| Factories de test | `build-flash-algorithm-configuration.js`, `build-version.js` | Ajouter les paramètres pour faciliter les tests |

### 4.2 Effets de bord à neutraliser ou vérifier

| Appelant de `getPossibleNextChallenges` | Fichier | À décider |
|---|---|---|
| Dégradation de capacité | `scoring-degradation-service.js` | R4 ne doit probablement pas s'y appliquer : prévoir une option pour la désactiver |
| Simulateur de passations | `AssessmentSimulatorSingleMeasureStrategy.js` | Garder R4, pour simuler son effet, ou la désactiver |
| Simulateur de scénarios | `simulate-flash-assessment-scenario.js` | Construit sa propre configuration : y ajouter les paramètres si on veut simuler R4 |

### 4.3 Étude et calibrage

Le plan de simulation détaillé (paramétrages, scénarios, indicateurs) est dans [simulations/scenario/scenarios-simulation-r4.md](./simulations/scenario/scenarios-simulation-r4.md).

- **Rejeu A–E** sur les certifications v3 terminées (section 3.5 de l'étude). Il sert à choisir k, `n_min`, θ_seuil et le niveau de confiance. C'est la **prochaine étape conseillée**, car les valeurs des paramètres en dépendent. Les fonctions pures de `early-stop.js` peuvent être réutilisées telles quelles dans le script de rejeu.
- Mesurer la couverture de la banque en items faciles, pour savoir si la condition sur k filtre vraiment quelque chose (section 3.3.4 de l'étude).
- Trancher les questions de la [section 3](#3-choix-faits-par-défaut), puis ajuster `countTrailingFailures` en conséquence.
- Faire valider par la psychométrie, le juridique et l'accessibilité avant toute mise en production.

### 4.4 Front et communication

- Afficher « jusqu'à N questions » au lieu de « N questions » dans les consignes (`mon-pix/app/components/certification-instructions/step-two.gjs`).
- Vérifier la barre de progression et l'écran de fin de test quand le test s'arrête plus tôt.
- Préparer un message pour expliquer un arrêt anticipé au candidat et au surveillant.

### 4.5 Tests restants

- Ajouter un test d'intégration du scoring : un test court sans `abortReason` n'est ni dégradé ni rejeté pour manque de réponses.
- Ajouter un test de bout en bout de `get-next-challenge` : quand R4 se déclenche, `AssessmentEndedError` est levée.

---

## Changelog

- **2026-11-23** : section 4.3, ajout d'un lien vers le plan de simulation.
- **2026-11-23** : section 2.5 mise à jour après le lancement des suites unitaire, d'intégration et d'acceptation, et du lint complet.
- **2026-11-23** : commits découpés en une fonctionnalité et ses tests par commit (8 commits au lieu de 3). Mise à jour du tableau 2.1.
- **2026-11-23** : création du document. Il décrit les commits (fonctions pures, configuration, branchement), les vérifications effectuées, les choix faits par défaut et ce qu'il reste à faire (persistance des paramètres, effets de bord, calibrage, front, tests).
