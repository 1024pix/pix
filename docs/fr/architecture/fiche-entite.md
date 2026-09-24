# Fiche — Entity

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés. Les deux règles les plus utiles
>   portent sur E3 et E6. Celle de E3 est la plus susceptible de produire du bruit sur l'existant.
>   Pour celle de E6, aucun faux positif n'est attendu.
> - E3 et E7 sont énoncés ici et valent aussi pour une Aggregate Root, qui y renvoie. Vérifier à
>   chaque reprise que les deux fiches ne les réénoncent pas.
> - Les écarts sont numérotés `X` et non `E`, qui est déjà le préfixe des invariants de cette fiche.
> - Le modèle de référence de la documentation d'architecture expose des champs publics assignables.
>   `E1` et `E6` l'excluent. La fiche garde sa règle et son motif : aucun code extérieur ne doit
>   pouvoir réécrire un **champ qui porte une règle**. Là où rien n'est protégé, c'est de l'hygiène,
>   pas un invariant. La page de documentation date d'avant les Bounded Contexts et n'est pas la
>   cible.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants**, classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**E3**](#e3-les-invariants-sont-tenus-à-tout-instant) | les invariants sont tenus à tout instant | **forte** | règle ESLint, bruyante |
| [**E6**](#e6-aucun-mutateur-nu) | aucun mutateur nu | **forte** | règle ESLint |
| [**E7**](#e7-les-autres-aggregates-sont-référencés-par-identité) | les autres Aggregates sont référencés par identité | **forte** | revue |
| [**E4**](#e4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | moyenne | `dependency-cruiser`, partielle |
| [**E5**](#e5-aucune-méthode-au-service-de-la-persistance) | aucune méthode au service de la persistance | moyenne | revue |
| [**E1**](#e1-lidentité-est-explicite-et-stable) | l'identité est explicite et stable | moyenne | règle ESLint, faux positifs non mesurés |
| [**E2**](#e2-légalité-se-fonde-sur-lidentité) | l'égalité se fonde sur l'identité | hygiène | revue |
| [**E8**](#e8-nommage-et-emplacement) | nommage et emplacement | hygiène | script |

**Écarts**, triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-constructeur-en-sac-de-propriétés) | le constructeur en sac de propriétés | **à corriger** |
| [**X3**](#x3-la-validation-a-lieu-après-laffectation) | la validation a lieu après l'affectation | à surveiller |
| [**X4**](#x4-larborescence-ne-distingue-pas-entity-et-value-object) | l'arborescence ne distingue pas Entity et Value Object | à surveiller |
| [**X5**](#x5-lentity-non-persistée-porte-un-identifiant-null) | l'Entity non persistée porte un identifiant `null` | à surveiller |

Hors numérotation, au § 1 : le [test de discrimination](#le-test-de-discrimination) avec
le Value Object, et la question [Entity ou Aggregate Root](#entity-ou-aggregate-root).

---

## 1. Rôle

Une Entity est définie **par son identité**, pas par ses attributs. Ses valeurs changent au cours du
temps, elle reste la même chose.

Elle porte les règles qui contraignent son propre état. Elle les tient **à tout instant**, pas
seulement à la construction.

### Le test de discrimination

> Si remplacer une instance par une autre portant exactement les mêmes valeurs change quelque chose
> pour le métier, c'est une Entity. Sinon, c'est un Value Object.

Deux exemples qui rendent le test concret. Deux organisations aux mêmes nom et type sont deux
organisations différentes : Entity. Deux seuils de 50 % sont le même seuil : Value Object, et
`fiche-objet-valeur.md` s'applique.

### Entity ou Aggregate Root

Toute Aggregate Root est une Entity. Cette fiche s'applique intégralement à elle. L'inverse est
faux : une Entity peut vivre **à l'intérieur** d'un Aggregate sans en être la racine. Elle n'est alors
pas accessible directement et n'a pas de repository.

La question qui décide : *cette Entity est-elle atteignable autrement qu'en passant par une autre ?* Si
oui, c'est une racine, et `fiche-racine-agregat.md` ajoute ses devoirs propres : frontière de
cohérence, point d'entrée unique, repository.

Deux invariants de cette fiche, **E3** et **E7**, valent pour toute Entity. C'est pourquoi ils sont
énoncés ici, et la fiche Aggregate Root y renvoie plutôt que de les répéter.

### Ce qu'une Entity n'est pas

Si le code correspond à une ligne, ce n'est pas une Entity.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas d'identité propre, deux instances de mêmes valeurs sont interchangeables | un Value Object, dans `domain/models/` | `fiche-objet-valeur.md` |
| est assemblé pour une lecture, et aucune règle ne le lit | un read-model, dans `domain/read-models/` | `fiche-read-model.md` |
| garantit une règle portant sur plusieurs objets à la fois | une Aggregate Root | `fiche-racine-agregat.md` |
| charge ou écrit des données | un repository | `fiche-repository.md` |
| coordonne plusieurs Entities et repositories pour réaliser une intention | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle qui ne relève d'aucune Entity, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| met en forme pour une réponse HTTP | `infrastructure/serializers/` | `fiche-serialiseur.md` |
| décrit ce qui est exposé à un autre contexte | `application/api/` | `fiche-api-interne.md` |

---

## 2. Invariants

### E1. L'identité est explicite et stable

**Énoncé.** L'Entity porte son identifiant. Il ne change pas pendant sa vie.

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
fondement. Chaque site d'appel improvise sa comparaison.

**Le cas de l'Entity non encore persistée.** Une Entity créée en mémoire n'a pas encore d'identifiant.
Deux traitements existent, et le choix entre eux est explicite :

- un identifiant `null`, assumé et documenté ;
- un type distinct pour l'intention de création, `…ForCreation` (voir V8 dans `fiche-objet-valeur.md`).

Le second est plus sûr : la signature dit qu'il n'y a pas encore d'identité. Voir X5 au § 5.

### E2. L'égalité se fonde sur l'identité

**Énoncé.** Deux instances de même identifiant sont la même Entity, quelles que soient leurs valeurs.
Deux instances de mêmes valeurs et d'identifiants différents sont deux Entities.

```js
// conforme
static areEqualById(oneSkill, otherSkill) {
  return oneSkill.id === otherSkill.id;
}

// fautif — la comparaison porte sur un champ, pas sur l'identifiant
static areEqual(oneSkill, otherSkill) {
  return oneSkill.name === otherSkill.name;
}
```

**Ce qui casse.** Une comparaison par un champ autre que l'identifiant dépend de la fraîcheur des
données chargées. Elle a deux effets :

- elle confond deux Entities distinctes qui partagent ce champ ;
- elle distingue deux instances de la même Entity chargées à des moments différents.

En test, la comparaison porte sur les identifiants, et l'état pertinent se vérifie séparément.

### E3. Les invariants sont tenus à tout instant

**Énoncé.** Une Entity invalide ne s'instancie pas. Aucune opération ne la laisse dans un état
invalide, y compris une opération qui échoue à mi-chemin.

C'est l'invariant qui distingue une Entity d'un objet littéral nommé. Il vaut aussi pour une Aggregate
Root, où il porte sur la frontière de cohérence entière. `fiche-racine-agregat.md` y renvoie.

**À la construction.** La validation lève un seul type d'erreur, commun à tout le domaine.

La convention Pix valide `this` après les affectations, contre un schéma déclaratif. C'est `X3` au
§ 5. Ce n'est pas la forme la plus stricte. Elle est documentée, et son coût porte sur le message
d'erreur, pas sur l'invariant.

**À chaque changement d'état.** Une méthode qui modifie l'Entity vérifie que le nouvel état reste
valide.

```js
// fautif — rien ne vérifie qu'un passage déjà terminé ne se termine pas deux fois
terminate() {
  this.terminatedAt = new Date();
}

// conforme — la règle est vérifiée au moment où elle peut être violée
terminate({ now }) {
  if (this.terminatedAt) throw new PassageTerminatedError();
  this.terminatedAt = now;
}
```

**À la sortie d'une opération partielle.** Une méthode qui modifie plusieurs champs, et lève entre
deux affectations, laisse l'Entity incohérente. La validation précède l'affectation : la même règle
qu'à la construction, pour la même raison.

**Ce qui casse.** Sans cet invariant, chaque code en aval doit se demander si l'état est cohérent. La
vérification se duplique et elle est oubliée quelque part.

**Le piège du constructeur en sac de propriétés.** Un constructeur déstructuré avec une valeur par
défaut `= {}` et tous les champs optionnels accepte l'objet vide. L'Entity s'instancie toujours, donc
elle ne protège rien. C'est la forme la plus répandue de violation. C'est aussi la plus discrète :
elle ressemble à du code correct. Voir X1 au § 5.

### E4. Aucune I/O, aucune dépendance à l'infrastructure

**Énoncé.** Une Entity n'importe rien de l'infrastructure et ne fait aucune I/O. Une violation se
repère dans les imports.

```js
// dans un fichier de domain/models/ — fautif
import { anonymizeGeneralizeDate } from '…/shared/infrastructure/utils/date-utils.js';
```

**L'horloge.** Lire l'heure courante est la violation la plus fréquente, parce
qu'elle ne ressemble pas à un import :

```js
// fautif — l'Entity lit l'heure courante, donc le test ne peut pas la fixer
updateRole({ role, updatedByUserId }) {
  this.role = role;
  this.updatedAt = new Date();
  if (updatedByUserId) this.updatedByUserId = updatedByUserId;
}

// conforme — la date entre en paramètre
updateRole({ role, updatedByUserId, now }) {
  this.role = role;
  this.updatedAt = now;
  if (updatedByUserId) this.updatedByUserId = updatedByUserId;
}
```

Ces deux méthodes sont par ailleurs **conformes à E6** : elles nomment leur intention. Un même code
peut satisfaire un invariant et en violer un autre. C'est le cas le plus courant en revue.

**Corollaire.** Une Entity ne charge jamais ce qui lui manque. Si une règle a besoin d'une donnée que
l'Entity n'a pas, le usecase la fournit.

**Ce qui casse.** Le test cesse d'être pur : il demande un double. Ce besoin n'est que le symptôme. La
cause est la dépendance à l'infrastructure.

### E5. Aucune méthode au service de la persistance

**Énoncé.** La traduction vers la forme de stockage est la responsabilité du repository. L'Entity
n'expose pas de méthode dont le repository est le seul consommateur.

```js
// fautif — le modèle porte une méthode dont seul le repository se sert
class Quest {
  toDTO() {
    return { id: this.id, rewardType: this.rewardType, rewardId: this.rewardId, … };
  }
}

// conforme — la traduction vit dans le repository, en fonction locale
function _toDomain({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
  return new Passage({ id, moduleId, userId, createdAt, updatedAt, terminatedAt });
}
```

**Ce qui casse.** Une migration de schéma oblige à modifier le domaine.

L'exception : un **format publié**. C'est une forme sérialisée qui est :

- écrite à la main ;
- documentée ;
- consommée hors du code.

La méthode de sérialisation exprime alors un contrat, pas un schéma de base.

Le test qui discrimine : *si le schéma de la base changeait, cette méthode devrait-elle changer ?* Si
oui, elle est au service de la persistance. Si elle suit un format documenté indépendant, non.

`fiche-repository.md` ne porte pas cet invariant. Son ancien numéro `I7` est retiré, parce que
l'invariant porte sur le modèle, pas sur le repository.

### E6. Aucun mutateur nu

**Énoncé.** Chaque changement d'état passe par une méthode qui **nomme l'intention métier**, par
exemple `archive()`, `complete()`, `rename()`. Pas de mutateur générique, pas d'affectation externe.

```js
// fautif — l'appelant décide de l'état, et l'objet se protège pourtant en lecture
class DataForQuest {
  #success;
  get success() { return Object.freeze(this.#success); }
  set success(value) { this.#success = value; }
}

// conforme à E6 — l'intention est nommée (la lecture de l'heure viole E4, voir plus haut)
complete() {
  this.updatedAt = new Date();
  this.status = CombinedCourseParticipationStatuses.COMPLETED;
}
```

Dans l'exemple fautif, l'objet gèle ce qu'il expose en lecture, puis offre un mutateur public sur le
même champ. La protection donne l'apparence d'une garantie, qu'un seul `set` annule.

**Ce qui casse.** Un mutateur nu annule E3 : l'invariant n'est plus garanti qu'à la construction.

**Bénéfice de lecture.** La liste des méthodes d'une Entity est la liste des choses qui peuvent lui
arriver. C'est la description la moins chère de son cycle de vie.

**Le cas de la construction progressive.** Une Entity construite par une suite de mutateurs appelés de
l'extérieur, `setX()` puis `setY()` puis `setZ()`, n'est pas une Entity. C'est un constructeur
déguisé, et son état est invalide entre deux appels. Un assemblage réellement progressif porte un
nom : un objet dédié à la construction, ou un read-model si l'objet ne porte aucune règle.

### E7. Les autres Aggregates sont référencés par identité

**Énoncé.** Une Entity ne tient pas l'instance complète d'une Entity appartenant à un **autre**
Aggregate : elle en tient l'identifiant.

```js
// fautif — l'Entity tient l'instance d'une Entity d'un autre Aggregate, en plus de son identifiant
this.organization = organization;
this.organizationId = organization?.id ?? organizationId;
this.user = user;
this.userId = user?.id ?? userId;

// conforme — seul l'identifiant est tenu
this.organizationId = organizationId;
this.userId = userId;
```

À l'intérieur d'un même Aggregate, tenir les instances est normal : c'est la définition d'un Aggregate.

Cet invariant vaut aussi pour une racine, où il est constitutif de la frontière plutôt qu'une bonne
pratique. `fiche-racine-agregat.md` y renvoie.

**Ce qui casse.** Deux effets, et le second est le plus coûteux.

Tenir l'objet entier oblige le repository à le charger aussi. Le coût d'un chargement cesse d'être
limité : il dépend de la profondeur du graphe.

La frontière cesse aussi d'être déplaçable. Une Entity qui tient l'instance d'une Entity d'un autre
contexte devient impossible à extraire le jour où ce contexte est découpé. C'est ce qui classe cet
invariant en rentabilité forte.

### E8. Nommage et emplacement

**Énoncé.** Un fichier par Entity, nommé d'après le concept métier en PascalCase, dans
`domain/models/`.

Le nom est celui de l'Ubiquitous Language du contexte. Deux contextes peuvent avoir une Entity de même
nom, désignant deux choses différentes. C'est attendu en DDD, pas une collision à résoudre. Ce qui
doit être clair, c'est **de quel contexte** relève le nom au moment de l'import.

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier trouvable et réduit le
bruit de revue.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Une Entity non persistée avec un identifiant `null` | **autorisé** si c'est assumé et documenté — E1, et voir X5 |
| Une Entity sans aucune méthode de changement d'état | **autorisé** — toutes les Entities ne mutent pas |
| Une Entity tient les instances d'Entities du **même** Aggregate | **autorisé**, c'est la définition d'un Aggregate. E7 |
| Une méthode de sérialisation vers un **format publié** | **autorisé**, c'est l'exception de E5 |
| Un accesseur calculé — `isArchived`, `hasFeature` — plutôt qu'un champ | **autorisé**, et souvent préférable |
| Une Entity qui reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de E4 |
| Deux contextes ont une Entity de même nom | **autorisé**, c'est l'Ubiquitous Language par contexte. E8 |
| L'objet n'a aucune règle propre et personne ne le lit pour décider | **ce n'est pas une Entity** — le test du § 1 s'applique, puis `fiche-read-model.md` |
| Une Entity au constructeur permissif dans du code ancien | **pas une exception** — c'est X1, un écart classé et corrigé, pas absous |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **E3** invariants tenus à tout instant | **forte** | Un état invalide n'existe jamais, donc aucun code en aval n'a à s'en prémunir |
| **E6** aucun mutateur nu | **forte** | Sans lui, E3 n'est garanti qu'à la construction. Et la liste des méthodes devient la description du cycle de vie |
| **E7** référence par identité | **forte** | Le coût d'un chargement reste limité, et la frontière reste déplaçable le jour d'un découpage en contextes |
| **E4** pureté | moyenne | Les règles métier deviennent vérifiables en unitaire pur, à coût quasi nul |
| **E5** pas de méthode de persistance | moyenne | Une migration de schéma ne touche pas au domaine |
| **E1** identité explicite | moyenne | Préalable pour raisonner sur l'égalité, la déduplication et les références |
| **E2** égalité par identité | hygiène | Conséquence de E1. L'apport se limite à des tests plus robustes |
| **E8** nommage et emplacement | hygiène | Rend le fichier trouvable. Réduit le bruit de revue |

E7 est classé en rentabilité forte ici, alors qu'un invariant de référencement passerait pour une
bonne pratique. La raison est son second effet : il conditionne la faisabilité d'un découpage en
contextes. C'est le chantier le plus coûteux à rattraper.

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si le concept modélisé est le bon, ni si la frontière entre deux
Entities est au bon endroit. Ils garantissent qu'une Entity tient ses promesses, pas qu'elle promet
les bonnes choses.

Ils ne disent pas non plus si l'objet méritait d'être une Entity plutôt qu'un Value Object ou un
read-model. C'est le test du § 1 qui répond. Il relève du jugement.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `E`, qui est le préfixe des invariants de cette fiche.

Le numéro **X2** n'est pas attribué. Il portait « les règles vivent dans les usecases ». C'est énoncé
au § 5 de `fiche-usecase.md` sous `X1`, là où se trouve le fichier fautif. Le symptôme vu d'ici est le
modèle vide. La correction porte sur le usecase.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le constructeur en sac de propriétés | dérive | L'Entity s'instancie dans n'importe quel état, donc elle ne protège rien. E3 est faux par construction | L'écriture est rapide, et l'ajout d'un champ ne touche pas au constructeur | **À corriger** |
| **X3** La validation a lieu après l'affectation | convention assumée | Un objet invalide existe le temps du constructeur, et le message porte sur un état déjà construit plutôt que sur l'entrée fautive | Réel — un schéma déclaratif, un seul appel de validation, une forme uniforme entre tous les modèles | *À surveiller* |
| **X4** L'arborescence ne distingue pas Entity et Value Object | convention assumée | Le test du § 1 n'est appliqué nulle part de façon visible, et aucune règle de chemin ne peut viser les Entities seules | Un seul dossier où chercher, et aucune décision de classement à prendre à chaque fichier | *À surveiller* |
| **X5** L'Entity non persistée porte un identifiant `null` | convention assumée | Chaque consommateur doit traiter le cas `null`, et le type ne l'annonce pas | Une seule classe au lieu de deux, et un seul chemin de code | *À surveiller* |

### X1. Le constructeur en sac de propriétés

**Ce que dit la théorie.** Une Entity protège ses invariants. Un constructeur est le point où
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

Trois traits vont ensemble et signalent le motif : la valeur par défaut `= {}` sur le paramètre
déstructuré, tous les champs optionnels, et aucun appel de validation dans le corps.

Sur cet exemple, le troisième trait n'est vrai qu'en partie. La validation existe pour un seul champ,
le type de déclencheur, et manque pour tous les autres. La règle du § 6 ne voit pas ce cas, parce
qu'elle cherche l'absence de tout appel de validation. Une validation partielle reste donc en revue.

**Correction.** Rendre requis ce qui est requis, et valider avant d'affecter. Le coût réel n'est pas
l'écriture du constructeur. C'est la découverte des appelants qui s'appuyaient sur la permissivité,
souvent des factories de test.

Ordre de travail : la règle du § 6 en avertissement d'abord, pour produire la liste. Puis fichier par
fichier. La lancer en erreur d'emblée garantit qu'elle sera désactivée.

### X3. La validation a lieu après l'affectation

**Ce que dit la théorie.** L'invariant est vrai à tout instant. Un objet dont les champs sont affectés
puis vérifiés a existé dans un état invalide, même brièvement.

**Exemple concret.** C'est le motif documenté. La documentation d'architecture Pix donne comme modèle
de référence un constructeur qui affecte tous ses champs, puis valide `this` contre un schéma
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

Ce n'est donc pas une dérive : c'est la forme prescrite. Le bénéfice est réel : un schéma déclaratif
au lieu de gardes écrites une à une, un seul appel, et une forme identique dans tous les modèles.

**Correction.** Aucune n'est systématique. La forme « valider puis affecter » existe dans le dépôt,
avec ses propres utilitaires d'assertion. L'alternative n'est donc pas à inventer : les deux
conventions cohabitent.

Passer de l'une à l'autre sur un modèle donné n'est pas mécanique. L'utilitaire qui valide `this`
contre un schéma ne se remplace pas par des assertions champ par champ sans réécrire la validation.

Le coût à surveiller est le message d'erreur. Une validation sur `this` décrit l'objet construit, pas
l'entrée fautive : le diagnostic est plus long. Là où le message compte, valider les paramètres avant
d'affecter reste préférable. C'est le cas d'une entrée venant d'un import, d'une API ou d'un
formulaire.

**Révision.** Un utilitaire qui validerait les paramètres plutôt que `this` change ce verdict. Il
supprimerait le coût sans rien retirer du bénéfice.

### X4. L'arborescence ne distingue pas Entity et Value Object

**Ce que dit la théorie.** Entity, Value Object et Aggregate Root sont trois catégories aux
invariants différents. La théorie ne prescrit rien sur les dossiers. Mais un dossier commun rend le
classement invisible.

**C'est documenté.** `docs/fr/Anatomy.md` décrit `domain/models` comme contenant « Entités, aggrégats
et value objects du domaine ». Le mélange est donc une convention documentée, pas une dérive.

**Exemple concret.** `domain/models/` contient les trois catégories à plat, sans distinction.

```
domain/models/
  Passage.js                    → Entity
  AnswerStatus.js               → Value Object
  CombinedCourseStatistics.js   → Value Object sans règle, ou read-model : le test du § 1 décide
```

**Correction.** Aucune n'est décidée : c'est une décision à prendre, pas une correction à appliquer.

Ce que le dossier commun coûte vraiment : aucune règle de chemin ne peut viser les Entities seules. Les
vérifications du § 6 s'appliquent donc à tout `domain/models/`, et produisent du bruit sur les
Value Objects. `fiche-read-model.md` montre l'inverse : deux dossiers séparés permettent d'écrire la
règle de chemin.

Ce que la séparation coûterait : une décision de classement sur chaque fichier existant, par le test
du § 1. Le choix se fait sur le gain de vérification, pas sur le seul souci de bien classer.

### X5. L'Entity non persistée porte un identifiant `null`

**Ce que dit la théorie.** Une Entity est définie par son identité. Une Entity sans identité est une
contradiction dans les termes. C'est pourquoi le cas mérite un nom.

**Exemple concret.**

```js
const draftVersion = Version.buildDraftFromActiveVersion({ scope, version: activeVersion, tubeIds });
// draftVersion.id === null, avant insertion
const versionId = await versionRepository.save(draftVersion);
```

Tout consommateur de `Version` doit alors savoir si l'identifiant peut être `null`. Rien dans la
signature ne le dit.

**Correction.** Aucune sur l'existant. Pour le neuf, l'intention de création prend un type distinct,
`…ForCreation`, sans identifiant. La signature porte alors l'information, et le typage la
vérifie. C'est V8 de `fiche-objet-valeur.md` appliqué à une Entity.

`X7` de `fiche-objet-valeur.md` limite la pratique : une forme de création exprime une
différence de nature, donc elle est légitime. Une forme de mise à jour portant un sous-ensemble de
champs ne l'est pas, sauf mesure.

**Révision.** Un défaut en production causé par le cas `null` change ce verdict. Sans
cette pièce, le coût du doublement des types n'est pas démontré.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve :

- introduction de la violation ;
- confirmation que l'outil la signale ;
- retrait de la violation.

Il n'existe aucun plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure. Les coûts ci-dessous ne comptent que la règle elle-même.

**Une limite pour toute cette section.** Les règles portent sur `domain/models/`, qui contient aussi
les Value Objects et peut-être des Aggregate Roots. Elles se déclencheront donc sur des fichiers
qui ne sont pas des Entities. Cette limite vient de X4, et elle réduit la précision de toutes les
règles de cette section.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **E4** aucune I/O | règle `dependency-cruiser` de chemin, pour les imports seulement. L'horloge, l'aléatoire et la configuration restent en revue | configuration seule | aucun |
| **E6** aucun mutateur nu | règle ESLint : `set` public dans `domain/models/` | ~20 lignes | aucun attendu |
| **E8** nommage et emplacement | script `tests/tooling/` | ~20 lignes | aucun |
| **E3** invariants tenus | règle ESLint : constructeur en `= {}` sans appel de validation | ~40 lignes | **élevés sur l'existant** — voir X1 |
| **X3** validation après affectation | sans objet : c'est la forme prescrite. Voir `X3` au § 5 | — | — |
| **E1** identité explicite | règle ESLint : une classe de `domain/models/` expose un accesseur `id` | ~15 lignes | **non mesurés** — un Value Object porteur d'identifiant la déclenche |
| **E5** pas de méthode de persistance | revue. knip, déjà branché, ne signale que les exports sans consommateur | — | — |
| **E2** l'égalité se fonde sur l'identité | revue | — | — |
| **E7** les autres Aggregates sont référencés par identité | revue | — | — |

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
commande. Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, les contextes à
sous-contextes ne sont pas atteints : la règle ne s'y déclenche jamais, sans aucun message.

Cette règle est partagée avec V4 de `fiche-objet-valeur.md` et S3 de `fiche-specification.md` : une
seule configuration couvre les trois.

### E6 — mutateur nu

Décidable localement, deux motifs :

- une déclaration `set nom(valeur)` dans un fichier de `domain/models/` ;
- un champ de classe public affecté hors du constructeur.

Le second est plus utile et plus délicat : il demande de distinguer l'affectation dans le
constructeur de celle dans une méthode. Le cas net, le `set` explicite, précède donc le second motif.

### E3 — la règle la plus utile et la plus bruyante

Le motif : un constructeur dont le paramètre est déstructuré avec `= {}`, et dont le corps ne comporte
**aucun appel de validation**, sous aucune forme. Ni garde écrite à la main, ni appel à l'utilitaire de
validation par schéma.

Ce motif désigne exactement la forme dominante de violation. La règle se déclenchera donc sur beaucoup
d'Entities existantes. Elle s'introduit en avertissement, après une décision sur l'ampleur du
rattrapage : voir l'ordre de travail de `X1` au § 5.

Ce que la règle ne doit pas signaler : une validation placée après les affectations. C'est la forme
prescrite par la documentation d'architecture, voir `X3` au § 5. Une règle qui l'attraperait se
déclencherait sur la quasi-totalité des modèles.

### E5 — knip ne suffit pas

knip signale les exports que rien n'importe. Une méthode dont le seul consommateur est le repository
est consommée, donc knip ne la signale pas. Il ne sait pas non plus compter les consommateurs d'un
export : un export à consommateur unique passe sans signalement. `E5` reste donc en revue.

knip aide seulement après la correction : une fois la traduction déplacée dans le repository, un
export resté sans consommateur apparaît dans sa sortie. Il ne décide pas non plus de l'exception du
format publié.

### Ce qui n'est pas mécanisable

E2 et E7 demandent de savoir ce qui appartient au même Aggregate. E5 demande de savoir ce qui est un
format publié. Ces deux informations ne se lisent pas dans un fichier isolé, et elles ne sont écrites
nulle part. C'est le même manque que celui relevé au § 6 de `fiche-racine-agregat.md`.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **E4** : configuration `dependency-cruiser`, avec contre-épreuve
2. **E6** : première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure
3. **E8** : script de nommage
4. **E3** : en avertissement, pour produire la liste du rattrapage
5. **E1** : après mesure des faux positifs sur les Value Objects porteurs d'identifiant

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **E8** nommage | oui, complet | Renommer le fichier et réécrire ses imports |
| **E6** champs publics | partiel | Privatiser un champ et ajouter son accesseur, oui. Si le champ est **écrit** depuis l'extérieur, signaler et s'arrêter — ajouter un mutateur violerait E6 |
| **X1** sac de propriétés | préparation seule | Repérer les constructeurs fautifs, oui. Décider quels champs sont requis, non |
| **X1** de `fiche-usecase.md`, règles dans les usecases | non | Décider ce qui appartient à l'Entity et ce qui est de l'orchestration est de la conception |

---

## 7. Le type

Une Entity se déclare en **classe**. Deux types de même forme risquent moins de se confondre que pour
un Value Object, parce que deux Entities se distinguent par leur identité. La classe reste la forme
retenue, car un constructeur qui valide doit être le seul chemin de construction.

```ts
export class Organization {
  readonly id: number;
  #archivedAt: Date | null;

  constructor(params: { id: number; archivedAt?: Date | null }) { /* validation */ }

  get isArchived(): boolean { return this.#archivedAt !== null; }
  // pas de mutateur ici : le code actuel n'a aucune méthode d'archivage sur cette Entity,
  // `archivedAt` y est aujourd'hui affecté par construction
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
| Entity | **unitaire pur**, aucune base, aucun double | la validation à la construction |
| Chaque méthode de changement d'état | **unitaire** | le cas passant **et** le refus quand l'invariant serait violé |
| Accesseurs calculés | **unitaire** | les cas limites, pas seulement le cas nominal |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic :

- Le test qui manque le plus souvent est celui du **refus**. Les tests vérifient que `terminate()`
  termine, pas qu'il refuse de terminer deux fois. Or c'est le second qui prouve que E3 est tenu.
  Exception : une Entity sans méthode de changement d'état n'a pas de refus à tester, ce qu'admet le
  § 3.
- Une Entity qui a besoin d'un double **viole E4**. Voir « Ce qui casse » de E4 au § 2.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

```
[ ] [partiel] E3  Refuse de s'instancier dans un état invalide, et refuse chaque transition invalide
[ ] [auto]    E6  Aucun mutateur nu ; chaque changement d'état nomme son intention métier
[ ] [humain]  E7  Les Entities d'un autre Aggregate sont référencées par identifiant, pas par instance
[ ] [partiel] E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [humain]  E5  Aucune méthode dont le repository est le seul consommateur   (sauf format publié)
[ ] [partiel] E1  L'identité est explicite et ne change pas ; le cas non persisté est traité
[ ] [humain]  E2  Les comparaisons se fondent sur l'identité, pas sur les champs
[ ] [auto]    E8  Un fichier, PascalCase, nom de l'Ubiquitous Language du contexte
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'Entity
[ ] [humain]  Chaque règle a son test de refus, pas seulement son cas passant
[ ] [humain]  Si l'objet n'a aucune règle propre, appliquer le test du § 1 : Entity, ou read-model ?
```

À terme, il reste huit lignes, toutes de jugement :

- E7 ;
- E5 ;
- E2 ;
- le test de refus ;
- le rappel du test de discrimination ;
- la part de E3 qu'aucune règle ne couvre : la validation de valeur, par opposition à la validation
  de présence ;
- la part de E1 qu'aucune règle ne couvre : le traitement du cas non persisté ;
- la part de E4 qu'aucune règle ne couvre : l'horloge, l'aléatoire et la configuration.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **E1**, **E2** identité, égalité par identité | Evans, *DDD*, ch. « A Model Expressed in Software » — Entity | *DDD Reference*, PDF gratuit |
| **E3** invariants tenus à tout instant | Evans, ch. « The Life Cycle of a Domain Object » — l'invariant est la raison d'être de l'Aggregate, et vaut pour l'Entity | *DDD Reference* |
| **E4** pureté | Evans, même ch. ; Martin, « The Clean Architecture » | billet gratuit |
| **E5** pas de méthode de persistance | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** | *DDD Reference* |
| **E6** aucun mutateur nu | Fowler, « AnemicDomainModel » | bliki gratuit |
| **E7** référence par identité | Vernon, « Effective Aggregate Design », règle 3 : *reference other aggregates by identity* | dddcommunity.org |
| **E8** nommage et emplacement | l'**emplacement** est documenté : `docs/fr/Anatomy.md` décrit `domain/models`. Le **nommage** — PascalCase, un fichier par Entity — n'a **aucune source** | `docs/fr/Anatomy.md` ; ADR 51 |
| Le test de discrimination Entity / Value Object | Evans, même ch. — c'est le critère qu'il donne | *DDD Reference* |
| Typage des identifiants à la frontière HTTP, pas par le domaine (X2 de `fiche-objet-valeur.md`) | **ADR 19**, qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

Un seul invariant sur huit n'a aucune source externe : **E8**, la convention de nommage. La catégorie
Entity est le cœur du vocabulaire tactique de DDD, et ses invariants sont ceux des livres.

Ce qui manque de source, ici, c'est la **façon Pix** de les appliquer : le choix du type d'erreur de
validation, l'ordre validation / affectation, et le traitement de l'Entity non persistée. Ces trois
points relèvent de la convention et se discutent sur leurs mérites. Les deux derniers sont
respectivement X3 et X5 au § 5.
