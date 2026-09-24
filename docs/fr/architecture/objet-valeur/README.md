# Value Object

Un Value Object est défini par ses attributs, pas par une identité. Il vit dans `domain/models/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout Value Object. V1, V2, V4, V6 et V7 s'appliquent aussi au
read-model, dont la référence est `../read-model/README.md`. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Tests attendus](#tests-attendus) · [Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**V1**](#v1-immuable-après-construction) | immuable après construction | règle ESLint |
| [**V2**](#v2-aucune-identité-égalité-par-valeur) | aucune identité, égalité par valeur | règle ESLint, avec liste d'exclusion |
| [**V3**](#v3-validation-à-la-construction) | validation à la construction | revue |
| [**V4**](#v4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | `dependency-cruiser`, partiel |
| [**V5**](#v5-porte-le-comportement-lié-à-ses-données) | porte le comportement lié à ses données | revue |
| [**V6**](#v6-aucun-cycle-de-vie-propre) | aucun cycle de vie propre | script |
| [**V7**](#v7-exposition-en-lecture-seule-collections-comprises) | exposition en lecture seule, collections comprises | règle ESLint, partielle |
| [**V8**](#v8-un-type-par-intention) | un type par intention | revue, puis typage |

Hors numérotation : le [discriminant](#le-discriminant) avec le read-model et ses quatre tests, dans
le rôle, et le [cas de la clé de présentation](#le-cas-de-la-clé-de-présentation) et ses trois cas,
sous V2.

---

## Rôle

Un **Value Object** est défini par ses attributs, pas par une identité. Deux instances aux mêmes
valeurs sont interchangeables. Il est immuable, il ne se persiste pas seul, et il porte le comportement
lié à ses données. Il transforme une primitive sans signification, comme `string`, `number` ou un objet
littéral, en concept nommé qui protège ses propres règles.

Le Value Object se confond souvent avec le **read-model** : une forme assemblée pour une lecture, que le
domaine ne lit pas pour décider. Le read-model a sa référence, `../read-model/README.md`.

Le discriminant ci-dessous sert aux deux références : `../read-model/README.md` y renvoie.

### Le discriminant

Une seule question sépare le Value Object du read-model :

> **Le domaine raisonne-t-il avec cet objet ?**

| Réponse | Catégorie | Invariants |
| --- | --- | --- |
| Une règle du domaine lit ses valeurs pour décider | **Value Object** | V1 à V8 |
| Il est assemblé pour être lu, puis sérialisé ou affiché | **read-model** | V1, V2, V4, V6, V7, puis RM1 à RM4 de `../read-model/README.md` |

Cinq invariants sont communs aux deux : immuabilité, absence d'identité, pureté, absence de cycle de
vie, exposition en lecture seule. Seules la validation et le comportement diffèrent.

Le discriminant se lit dans le code, pas dans le dossier. Un objet rangé dans `read-models/`, mais lu
par une règle, est un Value Object mal rangé. Il doit alors satisfaire V3 et V5.

#### Quatre tests pour l'appliquer

La question est abstraite. Quatre tests y répondent plus vite, et ils concordent presque toujours.

| Test | Value Object | read-model |
| --- | --- | --- |
| **Existence** — si l'interface disparaissait, l'objet existerait-il encore ? | oui : le concept préexiste à son affichage | non : il disparaîtrait avec l'écran |
| **Champs** — qui a choisi les champs ? | le concept métier. En retirer un casse le concept | un besoin d'affichage. En retirer un allège la réponse |
| **Portée** — combien de lecteurs ? | petit, et réutilisé partout | large, et consommé par un seul point d'entrée |
| **Nom** — que dit le nom ? | un nom du langage métier | un nom qui trahit son consommateur : `…ForAdmin`, `…Overview`, `…Details`, `…ListItem` |

#### Le piège : dérivation n'est pas règle

C'est la principale source de confusion entre les deux catégories. Une **dérivation de présentation**,
comme un total, un pourcentage ou un libellé composé, n'est pas une règle métier. Un read-model peut
donc porter des méthodes sans devenir un Value Object.

La question n'est pas « a-t-il du comportement ? » mais « **ce comportement décide-t-il quelque
chose ?** »

```js
// Value Object : petit, nommé par le métier, porte une règle qui décide
class BadgeCriterionForCalculation {
  constructor({ threshold, skillIds }) { this.threshold = threshold; this.skillIds = skillIds; }
  isFulfilled(knowledgeElements) { return this.getAcquisitionPercentage(knowledgeElements) === 100; }
}

