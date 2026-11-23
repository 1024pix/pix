# Règle R4 : échecs consécutifs ET capacité basse

Étude de faisabilité de la règle R4 dans le CAT de certification v3 de Pix : état actuel du code et ce qu'il manque.

Document parent : [regles-arret-cat.md](./regles-arret-cat.md), section 1.6 (variantes R1 à R4).

## Sommaire

1. [Rappel de la règle](#1-rappel-de-la-règle)
2. [État chez Pix](#2-état-chez-pix)
3. [Ce qu'il manque](#3-ce-quil-manque)
4. [Questions ouvertes à trancher](#4-questions-ouvertes-à-trancher)
5. [Plan et estimation](#5-plan-et-estimation)

---

## 1. Rappel de la règle

Après un minimum de `n_min` questions, on arrête le test si **les deux** conditions sont vraies :

1. **Déclencheur :** les `k` dernières réponses sont des échecs consécutifs.
2. **Confirmation :** la capacité est basse, mesurée de l'une des deux façons suivantes :
   - **R2** : θ̂ < θ_seuil ;
   - **R3** : P(θ < θ_seuil | réponses) ≥ 1 − α, par exemple 0,95.

**Pourquoi combiner les deux :** seule, la série d'échecs produit environ 20 % de faux arrêts avec k = 6 sur 32 questions dans un CAT bien ciblé (voir le document parent). La condition sur la capacité filtre les séries d'échecs dues au hasard chez des candidats de bon niveau.

---

## 2. État chez Pix

### 2.1 Ce qui existe et peut être réutilisé tel quel

| Brique | Où | Utilité pour R4 |
|---|---|---|
| Fin de test quand aucune question n'est renvoyée | `get-next-challenge.js:100-106` : si `getPossibleNextChallenges` renvoie `[]`, on lève `AssessmentEndedError` | **Le mécanisme d'arrêt existe déjà.** R4 doit seulement renvoyer `[]` au bon moment |
| Point d'entrée de l'arrêt | `FlashAssessmentAlgorithm.getPossibleNextChallenges` (`FlashAssessmentAlgorithm.js:49-79`), qui calcule déjà θ̂ et teste `#hasAnsweredToAllChallenges` | C'est ici qu'il faut ajouter la condition R4, à côté de la condition de longueur maximale |
| θ̂ et erreur standard courants | `getCapacityAndErrorRate`, appelé dans `getPossibleNextChallenges` (ligne 60). Il renvoie `{ capacity, errorRate }` | La condition R2 est directement calculable ; R3 l'est en première approximation (voir 3.3) |
| Historique de θ̂ après chaque réponse | `getCapacityAndErrorRateHistory` (`flash.js:78`) | Rejouer R4 sur les données réelles, ce qui permet la méthode A–E |
| Postérieur complet | `normalizedPosteriori`, calculé dans `_singleMeasure` (`flash.js:126`) mais non exposé | Calcul exact de R3 |
| Statut juste / faux d'une réponse | `answer.isOk()` (`Answer.js`) | Compter les échecs consécutifs |
| Temps de réponse | `answer.timeSpent` (`Answer.js:17-70`) | Exclure les réponses trop rapides du compteur, en option |
| Bornes des niveaux en θ | `Intervals` (`Intervals.js`) construit depuis `v3CertificationScoring.intervals` ; `intervals[0].bounds.min` est la borne basse du premier niveau | Fournit θ_seuil |
| Rejet des capacités sous le premier niveau | `scoring-v3.js` : si `reachedMeshIndex === null`, c'est-à-dire θ < `intervals[0].bounds.min`, la certification est `REJECTED` | **R4 cible précisément ces candidats** : avec θ_seuil = `intervals[0].bounds.min`, on arrête des candidats qui seraient de toute façon rejetés |
| Configuration versionnée | `FlashAssessmentAlgorithmConfiguration`, stockée par version de certification (`version-repository.js`) | Endroit naturel pour les paramètres k, n_min, θ_seuil et α |
| Paramètres des questions posées | `CertificationChallenge` enregistre `discriminant` et `difficulty` | Rejeu exact des historiques, même si la calibration a changé depuis |

### 2.2 Comportement actuel du scoring en cas de test court

C'est un point clé, car un test arrêté par R4 aurait **moins de réponses** que `maximumAssessmentLength`.

- **Dégradation de la capacité** (`shouldDowngradeCapacity`, `scoring-v3.js:167`) : elle ne s'applique **que si** `abortReason === CANDIDATE`, c'est-à-dire un abandon du candidat. Un test terminé normalement par R4 n'a pas d'`abortReason` : **pas de dégradation**. ✅
- **Rejet pour réponses insuffisantes** (`hasNotEnoughAnswers`, `scoring-v3.js:180`) : il exige lui aussi un `abortReason`. Un arrêt R4 n'est donc pas rejeté pour cette raison. ✅
- **Rejet sous le premier niveau** (`reachedMeshIndex === null`) : il s'applique normalement. C'est le résultat attendu pour les candidats arrêtés par R4. ✅

Le scoring accepte donc déjà un test plus court que la longueur maximale, à condition que l'arrêt ne soit pas enregistré comme un abandon.

### 2.3 Ce qui va à l'encontre de R4 aujourd'hui

| Point | Où | Effet |
|---|---|---|
| L'a priori est recentré à chaque réponse | `_computeNormalizedPrior` (`flash.js:148`) | La distribution a posteriori est trop confiante : un seuil de « 95 % » arrête bien plus de 5 % des candidats situés au seuil (voir 3.3.4) |
| Le moteur de règles ne sait que filtrer des questions | `FlashAssessmentAlgorithmRuleEngine` et les 4 règles existantes | Pas de notion de « règle d'arrêt » : il faut l'ajouter à côté, pas dedans |
| Le front affiche une longueur fixe | `mon-pix/app/components/certification-instructions/step-two.gjs`, `certification-info.js` (`maximumAssessmentLength`) | Les consignes annoncent N questions : il faudra annoncer « jusqu'à N questions » |
| Le schéma de configuration refuse les clés inconnues | `FlashAssessmentAlgorithmConfiguration.#schema` (`allowUnknown: false`) | Il faut ajouter explicitement les nouveaux champs et une migration des versions |

---

## 3. Ce qu'il manque

### 3.1 Paramètres de configuration

À ajouter dans `FlashAssessmentAlgorithmConfiguration`, en optionnel pour ne pas casser les versions existantes :

| Paramètre | Rôle | Valeur par défaut |
|---|---|---|
| `earlyStopConsecutiveFailures` (k) | Taille de la série d'échecs | `null` (règle désactivée) |
| `earlyStopMinimumLength` (n_min) | Nombre minimum de questions avant d'appliquer R4 | ≥ `minimumAnswersRequiredToValidateACertification` |
| `earlyStopCapacityThreshold` (θ_seuil) | Seuil de capacité | `intervals[0].bounds.min`, ou une valeur explicite |
| `earlyStopConfidence` (1 − α) | Niveau de confiance pour R3 | `null` = R2 ; sinon, par exemple 0,95 = R3 |

Il faut aussi mettre à jour le stockage des versions (`version-repository.js`) et l'admin si ces paramètres doivent être modifiables depuis l'interface.

### 3.2 Compteur d'échecs consécutifs

C'est une fonction pure qui parcourt les réponses depuis la fin :

```js
function countTrailingFailures(answers) {
  let count = 0;
  for (let i = answers.length - 1; i >= 0 && !answers[i].isOk(); i--) count++;
  return count;
}
```

Plusieurs points restent à trancher (voir section 4) :

- les réponses `SKIPPED`, `TIMEDOUT` et `FOCUSEDOUT` comptent-elles comme des échecs ?
- que faire des questions neutralisées ou couvertes par une alerte validée ?
- faut-il exclure les réponses trop rapides (`timeSpent` sous un seuil) ?

### 3.3 Condition de capacité

**R2** est immédiate : `capacity < earlyStopCapacityThreshold`, avec la capacité déjà calculée dans `getPossibleNextChallenges`.

Pour **R3**, il faut P(θ < θ_seuil | réponses). Deux façons de l'obtenir sont développées ci-dessous, suivies d'une comparaison par simulation.

#### 3.3.1 Ce que représentent `capacity` et `errorRate`

À chaque réponse, `_singleMeasure` (`flash.js:126`) construit une distribution discrète `normalizedPosteriori` sur la grille `samples` : 80 points de −9 à 8,775, avec un pas h = 0,225.

- `capacity` est la **moyenne** de cette distribution (`_computeCapacity`), éventuellement limitée par `_limitCapacityVariation`.
- `errorRate` est l'**écart-type** autour de `capacity`, corrigé de la discrétisation (correction de Sheppard) :
  ```
  errorRate² = Σ post(s)·(s − capacity)² − h²/12
  ```
- Quand la capacité n'est pas limitée, `capacity` est exactement la moyenne a posteriori m, et `errorRate` est l'écart-type a posteriori.
- Quand elle est limitée, on a Σ post·(s − c)² = Var + (m − c)². L'écart-type est alors gonflé par le biais (m − c)².

**`variationPercent` joue peu dans les zones basses.** La marge autorisée vaut `variationPercent` quand |θ̂| < `variationPercent`, et |θ̂| × `variationPercent` sinon. Avec la configuration des seeds (`variationPercent` = 0,5, capacité de départ −3), la marge dépasse déjà 1,5 à θ̂ = −3. Dans les simulations ci-dessous, **aucun pas n'a été limité** : `capacity` est donc la moyenne a posteriori dans toute la zone qui intéresse R3.

> ⚠️ Ce n'est pas un postérieur bayésien au sens strict. L'a priori N(θ̂_précédent, 1,5) est **recentré sur l'estimation précédente** à chaque réponse, puis multiplié par la vraisemblance cumulée (`_computeNormalizedPrior`). Les données servent donc deux fois : une fois dans la vraisemblance, une fois via le centre de l'a priori. La distribution obtenue n'a aucune raison d'être bien calibrée. Une probabilité de « 0,95 » n'est pas garantie de signifier 95 % (voir 3.3.4).

#### 3.3.2 R3, première version : approximation normale, sans toucher à `flash.js`

**Principe :** on suppose que la distribution a posteriori est à peu près normale, de moyenne `capacity` et d'écart-type `errorRate`.

```
P(θ < θ_seuil) ≈ Φ( (θ_seuil − capacity) / errorRate )
```

- **Données nécessaires :** déjà disponibles. `getCapacityAndErrorRate` renvoie `{ capacity, errorRate }`. Aujourd'hui, `getPossibleNextChallenges` ne déstructure que `capacity` (`FlashAssessmentAlgorithm.js:60`) : il suffit d'ajouter `errorRate`.
- **Fonction Φ :** l'API ne dépend d'aucune bibliothèque statistique (ni `jstat`, ni `simple-statistics`, ni `mathjs` dans `api/package.json`). Inutile d'en ajouter une : l'approximation d'Abramowitz & Stegun (formule 7.1.26) de la fonction erf tient en quelques lignes, avec une erreur absolue inférieure à 1,5·10⁻⁷.

```js
// Abramowitz & Stegun 7.1.26, erreur absolue < 1.5e-7
function normalCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

function probabilityBelowThreshold({ capacity, errorRate, threshold }) {
  return normalCdf((threshold - capacity) / errorRate);
}
```

- **Où placer ce code :** dans un petit module dédié à l'arrêt anticipé, à côté de `FlashAssessmentAlgorithm`, avec ses tests unitaires (valeurs de référence : Φ(0) = 0,5, Φ(1,645) ≈ 0,95, Φ(−1,96) ≈ 0,025).
- **Cas limites à gérer :**
  - sans réponse, `getCapacityAndErrorRate` renvoie `errorRate = DEFAULT_ERROR_RATE = 5` : sans danger, puisque R4 n'est évaluée qu'après `n_min` questions ;
  - si la distribution est très concentrée, `Var − h²/12` peut devenir négatif et `errorRate` vaut alors `NaN`. Il faut prévoir un plancher, par exemple `Math.max(errorRate, h / Math.sqrt(12))`.
- **Limite :** la distribution a posteriori n'est pas normale aux extrémités. Quand le candidat est sous le plancher de la banque, elle est asymétrique, avec une queue vers les θ bas et tronquée à −9.

#### 3.3.3 R3 exacte : sommer la masse a posteriori

**Principe :** la distribution discrète est déjà calculée. Il suffit d'additionner les probabilités des points de grille situés sous le seuil, sans hypothèse de normalité.

```
P(θ < θ_seuil) = Σ_{s < θ_seuil} post(s)   (+ fraction de la cellule qui contient θ_seuil)
```

- **Modification de `flash.js` nécessaire :** `normalizedPosteriori` est calculé dans la boucle de `getCapacityAndErrorRateHistory`, mais jamais renvoyé. Je propose de :
  1. extraire la boucle dans une fonction privée qui renvoie `{ capacityHistory, normalizedPosteriori }`, ce dernier étant le postérieur de la **dernière** réponse ;
  2. laisser `getCapacityAndErrorRateHistory` et `getCapacityAndErrorRate` inchangés pour leurs appelants ;
  3. ajouter une fonction exportée qui utilise ce postérieur.

  Il vaut mieux **ne pas** ajouter le postérieur à chaque entrée de l'historique. Le simulateur et la dégradation de capacité appellent ces fonctions en masse : stocker 80 nombres par réponse et par passation alourdirait inutilement la mémoire.

```js
export function getProbabilityBelowCapacity({ allAnswers, challenges, capacity = DEFAULT_CAPACITY, variationPercent, threshold }) {
  if (challenges.length === 0 || allAnswers.length === 0) return null;
  const { normalizedPosteriori } = _computeCapacityHistory({ allAnswers, challenges, capacity, variationPercent });
  return _massBelow(normalizedPosteriori, threshold);
}

// Chaque point s représente la cellule [s − STEP/2, s + STEP/2[ ; la cellule qui contient le seuil est comptée au prorata.
function _massBelow(normalizedPosteriori, threshold) {
  return samples.reduce((sum, sample, index) => {
    const low = sample - STEP_OF_SAMPLES / 2;
    const high = sample + STEP_OF_SAMPLES / 2;
    if (high <= threshold) return sum + normalizedPosteriori[index];
    if (low < threshold) return sum + (normalizedPosteriori[index] * (threshold - low)) / STEP_OF_SAMPLES;
    return sum;
  }, 0);
}
```

- **Coût de calcul :** quasi nul. Le postérieur est déjà calculé par `getCapacityAndErrorRate` ; on ajoute une somme sur 80 points. Pour éviter de recalculer l'historique, on peut faire renvoyer `normalizedPosteriori` en plus par la fonction privée, et le passer à `FlashAssessmentAlgorithm` en un seul appel.
- **Pourquoi la fraction de cellule :** sans elle, la probabilité varie par paliers de la masse d'une cellule (h = 0,225) quand θ_seuil se déplace. Le prorata linéaire supprime cet effet d'escalier.

#### 3.3.4 Comparaison par simulation

**Protocole :** un script reproduit les calculs de `flash.js` (grille, a priori recentré, vraisemblance, EAP, `_limitCapacityVariation`, correction de Sheppard) et la sélection parmi les 5 items les plus informatifs.

- Configuration des seeds : 32 questions, `variationPercent` 0,5, capacité de départ −3, θ_seuil = −4,67 (borne basse du premier niveau dans les seeds).
- Banque **synthétique** de 400 items, discriminant entre 0,8 et 2,5, testée dans deux variantes :
  - « pauvre » : difficultés entre −3,5 et 5,5, donc sans item facile ;
  - « large » : difficultés entre −7 et 5,5.
- 300 passations simulées par niveau réel, n_min = 8, arrêt quand P ≥ 0,95.

**1. L'approximation normale suffit :**

| Banque | Écart moyen P_normale − P_exacte | Écart maximal | Arrêts, θ réel = −5 (normale / exacte) |
|---|---|---|---|
| pauvre | < 0,01 | 0,04 | 59 % / 62 % |
| large | < 0,01 | 0,04 | 67 % / 63 % |

Les deux calculs ne diffèrent que de quelques points de pourcentage sur la décision. **La première version suffit pour le rejeu et une première mise en œuvre.** La version exacte est utile pour la rigueur et la documentation, pas pour la décision.

**2. Le vrai problème est la calibration, pas l'approximation.** Pourcentage de candidats arrêtés selon leur niveau réel (calcul exact) :

| θ réel | Banque pauvre : 1 seul contrôle à n = 16 | Banque pauvre : contrôle à chaque question (R3) | Banque large : 1 seul contrôle à n = 16 | Banque large : R3 |
|---|---|---|---|---|
| −6 | 62 % | 89 % | 100 % | 100 % |
| −5 | 31 % | 62 % | 29 % | 63 % |
| **−4,67 (= seuil)** | **13 %** | **42 %** | 3 % | 12 % |
| −4,3 | 11 % | 28 % | 1 % | 1 % |
| −4 | 3 % | 13 % | 0 % | 0 % |
| −3,5 | 0 % | 2 % | 0 % | 0 % |

Un seuil de « 95 % » devrait arrêter au plus 5 % des candidats situés exactement sur θ_seuil. On en arrête **12 à 42 %**. Trois causes s'additionnent :

- **les contrôles répétés** : vérifier la condition à chaque question de n_min à 32 multiplie les occasions de franchir le seuil par hasard. C'est le problème bien connu des tests séquentiels ;
- **l'a priori recentré** : il rend la distribution trop confiante (3.3.1) ;
- **la banque pauvre en items faciles** : chaque échec sur un item trop dur pousse θ̂ vers le bas sans vraiment informer.

**3. L'apport de la condition « k échecs » dépend de la banque.** Avec R4 = R3 + k échecs consécutifs :

| θ réel | Banque pauvre : R3 / R4 k=3 / k=6 / k=8 | Banque large : R3 / R4 k=3 / k=6 / k=8 |
|---|---|---|
| −6 | 89 / 89 / 89 / 89 % | 100 / 97 / 24 / 6 % |
| −5 | 62 / 62 / 62 / 62 % | 63 / 40 / 3 / 1 % |
| −4,67 | 42 / 42 / 42 / 42 % | 12 / 4 / 1 / 0 % |

- **Banque pauvre :** au moment où P franchit 0,95, le candidat enchaîne déjà de longues séries d'échecs (souvent plus de 8). La condition « k échecs » est **redondante** : elle ne filtre rien.
- **Banque large :** les candidats faibles réussissent de temps en temps les items faciles, et les séries sont courtes. La condition « k échecs » **réduit fortement** les faux arrêts, mais aussi les arrêts justifiés. Avec k = 3, on garde la plupart des bons arrêts tout en divisant par trois les faux arrêts au seuil.

**Conséquences pour la mise en œuvre :**

1. Commencer par l'**approximation normale** (3.3.2). Passer à la version exacte (3.3.3) seulement si le rejeu montre des écarts gênants.
2. **Ne pas utiliser 0,95 comme s'il s'agissait d'un risque de 5 %.** Il faut fixer le niveau de confiance **empiriquement**, par le rejeu A–E sur les données réelles, de façon à atteindre un taux de faux arrêts cible au seuil. On peut aussi réduire les contrôles répétés en ne vérifiant la condition qu'à quelques points fixes, par exemple à 12, 16, 20 et 24 questions.
3. Mesurer la **couverture réelle de la banque en items faciles** avant de choisir k. C'est elle qui détermine si la condition sur les échecs sert à quelque chose.

> Limites de la simulation : banque synthétique, paramètres des seeds et non de production, réponses générées par le modèle 2PL lui-même (pas de décrochage ni de réponse au hasard). Les ordres de grandeur sont indicatifs ; seul le rejeu sur les données réelles fera foi.

### 3.4 Branchement dans `FlashAssessmentAlgorithm`

Dans `getPossibleNextChallenges`, juste après le calcul de la capacité (ligne 60) :

```js
if (this.#shouldStopEarly({ assessmentAnswers, capacity, errorRate })) {
  return [];
}
```

Le reste suit sans modification : `get-next-challenge` lève `AssessmentEndedError`, le test se termine et le scoring s'applique sans dégradation.

**Effet de bord à vérifier :** `downgradeCapacity` (`scoring-degradation-service.js`) et le simulateur (`AssessmentSimulatorSingleMeasureStrategy`) appellent aussi `getPossibleNextChallenges`. Il faut vérifier si R4 doit s'y appliquer ou être neutralisée, par exemple avec une option désactivée en simulation de dégradation.

### 3.5 Outil de rejeu A–E

Un script qui, pour chaque certification v3 terminée :

1. charge les réponses et les `CertificationChallenge` (avec `discriminant` et `difficulty`) ;
2. calcule `getCapacityAndErrorRateHistory` ;
3. pour chaque combinaison (k, n_min, θ_seuil, α), trouve le premier pas t où R4 se déclenche ;
4. compare la capacité et le niveau au pas t avec ceux de la passation complète.

**Sorties attendues :**

- **Efficacité :** % de candidats arrêtés, questions économisées (médiane, distribution).
- **Précision :**
  - **taux de rattrapage** : parmi les arrêtés, combien finissent au-dessus de θ_seuil en passation complète ;
  - % de changement de niveau ;
  - |Δθ|.
- **Par population :** cadre de certification, type de centre, aménagement d'accessibilité.

Le rejeu est **exact** pour R4 : la règle ne modifie pas la sélection des questions avant le pas t, donc l'historique jusqu'à t est identique.

### 3.6 Front et communication

- Remplacer « N questions » par « jusqu'à N questions » dans les consignes (`step-two.gjs`).
- Vérifier la barre de progression et l'écran de fin de test.
- Préparer un message côté candidat et côté surveillant pour expliquer un arrêt anticipé.

### 3.7 Tests

- Tests unitaires : compteur, condition de capacité, combinaison, désactivation par défaut.
- Tests de `FlashAssessmentAlgorithm` : renvoie `[]` quand R4 se déclenche.
- Test d'intégration du scoring : un test court sans `abortReason` n'est ni dégradé ni rejeté pour réponses insuffisantes.

---

## 4. Questions ouvertes à trancher

| Question | Options | Impact |
|---|---|---|
| Statuts comptés comme échecs | `KO` seulement / `KO` + `SKIPPED` / tous sauf `OK` | Un candidat qui passe des questions est-il « en échec » ? |
| Questions neutralisées ou avec alerte | Les ignorer dans le compteur / remettre le compteur à zéro | Équité en cas d'incident technique |
| Réponses rapides | Les ignorer / les compter / suspendre R4 et alerter | Protection contre le décrochage |
| θ_seuil | Borne basse du premier niveau / borne haute (niveau 1 non atteint) | Avec la borne basse, on n'arrête que des candidats qui seraient rejetés ; avec la borne haute, on peut changer un niveau 1 |
| R2 ou R3 | Seuil simple / probabilité a posteriori | Simplicité contre robustesse |
| Niveau de confiance de R3 | Valeur nominale (0,95) / valeur calibrée par rejeu / contrôles à points fixes | Avec un contrôle à chaque question, « 0,95 » donne 12 à 42 % de faux arrêts au seuil en simulation |
| Valeur de k | Dépend de la couverture de la banque en items faciles | Redondant si la banque est pauvre, très filtrant si elle est large (3.3.4) |
| Validation | Psychométrie, juridique, accessibilité | Nécessaire avant toute mise en production en certification |

---

## 5. Plan et estimation

> Ordres de grandeur pour une personne, estimés à partir du code actuel. Ils n'incluent pas la validation métier et juridique.

| Étape | Contenu | Durée |
|---|---|---|
| 1. Rejeu A–E | Script de rejeu, grille de paramètres, graphiques par population | 1-2 sem |
| 2. Décisions | Trancher les questions de la section 4 à partir des résultats du rejeu | 1 sem (réunions, analyse) |
| 3. Configuration | Champs de `FlashAssessmentAlgorithmConfiguration`, stockage des versions, migration | 1-2 j |
| 4. Algorithme | Compteur, R2/R3 (approximation normale), branchement, neutralisation pour la dégradation et le simulateur | 2-3 j |
| 5. R3 exacte (optionnel) | Exposer `normalizedPosteriori` | 1-2 j |
| 6. Front | Consignes, progression, message de fin | 2-3 j |
| 7. Tests | Unitaires, intégration du scoring | 2-3 j |
| **Total** | | **≈ 4 à 6 semaines**, dont environ la moitié pour l'étude et le calibrage |

**Prochaine étape conseillée :** l'étape 1. Elle ne touche pas au code de production et permet de décider, chiffres à l'appui, si R4 vaut la peine d'être implémentée.

## Changelog

- **2026-11-20** : section 3.3 développée.
  - 3.3.1 : signification de `capacity` et `errorRate`, effet de `variationPercent`, mise en garde sur l'a priori recentré.
  - 3.3.2 : approximation normale, avec le code de Φ (Abramowitz & Stegun 7.1.26) et les cas limites.
  - 3.3.3 : calcul exact, avec la modification proposée de `flash.js` et la somme avec fraction de cellule.
  - 3.3.4 : comparaison par simulation. L'approximation suffit (écart < 0,04) ; le vrai sujet est la calibration du niveau de confiance (12 à 42 % de faux arrêts au seuil) ; l'apport de k dépend de la banque.
  - Section 2.3 : **correction**, `variationPercent` ne freine pas θ̂ dans les zones basses avec la configuration des seeds. La ligne est remplacée par l'effet de l'a priori recentré.
  - Section 4 : ajout des questions sur le niveau de confiance et sur k ; suppression de la question sur `variationPercent`.
- **2026-11-20** : création du document. Il contient l'état chez Pix (briques réutilisables, comportement du scoring en cas de test court, obstacles), ce qu'il manque (configuration, compteur, condition de capacité, branchement, rejeu A–E, front, tests), les questions ouvertes et l'estimation.
