# Aggregate Root

Un Aggregate est un groupe d'objets traité comme une unité de cohérence. Son Aggregate Root, la
racine, est l'Entity par laquelle passe tout accès. Elle vit dans `domain/models/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à toute Aggregate Root. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

**Invariants propres.**

| # | Invariant | Vérification |
| --- | --- | --- |
| [**A1**](#a1-la-frontière-de-cohérence-est-explicite) | la frontière de cohérence est explicite | revue |
| [**A2**](#a2-la-racine-est-le-seul-point-dentrée) | la racine est le seul point d'entrée | règle ESLint |
| [**A3**](#a3-un-repository-par-racine-et-seulement-pour-les-racines) | un repository par racine | indicateur, par script |
| [**A6**](#a6-petit-aggregate) | petit Aggregate | revue |
| [**A7**](#a7-une-transaction-un-aggregate) | une transaction, un Aggregate | revue |

[**Invariants hérités de l'Entity**](#les-invariants-hérités-de-lentity) : toute racine est une
Entity, donc E1 à E8 de `../entite/README.md` s'appliquent intégralement. Quatre sont repris dans
cette page : E3 et E7 jouent un rôle particulier pour une racine, E4 et E6 reviennent dans la
checklist.

| # | Invariant | Vérification |
| --- | --- | --- |
| **E3** | les invariants sont tenus à tout instant | règle ESLint |
| **E4** | aucune I/O, aucune dépendance à l'infrastructure | `dependency-cruiser`, partielle |
| **E6** | aucun mutateur nu | règle ESLint |
| **E7** | les autres Aggregates sont référencés par identité | revue |

Les énoncés de E3, E4, E6 et E7 sont dans `../entite/README.md`.

---

## Rôle

Un **Aggregate** est un groupe d'objets traité comme une unité de cohérence. Sa **racine** est
l'Entity par laquelle passe tout accès : rien de ce qu'il contient n'est atteignable autrement.

Sa raison d'être tient en une phrase : il existe une règle qui porte sur plusieurs objets à la fois,
et quelqu'un doit garantir qu'elle est vraie en permanence. C'est la racine.

Termes employés dans cette page :

- **Frontière de cohérence** : l'ensemble des objets que cette règle engage.
- **Invariant de frontière** : la règle elle-même, écrite sous la forme « à tout instant, dans cet
  Aggregate, … doit être vrai ».
- **Read-model** : un objet assemblé pour une lecture, sans règle commune à tenir.

S'il n'y a pas de telle règle, il n'y a pas d'Aggregate. Il reste une Entity, et des objets à côté.
Poser le mot sur un dossier sans cette règle promet une garantie qui n'existe pas. Cela coûte plus
cher que de ne pas ranger du tout.

### Le test de discrimination

Ce test, hors numérotation, dit en trois questions s'il y a un Aggregate ou non. Dans cet ordre :

1. *Existe-t-il une règle qui porte sur plusieurs de ces objets simultanément ?* Si non, ce n'est pas
   un Aggregate.
2. *Cette règle doit-elle être vraie en permanence, ou peut-elle se réconcilier plus tard ?* Si elle
   peut attendre, la frontière est ailleurs.
3. *Y a-t-il un objet par lequel tout accès doit passer ?* C'est la racine.

Contre-exemple courant, qui échoue à la première question : « ces objets sont toujours affichés
ensemble » n'est pas une règle de cohérence, c'est un besoin de lecture. Il appelle un read-model.

### Aggregate Root ou Entity

Toute Aggregate Root est une Entity, et `../entite/README.md` s'applique intégralement. Cette page
ajoute ce qui est propre à la racine : la frontière, le point d'entrée unique, le repository.

Une Entity qui vit **à l'intérieur** d'un Aggregate n'est pas une racine : elle n'a ni repository, ni
accès direct.

### Ce qu'une Aggregate Root n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une Aggregate Root.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas de règle commune à plusieurs objets à tenir en permanence | une Entity, dans `domain/models/` | `../entite/README.md` |
| regroupe des objets pour une lecture, sans règle commune | un read-model, dans `domain/read-models/` | `../read-model/README.md` |
| n'a pas d'identité | un Value Object | `../objet-valeur/README.md` |
| est construit par une suite de mutateurs appelés de l'extérieur | un constructeur dédié, ou un read-model | `../read-model/README.md` |
| coordonne plusieurs Aggregates | `domain/usecases/` | `../usecase/README.md` |
| applique une règle qui ne relève d'aucun Aggregate, sans I/O | `domain/services/` | `../service-domaine/README.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `../specification/README.md` |

---

## Invariants

### Les invariants hérités de l'Entity

Toute racine est une Entity. E1 à E8 de `../entite/README.md` s'appliquent intégralement, et ne sont
pas redétaillés ici. Deux d'entre eux jouent un rôle particulier pour une racine.

**E3**, *les invariants sont tenus à tout instant*. Pour une Entity simple, l'invariant porte sur ses
propres champs. Pour une racine, il porte sur la frontière entière : après chaque opération, y compris
celle qui échoue à mi-chemin, tout ce que contient l'Aggregate reste cohérent. C'est la formulation
forte de A1.

**E7**, *les autres Aggregates sont référencés par identité*. Pour une Entity simple, c'est une bonne
pratique qui limite le coût d'un chargement. Pour une racine, c'est constitutif : cela définit où
s'arrête la frontière. Une racine qui tient l'instance d'une autre racine n'a pas une frontière. Elle
en a deux confondues.

Le corollaire : à l'intérieur d'un même Aggregate, tenir les instances est normal. C'est la
définition d'un Aggregate, et c'est l'exception que E7 nomme.

### A1. La frontière de cohérence est explicite

**Énoncé.** L'Aggregate existe parce qu'une règle porte sur plusieurs de ses objets à la fois. Cette
règle doit être **nommable**.

Le test consiste à formuler la phrase « à tout instant, dans cet Aggregate, … doit être vrai ». Si la
phrase ne vient pas, il n'y a pas de frontière à protéger.

```
// nommable : il y a un Aggregate, et le code le vérifie
« à tout instant, toute participation portée par un parcours combiné est
  une participation de ce contexte, et non une forme quelconque »

    participations: Joi.array().items(Joi.object().instance(CombinedCourseParticipation)),

// non nommable : il n'y en a pas
« ces objets sont toujours chargés ensemble »
```

**Code.** Nommable : [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L13). La phrase non nommable est hypothétique.

Le second énoncé n'est pas un invariant mais une observation sur les habitudes de chargement. Pour un
objet assemblé pour un écran, c'est le seul énoncé disponible. C'est pourquoi ces objets ne sont pas
des Aggregates.

**Ce qui casse.** Sans frontière nommable, chaque écriture portant sur plusieurs objets est une
décision improvisée : personne ne sait ce qu'une transaction doit couvrir, ni ce qui peut se
réconcilier plus tard.

**Vérification.** La revue, sur la phrase écrite. L'invariant n'est contrôlable que si la phrase est
écrite quelque part. Voir [`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable-et-pourquoi).

### A2. La racine est le seul point d'entrée

**Énoncé.** Rien de ce que contient l'Aggregate n'est atteignable sans passer par la racine :

- ni par import direct ;
- ni par un repository dédié ;
- ni par un accesseur qui rend la référence interne modifiable.

```js
// fautif : le champ est public. L'appelant obtient la collection interne,
// peut la modifier, et peut même la remplacer entièrement
class CombinedCourse {
  constructor({ participations = [] } = {}) {
    this.participations = participations;
  }
}

// conforme : la racine ne rend que des résultats, jamais la collection
get participationsCount() {
  return this.participations.length;
}

get completedParticipationsCount() {
  return this.participations.filter((participation) => participation.isCompleted()).length;
}
```

**Code.** Fautif : [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L20-L46), simplifié. Conforme : [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L62-L68).

Les deux formes viennent du même fichier : le champ est public, et la racine expose deux comptages
dérivés. Ces comptages sont la forme qu'Evans autorise pour traverser la frontière : un scalaire
calculé, pas la collection. Voir [Sources](#sources).

**Conséquence sur les objets internes.** Ils n'ont pas de repository, et leur identité n'a de sens que
dans l'Aggregate. S'ils ont besoin d'être retrouvés indépendamment, ils ne sont pas internes.

**Ce qui casse.** La règle de frontière devient contournable, donc ce n'est plus une garantie mais une
convention.

**Vérification.** Une règle ESLint, commune avec `V7` de `../objet-valeur/README.md`. Voir
[`outillage.md`](outillage.md#a2--la-seule-règle-nette).

### A3. Un repository par racine, et seulement pour les racines

**Énoncé.** Chaque racine a un repository, et seules les racines en ont un. Le nombre de repositories
d'un contexte dit alors combien d'unités de cohérence il a.

Une lecture dont une mesure montre que charger l'Aggregate entier est trop cher passe par un
read-model, pas par un repository d'Aggregate de plus.

```
// fautif : cinq repositories pour une seule frontière de cohérence
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js               getById, save
  combined-course-details-repository.js         findByOrganizationId, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js une Entity interne à la frontière
    organization-learner-participation-repository.js
  prescription/
    combined-course-participant-repository.js   la même frontière, vue d'un autre besoin

// conforme : un seul repository pour la racine
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js               getById, save
```

**Code.** Fautif : [le dossier](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/repositories), simplifié : seuls les fichiers de cette frontière sont montrés. La forme conforme est hypothétique. Le détail est en `X4` de [`../repository/ecarts.md`](../repository/ecarts.md#x4-plusieurs-repositories-pour-un-même-aggregate).

**Ce qui casse.** Compter les repositories cesse d'être une information. C'est un invariant
d'hygiène : il ne prévient aucun défaut, il préserve la valeur d'un indicateur.

**Vérification.** Un script d'indicateur, qui compare le nombre de repositories au nombre de racines
déclarées. Voir [`outillage.md`](outillage.md#a3--un-indicateur-pas-une-règle).

### A6. Petit Aggregate

**Énoncé.** Un Aggregate ne contient que les objets que son invariant de frontière engage. Les autres
objets forment des Aggregates distincts, reliés par identité.

```js
// fautif : le constructeur porte douze champs, alors que la seule chose que la
// frontière garantit porte sur un seul d'entre eux, « participations »
constructor(
  {
    id, code, organizationId, name, description, illustration,
    participations = [], questId, blueprintId = null,
    deletedAt = null, deletedBy = null, baseSurveyUrl = null,
  } = {},
  quest,
) { … }

// conforme, forme corrigée : l'Aggregate ne porte que ce que l'invariant engage.
// Le reste (nom, description, illustration…) se charge à part, pour qui en a besoin
constructor({ id, participations = [] } = {}) { … }
```

**Code.** Fautif : [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L23-L39), simplifié : un champ par ligne dans le code. La forme corrigée est hypothétique.

Deux questions se posent à chaque ajout dans un Aggregate :

- *cette donnée doit-elle être cohérente avec le reste à tout instant, ou seulement à terme ?*
- *combien de lignes cet ajout fait-il charger pour une opération qui ne s'en sert pas ?*

La réponse au coût de chargement est de réduire l'Aggregate plutôt que de le charger partiellement.
Le modèle partiellement rempli est écarté, pour la raison exposée dans `X4` de
[`../repository/ecarts.md`](../repository/ecarts.md#x4-plusieurs-repositories-pour-un-même-aggregate).

**Ce qui casse.** Un gros Aggregate se charge entier pour chaque opération, y compris celles qui ne
touchent qu'un champ. Il concentre aussi les écritures concurrentes, donc la contention.

**Vérification.** La revue. Voir
[`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable-et-pourquoi).

### A7. Une transaction, un Aggregate

**Énoncé.** Une opération modifie **un** Aggregate. Si elle doit en modifier deux, deux voies :

- la frontière est mal placée, et les deux n'en font qu'un ;
- ou ils sont bien distincts, et la cohérence entre eux se règle à terme : un événement, un job, une
  réconciliation.

**Exception décidée.** L'ADR 25 retient la transaction qui couvre plusieurs Aggregates quand les
écritures doivent échouer ou réussir ensemble. Ces écritures sont alors orchestrées dans le usecase,
sans événements. Dans ce cas, A7 garde sa valeur comme question de conception : si deux Aggregates
doivent toujours changer ensemble, la frontière est peut-être mal placée.

```js
// conforme : une seule écriture, un seul Aggregate modifié
export const changeUserLocale = async function ({ userId, locale, userRepository }) {
  const lang = getBaseLocale(locale);

  await userRepository.update({ id: userId, lang, locale });
  return userRepository.get(userId);
};
```

**Code.** Conforme : [`change-user-locale.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/change-user-locale.usecase.js#L11-L16). La forme qui modifie deux Aggregates dans une même transaction est en `X4` de [`ecarts.md`](ecarts.md#x4-une-opération-modifie-plusieurs-aggregates-dans-la-même-transaction) : elle relève de l'exception décidée.

**Ce qui casse.** Une transaction qui couvre plusieurs Aggregates verrouille plus de lignes que
nécessaire, et fait échouer des opérations sans rapport entre elles. Elle masque aussi une frontière
mal placée : personne ne se pose la question tant que la transaction absorbe le problème.

**Vérification.** La revue. Voir
[`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable-et-pourquoi).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **A1** | Un Aggregate réduit à sa seule racine, sans objet interne | **autorisé** et fréquent : l'invariant porte alors sur les seuls champs de la racine |
| **A1** | Un dossier `aggregates/` contenant des read-models | **pas une exception** : sans règle commune nommable, ce n'est pas un Aggregate |
| **A2** | Une racine expose une collection en lecture par copie | **autorisé**, c'est la forme correcte de A2 |
| **A3** | Une lecture qui traverse plusieurs Aggregates | **autorisé** via un read-model : A3 ne contraint que l'écriture |
| **A3** | Plusieurs repositories pour une même frontière | **pas une exception**. Seul un read-model justifié par une mesure de charge reste séparé |
| **A7** | Une opération qui touche deux Aggregates via un événement ou un job | **autorisé**, c'est la seconde voie de A7 |
| **A7** | Une transaction qui couvre plusieurs Aggregates dont les écritures doivent échouer ou réussir ensemble | **autorisé**, c'est la décision de l'ADR 25 : orchestration dans le usecase, sans événements |
| **E7** | Un identifiant d'un autre contexte porté comme donnée | **autorisé**, c'est E7 bien appliqué |
| **E7** | La racine tient les instances de ses objets internes | **autorisé**, c'est la définition d'un Aggregate |

---

## Exemple complet

Aucune Aggregate Root du code n'est entièrement conforme. L'exemple est la version corrigée de
`CombinedCourse`, la racine la plus proche : son invariant de frontière est nommable et vérifié par
le schéma. Les mêmes noms et les mêmes champs sont gardés. Les extraits sont simplifiés : les liens
sous les blocs mènent au code d'origine.

L'invariant de frontière, celui de A1 : « à tout instant, toute participation portée par un parcours
combiné est une `CombinedCourseParticipation` ».

```js
// la racine, version corrigée
export class CombinedCourse {
  #participations;

  constructor({
    id, code, organizationId, name, description, illustration,
    participations = [], questId,
    blueprintId = null, deletedAt = null, deletedBy = null, baseSurveyUrl = null,
  } = {}) {
    this.id = id;
    // … code, organizationId, name, description, illustration, questId, blueprintId,
    //   deletedAt, deletedBy, baseSurveyUrl : affectés comme dans l'original
    this.#participations = [...participations];

    this.#validate();
  }

  get participations() {
    return [...this.#participations];
  }

  get participationsCount() {
    return this.#participations.length;
  }

  get completedParticipationsCount() {
    return this.#participations.filter((participation) => participation.isCompleted()).length;
  }

  #validate() {
    const { error } = schema.validate({ ...this, participations: this.#participations });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this });
    }
  }
}
```

**Code.** Version corrigée de [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L20-L76). Le schéma Joi est inchangé : [`CombinedCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/entities/CombinedCourse.js#L6-L19).

Corrections apportées :

- **A2**, collection privée : `participations` devient le champ privé `#participations`. L'appelant
  ne peut plus remplacer la collection, ni la modifier par la référence qu'il a passée au
  constructeur, puisque celui-ci en garde une copie.
- **A2**, lecture par copie : l'accesseur `participations` rend une copie, forme autorisée par les
  [exceptions légitimes](#exceptions-légitimes). Les deux comptages restent la voie principale.
- **A1** et **E3**, invariant de frontière vérifié à tout instant : dans l'original, un appelant peut
  réaffecter `participations` après la construction, sans aucune validation. Le champ privé rend
  cette affectation impossible, donc la validation du constructeur tient pour toute la vie de
  l'objet. Le schéma reçoit la collection privée explicitement, parce que `{ ...this }` ne copie pas
  les champs privés.
- **E7**, référence par identité : l'original reçoit l'instance de `Quest` en second paramètre et
  l'expose par l'accesseur `quest`. `Quest` a son propre repository, donc c'est une autre racine
  (A3). La version corrigée ne garde que `questId`. Le usecase qui a besoin de la quête la charge
  par son repository.

Choix sur **A6** : l'Aggregate garde ses douze champs. L'invariant de frontière n'engage que
`participations`, et A6 décrit la forme réduite. Mais A6 fait de la réduction la réponse à un coût
de chargement, et aucune mesure de ce coût n'est citée. La réduction déplace aussi les autres champs
vers un objet distinct, donc hors de ce fichier. Elle reste l'écart décrit en A6.

A3 et A7 ne se voient pas dans ce fichier. A3 porte sur le dossier des repositories, voir `X4` de
[`../repository/ecarts.md`](../repository/ecarts.md#x4-plusieurs-repositories-pour-un-même-aggregate).
A7 porte sur les usecases.

```js
// le test, version corrigée : les participations passent par le constructeur
it('should return the number of participations', function () {
  const combinedCourse = new CombinedCourse({
    id: 1, organizationId: 1, name: 'name', code: 'code',
    participations: [
      new CombinedCourseParticipation({ id: 1, questId: 1, organizationLearnerId: 1, status: CombinedCourseParticipationStatuses.STARTED }),
      new CombinedCourseParticipation({ id: 2, questId: 1, organizationLearnerId: 2, status: CombinedCourseParticipationStatuses.STARTED }),
    ],
  });

  expect(combinedCourse.participationsCount).to.equal(2);
});

// le test caractéristique, ajouté : une participation d'une autre forme est refusée
it('should refuse a participation that is not a CombinedCourseParticipation', function () {
  expect(() => {
    new CombinedCourse({ id: 1, organizationId: 1, name: 'name', code: 'code', participations: [{ id: 1 }] });
  }).to.throw(EntityValidationError);
});

// ajouté : la collection ne se remplace pas de l'extérieur
it('should not let the caller replace the participations', function () {
  const combinedCourse = new CombinedCourse({ id: 1, organizationId: 1, name: 'name', code: 'code' });

  expect(() => {
    combinedCourse.participations = [{ id: 1 }];
  }).to.throw(TypeError);
});
```

**Code.** Version corrigée de [`CombinedCourse_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/quest/unit/domain/models/combined-course/CombinedCourse_test.js#L52-L81). Les deux autres tests sont ajoutés : l'original n'en a pas d'équivalent.

Dans l'original, le test de comptage réaffecte `participations` après la construction. Il s'appuie
donc sur la violation de A2. Le seul test de refus porte sur `code`, un champ simple, et pas sur
l'invariant de frontière. Le test de réaffectation attend une `TypeError` parce qu'un module ES
s'exécute en mode strict : affecter une propriété qui n'a qu'un accesseur y lève une erreur.

---

## Tests attendus

| Objet | Type de test | Ce qui est vérifié |
| --- | --- | --- |
| La racine | **unitaire pur**, aucun double | l'invariant de frontière, sur le cas passant **et** sur le refus |
| Chaque opération modifiant l'Aggregate | **unitaire** | que l'invariant tient après l'opération, y compris en cas d'échec partiel |
| Le repository de la racine | **intégration** | que l'Aggregate est chargé et sauvegardé **entier** |

**Le test caractéristique** prouve qu'une opération qui violerait l'invariant de frontière est
refusée. C'est le seul qui distingue un Aggregate d'une Entity avec des objets à côté.

Ce test ne peut s'écrire que si l'invariant de frontière est formulé. Un Aggregate dont personne ne
sait énoncer la règle n'a pas ce test, parce qu'il n'a pas cette règle. C'est A1 qui est en défaut,
pas la couverture.

---

## Checklist de revue

Ordonnée par ROI décroissant pour les invariants propres, puis les invariants hérités. Le statut de
chaque ligne vient du moyen de vérification décrit dans [`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

Les quatre dernières lignes reprennent des invariants hérités de `../entite/README.md`. E3 et E7
portent différemment sur une racine, E4 et E6 s'y appliquent comme sur toute Entity.

```
[ ] [humain]  A1  L'invariant de frontière est nommable : « à tout instant, … doit être vrai »
[ ] [auto]    A2  Aucun accès à un objet interne sans passer par la racine, accesseurs compris
[ ] [humain]  A6  L'ajout ne fait pas charger des données inutiles à la plupart des opérations
[ ] [humain]  A7  L'opération ne modifie qu'un Aggregate, ou la cohérence différée est explicite, ou les écritures doivent échouer ensemble (ADR 25)
[ ] [partiel] A3  Un seul repository pour cette frontière ; une lecture séparée passe par un read-model justifié par une mesure
[ ] [humain]  Un test prouve le refus d'une opération qui violerait l'invariant de frontière
[ ] [humain]  Si aucun invariant de frontière n'est nommable, ce n'est pas un Aggregate : le ranger ailleurs
[ ] [partiel] E3  L'invariant tient après chaque opération, échec à mi-chemin compris
[ ] [auto]    E6  Aucun assemblage par mutateurs successifs appelés de l'extérieur
[ ] [humain]  E7  Les autres Aggregates sont référencés par identifiant, jamais par instance
[ ] [partiel] E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
```

À terme, neuf lignes restent : trois `[partiel]` (A3, E3, E4) et six `[humain]`.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **A1** frontière de cohérence | Evans, *DDD*, ch. « The Life Cycle of a Domain Object ». Vernon, « Effective Aggregate Design », règle 1 |
| **A2** point d'entrée unique | Evans, même ch. : c'est la définition de la racine |
| **A3** un repository par racine | Evans, même ch. : le Repository porte sur les Aggregates, pas sur les Entities internes |
| **A6** petit Aggregate | Vernon, règle 2 |
| **A7** une transaction, un Aggregate | Vernon, règle 4. Exception : ADR 25, « Précision sur les transactions et les événements métier », qui remplace l'ADR 9, « Transactions métier », et l'ADR 10, « Propager les Domain Events via un Event Dispatcher » |
| Le test de discrimination | Evans, même ch. |
