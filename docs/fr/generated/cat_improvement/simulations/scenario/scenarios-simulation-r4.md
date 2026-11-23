# Simulations de la règle R4 : paramétrages et scénarios

Ce document décrit le plan de simulation pour calibrer la règle d'arrêt anticipé R4 (k échecs consécutifs ET P(θ < θ_seuil) ≥ 1 − α) sur un **test de 16 questions**, avec une banque dont les difficultés vont de **−7 à 8**.

L'algorithme est configuré **sans passage obligatoire par toutes les compétences** (`enablePassageByAllCompetences: false`) et avec **5 questions d'écart** entre deux questions d'une même compétence (`challengesBetweenSameCompetence: 5`).

Documents liés :

- [regle-r4-echecs-capacite.md](../../regle-r4-echecs-capacite.md) : étude de faisabilité, et en particulier la section 3.3.4 sur les simulations synthétiques ;
- [implementation-r4-suivi.md](../../implementation-r4-suivi.md) : état de l'implémentation.

## Sommaire

1. [Hypothèses](#1-hypothèses)
2. [Conséquences d'un test de 16 questions](#2-conséquences-dun-test-de-16-questions)
3. [Paramètres existants : à garder, changer ou arbitrer](#3-paramètres-existants--à-garder-changer-ou-arbitrer)
4. [Méthode : simuler une fois, évaluer a posteriori](#4-méthode--simuler-une-fois-évaluer-a-posteriori)
5. [Paramétrages d'R4](#5-paramétrages-dr4)
6. [Scénarios de candidats](#6-scénarios-de-candidats)
7. [Variantes de banque](#7-variantes-de-banque)
8. [Indicateurs et critères d'acceptation](#8-indicateurs-et-critères-dacceptation)
9. [Plan d'exécution](#9-plan-dexécution)
10. [Limites](#10-limites)

---

## 1. Hypothèses

### 1.1 Test

- **16 questions au maximum** (`maximumAssessmentLength` = 16).
- **16 compétences** dans le référentiel cœur. Cette hypothèse est à vérifier sur la version utilisée, car le calcul de la [section 2.1](#21-combien-de-passages-par-compétence-) en dépend.
- **Pas de passage obligatoire par toutes les compétences** : l'algorithme peut ne jamais poser de question sur certaines compétences.
- **5 questions d'écart** entre deux questions d'une même compétence : 6 questions consécutives portent toujours sur 6 compétences différentes.
- Un minimum de réponses pour valider une certification, noté **m**, avec **m ≤ 16**. Sa valeur est à fixer dans la version (voir [section 3](#3-paramètres-existants--à-garder-changer-ou-arbitrer)).

### 1.2 Banque de questions

- Les difficultés vont de **−7 à 8**.
- La banque contient donc des questions faciles bien en dessous de la borne basse du premier niveau (−4,67). On est dans le cas de la **banque « large »** de l'étude (section 3.3.4) : les candidats faibles réussissent de temps en temps une question facile, et leurs séries d'échecs restent courtes. La condition « k échecs » **filtre réellement** les faux arrêts.
- ⚠️ Avec 5 questions d'écart, un candidat faible ne reçoit que des questions faciles si celles-ci sont réparties sur **au moins 6 compétences** (voir [section 2](#2-conséquences-dun-test-de-16-questions)). Ce qui compte, c'est donc le **nombre de compétences** qui contiennent des questions faciles.

### 1.3 Configuration de l'algorithme

Les paramètres viennent de la version cœur des seeds, avec une longueur ramenée à 16.

| Paramètre | Valeur |
|---|---|
| `maximumAssessmentLength` | **16** |
| `defaultCandidateCapacity` | −3 |
| `variationPercent` | 0,5 |
| `limitToOneQuestionPerTube` | `true` |
| `enablePassageByAllCompetences` | **`false`** |
| `challengesBetweenSameCompetence` | **5** |
| `defaultProbabilityToPickChallenge` | 51 |
| `minimumAnswersRequiredToValidateACertification` | m ≤ 16, à définir |
| Grille du postérieur (`flash.js`) | 80 points de −9 à 8,775, pas de 0,225 |

### 1.4 Niveaux (seeds, version cœur)

| Niveau | Borne basse | Borne haute |
|---|---|---|
| 0 | −4,67 | −1,4 |
| 1 | −1,4 | −0,519 |
| 2 | −0,519 | 0,6 |
| 3 | 0,6 | 1,5 |
| 4 | 1,5 | 2,25 |
| 5 | 2,25 | 3,1 |
| 6 | 3,1 | 4 |
| 7 | 4 | 8 |

Sous −4,67, la certification est **rejetée** (`reachedMeshIndex === null`). Les bornes de production peuvent différer : il faut les reprendre de la version réellement utilisée avant de lancer la campagne.

---

## 2. Conséquences d'un test de 16 questions

- **Pas de tour des compétences imposé.** Sans `enablePassageByAllCompetences`, l'algorithme choisit les questions les plus informatives au niveau de θ̂, sous deux contraintes seulement :
  - une question par sujet (`limitToOneQuestionPerTube`) ;
  - **5 questions d'écart** entre deux questions d'une même compétence.
- **Le ciblage est meilleur pour les candidats faibles.** L'algorithme n'est plus obligé de poser une question dans une compétence sans question facile. Les échecs « artificiels » liés à une compétence imposée disparaissent largement, et une série d'échecs reflète mieux le niveau réel du candidat : R1 devient un déclencheur plus fiable.
- **Mais il faut au moins 6 compétences avec des questions faciles.** Avec 5 questions d'écart, 6 questions consécutives portent toujours sur 6 compétences différentes. Si les questions faciles sont concentrées dans c compétences, un candidat faible reçoit au plus c questions faciles sur 6 consécutives quand c < 6. Les autres sont trop dures, ce qui recrée des échecs artificiels. La règle n'est contournée que si **toutes** les questions restantes de la banque appartiennent aux 5 dernières compétences : en pratique, jamais.
- **Il faut aussi assez de sujets faciles.** Une même compétence peut revenir jusqu'à 3 fois (voir [section 2.1](#21-combien-de-passages-par-compétence-)), à condition d'avoir 3 sujets différents adaptés au niveau du candidat. Pour qu'un candidat faible reçoive 16 questions faciles, il faut au moins 16 sujets faciles répartis sur au moins 6 compétences.
- **La couverture du référentiel n'est plus garantie.** Plusieurs compétences ne sont jamais évaluées (voir [section 2.1](#21-combien-de-passages-par-compétence-)). C'est un choix de conception à assumer, indépendant d'R4, à valider avec la psychométrie.
- **Le gain maximal d'R4 est de 16 − n_min questions.** Avec n_min = 8, on économise au plus 8 questions ; avec n_min = 12, au plus 4. R4 n'a d'intérêt que si n_min reste nettement sous 16.
- **θ̂ est peu précis.** Avec peu de réponses, `errorRate` reste élevé : R3 atteint plus difficilement le niveau de confiance. C'est elle, plus que k, qui limitera les arrêts.
- **Les contrôles sont peu nombreux.** Entre n_min et 16, il y a peu de contrôles, donc peu d'inflation des faux arrêts due aux contrôles répétés. En revanche, l'a priori recentré rend toujours le postérieur trop confiant.
- **Le départ pèse lourd.** Il y a peu de réponses pour s'éloigner de la capacité de départ (−3) : la variante de départ ([section 6.3](#63-variantes-de-départ)) a un effet sensible.

### 2.1 Combien de passages par compétence ?

**Hypothèses :** 16 compétences, 16 questions, 5 questions d'écart entre deux questions d'une même compétence, pas de passage obligatoire par toutes les compétences.

#### Résultats exacts

| Grandeur | Valeur | Raison |
|---|---|---|
| Passages moyens par compétence | **exactement 1** | 16 questions réparties sur 16 compétences, quel que soit le mode de sélection |
| Passages maximum sur une compétence | **3** | Au plus une question toutes les 6 positions : par exemple aux questions 1, 7 et 13. Un 4e passage demanderait 19 questions |
| Compétences distinctes vues, au minimum | **6** | 6 questions consécutives portent toujours sur 6 compétences différentes |
| Compétences distinctes vues, au maximum | **16** | Une compétence par question |

La moyenne de 1 ne dit rien de la répartition : tout dépend de la façon dont l'algorithme choisit les compétences.

#### Simulation de la répartition

Méthode : 200 000 tirages de Monte-Carlo. À chaque question, on tire une compétence parmi celles qui ne figurent pas dans les 5 dernières, selon trois modèles de préférence :

- **uniforme** : toutes les compétences ont le même poids, ce qui correspond à des questions informatives réparties également ;
- **hétérogène** : des poids décroissants (0,8ⁱ), car certaines compétences offrent plus de questions proches du niveau du candidat ;
- **concentré** : 4 compétences ont un poids 10 fois plus élevé, par exemple parce qu'elles concentrent les questions faciles et que le candidat est faible.

| Modèle | Compétences distinctes vues (moyenne, P5 à P95) | Compétences jamais vues | Maximum de passages sur une compétence (moyenne) |
|---|---|---|---|
| Uniforme | 12,1 (10 à 14) | 3,9 | 2,1 |
| Hétérogène | 10,5 (9 à 12) | 5,6 | 2,6 |
| Concentré | 10,2 (9 à 12) | 5,9 | 2,8 |

Répartition du nombre de passages par compétence :

| Modèle | 0 passage | 1 passage | 2 passages | 3 passages |
|---|---|---|---|---|
| Uniforme | 24,1 % | 52,7 % | 22,3 % | 0,9 % |
| Hétérogène | 34,7 % | 34,9 % | 26,0 % | 4,3 % |
| Concentré | 36,5 % | 34,4 % | 21,6 % | 7,5 % |

#### Lecture

- **En moyenne, on passe 1 fois par compétence.** Mais même dans le cas le plus favorable (modèle uniforme), **près de 30 % des compétences ne sont jamais évaluées**, soit 4 à 5 compétences sur 16, et environ 25 % sont vues 2 fois ou plus.
- **Plus l'algorithme a de préférences, plus la couverture se dégrade.** Pour un candidat faible, dont les questions faciles se trouvent dans quelques compétences, on peut s'attendre à 6 compétences jamais vues et à quelques compétences vues 3 fois.
- **Conséquence pour R4 :** les séries d'échecs d'un candidat faible se concentrent sur les compétences où il existe des questions à son niveau. Si moins de 6 compétences en contiennent, la règle des 5 questions d'écart impose régulièrement des questions trop dures. C'est le cas du modèle concentré, où seules 4 compétences sont favorisées : au moins 2 questions sur 6 tombent alors dans des compétences moins adaptées. La mesure de couverture de la [section 7](#7-variantes-de-banque) doit vérifier ce point.
- **Limite du calcul :** ce modèle ignore deux contraintes qui réduisent encore les répétitions possibles. Une compétence ne peut revenir que si elle a encore des sujets non utilisés, et le choix réel se fait parmi les 5 questions les plus informatives, avec une probabilité de 51 % pour la première. La répartition réelle doit être mesurée sur les passations simulées (indicateur de couverture, [section 8.1](#81-indicateurs-par-paramétrage-et-par-scénario)).

---

## 3. Paramètres existants : à garder, changer ou arbitrer

| Paramètre | Valeur | Décision | Pourquoi |
|---|---|---|---|
| `maximumAssessmentLength` | 16 | Hypothèse | Dans le simulateur, `stopAtChallenge: 16` permet de simuler 16 questions à partir d'une version existante, sans en créer une nouvelle |
| `minimumAnswersRequiredToValidateACertification` | m ≤ 16 | **À arbitrer** | Avec la valeur actuelle de 20, aucun abandon ne serait jamais valide : m doit être ≤ 16. C'est aussi la valeur de référence pour n_min. Un test arrêté par R4 avec moins de m réponses serait valide, alors qu'un abandon avec moins de m réponses est rejeté. Il faut une décision de la psychométrie et du juridique : soit n_min ≥ m, soit une justification écrite de l'écart |
| `enablePassageByAllCompetences` | `false` | **Hypothèse, à valider** | Le ciblage est meilleur et les échecs dus à une compétence imposée disparaissent. En contrepartie, environ 24 à 37 % des compétences ne sont jamais évaluées ([section 2.1](#21-combien-de-passages-par-compétence-)). La psychométrie doit valider ce choix pour la validité du contenu |
| `challengesBetweenSameCompetence` | 5 | **Garder** | C'est la seule contrainte de diversité qui reste : elle limite une compétence à 3 passages au maximum et améliore un peu la couverture. Il faut au moins 6 compétences avec des questions faciles pour qu'elle ne pénalise pas les candidats faibles |
| `limitToOneQuestionPerTube` | `true` | **Garder** | Il assure la diversité des questions. Il intervient peu, puisqu'on ne revient jamais sur une compétence |
| `defaultCandidateCapacity` | −3 | **Garder, tester les variantes D2 et D3** | Un départ plus bas accélère l'arrivée de θ̂ dans la zone d'R4, mais allonge le test des autres candidats |
| `variationPercent` | 0,5 | **Garder** | Il ne freine pas θ̂ dans les zones basses : la marge dépasse 1,5 à θ̂ = −3 |
| `defaultProbabilityToPickChallenge` | 51 | **Garder** | Le tirage se fait parmi les 5 questions les plus informatives de la compétence en cours : effet négligeable sur les séries d'échecs |
| A priori recentré, variance 1,5 (`flash.js`, codé en dur) | — | **Ne pas toucher dans le cadre d'R4** | C'est la cause du postérieur trop confiant. Le corriger changerait la capacité de tous les candidats, donc le scoring et les bornes de niveaux. On fixe plutôt `earlyStopConfidence` par simulation |
| `ERROR_RATE_CLASS_INTERVAL` (`flash.js`) | 9/80 | **À signaler dans un ticket** | La correction de Sheppard utilise la moitié du pas de la grille (18/80) : elle est 4 fois trop faible. L'effet sur `errorRate` est négligeable, mais c'est incohérent avec la grille |

---

## 4. Méthode : simuler une fois, évaluer a posteriori

R4 ne modifie pas la sélection des questions avant le pas où elle se déclenche. Une passation arrêtée au pas t est donc **identique**, jusqu'à t, à la même passation menée jusqu'à 16 questions.

On procède en deux temps :

1. **Simuler des passations complètes de 16 questions**, avec R4 désactivée, grâce au simulateur existant (`POST /api/scenario-simulator`). À chaque question, il renvoie déjà `answerStatus`, `capacity` et `errorRate`.
2. **Appliquer chaque paramétrage a posteriori** sur ces historiques, avec les fonctions pures de `early-stop.js`. Pour chaque passation et chaque paramétrage, on cherche le premier pas t où `shouldStopEarly` renvoie `true`.

Avantages :

- **une seule campagne de simulation** pour toute la grille de paramètres ;
- les paramétrages sont comparés **sur les mêmes passations**, ce qui donne des comparaisons appariées, sans bruit entre configurations ;
- on connaît, pour chaque passation arrêtée, la capacité et le niveau qu'aurait obtenus le candidat en allant jusqu'à 16 questions. Cela mesure directement les **rattrapages**.

### 4.1 Appel du simulateur

L'appel est réservé aux super-admins. La réponse est au format NDJSON : une ligne par passation.

```json
POST /api/scenario-simulator
{
  "versionId": <id de la version cœur>,
  "locale": "fr-fr",
  "capacity": -5,
  "numberOfIterations": 500,
  "stopAtChallenge": 16,
  "accessibilityAdjustmentNeeded": false
}
```

Chaque ligne contient `simulationReport[]`, avec pour chaque question : `difficulty`, `discriminant`, `answerStatus`, `capacity` et `errorRate`.

### 4.2 Évaluation a posteriori (esquisse)

```js
import { shouldStopEarly } from '../src/certification/evaluation/domain/services/algorithm-methods/early-stop.js';

// report : simulationReport d'une passation ; config : un paramétrage de la section 5
function findStopStep(report, config) {
  const answers = report.map(({ answerStatus }) => ({ isOk: () => answerStatus === 'ok' }));
  for (let t = 1; t <= report.length; t++) {
    if (config.checkpoints && !config.checkpoints.includes(t)) continue;
    const { capacity, errorRate } = report[t - 1];
    if (shouldStopEarly({ answers: answers.slice(0, t), capacity, errorRate, ...config })) return t;
  }
  return null; // pas d'arrêt : passation complète
}
```

Le simulateur renvoie `capacity` et `errorRate` **après** la réponse t. C'est exactement ce que `getPossibleNextChallenges` calcule avant de choisir la question t + 1. Un arrêt au pas t = 16 ne fait rien gagner : on ne retient que les pas t < 16.

---

## 5. Paramétrages d'R4

### 5.1 Grille d'exploration

| Paramètre | Valeurs testées | Justification |
|---|---|---|
| k (`earlyStopConsecutiveFailures`) | 2, 3, 4, 5 | Au-delà de 5, R1 ne se déclenche presque jamais avant 16 questions |
| n_min (`earlyStopMinimumLength`) | 6, 8, 10, 12, et m s'il n'en fait pas partie | En dessous de 6, θ̂ n'a pas le temps de quitter la zone de départ. Au-delà de 12, le gain maximal tombe sous 4 questions |
| θ_seuil (`earlyStopCapacityThreshold`) | −4,67 ; −3 ; −1,4 | −4,67 : on n'arrête que des candidats qui seraient rejetés. −1,4 : on arrête aussi des candidats de niveau 0, ce qui change leur résultat. −3 : valeur intermédiaire, pour mesurer la sensibilité |
| 1 − α (`earlyStopConfidence`) | 0,80 ; 0,90 ; 0,95 ; 0,99 ; 0,995 | Le niveau nominal n'est pas calibré, à cause de l'a priori recentré : il faut le fixer empiriquement |
| Fréquence de contrôle | à chaque question ; points fixes 8, 10, 12 ; points fixes 8, 12 | Moins de contrôles, c'est moins d'occasions de faux arrêts |

Cela fait 4 × 4 × 3 × 5 × 3 = **720 combinaisons** (hors m), toutes évaluées sur les mêmes passations.

### 5.2 Paramétrages de référence

Ce sont des configurations nommées, à présenter dans les comparaisons et les graphiques.

| Id | Description | k | n_min | θ_seuil | 1 − α | Contrôle |
|---|---|---|---|---|---|---|
| **P0** | Référence : pas d'arrêt anticipé | — | — | — | — | — |
| **P1** | R1 seule | 4 | 8 | −4,67 | 10⁻⁶ ¹ | chaque question |
| **P2** | R3 seule (approchée) | 1 ² | 8 | −4,67 | 0,95 | chaque question |
| **P3** | R4 nominale | 3 | 8 | −4,67 | 0,95 | chaque question |
| **P4** | R4 prudente | 4 | 10 | −4,67 | 0,99 | chaque question |
| **P5** | R4 agressive | 2 | 6 | −4,67 | 0,90 | chaque question |
| **P6** | R4 alignée sur le minimum de réponses | 3 | m | −4,67 | 0,95 | chaque question |
| **P7** | R4 à points fixes | 3 | 8 | −4,67 | 0,95 | 8, 10, 12 |
| **P8** | R4 à seuil haut (niveau 0 non atteint) | 3 | 8 | −1,4 | 0,99 | chaque question |

¹ Avec une confiance quasi nulle, la condition R3 est toujours vraie : on obtient R1 seule sans modifier le code.
² Avec k = 1, il suffit que la dernière réponse soit un échec : c'est une approximation de R3 seule, car R3 n'est vérifiée qu'après un échec.

---

## 6. Scénarios de candidats

### 6.1 Candidats « modèle » (réponses tirées selon le 2PL)

Le simulateur tire chaque réponse avec P(réussite) = 1 / (1 + exp(−a(θ − b))) (`pickAnswerStatusForCapacity`). Le paramètre `capacity` de la route fixe le θ réel du candidat.

| Id | θ réel | Résultat attendu sur 16 questions | Ce qu'on attend de R4 |
|---|---|---|---|
| C1 | −8 | rejeté | arrêt quasi systématique, dès n_min |
| C2 | −7 | rejeté | arrêt quasi systématique |
| C3 | −6 | rejeté | arrêt fréquent (≥ 60 %) |
| C4 | −5,5 | rejeté | arrêt majoritaire |
| C5 | −5 | rejeté | arrêt possible, mais pas exigé |
| C6 | **−4,67** | **au seuil** | **faux arrêts à mesurer : c'est le point critique** |
| C7 | −4,3 | niveau 0 | arrêt = faux arrêt |
| C8 | −4 | niveau 0 | arrêt = faux arrêt |
| C9 | −3,5 | niveau 0 | quasiment jamais d'arrêt |
| C10 | −3 | niveau 0 | jamais d'arrêt |
| C11 | −2 | niveau 0 | jamais d'arrêt |
| C12 | −1,4 | seuil niveau 0/1 | jamais, sauf avec P8 |
| C13 | 0 | niveau 2 | jamais |
| C14 | 2 | niveau 4 | jamais |
| C15 | 4 | niveau 7 | jamais |

La route accepte `capacity` entre −8 et 8.

**Volume :** 500 passations par θ réel, soit 7 500 passations. À −5, −4,67 et −4,3, on monte à **2 000 passations** pour deux raisons :

- l'intervalle de confiance d'un taux de faux arrêts d'environ 5 % fait alors ± 1 point ;
- avec seulement 16 réponses, les écarts entre paramétrages sont bruités.

### 6.2 Candidats « comportementaux »

Ces scénarios ne suivent pas le modèle 2PL. Ce sont les situations où R4 risque d'être injuste. La route actuelle ne sait générer que des réponses 2PL : il faut **un script** qui appelle directement `AssessmentSimulator` avec un `pickAnswerStatus` adapté, ou une extension de la route.

| Id | Scénario | Modèle de réponse | Risque testé |
|---|---|---|---|
| S1 | **Démarrage difficile** (stress, prise en main) | θ = −2, mais les 4 premières réponses sont forcées en échec | Arrêt d'un candidat de niveau 0 sur un faux départ : quel n_min minimum ? |
| S2 | **Série malchanceuse en cours de test** | θ = −4, puis 3 échecs forcés aux questions 7 à 9 | Robustesse de la condition sur la capacité face à une série isolée |
| S3 | **Décrochage** (abandon moral) | θ = 0 jusqu'à la question 6, puis échecs systématiques | Faut-il arrêter ? Un bon candidat qui décroche serait arrêté et rejeté. C'est une question métier |
| S4 | **Réponses au hasard** | P(réussite) = 0,25, quelle que soit la question | Comportement face à un candidat qui ne lit pas les questions |
| S5 | **Questions passées** (`SKIPPED`) | θ = −3, et 30 % de réponses remplacées par `SKIPPED` | Impact du choix « `SKIPPED` = échec » (voir le suivi, section 3) |
| S6 | **Incident technique** | θ = −3, et 3 réponses consécutives `TIMEDOUT` ou `FOCUSEDOUT` aux questions 6 à 8 | Faut-il exclure ces statuts du compteur ? |
| S7 | **Questions faciles concentrées** | θ = −5, avec une banque où les questions de difficulté < −3 ne sont conservées que dans 4, puis 5, puis 6 compétences (filtre dans le script) | Effet de la règle des 5 questions d'écart : en dessous de 6 compétences faciles, des questions trop dures sont imposées et les séries d'échecs s'allongent |

### 6.3 Variantes de départ

| Id | `initialCapacity` | Intérêt |
|---|---|---|
| D1 | −3 (défaut) | Référence |
| D2 | −5 | Départ bas : θ̂ arrive plus vite dans la zone d'R4. Vérifier qu'il n'y a pas plus de faux arrêts |
| D3 | 0 | Départ haut : θ̂ met plus de temps à descendre, et R4 peut ne jamais avoir le temps de se déclencher en 16 questions |

La route n'accepte que des entiers pour `initialCapacity`.

---

## 7. Variantes de banque

| Id | Banque | Comment l'obtenir | Intérêt |
|---|---|---|---|
| B1 | Complète, difficultés de −7 à 8 | Version cœur, locale `fr-fr` | Cas nominal |
| B2 | Accessibilité | `accessibilityAdjustmentNeeded: true` | Banque réduite : les questions faciles sont-elles toujours disponibles dans chaque compétence ? Il faut s'assurer que R4 ne traite pas les candidats avec aménagement différemment |
| B3 | Pauvre en questions faciles | Ne garder que les difficultés ≥ −3,5 (filtre dans le script) | Cas « banque pauvre » de l'étude : vérifier que k devient redondant et que les faux arrêts augmentent |
| B4 | Autre locale | `fr`, `en`, `nl`… | La couverture en questions faciles peut varier d'une langue à l'autre |

**La mesure de couverture est critique** et doit être faite avant la campagne. Avec 5 questions d'écart, ce qui compte est la **répartition des questions faciles entre les compétences** :

- pour chacune des 16 compétences et chaque banque (B1, B2, B4) : le nombre de questions **et de sujets** de difficulté < −4,67 et < −3 ;
- le **nombre de compétences** qui contiennent des questions sous −3. En dessous de 6, la règle des 5 questions d'écart impose des questions trop dures aux candidats faibles (scénario S7) ;
- le **nombre total de sujets faciles** : il en faut au moins 16 pour qu'un candidat faible ne reçoive que des questions à son niveau ;
- l'histogramme des difficultés par tranche de 1, de −7 à 8, par compétence ;
- dans les passations simulées : la difficulté moyenne des questions posées aux candidats C3 à C6.

---

## 8. Indicateurs et critères d'acceptation

### 8.1 Indicateurs, par paramétrage et par scénario

| Famille | Indicateur |
|---|---|
| Efficacité | % de passations arrêtées ; longueur médiane et distribution ; questions économisées (au plus 16 − n_min) |
| Précision | **taux de faux arrêts** : arrêt d'un candidat dont le θ réel est ≥ θ_seuil |
| Précision | **taux de rattrapage** : parmi les passations arrêtées, part de celles dont la capacité à 16 questions est ≥ θ_seuil |
| Précision | changement de résultat entre l'arrêt et 16 questions (rejeté ↔ niveau 0), et \|Δθ̂\| |
| Dynamique | distribution du pas d'arrêt t ; part des arrêts au premier contrôle possible (n_min) |
| Couverture | nombre de compétences distinctes vues par passation, et nombre de passages par compétence, à comparer à la [section 2.1](#21-combien-de-passages-par-compétence-) ; part des arrêts dont la série d'échecs contient une question beaucoup plus dure que θ̂ (par exemple difficulté > θ̂ + 2) |
| Équité | les mêmes indicateurs pour B2 (accessibilité) par rapport à B1 |

### 8.2 Courbes à produire

- **Courbe d'arrêt** : % d'arrêts en fonction du θ réel, une courbe par paramétrage de référence (P1 à P8). C'est l'équivalent d'une courbe caractéristique d'opération.
- **Compromis** : questions économisées en moyenne (C1 à C5) en fonction du taux de faux arrêts (C6 à C8), un point par combinaison de la grille. On retient les configurations situées sur la frontière de Pareto.
- **Sensibilité** : effet de k et de 1 − α, à n_min et θ_seuil fixés (carte de chaleur des faux arrêts en C6).

### 8.3 Critères d'acceptation proposés (à valider par la psychométrie)

| Critère | Seuil proposé |
|---|---|
| Faux arrêts au seuil (C6, θ = −4,67) | ≤ 5 % |
| Faux arrêts en niveau 0 (C7 à C9, θ ≥ −4,3) | ≤ 1 % |
| Arrêts pour θ ≤ −6 (C1 à C3) | ≥ 60 % |
| Rattrapage parmi les arrêts | ≤ 2 % |
| Écart de faux arrêts entre B2 et B1 | ≤ 1 point |
| Gain médian pour les candidats arrêtés | ≥ 4 questions |

Si aucune combinaison ne remplit tous les critères, c'est le critère de **faux arrêts** qui prime sur le gain.

**Critère de pertinence :** si la meilleure configuration conforme économise moins de 3 questions en moyenne aux candidats C1 à C5, R4 n'apporte pas assez sur un test de 16 questions. Il vaut mieux alors ne pas l'activer, ce qui évite d'avoir à expliquer un arrêt anticipé aux candidats.

### 8.4 Repères de l'étude

Ces repères ont été obtenus sur un test de **32 questions** (banque large synthétique, contrôle à chaque question, n_min = 8, 1 − α = 0,95). Ils ne sont pas transposables tels quels : sur 16 questions, on attend des taux d'arrêt **plus faibles**, car il y a moins de contrôles et un `errorRate` plus élevé.

| θ réel | R3 seule | R4, k = 3 | R4, k = 6 |
|---|---|---|---|
| −6 | 100 % | 97 % | 24 % |
| −5 | 63 % | 40 % | 3 % |
| −4,67 | 12 % | 4 % | 1 % |

---

## 9. Plan d'exécution

| Étape | Contenu | Sortie |
|---|---|---|
| 0 | Vérifier le nombre de compétences, fixer m et valider l'absence de passage obligatoire par toutes les compétences avec la psychométrie | Hypothèses de la section 1 confirmées |
| 1 | Mesurer la couverture de la banque ([section 7](#7-variantes-de-banque)) | Questions et sujets faciles par compétence ; nombre de compétences avec des questions faciles (≥ 6 ?) |
| 2 | Campagne 2PL : C1 à C15 × B1, départ D1, `stopAtChallenge: 16` | ≈ 12 000 passations complètes en NDJSON |
| 3 | Évaluation a posteriori de la grille ([section 5.1](#51-grille-dexploration)) | Tableau des 720 combinaisons × 15 θ |
| 4 | Sélection : frontière de Pareto, puis critères de la section 8.3 et critère de pertinence | 2 ou 3 configurations candidates, ou décision de ne pas activer R4 |
| 5 | Robustesse des candidates : B2, B3, B4, D2, D3 | Indicateurs par variante |
| 6 | Scénarios comportementaux S1 à S7 (script dédié) | Taux d'arrêt par scénario ; questions métier à trancher (S3, S5, S6) |
| 7 | Rejeu sur les passations réelles (section 3.5 de l'étude) | Validation finale : seule cette étape fait foi |

Un script qui lit le NDJSON du simulateur et applique `findStopStep` ([section 4.2](#42-évaluation-a-posteriori-esquisse)) à chaque combinaison suffit pour les étapes 2 à 4. Il n'y a pas besoin de modifier l'API.

---

## 10. Limites

- **Réponses idéales** : en mode 2PL, le simulateur génère des réponses avec le modèle qui sert aussi à les estimer. Les vrais candidats s'en écartent (fatigue, hasard, stress), d'où les scénarios S1 à S7 et le rejeu sur données réelles.
- **Aléa non reproductible** : `Math.random` n'est pas initialisable. Les campagnes ne sont pas rejouables à l'identique, mais l'évaluation a posteriori garde des comparaisons appariées entre paramétrages.
- **Calibration** : les paramètres des questions sont supposés exacts. Une erreur de calibration sur les questions faciles fausse directement R3.
- **Bornes de niveaux** : les valeurs utilisées ici viennent des seeds. Il faut reprendre celles de la version de production.
- **Simulation par `stopAtChallenge`** : la route simule 16 questions à partir d'une version prévue pour 32. Si la version réelle de 16 questions a d'autres paramètres (bornes, capacité de départ, minimum de réponses), il faut les reporter dans la simulation.

---

## Changelog

- **2026-11-23** : configuration passée à `enablePassageByAllCompetences: false` et `challengesBetweenSameCompetence: 5`.
  - Section 2 réécrite : plus de tour des compétences imposé, il faut au moins 6 compétences avec des questions faciles.
  - Ajout de la section 2.1 : passages par compétence (1 en moyenne, 3 au maximum, au moins 6 compétences vues, 24 à 37 % des compétences jamais vues selon la simulation de Monte-Carlo).
  - Section 3, scénario S7, couverture de la banque (section 7), indicateur de couverture et plan d'exécution adaptés.
- **2026-11-23** : document refondu pour un test de **16 questions** comme hypothèse de base, et non plus comme une variante d'un test de 32 questions.
  - Nouvelles sections 2 (conséquences d'un test de 16 questions) et 3 (paramètres existants : à garder, changer ou arbitrer).
  - Grille ramenée à 720 combinaisons ; paramétrages de référence P0 à P8 recalés.
  - Scénarios S1 à S6 recalés sur 16 questions, et ajout de S7 (compétence sans question facile).
  - Mesure de couverture par compétence rendue critique ; critères d'acceptation adaptés, avec un critère de pertinence.
  - Les repères de l'étude (32 questions) sont signalés comme non transposables.
- **2026-11-23** : ajout de la section 8, variante pour un test de 16 questions (analyse des paramètres existants, grille de 720 combinaisons, paramétrages de référence Q0 à Q8, scénarios recalés, critères adaptés).
- **2026-11-23** : création du document (hypothèses, méthode de simulation unique avec évaluation a posteriori, grille de 1 080 paramétrages et 9 paramétrages de référence, 15 candidats 2PL, 6 scénarios comportementaux, 3 départs, 4 variantes de banque, indicateurs, critères d'acceptation et plan d'exécution).
