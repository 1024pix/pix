# Règles d'arrêt pour le CAT de certification Pix

Étude exploratoire : comment arrêter un test adaptatif (CAT) plus tôt, en particulier quand il est trop difficile pour le candidat.

## Sommaire

1. [Panorama des méthodes d'arrêt](#1-panorama-des-méthodes-darrêt)
2. [Méthodes fondées sur l'erreur standard et le PSER : état chez Pix et ce qui manque](#2-méthodes-fondées-sur-lerreur-standard-et-le-pser--état-chez-pix-et-ce-qui-manque)
3. [Évaluer une règle d'arrêt : la méthode A–E appliquée à Pix](#3-évaluer-une-règle-darrêt--la-méthode-ae-appliquée-à-pix)
4. [Recommandation par méthode](#4-recommandation-par-méthode)
5. [Références](#5-références)

---

## 1. Panorama des méthodes d'arrêt

| Famille | Principe | Gère le « trop difficile » ? |
|---|---|---|
| [1.1 Seuil d'erreur standard](#11-seuil-derreur-standard) | SE < seuil (par exemple 0,3) | ❌ quand la banque est pauvre en items faciles, le SE ne descend pas et le test va jusqu'au max |
| [1.2 PSER](#12-pser-predicted-standard-error-reduction) | Arrêt quand l'item suivant ne réduirait presque plus le SE | ✅ |
| [1.3 Information minimale](#13-information-minimale) | Arrêt quand aucun item restant n'apporte I(θ̂) > seuil | ✅ (le plus direct) |
| [1.4 Classification](#14-classification--intervalle-de-confiance-sprt-glr) (IC, SPRT, GLR) | Arrêt dès que la classe est certaine | ✅ (sortie sous le niveau le plus bas) |
| [1.5 Curtailment](#15-curtailment) | Arrêt quand le verdict ne peut plus changer | ✅ |
| [1.6 Échecs consécutifs et capacité basse](#16-échecs-consécutifs-et-capacité-basse-chen-et-al-2025) | k échecs de suite et/ou θ̂ sous un seuil | ✅ à condition de les combiner |
| [1.7 Rendre le test moins difficile](#17-rendre-le-test-moins-difficile-au-lieu-de-larrêter) | Cible P ≈ 0,7, multistage, contraintes du shadow test | atténue |
| [1.8 Détection du décrochage](#18-détection-du-décrochage) | Repérer le *rapid guessing* via les temps de réponse | protège θ̂ |

### 1.1 Seuil d'erreur standard

On arrête quand l'erreur standard de θ̂ passe sous un seuil. Quand la banque contient peu d'items faciles, l'information disponible pour un θ bas est faible : le SE ne descend jamais sous le seuil et le test va jusqu'à la longueur maximale. Ce sont justement les candidats en difficulté qui subissent les tests les plus longs.

- Babcock & Weiss (2012) comparent les critères des CAT à longueur variable.
- Morris et al. (2020) traitent le cas des banques dont l'information est non uniforme, c'est-à-dire pauvres aux extrémités.

### 1.2 PSER (Predicted Standard Error Reduction)

On arrête quand le **gain prévu** sur le SE avec l'item suivant devient négligeable. Pour chaque item candidat j :

```
PSER_j = PSD_actuel − [ P_j(θ̂) · PSD(postérieur | juste) + (1 − P_j(θ̂)) · PSD(postérieur | faux) ]
```

PSD désigne l'écart-type a posteriori. Choi, Grady & Dodd (2011), qui ont introduit le PSER, montrent qu'il raccourcit les tests aux extrémités de l'échelle sans dégrader la précision au centre.

### 1.3 Information minimale

On arrête quand aucun item restant n'apporte une information de Fisher supérieure à un seuil (par exemple 0,01 à 0,1) au θ̂ courant. Autrement dit : « il n'y a plus rien d'utile à poser à ce candidat ». Si θ̂ est sous la plage couverte par la banque, tous les items sont trop durs, leur information est quasi nulle, et le test s'arrête.

- Dodd, Koch & De Ayala (1993).
- Stafford et al. (2019) comparent SE, information minimale, PSER et leurs combinaisons, et recommandent de **combiner** les règles.

### 1.4 Classification : intervalle de confiance, SPRT, GLR

Quand l'objectif est de **classer** le candidat (un niveau Pix) plutôt que de mesurer θ finement, on arrête dès que la classe est statistiquement certaine.

- SPRT : Reckase (1983), Eggen (1999).
- GLR : Bartroff, Finkelman & Lai (2008), Thompson (2009).
- **Exemple opérationnel, le NCLEX :** arrêt dès que l'intervalle de confiance à 95 % de θ est entièrement d'un côté du seuil de réussite, entre une longueur minimale et une longueur maximale. Un candidat nettement trop faible échoue avec un test court.

### 1.5 Curtailment

On arrête quand, même en réussissant tous les items restants, le candidat ne peut plus changer de classe. La version stochastique arrête quand la probabilité de changement devient négligeable.

- Finkelman (2008, 2010).

### 1.6 Échecs consécutifs et capacité basse (Chen et al., 2025)

#### Ce que dit l'article

Chen, Brinchmann & Braeken (2025), *Setting Discontinue Rules for Progressive Tests: A Practical and Transparent Toolkit*, Assessment 33(8). Lu en texte intégral.

- **Contexte : les tests progressifs.** Les items sont présentés par difficulté croissante (WISC-V, BPVS, Raven) et on arrête après un certain nombre d'erreurs. Le principe sous-jacent est l'échelle de Guttman : au-delà de son plafond, le candidat échoue à tout ce qui suit.
- **Trois formes de règle :**
  - X échecs consécutifs sur des items. Exemple : WISC-V, 2 erreurs en Block Design, 3 en Similarities.
  - X blocs échoués consécutifs. Exemple : TROG-2, 5 blocs.
  - Un taux d'erreur X dans un bloc. Exemple : BPVS, 8 erreurs ou plus sur un bloc de 12.
- **Résultats chiffrés sur le BPVS, enfants de 6 ans, n = 209 :**
  - Passer de 8 à 7 erreurs fait gagner 24 items (la longueur médiane passe de 108 à 84). Mais un individu peut perdre jusqu'à **30 points**, soit 58 rangs percentiles.
  - Avec 5 erreurs, la corrélation de rang avec la règle par défaut tombe à 0,76, et le taux de faux positifs en dépistage atteint 24 %.
  - Avec 2 erreurs, on divise la longueur par deux, mais avec 75 % de faux positifs.
  - Pour garder moins de 10 % de faux positifs : 7 erreurs à 6 ans, mais 6 erreurs à 4 ans.
- **Conclusions des auteurs :**
  - « *A universal discontinue rule likely does not exist* » : la bonne règle dépend de l'enjeu (diagnostic, recherche ou dépistage) et de la population.
  - Plus il y a de réponses au hasard ou de désengagement, plus la règle doit être souple.
  - Les règles des CAT (seuil de SE, convergence de θ) sont citées comme une piste à explorer.

#### Pourquoi la règle « k échecs consécutifs » ne se transpose pas telle quelle à un CAT

Dans un test progressif, P(réussite) **baisse** d'item en item : une série d'échecs signale qu'on a atteint le plafond. Dans un CAT, l'algorithme choisit l'item le plus informatif au niveau de θ̂, donc P(réussite) reste **autour de 50 %**. Une série d'échecs est alors un phénomène banal.

Probabilité d'avoir au moins une série de k échecs sur un test de 32 questions (calcul exact par récurrence) :

| P(échec) par item | k=4 | k=5 | k=6 | k=7 | k=8 |
|---|---|---|---|---|---|
| 0,5 (CAT bien ciblé) | 66 % | 39 % | **20 %** | 10 % | 5 % |
| 0,6 | 88 % | 67 % | 45 % | 28 % | 17 % |
| 0,7 (banque trop dure) | 98 % | 89 % | 75 % | 57 % | 42 % |

Avec 6 échecs consécutifs comme seul critère, **un candidat dont le niveau est parfaitement mesuré serait arrêté une fois sur cinq**. Cette règle n'est donc pas défendable seule en certification.

En revanche, dans un CAT, θ̂ baisse après chaque échec et l'item suivant devient **plus facile**. Échouer k fois de suite sur des items de plus en plus faciles est un signal fort que le test est trop difficile. Ce signal apparaît dans deux cas :
- le candidat est sous le plancher de la banque ;
- le candidat a décroché et répond au hasard.

#### Variantes possibles

| Règle | Définition | Avantage | Risque |
|---|---|---|---|
| **R1** échecs consécutifs | k échecs de suite, après n_min questions | Transparente, facile à expliquer | Faux positifs élevés seule |
| **R2** capacité basse | θ̂ < θ_seuil (par exemple la borne du premier niveau), après n_min | Directement liée au score | θ̂ instable en début de test |
| **R3** capacité basse probabiliste | P(θ < θ_seuil \| réponses) ≥ 0,95 | Tient compte de l'incertitude ; même logique que le NCLEX | Moins intuitive à communiquer |
| **R4** combinée | **k échecs consécutifs ET (R2 ou R3)** | La série d'échecs déclenche, la capacité confirme : beaucoup moins de faux positifs | Deux paramètres à régler |

Étude de faisabilité détaillée de R4 dans Pix : [regle-r4-echecs-capacite.md](./regle-r4-echecs-capacite.md).

### 1.7 Rendre le test moins difficile au lieu de l'arrêter

Un CAT qui maximise l'information vise P(réussite) ≈ 50 %. C'est vécu comme difficile par tout le monde, et pire pour les candidats faibles quand la banque manque d'items faciles.

- **Viser P(réussite) ≈ 0,7 :** Eggen & Verschoor (2006), Bergstrom, Lunz & Gershon (1992), Häusler & Sommer (2008). Le coût est faible : quelques items de plus pour une même précision.
- **Réactions des candidats :** Tonidandel, Quiñones & Adams (2002).
- **Multistage testing :** après un module de routage, le candidat est orienté vers un module plus facile. Voir Yan, von Davier & Lewis (2014).
- **Shadow testing** (programmation en nombres entiers) : on ajoute des contraintes de difficulté ou une longueur variable au test fantôme. Voir van der Linden & Reese (1998), van der Linden (2005).

### 1.8 Détection du décrochage

Quand le test est trop dur, le candidat abandonne souvent sans le dire : il répond au hasard et très vite. θ̂ devient alors biaisé.

- Wise & Kong (2005), Wise (2017).
- **Exemple opérationnel :** NWEA MAP Growth met la session en pause automatiquement quand il détecte des réponses trop rapides.

---

## 2. Méthodes fondées sur l'erreur standard et le PSER : état chez Pix et ce qui manque

Le code se trouve dans `api/src/certification/evaluation/domain/services/algorithm-methods/flash.js`, l'algorithme de certification v3 (« flash »).

### 2.1 Fonctionnement actuel

- **Sélection des questions :** information de Fisher maximale (`getReward`, `flash.js:293`). On garde les 5 meilleures épreuves (`MAX_NUMBER_OF_RETURNED_CHALLENGES`), puis on en tire une au hasard.
- **Estimation de la capacité :** EAP bayésienne sur une grille de 80 points entre −9 et 9. L'a priori est une gaussienne de variance 1,5 centrée sur la capacité précédente. Le déplacement de θ̂ est limité par `variationPercent` (`_limitCapacityVariation`).
- **Erreur standard :** écart-type a posteriori avec correction de Sheppard (`_computeCorrectedErrorRate`, `flash.js:207`).
- **Règle d'arrêt :** **longueur fixe uniquement** (`maximumAssessmentLength`, `FlashAssessmentAlgorithm.js:50-87`).
- **Utilisation de `errorRate` :** uniquement dans le simulateur (`AssessmentSimulatorSingleMeasureStrategy.js:42`, `scenario-simulator-controller.js:61`). Il ne sert ni à sélectionner les questions ni à arrêter le test.
- **Temps de réponse :** stocké sur chaque réponse (`Answer.timeSpent`, `src/evaluation/domain/models/Answer.js`).

**Conséquence :** un candidat très faible passe toutes les questions, même quand son niveau est établi depuis longtemps.

### 2.2 Ce qui existe déjà et ce qui manque, méthode par méthode

| Méthode | Ce qui existe dans Pix | Ce qui manque |
|---|---|---|
| Seuil d'erreur standard | `_computeCorrectedErrorRate` calcule déjà la PSD après chaque réponse | La brancher dans `FlashAssessmentAlgorithm` comme condition d'arrêt, avec un seuil configurable |
| **PSER** | Toutes les briques : `_computeLikelihood`, `_computeNormalizedPosteriori`, `_computeCorrectedErrorRate`, `_getProbability` | Le calcul prédictif : simuler une réponse juste puis fausse pour chaque item candidat, calculer les deux PSD et les pondérer par P_j(θ̂) |
| Information minimale | `getReward` calcule déjà I(θ̂) pour chaque épreuve disponible | Comparer le meilleur `reward` à un seuil et arrêter s'il est en dessous |
| Classification par IC ou postérieur (R3) | `normalizedPosteriori` est déjà calculé | Exposer le postérieur et le relier aux bornes des niveaux Pix en θ |

### 2.3 Le PSER en détail

Le PSER n'existe pas dans Pix, ni comme terme ni comme calcul. Deux éléments s'en approchent.

**`getReward`, l'approximation classique :**

```js
export function getReward({ capacity, discriminant, difficulty }) {
  const probability = _getProbability(capacity, discriminant, difficulty);
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}
```

C'est l'information de Fisher en modèle 2PL : I(θ) = a²·P·(1−P). Comme SE(θ̂) ≈ 1/√ΣI, maximiser l'information revient à choisir l'item qui réduit le plus l'erreur standard, **de façon approchée, locale et asymptotique**.

**`_computeCorrectedErrorRate`, la grandeur visée par le PSER :**

```js
const errorRates = samples.map((sample, index) => normalizedPosteriori[index] * (sample - latestCapacity) ** 2);
return Math.sqrt(rawErrorRate - (ERROR_RATE_CLASS_INTERVAL ** 2) / 12.0);
```

C'est l'écart-type a posteriori (PSD), exactement la grandeur qu'un PSER cherche à faire baisser.

**Ce qui manque :** appliquer la formule de la [section 1.2](#12-pser-predicted-standard-error-reduction). Le coût de calcul est modeste : 2 postérieurs de 80 points par item candidat.

### 2.4 Point d'attention propre à Pix : `variationPercent`

`variationPercent` limite le déplacement de θ̂ d'une réponse à l'autre. La marge autorisée vaut `variationPercent` quand |θ̂| < `variationPercent`, et |θ̂| × `variationPercent` sinon.

- **Le frein joue surtout autour de 0.** Avec la configuration des seeds (`variationPercent` = 0,5), la marge vaut déjà 1,5 à θ̂ = −3. En simulation, aucun pas n'a été limité dans les zones basses (voir [regle-r4-echecs-capacite.md](./regle-r4-echecs-capacite.md), section 3.3). Il n'est donc pas un obstacle pour les règles qui visent les candidats faibles.
- **Quand le frein joue**, θ̂ n'est plus la moyenne a posteriori, et la PSD est gonflée par le biais (Σ post·(s − θ̂)² = Var + biais²). Le PSER et le seuil de SE doivent en tenir compte pour les capacités moyennes.
- **Point plus important :** l'a priori N(θ̂_précédent, 1,5) est recentré à chaque réponse (`_computeNormalizedPrior`). La distribution a posteriori est donc trop confiante. Toute règle fondée sur une probabilité ou un seuil de SE doit être calibrée empiriquement, et non sur ses valeurs nominales.

---

## 3. Évaluer une règle d'arrêt : la méthode A–E appliquée à Pix

La méthode de Chen et al. (2025) consiste à appliquer **rétroactivement** des règles d'arrêt aux données réelles, puis à tracer l'efficacité en face de la précision.

Pix est dans la **situation idéale** que décrit l'article. Les auteurs n'avaient que des données déjà tronquées par la règle à 8 erreurs. Pix fait passer **toutes** les questions à tous les candidats, ce qui fournit une vraie référence en passation complète.

`getCapacityAndErrorRateHistory` (`flash.js:78`) renvoie déjà θ̂ et l'erreur standard **après chaque réponse**. Appliquer une règle à rebours est donc exact et peu coûteux. Pour chaque candidat et chaque règle :

1. On trouve le pas t où la règle se déclenche.
2. La capacité tronquée vaut `history[t-1].capacity`.
3. On la compare à la capacité finale.

Il faudra vérifier que le score final de certification repose bien sur cette capacité (`ScoringV3Algorithm`).

Ce rejeu est valable pour toutes les règles qui ne modifient pas la sélection des questions : SE, PSER, information minimale, classification, R1 à R4. Les méthodes qui changent la sélection (cible P ≈ 0,7, multistage, shadow test) demandent une simulation complète avec le simulateur de scénarios.

**Mesures pour les axes :**

- **Efficacité :** longueur médiane, % de candidats arrêtés tôt, nombre de questions économisées par les candidats faibles.
- **Précision :**
  - écart |Δθ| maximal et médian ;
  - **% de candidats qui changent de niveau Pix** (le critère principal) ;
  - **taux de rattrapage** : parmi les candidats qui déclenchent la règle au pas t, combien finissent au-dessus du seuil s'ils passent le test en entier. Ce sont les faux positifs de l'article.

**Grille à balayer :**

- k de 3 à 8 ;
- θ_seuil sur les bornes des niveaux ;
- seuil probabiliste à 0,90, 0,95 ou 0,99 ;
- seuils de SE, de PSER et d'information ;
- n_min de 8 à 16 ;
- découpage par population (public scolaire ou professionnel, centre de certification). Comme le montre l'article pour l'âge, la règle optimale n'a aucune raison d'être la même partout.

**Limites à garder en tête :**

- En certification, le critère « aucun changement de niveau » devrait être quasi absolu. C'est le scénario *high-stakes* de l'article, où passer de 8 à 7 erreurs coûtait déjà jusqu'à 30 points.
- Un arrêt anticipé raccourcit le test pour certains candidats : il faut documenter la règle pour qu'elle reste défendable en équité.

---

## 4. Recommandation par méthode

> **Lecture des durées :** ordres de grandeur pour une personne, estimés à partir du code actuel. « Dev » couvre l'implémentation et les tests. « Calibrage » couvre le rejeu A–E ou la simulation, le choix des seuils et la validation psychométrique. Ces durées n'incluent ni la gouvernance (validation métier et juridique d'une longueur variable en certification) ni le déploiement progressif.

**Prérequis commun :** un outil de rejeu A–E sur les historiques de certification v3 (section 3). Il ne s'agit pas d'une règle d'arrêt, mais il conditionne le calibrage de toutes les autres. Estimation : 1 à 2 semaines.

| Méthode | État chez Pix | Durée estimée | Avantages | Limites |
|---|---|---|---|---|
| **Seuil d'erreur standard** | 🟡 Calcul présent (`_computeCorrectedErrorRate`), non branché sur l'arrêt | Dev 2-3 j, calibrage 1-2 sem | Standard, simple, bien documenté ; précision homogène entre candidats | Ne raccourcit **pas** le test des candidats faibles quand la banque est pauvre en items faciles (Morris et al., 2020) |
| **PSER** | 🟡 Toutes les briques présentes, calcul prédictif absent | Dev 1 sem, calibrage 1-2 sem | Corrige le défaut du seuil de SE aux extrémités ; arrêt quand l'item suivant n'apporte plus rien (Choi et al., 2011) | Plus coûteux en calcul (2 postérieurs par item candidat) ; seuil peu intuitif ; interaction à étudier avec `variationPercent` |
| **Information minimale** | 🟡 `getReward` présent, pas de seuil | Dev 1-2 j, calibrage 1 sem | La plus directe pour le « test trop difficile » ; triviale à implémenter | Dépend du θ̂ courant ; à combiner avec d'autres règles (Stafford et al., 2019) |
| **Classification par IC ou postérieur (R3)** | 🟡 `normalizedPosteriori` présent ; lien avec les bornes des niveaux à faire | Dev 3-5 j, calibrage 2 sem | Aligné sur la finalité (un niveau Pix) ; défendable (logique du NCLEX) ; tient compte de l'incertitude | Suppose des bornes de niveaux fiables en θ ; moins intuitive à expliquer au public |
| **SPRT / GLR** | 🔴 Absent | Dev 2-3 sem, calibrage 2-3 sem | Cadre statistique formel, erreurs α et β contrôlées | Conçu pour une décision binaire : il faut l'étendre aux niveaux multiples ; complexité |
| **Curtailment** | 🔴 Absent | Dev 2-3 sem, calibrage 2 sem | Aucune perte de précision sur la classe (version déterministe) | Difficile à projeter dans un CAT, puisque les items restants ne sont pas connus à l'avance ; gain faible en version déterministe |
| **R1 échecs consécutifs seuls** | 🔴 Absent (compteur trivial) | Dev 1 j, calibrage 1 sem | Très transparente, facile à communiquer (Chen et al., 2025) | **À écarter seule** : environ 20 % de faux arrêts avec k = 6 sur 32 questions dans un CAT bien ciblé |
| **R2 capacité basse** | 🟡 θ̂ disponible à chaque pas | Dev 1-2 j, calibrage 1-2 sem | Directement liée au score | θ̂ instable en début de test ; impose un n_min |
| **R4 échecs consécutifs ET capacité basse (R2 ou R3)** | 🔴 Absent ; briques présentes | Dev 2-3 j, calibrage 2 sem | Combine la transparence de R1 et la robustesse de R3 ; beaucoup moins de faux positifs | Deux paramètres à régler ; doit être réglé par population |
| **Cible P ≈ 0,7** | 🔴 Absent (`getReward` à modifier) | Dev 2-3 j, simulation 2 sem | Expérience moins frustrante ; coût en précision faible (Eggen & Verschoor, 2006) | Il faut quelques items de plus pour une même précision ; nécessite une simulation complète, pas un simple rejeu |
| **Multistage testing** | 🔴 Absent | Plusieurs mois | Routage explicite vers un module plus facile ; modules contrôlables | Refonte de l'algorithme et de la banque d'items |
| **Shadow testing** (contraintes de difficulté ou longueur variable) | 🟠 En exploration (`shadow-testing-certification/tuto-mip`) | Plusieurs mois | Intègre toutes les contraintes (contenu, exposition, difficulté) dans un cadre optimal | Solveur MIP en ligne, complexité ; une règle d'arrêt reste à définir à part |
| **Détection du *rapid guessing*** | 🟡 `Answer.timeSpent` stocké | Dev 1 sem, calibrage 2 sem | Protège θ̂ et les règles d'échecs contre le décrochage ; permet d'alerter le surveillant | Seuils de temps dépendants du type d'épreuve ; risque de faux positifs chez les candidats rapides |

Légende : 🟢 en place · 🟡 briques présentes · 🟠 en exploration · 🔴 absent

### Combinaison recommandée

1. Construire d'abord l'outil de rejeu A–E.
2. Garder la longueur maximale actuelle comme garde-fou.
3. Imposer un minimum de questions (n_min).
4. Arrêter dès que l'une des conditions suivantes est remplie :
   - SE < seuil, **OU**
   - PSER < seuil (ou information max restante < seuil, qui est plus simple), **OU**
   - **R4** : k échecs consécutifs ET P(θ < borne du premier niveau) ≥ 0,95.
5. Neutraliser dans le compteur d'échecs les réponses données trop vite.
6. Régler les seuils par population sur les historiques réels.

---

## 5. Références

> Les références sont citées de mémoire, sans vérification en ligne, sauf Chen et al. (2025), lu en texte intégral. Contrôler les volumes et les pages avant toute citation officielle.

- Babcock, B., & Weiss, D. J. (2012). Termination criteria in computerized adaptive tests: Do variable-length CATs provide efficient and effective measurement? *Journal of Computerized Adaptive Testing*, 1(1), 1-18.
- Bartroff, J., Finkelman, M., & Lai, T. L. (2008). Modern sequential analysis and its application to computerized adaptive testing. *Psychometrika*, 73(3), 473-486.
- Bergstrom, B. A., Lunz, M. E., & Gershon, R. C. (1992). Altering the level of difficulty in computer adaptive testing. *Applied Measurement in Education*, 5(2), 137-149.
- **Chen, J., Brinchmann, E. I., & Braeken, J. (2025). Setting Discontinue Rules for Progressive Tests: A Practical and Transparent Toolkit. *Assessment*, 33(8), 1255-1265.** [doi:10.1177/10731911251385776](https://doi.org/10.1177/10731911251385776). [Texte intégral sur PubMed Central](https://pmc.ncbi.nlm.nih.gov/articles/PMC13675533). Code et données : https://osf.io/58bqr/?view_only=a0ba40df1df644319689fabfda5edebd
- Choi, S. W., Grady, M. W., & Dodd, B. G. (2011). A new stopping rule for computerized adaptive testing. *Educational and Psychological Measurement*, 71(1), 37-53.
- Dodd, B. G., Koch, W. R., & De Ayala, R. J. (1993). Computerized adaptive testing using the partial credit model: Effects of item pool characteristics and different stopping rules. *Educational and Psychological Measurement*, 53(1), 61-77.
- Eggen, T. J. H. M. (1999). Item selection in adaptive testing with the sequential probability ratio test. *Applied Psychological Measurement*, 23(3), 249-261.
- Eggen, T. J. H. M., & Verschoor, A. J. (2006). Optimal testing with easy or difficult items in computerized adaptive testing. *Applied Psychological Measurement*, 30(5), 379-393.
- Finkelman, M. (2008). On using stochastic curtailment to shorten the SPRT in sequential mastery testing. *Journal of Educational and Behavioral Statistics*, 33(4), 442-463.
- Finkelman, M. (2010). Variations on stochastic curtailment in sequential mastery testing. *Applied Psychological Measurement*, 34(1), 27-45.
- Häusler, J., & Sommer, M. (2008). The effect of success probability on test economy and self-confidence in computerized adaptive tests. *Psychology Science Quarterly*, 50(1), 75-87.
- Morris, S. B., Bass, M., Howard, E., & Neapolitan, R. E. (2020). Stopping rules for computer adaptive testing when item banks have nonuniform information. *International Journal of Testing*, 20(2), 146-168.
- Reckase, M. D. (1983). A procedure for decision making using tailored testing. In D. J. Weiss (Ed.), *New horizons in testing* (pp. 237-255). Academic Press.
- Stafford, R. E., Runyon, C. R., Casabianca, J. M., & Dodd, B. G. (2019). Comparing computer adaptive testing stopping rules under the generalized partial-credit model. *Behavior Research Methods*, 51, 1305-1320.
- Thompson, N. A. (2009). Item selection in computerized classification testing. *Educational and Psychological Measurement*, 69(5), 778-793.
- Tonidandel, S., Quiñones, M. A., & Adams, A. A. (2002). Computer-adaptive testing: The impact of test characteristics on perceived performance and test takers' reactions. *Journal of Applied Psychology*, 87(2), 320-332.
- van der Linden, W. J. (2005). *Linear Models for Optimal Test Design*. Springer.
- van der Linden, W. J., & Reese, L. M. (1998). A model for optimal constrained adaptive testing. *Applied Psychological Measurement*, 22(3), 259-270.
- Wise, S. L. (2017). Rapid-guessing behavior: Its identification, interpretation, and implications. *Educational Measurement: Issues and Practice*, 36(4), 52-61.
- Wise, S. L., & Kong, X. (2005). Response time effort: A new measure of examinee motivation in computer-based tests. *Applied Measurement in Education*, 18(2), 163-183.
- Yan, D., von Davier, A. A., & Lewis, C. (Eds.) (2014). *Computerized Multistage Testing: Theory and Applications*. CRC Press.

## Changelog

- **2026-11-20** : **correction** de la section 2.4 et du tableau de la section 4. D'après une simulation reproduisant `flash.js`, `variationPercent` ne freine pas θ̂ dans les zones basses avec la configuration des seeds. Ajout d'une mise en garde sur l'a priori recentré, qui rend la distribution a posteriori trop confiante.
- **2026-11-20** : section 1.6, ajout d'un lien vers le nouveau document `regle-r4-echecs-capacite.md`.
- **2026-11-20** : réorganisation complète.
  - Section 1 : le panorama des méthodes vient en premier et intègre l'analyse de Chen et al. sur les échecs consécutifs et la capacité basse (1.6).
  - Section 2 : état chez Pix et ce qui manque pour les méthodes fondées sur le SE et le PSER, avec un tableau par méthode et un point d'attention sur `variationPercent`.
  - Section 3 : la méthode A–E devient une section d'évaluation, avec la distinction entre rejeu et simulation complète.
  - Section 4 : la recommandation devient un tableau par méthode (état, durée estimée, avantages, limites), suivi de la combinaison recommandée.
  - Ajout de `Answer.timeSpent` comme brique existante pour la détection du *rapid guessing*.
  - Bibliographie conservée.
- **2026-11-20** : création du document. Il couvre l'état actuel du code Pix, l'équivalent du PSER dans `flash.js`, le panorama des règles d'arrêt, l'analyse de Chen et al. (2025) sur les échecs successifs et la capacité basse, la méthode A–E appliquée à Pix et la recommandation.
