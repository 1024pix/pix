# Entity

Une Entity est un objet du domaine défini par son identité, pas par ses attributs. Elle vit dans
`domain/models/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à toute Entity, y compris une Aggregate Root. La ligne
**Vérification** de chaque invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans
la CI est dans [`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) · [Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**E1**](#e1-lidentité-est-explicite-et-stable) | l'identité est explicite et stable | règle ESLint, faux positifs non mesurés |
| [**E2**](#e2-légalité-se-fonde-sur-lidentité) | l'égalité se fonde sur l'identité | revue |
| [**E3**](#e3-les-invariants-sont-tenus-à-tout-instant) | les invariants sont tenus à tout instant | règle ESLint, bruyante, et revue |
| [**E4**](#e4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | `dependency-cruiser`, partiel |
| [**E5**](#e5-aucune-méthode-au-service-de-la-persistance) | aucune méthode au service de la persistance | revue |
| [**E6**](#e6-aucun-mutateur-nu) | aucun mutateur nu | règle ESLint |
| [**E7**](#e7-les-autres-aggregates-sont-référencés-par-identité) | les autres Aggregates sont référencés par identité | revue |
| [**E8**](#e8-nommage-et-emplacement) | nommage et emplacement | script |

---

## Rôle

Une Entity est définie **par son identité**, pas par ses attributs. Ses valeurs changent au cours du
temps, elle reste la même chose.

Elle porte les règles qui contraignent son propre état. Elle les tient à tout instant, pas seulement
à la construction.

Termes employés dans cette page :

- **Aggregate** : un groupe d'objets du domaine qui forme une frontière de cohérence.
- **Aggregate Root** : l'Entity par laquelle passe tout accès à un Aggregate.
- **Format publié** : une forme sérialisée écrite à la main, documentée et consommée hors du code.
- **Mutateur nu** : un moyen de changer l'état sans nommer d'intention métier, comme un `set` public
  ou une affectation externe.

### Le test de discrimination

> Si remplacer une instance par une autre portant exactement les mêmes valeurs change quelque chose
> pour le métier, c'est une Entity. Sinon, c'est un Value Object.

Deux exemples qui rendent le test concret. Deux organisations aux mêmes nom et type sont deux
organisations différentes : Entity. Deux seuils de 50 % sont le même seuil : Value Object, et
`../objet-valeur/README.md` s'applique.

### Entity ou Aggregate Root

Toute Aggregate Root est une Entity. Cette page s'applique intégralement à elle. L'inverse est faux :
une Entity peut vivre **à l'intérieur** d'un Aggregate sans en être la racine. Elle n'est alors pas
accessible directement et n'a pas de repository.

La question qui décide : *cette Entity est-elle atteignable autrement qu'en passant par une autre ?*
Si oui, c'est une racine, et `../racine-agregat/README.md` ajoute ses devoirs propres :

- frontière de cohérence ;
- point d'entrée unique ;
- repository.

Deux invariants de cette page, **E3** et **E7**, valent pour toute Entity. Ils sont énoncés ici, et
`../racine-agregat/README.md` y renvoie plutôt que de les répéter.

### Ce qu'une Entity n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une Entity.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas d'identité propre, deux instances de mêmes valeurs sont interchangeables | un Value Object, dans `domain/models/` | `../objet-valeur/README.md` |
| est assemblé pour une lecture, et aucune règle ne le lit | un read-model, dans `domain/read-models/` | `../read-model/README.md` |
| garantit une règle portant sur plusieurs objets à la fois | une Aggregate Root | `../racine-agregat/README.md` |
| charge ou écrit des données | un repository | `../repository/README.md` |
| coordonne plusieurs Entities et repositories pour réaliser une intention | `domain/usecases/` | `../usecase/README.md` |
| applique une règle qui ne relève d'aucune Entity, sans I/O | `domain/services/` | `../service-domaine/README.md` |
| met en forme pour une réponse HTTP | `infrastructure/serializers/` | `../serialiseur/README.md` |
| décrit ce qui est exposé à un autre contexte | `application/api/` | `../api-interne/README.md` |

---

## Invariants

### E1. L'identité est explicite et stable

**Énoncé.** L'Entity porte son identifiant. Il ne change pas pendant sa vie.

```js
// conforme — l'identifiant est porté, et rien ne le réassigne ensuite
class Passage {
  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id;
    …
  }
}
```

**Code.** Conforme : [`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L1-L9), simplifié.

**Le cas de l'Entity non encore persistée.** Une Entity créée en mémoire n'a pas encore
d'identifiant. Deux traitements existent, et le choix entre eux est explicite :

- un identifiant `null`, assumé et documenté ;
- un type distinct pour l'intention de création, `…ForCreation` : voir `V8` de
  `../objet-valeur/README.md`.

Le second est plus sûr : la signature dit qu'il n'y a pas encore d'identité. Voir
[`X5` de `ecarts.md`](ecarts.md#x5-lentity-non-persistée-porte-un-identifiant-null).

**Ce qui casse.** Sans identité explicite, l'égalité, la déduplication et les références n'ont pas de
fondement. Chaque site d'appel improvise sa comparaison.

**Vérification.** Une règle ESLint, dont les faux positifs ne sont pas mesurés. Le traitement du cas
non persisté se vérifie en revue. Voir [`outillage.md`](outillage.md#e1--accesseur-didentité).

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

**Code.** Conforme : [`Skill.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Skill.js#L46-L52). Fautif : [`Skill.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Skill.js#L38-L44). Les deux extraits sont simplifiés : la garde sur `null` est retirée.

**Ce qui casse.** Une comparaison par un champ autre que l'identifiant dépend de la fraîcheur des
données chargées. Elle confond deux Entities distinctes qui partagent ce champ. Elle distingue deux
instances de la même Entity chargées à des moments différents.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

### E3. Les invariants sont tenus à tout instant

**Énoncé.** Une Entity invalide ne s'instancie pas. Aucune opération ne la laisse dans un état
invalide, y compris une opération qui échoue à mi-chemin.

L'invariant vaut aussi pour une Aggregate Root, où il porte sur la frontière de cohérence entière.
`../racine-agregat/README.md` y renvoie.

**À la construction.** La validation lève un seul type d'erreur, commun à tout le domaine. Valider
`this` après les affectations, contre un schéma déclaratif, est la forme documentée : voir les
[exceptions légitimes](#exceptions-légitimes) et
[`X3` de `ecarts.md`](ecarts.md#x3-la-validation-a-lieu-après-laffectation).

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

**Code.** Fautif : [`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L11-L13). La forme conforme est hypothétique.

**À la sortie d'une opération partielle.** Une méthode qui modifie plusieurs champs, et lève entre
deux affectations, laisse l'Entity incohérente. La validation précède l'affectation : la même règle
qu'à la construction, pour la même raison.

**Le piège du constructeur en sac de propriétés.** Un constructeur déstructuré avec une valeur par
défaut `= {}` et tous les champs optionnels accepte l'objet vide. L'Entity s'instancie toujours, donc
elle ne protège rien. Cette violation est discrète, parce qu'elle ressemble à du code correct. Voir
[`X1` de `ecarts.md`](ecarts.md#x1-le-constructeur-en-sac-de-propriétés).

**Ce qui casse.** Sans cet invariant, chaque code en aval doit se demander si l'état est cohérent. La
vérification se duplique, et elle est oubliée quelque part.

**Vérification.** Une règle ESLint signale le constructeur en `= {}` sans aucun appel de validation.
Elle est bruyante sur l'existant. La validation de valeur et le refus des transitions invalides se
vérifient en revue. Voir
[`outillage.md`](outillage.md#e3--la-règle-la-plus-utile-et-la-plus-bruyante).

### E4. Aucune I/O, aucune dépendance à l'infrastructure

**Énoncé.** Une Entity n'importe rien de l'infrastructure et ne fait aucune I/O. Une violation se
repère dans les imports.

```js
// dans un fichier de domain/models/ — fautif
import { anonymizeGeneralizeDate } from '../../../shared/infrastructure/utils/date-utils.js';
```

**Code.** Fautif : [`UserLogin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/models/UserLogin.js#L2).

**L'horloge.** Lire l'heure courante viole aussi E4, alors qu'aucun import ne le montre :

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

**Code.** Fautif : [`CertificationCenterMembership.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/team/domain/models/CertificationCenterMembership.js#L35-L42), simplifié : le `if` y tient sur trois lignes. La forme conforme est hypothétique.

Ces deux méthodes sont par ailleurs **conformes à E6** : elles nomment leur intention. Un même code
peut satisfaire un invariant et en violer un autre.

**Corollaire.** Une Entity ne charge jamais ce qui lui manque. Si une règle a besoin d'une donnée que
l'Entity n'a pas, le usecase la fournit.

**Ce qui casse.** Le test cesse d'être pur : il demande un double. Ce besoin n'est que le symptôme.
La cause est la dépendance à l'infrastructure.

**Vérification.** Une règle `dependency-cruiser` pour les imports. L'horloge, l'aléatoire et la
configuration se vérifient en revue. Voir [`outillage.md`](outillage.md#e4--une-règle-de-chemin).

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

**Code.** Fautif : [`Quest.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/entities/Quest.js#L155-L165), simplifié. Conforme : [`passage-repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/repositories/passage-repository.js#L49-L51).

L'exception est un **format publié**. C'est une forme sérialisée qui est :

- écrite à la main ;
- documentée ;
- consommée hors du code.

La méthode de sérialisation exprime alors un contrat, pas un schéma de base.

Le test qui discrimine : *si le schéma de la base changeait, cette méthode devrait-elle changer ?* Si
oui, elle est au service de la persistance. Si elle suit un format documenté indépendant, non.

**Ce qui casse.** Une migration de schéma oblige à modifier le domaine.

**Vérification.** La revue. knip ne suffit pas. Voir
[`outillage.md`](outillage.md#e5--knip-ne-suffit-pas).

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

**Code.** Fautif : [`DataForQuest.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/aggregates/DataForQuest.js#L1-L20), simplifié. Conforme : [`CombinedCourseParticipation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/entities/CombinedCourseParticipation.js#L28-L31).

Dans l'exemple fautif, l'objet gèle ce qu'il expose en lecture, puis offre un mutateur public sur le
même champ. La protection donne l'apparence d'une garantie, qu'un seul `set` annule.

**Le cas de la construction progressive.** Une Entity construite par une suite de mutateurs appelés
de l'extérieur, `setX()` puis `setY()` puis `setZ()`, n'est pas une Entity. C'est un constructeur
déguisé, et son état est invalide entre deux appels. Un assemblage réellement progressif porte un
nom : un objet dédié à la construction, ou un read-model si l'objet ne porte aucune règle.

**Ce qui casse.** Un mutateur nu annule E3 : l'invariant n'est plus garanti qu'à la construction.

**Vérification.** Une règle ESLint. Voir [`outillage.md`](outillage.md#e6--mutateur-nu).

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

**Code.** Fautif : [`Membership.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Membership.js#L23-L26). La forme conforme est hypothétique.

À l'intérieur d'un même Aggregate, tenir les instances est normal : c'est la définition d'un
Aggregate.

L'invariant vaut aussi pour une racine, où il est constitutif de la frontière.
`../racine-agregat/README.md` y renvoie.

**Ce qui casse.** Tenir l'objet entier oblige le repository à le charger aussi, donc le coût d'un
chargement dépend de la profondeur du graphe. La frontière cesse aussi d'être déplaçable : une Entity
qui tient l'instance d'une Entity d'un autre contexte devient impossible à extraire le jour où ce
contexte est découpé.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

### E8. Nommage et emplacement

**Énoncé.** Un fichier par Entity, nommé d'après le concept métier en PascalCase, dans
`domain/models/`.

Le nom est celui de l'Ubiquitous Language du contexte. Deux contextes peuvent avoir une Entity de même
nom, désignant deux choses différentes. C'est attendu en DDD, pas une collision à résoudre. Ce qui
doit être clair, c'est **de quel contexte** relève le nom au moment de l'import.

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier trouvable et réduit le
bruit de revue.

**Vérification.** Un script de nommage. Voir [`outillage.md`](outillage.md#e8--script-de-nommage).

---

## Exceptions légitimes

Sans cette section, un relecteur signale du code correct. Chaque exception ne vaut que pour
l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **E1** | Une Entity non persistée avec un identifiant `null` | autorisé si c'est assumé et documenté. Voir [`X5` de `ecarts.md`](ecarts.md#x5-lentity-non-persistée-porte-un-identifiant-null) |
| **E3** | À la construction, `this` est validé après les affectations, contre un schéma déclaratif | autorisé : c'est la forme documentée. Voir [`X3` de `ecarts.md`](ecarts.md#x3-la-validation-a-lieu-après-laffectation) |
| **E3** | Une Entity au constructeur permissif dans du code ancien | **pas une exception** : c'est [`X1` de `ecarts.md`](ecarts.md#x1-le-constructeur-en-sac-de-propriétés), un écart classé et corrigé, pas absous |
| **E4** | Une Entity reçoit `now` ou un générateur en paramètre | autorisé : c'est la forme correcte |
| **E5** | Une méthode de sérialisation vers un **format publié** | autorisé : c'est l'exception de l'énoncé |
| **E6** | Une Entity n'a aucune méthode de changement d'état | autorisé : toutes les Entities ne mutent pas |
| **E6** | Un accesseur calculé, comme `isArchived` ou `hasFeature`, plutôt qu'un champ | autorisé, et souvent préférable |
| **E7** | Une Entity tient les instances d'Entities du **même** Aggregate | autorisé : c'est la définition d'un Aggregate |
| **E8** | Deux contextes ont une Entity de même nom | autorisé : c'est l'Ubiquitous Language par contexte |
| catégorie | L'objet n'a aucune règle propre, et personne ne le lit pour décider | **ce n'est pas une Entity** : le [test de discrimination](#le-test-de-discrimination) s'applique, puis `../read-model/README.md` |

---

## Exemple complet

Aucune Entity du code n'est entièrement conforme. L'exemple est la version corrigée de `Passage`, le
passage d'un utilisateur dans un module. C'est l'Entity la plus proche du conforme : identité portée
(E1), aucun import (E4), aucune méthode de persistance (E5), aucune instance d'un autre Aggregate
(E7). Une Entity n'a pas d'enregistrement : elle s'importe directement.

```js
// l'Entity, version corrigée
import { PassageTerminatedError } from '../errors.js';

class Passage {
  #terminatedAt;

  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id;
    this.moduleId = moduleId;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#terminatedAt = terminatedAt;
  }

  get terminatedAt() {
    return this.#terminatedAt;
  }

  terminate({ now }) {
    if (this.#terminatedAt) throw new PassageTerminatedError();
    this.#terminatedAt = now;
  }
}

export { Passage };
```

**Code.** Version corrigée de [`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L1-L16).

Corrections apportées :

- **E3**, refus de la transition invalide : `terminate` lève `PassageTerminatedError` sur un passage
  déjà terminé. Dans l'original, ce refus est dans le usecase
  [`terminate-passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/usecases/terminate-passage.js#L6-L8).
  Tout autre appelant de `terminate` y échappe. Le usecase n'a plus à le vérifier.
- **E4**, date en paramètre : `terminate` reçoit `now` au lieu de lire `new Date()`. Le usecase la
  fournit.
- **E6**, pas d'affectation externe : `terminatedAt` porte la règle du refus, donc il devient privé,
  lu par un accesseur. Sans cela, un appelant pourrait le réécrire et contourner `terminate`.

Reste hors correction : la validation à la construction, que demande aussi E3. Aucune règle du code
ne dit quels champs sont obligatoires, et un `userId` absent y est admis. La corriger supposerait une
règle métier que l'exemple ne peut pas inventer.

```js
// le test — unitaire pur : aucune base, aucun double, la date est une valeur
describe('#terminate', function () {
  it('should terminate the passage at the given date', function () {
    const now = new Date('2024-01-02');
    const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123 });

    passage.terminate({ now });

    expect(passage.terminatedAt).to.deep.equal(now);
  });

  it('should refuse to terminate a passage already terminated', function () {
    const terminatedAt = new Date('2024-01-01');
    const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123, terminatedAt });

    expect(() => passage.terminate({ now: new Date('2024-01-02') })).to.throw(PassageTerminatedError);
    expect(passage.terminatedAt).to.deep.equal(terminatedAt);
  });
});
```

**Code.** Version corrigée de [`Passage_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/devcomp/unit/domain/models/Passage_test.js#L29-L44).

Le premier test est corrigé : l'original fige l'horloge avec `sinon.useFakeTimers`, un double qui
signale la violation de E4. Le second est ajouté : c'est le test du refus, absent de l'original. Il
vérifie aussi que l'échec laisse l'état intact.

---

## Tests attendus

| Objet | Type de test | Ce qui est vérifié |
| --- | --- | --- |
| Entity | **unitaire pur**, aucune base, aucun double | la validation à la construction |
| Chaque méthode de changement d'état | **unitaire** | le cas passant **et** le refus quand l'invariant serait violé |
| Accesseurs calculés | **unitaire** | les cas limites, pas seulement le cas nominal |

En test, la comparaison de deux Entities porte sur les identifiants, et l'état pertinent se vérifie
séparément : c'est E2.

L'existence du fichier de test se vérifie par comparaison de noms. Voir
[`outillage.md`](outillage.md#tests-attendus--existence-du-fichier).

Deux indices de diagnostic :

- Le test qui manque le plus souvent est celui du **refus**. Les tests vérifient que `terminate()`
  termine, pas qu'il refuse de terminer deux fois. Or c'est le second qui prouve que E3 est tenu.
  Exception : une Entity sans méthode de changement d'état n'a pas de refus à tester, ce qu'admettent
  les [exceptions légitimes](#exceptions-légitimes).
- Une Entity qui a besoin d'un double **viole E4**. Voir « Ce qui casse » de
  [E4](#e4-aucune-io-aucune-dépendance-à-linfrastructure).

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

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
[ ] [humain]  Si l'objet n'a aucune règle propre, appliquer le test de discrimination : Entity, ou read-model ?
```

À terme, huit lignes restent, toutes de jugement :

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

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **E1**, **E2** identité, égalité par identité | Evans, *DDD*, Entity |
| **E3** invariants tenus à tout instant | Evans, *DDD*, cycle de vie d'un objet du domaine |
| **E4** pureté | Evans, *DDD* ; Martin, « The Clean Architecture » |
| **E5** pas de méthode de persistance | Evans, *DDD*. L'exception du format publié : Published Language |
| **E6** aucun mutateur nu | Fowler, « AnemicDomainModel » |
| **E7** référence par identité | Vernon, « Effective Aggregate Design », règle 3 |
| **E8** nommage et emplacement | l'emplacement : `docs/fr/Anatomy.md`, et ADR 51, « Arborescence API ». Le nommage : aucune source |
| Le test de discrimination | Evans, *DDD*, Entity |
