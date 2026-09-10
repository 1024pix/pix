# Fiche — Entité

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés. Les deux règles les plus utiles,
>   sur E3 et E6, sont aussi les plus susceptibles de produire du bruit sur l'existant.
> - E3 et E7 sont énoncés ici et valent aussi pour une racine d'agrégat, qui y renvoie. Vérifier à
>   chaque reprise que les deux fiches ne les réénoncent pas.
> - Les écarts sont numérotés `X` et non `E`, qui est déjà le préfixe des invariants de cette fiche.
> - **Contradiction tranchée le 2026-09-08.** Le modèle de référence de la documentation
>   d'architecture expose des champs publics assignables, ce que `E1` et `E6` excluent. La fiche garde
>   sa règle, avec son motif explicite : **un champ qui porte une règle ne doit pas pouvoir être
>   réécrit de l'extérieur.** Là où rien n'est protégé, c'est de l'hygiène et non un invariant. La
>   page de documentation est antérieure aux contextes bornés et n'est pas la cible.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**E3**](#e3-les-invariants-sont-tenus-à-tout-instant) | les invariants sont tenus à tout instant | **forte** | règle ESLint, bruyante |
| [**E6**](#e6-aucun-mutateur-nu) | aucun mutateur nu | **forte** | règle ESLint |
| [**E7**](#e7-les-autres-agrégats-sont-référencés-par-identité) | les autres agrégats sont référencés par identité | **forte** | revue |
| [**E4**](#e4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | moyenne | `dependency-cruiser` |
| [**E5**](#e5-aucune-méthode-au-service-de-la-persistance) | aucune méthode au service de la persistance | moyenne | knip, partiel |
| [**E1**](#e1-lidentité-est-explicite-et-stable) | l'identité est explicite et stable | moyenne | règle ESLint, à mesurer |
| [**E2**](#e2-légalité-se-fonde-sur-lidentité) | l'égalité se fonde sur l'identité | hygiène | revue |
| [**E8**](#e8-nommage-et-emplacement) | nommage et emplacement | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-constructeur-en-sac-de-propriétés) | le constructeur en sac de propriétés | **à corriger** |
| [**X3**](#x3-la-validation-a-lieu-après-laffectation) | la validation a lieu après l'affectation | à surveiller |
| [**X4**](#x4-larborescence-ne-distingue-pas-entité-et-objet-valeur) | l'arborescence ne distingue pas entité et objet-valeur | à surveiller |
| [**X5**](#x5-lentité-non-persistée-porte-un-identifiant-null) | l'entité non persistée porte un identifiant `null` | à surveiller |

Deux artefacts hors numérotation, souvent cherchés : le
[test de discrimination](#le-test-de-discrimination) avec l'objet-valeur, et la question
[entité ou racine d'agrégat](#entité-ou-racine-dagrégat), tous deux au § 1.

---

## 1. Rôle

Une entité est définie **par son identité**, pas par ses attributs. Ses valeurs changent au cours du
temps, elle reste la même chose.

Elle porte les règles qui contraignent son propre état, et elle les tient **à tout instant** — pas
seulement à la construction.

### Le test de discrimination

> Si remplacer une instance par une autre portant exactement les mêmes valeurs change quelque chose
> pour le métier, c'est une entité. Sinon, c'est un objet-valeur.

Deux exemples qui rendent le test concret. Deux organisations aux mêmes nom et type sont deux
organisations différentes : entité. Deux seuils de 50 % sont le même seuil : objet-valeur, et
`fiche-objet-valeur.md` s'applique.

### Entité ou racine d'agrégat

Toute racine d'agrégat est une entité, et cette fiche s'applique intégralement à elle. L'inverse est
faux : une entité peut vivre **à l'intérieur** d'un agrégat sans en être la racine, auquel cas elle
n'est pas accessible directement et n'a pas de repository.

La question à poser : *cette entité est-elle atteignable autrement qu'en passant par une autre ?* Si
oui, c'est une racine, et `fiche-racine-agregat.md` ajoute ses devoirs propres — frontière de
cohérence, point d'entrée unique, repository.

Deux invariants de cette fiche, **E3** et **E7**, valent pour toute entité et sont donc énoncés ici.
La fiche racine d'agrégat y renvoie plutôt que de les réénoncer.

### Ce qu'une entité n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une entité.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas d'identité propre, deux instances de mêmes valeurs sont interchangeables | un objet-valeur, dans `domain/models/` | `fiche-objet-valeur.md` |
| est assemblé pour une lecture, et aucune règle ne le lit | un read-model, dans `domain/read-models/` | `fiche-read-model.md` |
| garantit une règle portant sur plusieurs objets à la fois | une racine d'agrégat | `fiche-racine-agregat.md` |
| charge ou écrit des données | un repository | `fiche-repository.md` |
| coordonne plusieurs entités et repositories pour réaliser une intention | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle qui ne relève d'aucune entité, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| met en forme pour une réponse HTTP | `infrastructure/serializers/` | `fiche-serialiseur.md` |
| décrit ce qu'on expose à un autre contexte | `application/api/` | `fiche-api-interne.md` |

---

## 2. Invariants

### E1. L'identité est explicite et stable

**Énoncé.** L'entité porte son identifiant, et il ne change pas pendant sa vie.

```js
// conforme — l'identifiant est porté, et rien ne le réassigne ensuite
class Passage {
  constructor({ id, moduleId, userId, terminatedAt }) {
    this.id = id;
    …
  }
}
```

**Ce qui casse.** Sans identité explicite, l'égalité, la déduplication et les références n'ont pas de
fondement : chaque site d'appel improvise sa comparaison.

**Le cas de l'entité non encore persistée.** Une entité créée en mémoire n'a pas encore
d'identifiant. Deux traitements, à choisir explicitement : un identifiant `null` assumé et documenté,
ou un type distinct pour l'intention de création — `…ForCreation`, voir V8 dans
`fiche-objet-valeur.md`. La seconde est plus sûre : la signature dit qu'il n'y a pas encore
d'identité. Voir X5 au § 5.

### E2. L'égalité se fonde sur l'identité

**Énoncé.** Deux instances de même identifiant sont la même entité, quelles que soient leurs valeurs.
Deux instances de mêmes valeurs et d'identifiants différents sont deux entités.

```js
// conforme
const isSamePassage = (a, b) => a.id === b.id;

// fautif — la comparaison dépend des champs chargés par la requête
const isSamePassage = (a, b) => JSON.stringify(a) === JSON.stringify(b);
```

**Ce qui casse.** Une comparaison par champs dépend de l'ordre des clés et de la fraîcheur des
données chargées. Elle rend deux entités différentes égales, ou l'inverse, selon la requête qui les a
produites.

Conséquence pratique en test : comparer les identifiants, et vérifier séparément l'état pertinent.

### E3. Les invariants sont tenus à tout instant

**Énoncé.** Une entité invalide ne s'instancie pas, et aucune opération ne la laisse dans un état
invalide — y compris une opération qui échoue à mi-chemin.

C'est l'invariant qui distingue une entité d'un objet littéral nommé. Il vaut aussi pour une racine
d'agrégat, où il porte sur la frontière de cohérence entière ; `fiche-racine-agregat.md` y renvoie.

**À la construction.** Une entité invalide ne s'instancie pas, et un seul type d'erreur de validation
vaut pour tout le domaine.

Sur la **place** de la validation dans le constructeur, la convention Pix valide `this` après les
affectations, contre un schéma déclaratif. C'est `X3` au § 5 : ce n'est pas la forme la plus stricte,
elle est documentée, et son coût porte sur le message d'erreur plutôt que sur l'invariant.

**À chaque changement d'état.** Une méthode qui modifie l'entité vérifie que le nouvel état reste
valide.

```js
// fautif — rien ne vérifie qu'un passage déjà terminé ne se termine pas deux fois
terminate() {
  this.terminatedAt = new Date();
}

// conforme — la règle est vérifiée au moment où elle peut être violée
terminate({ now }) {
  if (this.terminatedAt) throw new PassageAlreadyTerminatedError(this.id);
  this.terminatedAt = now;
}
```

**À la sortie d'une opération partielle.** Une méthode qui modifie plusieurs champs et lève entre
deux affectations laisse l'entité incohérente. Valider d'abord, affecter ensuite — la même règle qu'à
la construction, pour la même raison.

**Ce qui casse.** Sans cet invariant, chaque code en aval doit se demander si l'état est cohérent. La
vérification se duplique et elle est oubliée quelque part.

**Le piège du constructeur en sac de propriétés.** Un constructeur déstructuré avec une valeur par
défaut `= {}` et tous les champs optionnels accepte l'objet vide. L'entité s'instancie toujours, donc
elle ne protège rien. C'est la forme la plus répandue de violation, et la plus discrète : elle
ressemble à du code correct. Voir X1 au § 5.

### E4. Aucune I/O, aucune dépendance à l'infrastructure

**Énoncé.** Le symptôme est dans les imports.

```js
// dans un fichier de domain/models/ — fautif
import { anonymizeGeneralizeDate } from '…/shared/infrastructure/utils/date-utils.js';
```

**Vaut aussi pour l'horloge**, et c'est la violation la plus fréquente parce qu'elle ne ressemble pas
à un import :

```js
// fautif — l'entité lit l'heure courante, donc le test ne peut pas la fixer
terminate() { this.terminatedAt = new Date(); }
complete()  { this.updatedAt = new Date(); this.status = COMPLETED; }

// conforme — la date entre en paramètre
terminate({ now }) { this.terminatedAt = now; }
```

Ces deux méthodes sont par ailleurs **conformes à E6** : elles nomment leur intention. Un même code
peut satisfaire un invariant et en violer un autre, et c'est le cas le plus courant en revue.

**Corollaire.** Une entité ne charge jamais ce qui lui manque. Si une règle a besoin d'une donnée que
l'entité n'a pas, c'est au usecase de la fournir.

**Ce qui casse.** Le test cesse d'être pur : il faut un double. Le besoin d'un double est le symptôme,
pas la cause.

### E5. Aucune méthode au service de la persistance

**Énoncé.** La traduction vers la forme de stockage est la responsabilité du repository. L'entité
n'expose pas de méthode dont le repository est le seul consommateur.

```js
// fautif — le modèle porte une méthode dont seule l'infrastructure se sert
class Passage {
  toRow() { return { moduleId: this.moduleId, userId: this.userId, terminatedAt: this.terminatedAt }; }
}

// conforme — la traduction vit dans le repository, en fonction locale
const toRow = (passage) => ({ moduleId: passage.moduleId, userId: passage.userId, … });
```

**Ce qui casse.** Une migration de schéma oblige à modifier le domaine.

**L'exception.** Quand la forme sérialisée est un **format publié** — écrit à la main, documenté,
consommé hors du code — la méthode de sérialisation exprime un contrat et non un schéma de base.

Le test qui discrimine : *si le schéma de la base changeait, cette méthode devrait-elle changer ?* Si
oui, elle est au service de la persistance. Si elle suit un format documenté indépendant, non.

C'est ici son domicile unique. Il figurait aussi dans `fiche-repository.md` sous le numéro `I7`, qui
est retiré : l'invariant porte sur le modèle, pas sur le repository.

### E6. Aucun mutateur nu

**Énoncé.** Chaque changement d'état passe par une méthode qui **nomme l'intention métier** —
`archive()`, `complete()`, `rename()` — et non par un mutateur générique ni une affectation externe.

```js
// fautif — l'appelant décide de l'état, et l'objet se protège pourtant en lecture
class DataForQuest {
  #success;
  get success() { return Object.freeze(this.#success); }
  set success(value) { this.#success = value; }
}

// conforme — l'intention est nommée
complete() { this.status = COMPLETED; }
terminate({ now }) { this.terminatedAt = now; }
```

Le premier exemple est le plus instructif : l'objet gèle ce qu'il expose en lecture, puis offre un
mutateur public sur le même champ. La protection donne l'apparence d'une garantie qu'un seul `set`
annule.

**Ce qui casse.** Un mutateur nu annule E3 : l'invariant n'est plus garanti qu'à la naissance.

**Bénéfice de lecture.** La liste des méthodes d'une entité est la liste des choses qui peuvent lui
arriver. C'est la description la moins chère de son cycle de vie.

**Le cas de la construction progressive.** Une entité construite par une suite de mutateurs appelés
de l'extérieur — `setX()`, puis `setY()`, puis `setZ()` — n'est pas une entité mais un constructeur
déguisé, et son état est invalide entre deux appels. Si l'assemblage est réellement progressif, le
nommer : un objet dédié à la construction, ou un read-model si l'objet ne porte aucune règle.

### E7. Les autres agrégats sont référencés par identité

**Énoncé.** Une entité ne tient pas l'instance complète d'une entité appartenant à un **autre**
agrégat : elle en tient l'identifiant.

```js
// conforme — l'identifiant suffit
this.userId = userId;
this.moduleId = moduleId;

// fautif — l'entité tient l'instance d'une entité d'un autre agrégat
this.user = user;
this.module = module;
```

À l'intérieur d'un même agrégat, tenir les instances est normal : c'est la définition d'un agrégat.

Cet invariant vaut aussi pour une racine, où il est constitutif de la frontière plutôt qu'une bonne
pratique ; `fiche-racine-agregat.md` y renvoie.

**Ce qui casse.** Deux effets, et le second est le plus coûteux.

Charger l'objet entier oblige le repository à le charger aussi, et le coût d'un chargement cesse
d'être borné : il dépend de la profondeur du graphe.

Et la frontière cesse d'être déplaçable. Une entité qui tient l'instance d'une entité d'un autre
contexte devient impossible à extraire le jour où ce contexte est découpé. C'est ce qui classe cet
invariant en rentabilité forte.

### E8. Nommage et emplacement

**Énoncé.** Un fichier par entité, nommé d'après le concept métier en PascalCase, dans
`domain/models/`.

Le nom est celui du langage ubiquitaire du contexte. Deux contextes peuvent avoir une entité de même
nom désignant deux choses différentes : c'est attendu en DDD, pas une collision à résoudre. Ce qui
doit être clair, c'est **de quel contexte** on parle au moment de l'import.

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier trouvable et réduit le
bruit de revue.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Une entité non persistée avec un identifiant `null` | **autorisé** si c'est assumé et documenté — E1, et voir X5 |
| Une entité sans aucune méthode de changement d'état | **autorisé** — toutes les entités ne mutent pas |
| Une entité tient les instances d'entités du **même** agrégat | **autorisé**, c'est la définition d'un agrégat. E7 |
| Une méthode de sérialisation vers un **format publié** | **autorisé**, c'est l'exception de E5 |
| Un accesseur calculé — `isArchived`, `hasFeature` — plutôt qu'un champ | **autorisé**, et souvent préférable |
| Une entité qui reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de E4 |
| Deux contextes ont une entité de même nom | **autorisé**, c'est le langage ubiquitaire par contexte. E8 |
| L'objet n'a aucune règle propre et personne ne le lit pour décider | **ce n'est pas une entité** — appliquer le test du § 1, puis `fiche-read-model.md` |
| Une entité au constructeur permissif dans du code ancien | **pas une exception** — c'est X1, à classer et corriger, pas à absoudre |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **E3** invariants tenus à tout instant | **forte** | Un état invalide n'existe jamais, donc aucun code en aval n'a à s'en prémunir. C'est la différence entre un modèle qui protège et un modèle qui décore |
| **E6** aucun mutateur nu | **forte** | Sans lui, E3 n'est garanti qu'à la naissance. Et la liste des méthodes devient la description du cycle de vie |
| **E7** référence par identité | **forte** | Le coût d'un chargement reste borné, et la frontière reste déplaçable le jour d'un découpage en contextes |
| **E4** pureté | moyenne | Les règles métier deviennent vérifiables en unitaire pur, à coût quasi nul |
| **E5** pas de méthode de persistance | moyenne | Une migration de schéma ne touche pas au domaine |
| **E1** identité explicite | moyenne | Préalable pour raisonner sur l'égalité, la déduplication et les références |
| **E2** égalité par identité | hygiène | Conséquence de E1. L'apport se limite à des tests plus robustes |
| **E8** nommage et emplacement | hygiène | Rend le fichier trouvable. Réduit le bruit de revue |

E7 est classé en rentabilité forte ici, alors qu'un invariant de référencement passerait pour une
bonne pratique. La raison est le second de ses effets : il conditionne la faisabilité d'un découpage
en contextes, ce qui est le chantier le plus coûteux à rattraper.

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si le concept modélisé est le bon, ni si la frontière entre deux
entités est au bon endroit. Ils garantissent qu'une entité tient ses promesses, pas qu'elle promet
les bonnes choses.

Et ils ne disent pas si l'objet méritait d'être une entité plutôt qu'un objet-valeur ou un
read-model. C'est le test du § 1 qui répond, et il relève du jugement.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `E`, qui est le préfixe des invariants de cette fiche.

Le numéro **X2** n'est pas attribué. Il portait « les règles vivent dans les usecases », qui est
énoncé au § 5 de `fiche-usecase.md` sous `X1` — là où se trouve le fichier fautif. Le symptôme vu
d'ici est le modèle vide ; la correction porte sur le usecase.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le constructeur en sac de propriétés | dérive | L'entité s'instancie dans n'importe quel état, donc elle ne protège rien. E3 est faux par construction | L'écriture est rapide, et l'ajout d'un champ ne touche pas au constructeur | **À corriger** |
| **X3** La validation a lieu après l'affectation | convention assumée | Un objet invalide existe le temps du constructeur, et le message porte sur un état déjà construit plutôt que sur l'entrée fautive | Réel — un schéma déclaratif, un seul appel de validation, une forme uniforme entre tous les modèles | *À surveiller* |
| **X4** L'arborescence ne distingue pas entité et objet-valeur | convention assumée | Le test du § 1 n'est appliqué nulle part de façon visible, et aucune règle de chemin ne peut viser les entités seules | Un seul dossier où chercher, et aucune décision de classement à prendre à chaque fichier | *À surveiller* |
| **X5** L'entité non persistée porte un identifiant `null` | convention assumée | Chaque consommateur doit traiter le cas `null`, et le type ne l'annonce pas | Une seule classe au lieu de deux, et un seul chemin de code | *À surveiller* |

### X1. Le constructeur en sac de propriétés

**Ce que dit la théorie.** Une entité protège ses invariants. Un constructeur est le point où
l'invariant devient vrai pour la première fois.

**Exemple concret.**

```js
// accepte l'objet vide, donc s'instancie toujours
class TrainingTrigger {
  constructor({ id, trainingId, triggerTubes, type, threshold } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    …
  }
}
```

Le motif se reconnaît à la valeur par défaut `= {}` sur le paramètre déstructuré. Sur cet exemple la
validation existe pour un seul champ — le type de déclencheur — et manque pour tous les autres.

Le motif se reconnaît à trois traits qui vont ensemble : la valeur par défaut `= {}`, tous les champs
optionnels, et aucun appel de validation dans le corps.

**Correction.** Rendre requis ce qui est requis et valider avant d'affecter. Le coût réel n'est pas
l'écriture du constructeur mais la découverte des appelants qui s'appuyaient sur la permissivité —
souvent des factories de test.

Ordre de travail : la règle du § 6 en avertissement d'abord, pour produire la liste ; puis fichier
par fichier. La lancer en erreur d'emblée garantit qu'elle sera désactivée.

### X3. La validation a lieu après l'affectation

**Ce que dit la théorie.** L'invariant est vrai à tout instant. Un objet dont les champs sont affectés
puis vérifiés a existé dans un état invalide, même brièvement.

**Exemple concret, et c'est le motif documenté.** La documentation d'architecture Pix donne comme
modèle de référence un constructeur qui affecte tous ses champs, puis valide `this` contre un schéma
déclaratif :

```js
// la forme documentée : affecter, puis valider this contre un schéma
constructor({ id, state, … } = {}) {
  this.id = id;
  this.state = state;
  …
  validateEntity(certificationAssessmentSchema, this);
}

// la forme inverse, qui existe aussi dans le dépôt
constructor({ id, type, grains }) {
  assertNotNullOrUndefined(id, 'The id is required for a section');
  assertIsArray(grains, 'A list of grains is required for a section');
  this.id = id;
  …
}
```

Ce n'est donc pas une dérive : c'est la forme prescrite, avec un bénéfice réel — un schéma déclaratif
au lieu de gardes écrites une à une, un seul appel, et une forme identique dans tous les modèles.

**Correction.** Aucune systématique. Mais la forme « valider puis affecter » **existe dans le dépôt**,
avec ses propres utilitaires d'assertion, donc l'alternative n'est pas à inventer : les deux
conventions cohabitent.

Ce qui n'est pas mécanique, c'est de passer de l'une à l'autre sur un modèle donné : l'utilitaire qui
valide `this` contre un schéma ne se remplace pas par des assertions champ par champ sans réécrire la
validation.

Ce qui reste à tenir, et c'est la part utile de l'écart : le **message d'erreur**. Une validation sur
`this` décrit l'objet construit, pas l'entrée fautive, donc le diagnostic est plus long. Là où le
message compte — une entrée venant d'un import, d'une API, d'un formulaire — valider les paramètres
avant d'affecter reste préférable.

Ce qui rouvrirait le dossier : un utilitaire qui validerait les paramètres plutôt que `this`. Il
supprimerait le coût sans rien retirer du bénéfice.

### X4. L'arborescence ne distingue pas entité et objet-valeur

**Ce que dit la théorie.** Entité, objet-valeur et racine d'agrégat sont trois catégories aux
invariants différents. La théorie ne prescrit rien sur les dossiers, mais un dossier commun rend le
classement invisible.

**Et c'est documenté.** `docs/fr/Anatomy.md` décrit `domain/models` comme contenant « Entités,
aggrégats et value objects du domaine ». Le mélange est donc une convention, pas une dérive — ce qui
confirme le classement de cet écart et lui donne une source.

**Exemple concret.** `domain/models/` contient les trois catégories à plat, sans distinction.

```
domain/models/
  Passage.js                    → entité
  AnswerStatus.js               → objet-valeur
  CombinedCourseStatistics.js   → read-model, probablement
```

**Correction.** Aucune décidée, et c'est le point à trancher plutôt qu'à appliquer.

Ce que le dossier commun coûte vraiment : aucune règle de chemin ne peut viser les entités seules,
donc les vérifications du § 6 s'appliquent à tout `domain/models/` et produisent du bruit sur les
objets-valeurs. C'est le même obstacle que celui décrit dans `fiche-read-model.md`, où deux dossiers
frères rendent au contraire la règle écrivable.

Ce que la séparation coûterait : une décision de classement sur chaque fichier existant, par le test
du § 1. À arbitrer au regard du gain de vérification, pas par goût de taxonomie.

### X5. L'entité non persistée porte un identifiant `null`

**Ce que dit la théorie.** Une entité est définie par son identité. Une entité sans identité est une
contradiction dans les termes, ce qui est précisément pourquoi le cas mérite un nom.

**Exemple concret.**

```js
const passage = new Passage({ id: null, moduleId, userId });   // avant insertion
const saved = await passageRepository.save({ passage });
```

Tout consommateur de `Thing` doit alors savoir si l'identifiant peut être `null`, et rien dans la
signature ne le dit.

**Correction.** Aucune sur l'existant. Pour le neuf, préférer un type distinct pour l'intention de
création — `…ForCreation`, sans identifiant. La signature porte alors l'information, et le typage la
vérifiera. C'est V8 de `fiche-objet-valeur.md` appliqué à une entité.

À lire avec `X7` de cette même fiche, qui borne la pratique : une forme de **création** exprime une
différence de nature, donc elle est légitime. Une forme de **mise à jour** portant un sous-ensemble de
champs ne l'est pas, sauf mesure.

Ce qui rouvrirait le dossier : constater que le cas `null` a produit un défaut en production. Sans
cette pièce, le coût du doublement des types n'est pas démontré.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve : introduire la violation, confirmer que l'outil sort, retirer la
violation.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure, et les coûts ci-dessous ne comptent que la règle. Ce point est daté, à retirer dès que
l'infrastructure existe.

**Une limite qui vaut pour tout ce § :** les règles portent sur `domain/models/`, qui contient aussi
les objets-valeurs et peut-être des racines d'agrégat. Elles sortiront donc sur des fichiers qui ne
sont pas des entités. C'est X4, et c'est ce qui plafonne la précision de cette section.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **E4** aucune I/O | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **E6** aucun mutateur nu | règle ESLint : `set` public dans `domain/models/` | ~20 lignes | aucun attendu |
| **E8** nommage et emplacement | script `tests/tooling/` | ~20 lignes | aucun |
| **E3** invariants tenus | règle ESLint : constructeur en `= {}` sans appel de validation | ~40 lignes | **élevés sur l'existant** — voir X1 |
| **X3** validation après affectation | sans objet : c'est la forme prescrite. Voir `X3` au § 5 | — | — |
| **E1** identité explicite | règle ESLint : une classe de `domain/models/` expose un accesseur `id` | ~15 lignes | **à mesurer** — un objet-valeur porteur d'identifiant la déclenche |
| **E5** pas de méthode de persistance | knip, déjà branché : il signale les exports à consommateur unique | aucun | **à mesurer** |
| **E2**, **E7** | revue | — | — |

### E4 — une règle de chemin

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans erreur ni avertissement.

Cette règle est partagée avec V4 de `fiche-objet-valeur.md` et S3 de `fiche-specification.md` : une
seule configuration couvre les trois.

### E6 — mutateur nu

Décidable localement, deux motifs :

- une déclaration `set nom(valeur)` dans un fichier de `domain/models/` ;
- un champ de classe public affecté hors du constructeur.

Le second est plus utile et plus délicat : il faut distinguer l'affectation dans le constructeur de
celle dans une méthode. Commencer par le cas net — `set` explicite — puis élargir.

### E3 — la règle la plus utile et la plus bruyante

Le motif : un constructeur dont le paramètre est déstructuré avec `= {}` et dont le corps ne comporte
**aucun appel de validation**, sous aucune forme — ni garde écrite à la main, ni appel à l'utilitaire
de validation par schéma.

Il désigne exactement la forme dominante de violation, mais il sortira sur beaucoup d'entités
existantes. **À introduire en avertissement**, avec une décision préalable sur l'ampleur du rattrapage.
La lancer en erreur d'emblée garantit qu'elle sera désactivée.

Ce que la règle ne doit **pas** signaler : une validation placée après les affectations. C'est la forme
prescrite par la documentation d'architecture — voir `X3` au § 5 — et une règle qui l'attraperait
sortirait sur la quasi-totalité des modèles.

### E5 partiel — knip

knip détecte les exports non consommés. Une méthode dont le seul consommateur est le repository
n'apparaît pas comme non consommée : knip ne la voit pas directement. Il désigne la famille adjacente
— un export à consommateur unique — qui est le motif de `E5`. À exploiter en lisant sa sortie.

Coût nul, puisqu'il tourne déjà. Faux positifs à mesurer avant d'en faire une règle bloquante. Et il ne
tranche pas l'exception du format publié, qui reste en revue.

### Ce qui n'est pas mécanisable

E2 et E7 demandent de savoir ce qui appartient au même agrégat, et E5 ce qui est un format publié.
Ces deux informations ne se lisent pas dans un fichier isolé, et elles ne sont écrites nulle part —
c'est le même manque que celui relevé au § 6 de `fiche-racine-agregat.md`.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **E4** — configuration `dependency-cruiser`, avec contre-épreuve
2. **E6** — première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure
3. **E8** — script de nommage
4. **E3** — en avertissement, pour produire la liste du rattrapage
5. **E1** — après mesure des faux positifs sur les objets-valeurs porteurs d'identifiant

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **E8** nommage | oui, complet | Renommer le fichier et réécrire ses imports |
| **E6** champs publics | partiel | Privatiser un champ et ajouter son accesseur, oui. Si le champ est **écrit** depuis l'extérieur, signaler et s'arrêter — ajouter un mutateur violerait E6 |
| **X1** sac de propriétés | préparation seule | Repérer les constructeurs fautifs, oui. Décider quels champs sont requis, non |
| **X2** règles dans les usecases | non | Décider ce qui appartient à l'entité et ce qui est de l'orchestration est de la conception |

---

## 7. Le type

Une entité se déclare en **classe**. L'identité rend la nominalité moins critique que pour un
objet-valeur — deux entités ne se confondent pas par leur forme — mais la classe reste la forme
retenue, parce qu'un constructeur qui valide doit être le seul chemin de construction.

```ts
export class Organization {
  readonly id: number;
  #archivedAt: Date | null;

  constructor(params: { id: number; archivedAt?: Date | null }) { /* validation */ }

  get isArchived(): boolean { return this.#archivedAt !== null; }
  archive(params: { archivedBy: number; now: Date }): void { /* … */ }
}
```

Deux bénéfices qui portent sur les invariants les plus souvent en défaut.

**E3 devient partiellement structurel.** Des champs non optionnels dans le type du constructeur
suppriment le sac de propriétés permissif : l'appelant ne peut plus omettre ce qui est requis. La
validation de valeur reste nécessaire, la validation de présence devient gratuite.

**E7 devient lisible.** `organizationId: number` plutôt qu'`organization: Organization` est une
différence visible dans la signature, donc revue à la lecture.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. E6 repose
sur les champs privés, pas sur `readonly`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Entité | **unitaire pur**, aucune base, aucun double | la validation à la construction |
| Chaque méthode de changement d'état | **unitaire** | le cas passant **et** le refus quand l'invariant serait violé |
| Accesseurs calculés | **unitaire** | les cas limites, pas seulement le cas nominal |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic, avec leurs bornes.

**Le test qui manque le plus souvent est celui du refus.** On vérifie qu'`archive()` archive, pas
qu'il refuse d'archiver deux fois. Or c'est le second qui prouve que E3 est tenu. La borne : une
entité sans méthode de changement d'état n'a pas de refus à tester, ce qu'admet le § 3.

Une entité qui a besoin d'un double **viole E4**. Le double nécessaire est le symptôme, pas la cause.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [partiel] E3  Refuse de s'instancier dans un état invalide, et refuse chaque transition invalide
[ ] [auto]    E6  Aucun mutateur nu ; chaque changement d'état nomme son intention métier
[ ] [humain]  E7  Les entités d'un autre agrégat sont référencées par identifiant, pas par instance
[ ] [auto]    E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [partiel] E5  Aucune méthode dont le repository est le seul consommateur   (sauf format publié)
[ ] [partiel] E1  L'identité est explicite et ne change pas ; le cas non persisté est traité
[ ] [humain]  E2  Les comparaisons se fondent sur l'identité, pas sur les champs
[ ] [auto]    E8  Un fichier, PascalCase, nom du langage ubiquitaire du contexte
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'entité
[ ] [humain]  Chaque règle a son test de refus, pas seulement son cas passant
[ ] [humain]  Si l'objet n'a aucune règle propre, appliquer le test du § 1 : entité, ou read-model ?
```

À terme il reste six lignes, toutes de jugement : E7, E5, E2, le test de refus, le rappel du test de
discrimination, et la part de E3 qu'aucune règle ne couvre — la validation de valeur, par opposition
à la validation de présence.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **E1**, **E2** identité, égalité par identité | Evans, *DDD*, ch. « A Model Expressed in Software » — Entity | *DDD Reference*, PDF gratuit |
| **E3** invariants tenus à tout instant | Evans, ch. « The Life Cycle of a Domain Object » — l'invariant est la raison d'être de l'agrégat, et vaut pour l'entité | *DDD Reference* |
| **E4** pureté | Evans, même ch. ; Martin, « The Clean Architecture » | billet gratuit |
| **E5** pas de méthode de persistance | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** | *DDD Reference* |
| **E6** aucun mutateur nu | Fowler, « AnemicDomainModel » | bliki gratuit |
| **E7** référence par identité | Vernon, « Effective Aggregate Design », règle 3 : *reference other aggregates by identity* | dddcommunity.org |
| **E8** nommage et emplacement | l'**emplacement** est documenté : `docs/fr/Anatomy.md` décrit `domain/models`. Le **nommage** — PascalCase, un fichier par entité — n'a **aucune source** | `docs/fr/Anatomy.md` ; ADR 51 |
| Le test de discrimination entité / objet-valeur | Evans, même ch. — c'est le critère qu'il donne | *DDD Reference* |
| Validation à la frontière HTTP plutôt que par le type (X5) | **ADR 19**, qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

**Un seul invariant sur huit n'a aucune source externe** : E8, convention de nommage. La catégorie
entité est le cœur du vocabulaire tactique de DDD, et ses invariants sont ceux des livres.

Ce qui manque de source, ici, c'est la **façon Pix** de les appliquer : le choix du type d'erreur de
validation, l'ordre validation / affectation, et le traitement de l'entité non persistée. Ces trois
points relèvent de la convention et se discutent sur leurs mérites — ce sont respectivement X3 et X5
au § 5.