// read-model : large, nommé par son écran, dérive sans décider
class PlacesStatistics {
  constructor({ placesLots = [], placeRepartition, organizationId, enableMaximumPlacesLimit } = {}) { … }
  get available() {
    const available = this.total - this.occupied;
    if (available < 0) return 0;
    return available;
  }
}
```

**Code.** Value Object : [`BadgeCriterionForCalculation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/BadgeCriterionForCalculation.js#L3-L17), simplifié. read-model : [`PlacesStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesStatistics.js#L5-L43), simplifié.

#### La zone grise

Quand les tests ne concordent pas, l'objet se classe en **read-model**, parce que cette erreur-là se
signale d'elle-même.

Un Value Object pris pour un read-model se signale dès qu'une règle le lit. C'est RM3 de
`../read-model/README.md`, que sa règle de chemin détecte. L'erreur inverse, un read-model pris pour un
Value Object, ne se signale jamais. Elle produit une validation et des règles inutiles.

### Ce qu'un Value Object n'est pas

Si le code correspond à une ligne, ce n'est pas un Value Object.

| Le code… | Va dans | Référence |
| --- | --- | --- |
| est assemblé pour une lecture, et aucune règle ne le lit | un read-model, dans `domain/read-models/` | `../read-model/README.md` |
| a besoin d'être retrouvé, suivi, mis à jour dans le temps | une Entity, dans `domain/models/` | `../entite/README.md` |
| coordonne plusieurs objets pour tenir une règle commune | une Aggregate Root | `../racine-agregat/README.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `../specification/README.md` |
| charge ou écrit des données | un repository | `../repository/README.md` |
| décrit le contrat d'échange avec un autre contexte | `application/api/` | `../api-interne/README.md` |
| met en forme pour une réponse HTTP, clé de présentation comprise | `infrastructure/serializers/` | `../serialiseur/README.md` |

---

## Invariants

V1, V2, V4, V6 et V7 s'appliquent aussi au read-model, qui y renvoie depuis sa propre référence. V3,
V5 et V8 sont propres au Value Object.

### V1. Immuable après construction

**Énoncé.** Aucune écriture après le constructeur. Ni mutateur, ni champ public assignable.

```js
// conforme — l'état est privé, rien n'est exposé en écriture
class AnswerStatus {
  #status;
  constructor({ status }) { /* validation */ this.#status = status; }
  isOK() { return this.#status === statuses.OK; }
}

// fautif — champ public, réassignable de l'extérieur
class CombinedCourseStatistics {
  constructor({ participationsCount, completedParticipationsCount }) {
    this.participationsCount = participationsCount;
    this.completedParticipationsCount = completedParticipationsCount;
  }
}
```

**Code.** Conforme : forme corrigée, hypothétique, de [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L10-L23), dont le champ `status` est public. Fautif : [`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L1-L7), simplifié : le champ `id` est omis.

Un changement produit une nouvelle instance, il ne modifie pas l'existante. La forme la plus lisible
est un constructeur statique nommé :

```js
static get OK() { return new AnswerStatus({ status: statuses.OK }); }
```

**Code.** [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L41-L43).

**Ce qui casse.** Un Value Object mutable, partagé entre deux évaluations ou mis en cache, peut changer
sans que son deuxième lecteur le sache. Le défaut apparaît loin de sa cause.

**Piège sur les classes de base.** Une hiérarchie peut être irréprochable dans ses sous-classes et
exposer des champs publics sur sa classe abstraite. L'invariant se vérifie sur toute la chaîne.

**Vérification.** Une règle ESLint sur les champs de classe publics. Voir
[`outillage.md`](outillage.md#v1-et-v7--une-seule-règle-eslint).

### V2. Aucune identité, égalité par valeur

**Énoncé.** Pas d'identité propre. Pas de suivi dans le temps. Deux instances de mêmes valeurs sont la
même chose.

Un Value Object peut **porter** l'identifiant d'autre chose : c'est une donnée comme une autre. Ce qui
est interdit, c'est qu'il ait sa propre identité.

```js
// conforme — aucune identité propre, deux instances de même statut sont la même chose
class AnswerStatus { #status; }

// fautif, sauf deuxième cas ci-dessous — l'objet porte un identifiant sans rôle dans le domaine
class CombinedCourseStatistics {
  constructor({ id, participationsCount, completedParticipationsCount }) { this.id = id; … }
}
```

**Code.** Conforme : forme corrigée, hypothétique, de [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L10-L14). Fautif : [`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L2-L3).

**Test de discrimination.** Si remplacer une instance par une autre de mêmes valeurs change quelque
chose pour le métier, ce n'est pas un Value Object, c'est une Entity.

**Ce qui casse.** Une identité propre appelle un cycle de vie : retrouver l'objet, le mettre à jour,
le comparer par référence. La catégorie ne tient plus, et V6 tombe avec elle.

#### Le cas de la clé de présentation

Un client qui met les objets en cache, comme le store d'une application web, exige une clé par
enregistrement. Cela vaut aussi pour des objets qui n'ont aucune identité. La clé est alors composée, le
plus souvent par concaténation de deux identifiants portés.

Cette clé n'est **pas** une identité du domaine. Trois cas se distinguent :

| Situation | Nature de la clé | Où elle se fabrique |
| --- | --- | --- |
| Le client a besoin d'une clé pour son cache, et ne la renvoie jamais | clé de présentation | le sérialiseur |
| Le client renvoie la clé, et le serveur la découpe pour retrouver ses parties | identifiant composite | un Value Object qui porte la paire construire / découper |
| L'objet a une identité métier exprimée par plusieurs attributs | identité composite | c'est une **Entity**, et V2 ne s'y applique pas |

Le premier cas est le plus fréquent. Il ne viole V2 que si la clé est fabriquée **dans le domaine** ;
voir `X5` de [`ecarts.md`](ecarts.md#x5-la-clé-de-présentation-est-fabriquée-dans-le-domaine). Le
deuxième est un identifiant à part entière, donc V3 s'applique à lui. Le troisième relève de
`../entite/README.md`.

Le critère est le lecteur de la clé. Si personne ne la relit côté serveur, c'est une clé de
présentation.

**Vérification.** Une règle ESLint sur les champs et accesseurs `id`, avec une liste d'exclusion des
`id` légitimes, et une règle de signal sur les clés composées dans le domaine. Voir
[`outillage.md`](outillage.md#x5-et-v2--dans-cet-ordre).

### V3. Validation à la construction

**Énoncé.** *Propre au Value Object.* Une valeur invalide ne s'instancie pas. L'aval ne valide rien.

```js
// conforme — validation, puis affectation, avec une erreur du domaine
constructor({ id, type, grains }) {
  assertNotNullOrUndefined(id, 'The id is required for a section');
  assertNotNullOrUndefined(type, 'The type is required for a section');
  this.#assertTypeIsValid(type);
  assertIsArray(grains, 'A list of grains is required for a section');

  this.id = id;
  this.type = type;
  this.grains = grains;
}

// fautif — aucune validation, et le code le sait
constructor({ status } = {}) {
  // TODO: throw a BadAnswerStatus error if the status is bad + adapt the tests
  this.status = status;
}
```

**Code.** Conforme : [`Section.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/module/Section.js#L14-L23). Fautif : [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L11-L14).

Le second exemple est la forme la plus fréquente de violation : ce n'est pas une validation mal
placée, c'est une validation absente.

Trois points de cohérence, sans lesquels l'invariant est respecté sans être utile :

- la validation **précède l'affectation** quand le message d'erreur doit désigner l'entrée fautive.
  La convention Pix valide `this` après les affectations, contre un schéma déclaratif : voir `X3` de
  `../entite/ecarts.md`, qui décrit cet écart ;
- **un seul type d'erreur de validation** vaut pour le domaine. Sinon, les appelants rattrapent et
  reconvertissent ;
- la validation porte sur **tous les niveaux** d'une composition, pas seulement sur la racine.

**Ce qui casse.** Sans validation à la construction, chaque appelant doit se demander si la valeur est
cohérente. La vérification se duplique, et elle est oubliée quelque part.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### V4. Aucune I/O, aucune dépendance à l'infrastructure

**Énoncé.** Un Value Object n'importe rien de l'infrastructure et ne fait aucune I/O. Une violation se
repère dans les imports :

```js
// dans un Value Object de domain/models/ — fautif
import { logger } from '…/shared/infrastructure/utils/logger.js';

// et son usage : journaliser une erreur avant de la lever
getDeletableOrganizationLearners(organizationLearnerIdsToDelete, userId) {
  if (this.organizationLearners.length !== organizationLearnerIdsToDelete.length) {
    logger.error(`User id ${userId} could not delete organization learners because …`);
    throw new CouldNotDeleteLearnersError();
  }
  return this.organizationLearners;
}
```

**Code.** [`OrganizationLearnerList.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/learner-management/domain/models/OrganizationLearnerList.js#L1-L19), simplifié.

Le besoin est légitime, la solution non. C'est l'appelant qui trace : l'objet lève seulement
l'erreur. Voir `X3` de `../specification/ecarts.md`, qui décrit l'écart.

L'interdit vaut aussi pour la configuration, l'horloge et l'aléatoire. Un objet qui lit l'heure courante
n'est pas testable de façon déterministe : la date arrive en paramètre.

**Ce qui casse.** Le test cesse d'être pur : il demande un double. Ce besoin n'est que le symptôme. La
cause est la dépendance à l'infrastructure.

**Vérification.** Une règle `dependency-cruiser` pour les imports. L'horloge, l'aléatoire et la
configuration se vérifient en revue. Voir [`outillage.md`](outillage.md#v4--une-règle-de-chemin).

### V5. Porte le comportement lié à ses données

**Énoncé.** *Propre au Value Object.* Le Value Object porte les règles qui contraignent ses données.
Un objet réduit à des champs et des accesseurs n'apporte rien qu'un objet littéral n'apporte déjà.

```js
// pauvre : un sac de champs, que trois clés d'un objet littéral remplaceraient
class CombinedCourseStatistics {
  constructor({ id, participationsCount, completedParticipationsCount }) { … }
}

// utile : la règle est là où est la donnée
class TrainingTrigger {
  isFulfilled({ knowledgeElements, skills } = {}) {
    …
    if (this.type === types.GOAL) {
      return validatedKnowledgeElementsPercentage <= this.threshold;
    }
    return validatedKnowledgeElementsPercentage >= this.threshold;
  }
}
```

**Code.** Pauvre : [`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L1-L7). Utile : [`TrainingTrigger.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/TrainingTrigger.js#L18-L29), simplifié.

Le second décide quelque chose : un seuil est atteint ou non. Cette décision distingue un
Value Object d'un read-model. Le [piège du discriminant](#le-piège--dérivation-nest-pas-règle) le
rappelle : une dérivation de présentation ne décide rien.

**Ce qui casse.** La règle qui contraint la donnée s'écrit ailleurs, donc plusieurs fois, donc
différemment.

Un Value Object sans comportement dans une famille où d'autres en ont n'est pas une faute à lui seul :
un type nommé peut valoir pour la seule signature. Voir les
[exceptions légitimes](#exceptions-légitimes).

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### V6. Aucun cycle de vie propre

**Énoncé.** Pas de repository, pas de table dédiée, pas de fonction de persistance. Un Value Object
est persisté **avec** ce qui le contient, ou pas du tout.

Un objet qui doit être retrouvé indépendamment est une Entity.

**Ce qui casse.** Un repository dédié à un Value Object lui donne une identité de fait, celle par
laquelle il est retrouvé. Le Value Object bascule alors dans la catégorie des Entities, sans que
personne l'ait décidé.

**Vérification.** Un script de complétude. Voir
[`outillage.md`](outillage.md#v6-et-lexistence-des-tests--un-script).

### V7. Exposition en lecture seule, collections comprises

**Énoncé.** Rien n'est exposé en écriture, pas même le contenu d'une collection interne. Un accesseur
qui renvoie une collection interne expose un tableau modifiable par l'appelant.

```js
// fautif — l'appelant reçoit le tableau interne et peut le modifier
get levelsPerTube() {
  return this.#tubesWithLevels;
}

// conforme — une copie, donc l'état interne reste protégé
get attachments() {
  return this.#coreChallenge.attachments ? [...this.#coreChallenge.attachments] : null;
}
```

**Code.** Fautif : [`CampaignResultLevelsPerTubesAndCompetences.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js#L29-L31), où `#tubesWithLevels` est un tableau construit dans le constructeur. Conforme : [`BaseChallenge.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/models/BaseChallenge.js#L214-L216).

Le champ privé ne suffit donc pas : `#tubesWithLevels` est inaccessible, mais l'accesseur renvoie une
référence vers son contenu.

**Le gel inopérant.** `Object.freeze` n'affecte pas les champs privés `#` : ce ne sont pas des
propriétés. Geler une instance dont l'état est privé ne protège rien tout en en donnant
l'apparence.

**Ce qui casse.** V1 est annulé de l'extérieur : l'objet est immuable, son contenu ne l'est pas.

**Vérification.** La règle ESLint de V1, élargie, pour les cas évidents. Le reste se vérifie en revue.
Voir [`outillage.md`](outillage.md#v1-et-v7--une-seule-règle-eslint).

### V8. Un type par intention

**Énoncé.** *Propre au Value Object.* Quand un même concept entre dans le système sous plusieurs
formes, chaque forme a son type.

```
CombinedCourseBlueprintForCreation   → sans identifiant, avant insertion
CombinedCourseBlueprintForUpdate     → avec identifiant
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-blueprints).

**Ce qui casse.** Une signature qui accepte l'un accepte l'autre. L'erreur n'apparaît qu'à
l'exécution, sur un champ absent.

Le **test du motif**, plus bas, est indispensable : sans lui, cet invariant est le vecteur d'une
dérive. Voir `X7` de
[`ecarts.md`](ecarts.md#x7-les-modèles-se-multiplient-par-intention-décriture-sans-mesure).

Une forme de **création** est un concept distinct : un objet qui n'existe pas encore n'a pas
d'identité, ce qui est une différence de nature et non un raccourci. `…ForCreation` est légitime.

Une forme de **mise à jour** qui porte un sous-ensemble de champs est autre chose : c'est un modèle
partiellement rempli. `X4` de `../repository/ecarts.md` explique pourquoi il est écarté. Le test du
motif sépare les cas :

| Motif invoqué | Verdict |
| --- | --- |
| L'objet n'a pas encore d'identité | légitime — c'est un concept distinct |
| Le vocabulaire de l'appel diffère de celui du modèle | légitime — c'est un objet d'entrée nommé |
| Éviter de charger l'Entity entière, coût **mesuré** | légitime, documenté avec la mesure |
| Éviter de charger l'Entity entière, sans mesure | **ce n'est pas un motif** : l'Entity se charge entière et change par une méthode nommée. C'est `E6` de `../entite/README.md` |

**Vérification.** La revue, puis le typage. Voir
[`outillage.md`](outillage.md#vérifier-par-le-typage).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **V1** | Une famille de Value Objects partage une classe de base abstraite | **autorisé** si la base respecte V1 |
| **V2** | Un Value Object porte l'identifiant d'autre chose | **autorisé** — c'est une donnée, pas son identité |
| **V2** | Un Value Object porte une clé composite que le client renvoie | **autorisé** — c'est un identifiant, deuxième cas de V2. V3 s'applique à lui |
| **V3** | Une méthode rend une valeur neutre sur entrée non exploitable plutôt que de lever | **autorisé** |
| **V3**, **V5** | L'objet est anémique et aucune règle ne le lit | **ce n'est pas un Value Object** : le [discriminant](#le-discriminant) s'applique, puis `../read-model/README.md` |
| **V5** | Un Value Object sans comportement, dans une famille où d'autres en ont | **toléré** : ne se signale pas seul, car un type nommé peut valoir pour la seule signature |
| **V7** | Un accesseur reconstruit un objet à chaque appel | **autorisé** — c'est la forme sûre de V7 |

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Value Object | **unitaire pur**, aucun double | la validation, le comportement, l'immuabilité |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites dans
[`outillage.md`](outillage.md#v6-et-lexistence-des-tests--un-script).

Deux indices de diagnostic :

- Un objet qui a besoin d'un double **viole V4**. Voir « Ce qui casse » de
  [V4](#v4-aucune-io-aucune-dépendance-à-linfrastructure).
- Un Value Object dont le test unitaire n'a ni validation ni comportement à vérifier n'est
  probablement pas un Value Object : le [discriminant](#le-discriminant) s'applique. Limite : un type
  nommé sans logique peut valoir pour la seule signature, ce qu'admettent les
  [exceptions légitimes](#exceptions-légitimes).

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

```
[ ] [humain]  V3  Validation à la construction, un seul type d'erreur ; avant affectation si le message nomme l'entrée   (Value Object)
[ ] [humain]  V5  La règle qui contraint la donnée est portée par l'objet                  (Value Object)
[ ] [auto]    V1  Aucun champ public ; aucune écriture après le constructeur, classe de base comprise
[ ] [partiel] V7  Aucune collection interne rendue telle quelle ; aucun gel inopérant
[ ] [partiel] V4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [humain]  V8  Une intention d'écriture distincte a son propre type — et son motif tient (X7)
[ ] [partiel] V2  Aucune clé composée ici : une clé de présentation se compose dans le sérialiseur
[ ] [partiel] V2  Aucune identité propre ; un identifiant porté est admis
[ ] [partiel] V6  Aucun repository, aucune persistance propre
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'objet
[ ] [humain]  Tests unitaires purs, sans double
[ ] [humain]  Avant de signaler V3 ou V5, appliquer les quatre tests du discriminant : est-ce un read-model ?
[ ] [humain]  Avant de signaler un id, classer la clé selon les trois cas de V2
```

À terme, onze lignes restent : six `[humain]` et cinq `[partiel]`.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **V1**, **V2**, **V6** immuabilité, absence d'identité, pas de cycle de vie | Evans, *DDD*, Value Object |
| **V3** validation à la construction | convention Pix, cohérente avec l'invariant d'Aggregate d'Evans sans être prescrite sous cette forme |
| **V4** pureté | Evans, *DDD* ; Martin, « The Clean Architecture » |
| **V5** comportement porté par l'objet | Fowler, « AnemicDomainModel » |
| **V7** exposition en lecture seule | aucune source : conséquence pratique de V1 |
| **V8** un type par intention | aucune source |
| Identité composite, deuxième et troisième cas de V2 | Evans, *DDD* : l'identité d'une Entity peut être composée de plusieurs attributs |
| Clé de présentation dans le sérialiseur | Martin, *Clean Architecture* (2017), la règle de dépendance |
| Le discriminant et ses quatre tests | construction de ce corpus, sans source |
| Validation à la frontière HTTP | ADR 19, « Typer les identifiants », qui écarte le typage des identifiants côté domaine |
