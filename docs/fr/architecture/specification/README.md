# Specification

Une Specification porte un prédicat composable sur un autre objet, le candidat. Dans `api/`, le moteur
de règles des quêtes en est un exemple : il vit dans `domain/models/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à toute Specification. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Tests attendus](#tests-attendus) · [Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**S1**](#s1-la-specification-est-totale) | la specification est totale | test paramétré |
| [**S2**](#s2--non-satisfait--et--non-évaluable--sont-distincts) | « non satisfait » et « non évaluable » sont distincts | revue |
| [**S5**](#s5-la-composition-est-fermée) | la composition est fermée | test de composition |
| [**S6**](#s6-le-format-est-un-contrat-publié) | le format est un contrat publié | test contre la documentation du format |
| [**S7**](#s7-tout-critère-déclaré-est-branché-sur-le-candidat) | tout critère déclaré est branché sur le candidat | test de correspondance, puis typage |
| [**S8**](#s8-un-consommateur-ne-redéfinit-pas-la-specification) | un consommateur ne redéfinit pas la specification | revue, puis règle `dependency-cruiser` |

[**Invariants hérités du Value Object**](#les-invariants-hérités-du-value-object) : les critères et
le candidat sont des Value Objects. Les invariants de `../objet-valeur/README.md` s'appliquent : `V1`
immuabilité, `V2` absence d'identité, `V3` validation à la construction, `V4` pureté, `V6` absence de
cycle de vie, `V7` exposition en lecture seule.

Hors numérotation, sous [Rôle](#rôle) : la [table des quatre éléments](#les-quatre-éléments) du
pattern, et le
[format publié](#le-format-dune-specification-pilotée-par-les-données-est-un-contrat-publié) avec ses
trois conséquences.

---

## Rôle

Une Specification s'applique dès qu'un objet répond à la question « ce candidat satisfait-il ces
critères ? ». Par exemple :

- un moteur de règles ;
- un ensemble de prérequis ;
- un prédicat métier composable et configuré par des données.

Une Specification porte un **prédicat** sur un autre objet. Elle ne fait rien d'autre : elle ne charge
rien, n'écrit rien, et ne décide pas des conséquences.

Termes employés dans cette page :

- **Candidat** : l'objet évalué, assemblé pour l'occasion.
- **Critère** : une feuille ou un combinateur du prédicat.
- **Published Language** : au sens d'Evans, un format d'échange documenté que d'autres que le code
  écrivent ou lisent.

### Les quatre éléments

Chaque élément a un rôle distinct :

| Élément | Rôle | Catégorie | Fiche |
| --- | --- | --- | --- |
| **La specification** | l'arbre de critères. Aggregate Root si elle est persistée et identifiée | Entity, ou Aggregate Root | `../racine-agregat/README.md` |
| **Les critères** | les feuilles et les combinateurs du prédicat | Value Objects | `../objet-valeur/README.md` |
| **Le candidat** | l'objet évalué, assemblé pour l'occasion | **Value Object** | `../objet-valeur/README.md` |
| **`isSatisfiedBy(candidat)`** | l'unique point d'entrée | sur la specification | — |

**Le candidat est un Value Object**, pas un read-model : une règle du domaine lit ses valeurs pour
décider. Voir le discriminant de `../objet-valeur/README.md`, et
[`explication.md`](explication.md#le-candidat-est-un-value-object).

Conséquence directe : `V3` s'applique. Le candidat valide à la construction. C'est ce qui rend `S1`
tenable, car un candidat valide garantit la forme de chacune de ses propriétés.

Le candidat ne se range pas dans `aggregates/`, qui promet une frontière de cohérence qu'il n'a pas.
Voir `X1` de `../racine-agregat/ecarts.md`.

### Plusieurs prédicats, et le prédicat vide

Une specification peut porter **plusieurs prédicats indépendants** sur le même candidat. C'est le cas
quand le métier distingue plusieurs questions, par exemple « cet utilisateur est-il concerné ? » et
« a-t-il accompli ce qui est demandé ? ». Chaque prédicat est un arbre distinct, évalué séparément.

Les deux énumérations du format sont typiquement celles-ci : un type de critère, et une modalité de
comparaison.

```js
export const COMPARISONS = { ALL: 'all', ONE_OF: 'one-of' };
export const TYPES = { COMPOSE: 'compose', CAPPED_TUBES: 'cappedTubes', OBJECT: { … } };
```

**Code.** [`Requirement.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L7-L21), simplifié.

Un prédicat **vide** est vrai par vacuité : une composition `all` sur une liste vide renvoie `true`.
Ce n'est pas un défaut, c'est la sémantique attendue. Conséquence : un prédicat vide ne filtre plus
aucun candidat.

### Le format d'une specification pilotée par les données est un contrat publié

Dès qu'une specification est écrite à la main (JSON en base, CSV d'import, interface d'administration),
son format devient un **Published Language**. Trois conséquences suivent :

- ses clés ne se renomment pas pour des raisons de style interne, même si elles jurent avec les
  conventions du code ;
- toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable ;
- un format publié se versionne ou s'étend, il ne se casse pas.

C'est `S6`. Ces trois conséquences distinguent ce format de toute autre structure interne.

### Ce qu'une Specification n'est pas

Si le code correspond à une ligne, ce n'est pas une Specification.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| charge les données du candidat | un repository, puis un usecase qui assemble le candidat | `../repository/README.md`, `../usecase/README.md` |
| décide quoi faire du résultat | `domain/usecases/` | `../usecase/README.md` |
| applique une règle sur un seul objet, sans composition | l'Entity ou le Value Object concerné | `../entite/README.md`, `../objet-valeur/README.md` |
| applique une règle transverse non composable, sans I/O | `domain/services/` | `../service-domaine/README.md` |
| journalise, mesure, trace | l'appelant | — |
| filtre les critères avant d'évaluer | nulle part : c'est `S8` | — |
| enrichit le candidat en cours d'évaluation | le usecase, avant l'appel | `../usecase/README.md` |

---

## Invariants

### Les invariants hérités du Value Object

Les critères et le candidat sont des Value Objects. Les invariants `V1`, `V2`, `V3`, `V4`, `V6` et
`V7` de `../objet-valeur/README.md` **s'appliquent**. Leurs énoncés, illustrations et pièges sont
dans `../objet-valeur/README.md`.

Deux de ces pièges comptent en particulier ici : le champ public sur une classe de base abstraite, et
le gel inopérant sur un objet dont l'état est privé.

Deux invariants hérités, `V3` et `V4`, jouent un rôle particulier dans un moteur de règles. Le motif
est dans [`explication.md`](explication.md#le-rôle-de-v3-et-de-v4-dans-un-moteur-de-règles).

**`V3` : validation à la construction.** Un arbre invalide ne s'instancie pas, donc `isSatisfiedBy`
n'a pas à le vérifier. La validation s'applique à tous les niveaux de l'arbre : la specification, les
combinateurs, les critères, les comparaisons élémentaires. Chacun a son schéma.

**`V4` : pureté.** Aucune I/O, aucun effet de bord. Le candidat entre, un booléen sort. La
journalisation est une I/O.

### S1. La specification est totale

**Énoncé.** `isSatisfiedBy` est définie pour tout candidat valide, y compris incomplet. Une donnée
absente rend `false`.

Le point sensible est toujours le même : l'accès à une propriété du candidat.

```js
// fautif — une propriété absente et non tableau atteint #criterion.check() sans garde ;
// check() lève en lisant item[this.#key] sur un item undefined
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);
  return this.#criterion.check({ item: dataInput[this.requirement_type], comparisonFunction });
}

// conforme — l'absence de la propriété du candidat est une réponse, pas un incident
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);
  const value = dataInput[this.requirement_type];
  if (value === undefined) return false;

  if (Array.isArray(value)) {
    return value.some((item) => this.#criterion.check({ item, comparisonFunction }));
  }
  return this.#criterion.check({ item: value, comparisonFunction });
}
```

**Code.** Fautif : dérivé de [`ObjectRequirement.isFulfilled`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L163-L191), simplifié : sans la branche tableau ni la journalisation. La lecture qui lève : [`CriterionProperty.check`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/CriterionProperty.js#L86). La forme conforme est hypothétique.

Le candidat contribue aussi à la totalité. Sa validation à la construction, `V3`, la garantit :

```js
constructor({ organizationLearner, organization, campaignParticipations = [], passages = [] }) {
  // une projection : la propriété est toujours un objet, ses champs peuvent être undefined
  this.organizationLearner = {
    id: organizationLearner?.id,
  };
  // une valeur par défaut : campaignParticipations est toujours itérable
  …
}
```

**Code.** [`Eligibility.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/aggregates/Eligibility.js#L2-L5), simplifié.

**Ce qui casse.** Une specification mal câblée lève dans un job asynchrone, où l'exception est souvent
avalée par un `try/catch` que personne ne relit. Le défaut est silencieux et le résultat manquant est
attribué au métier.

**Un seul mode de réponse par erreur de câblage.** Si certaines propriétés lèvent, d'autres rendent
`false` par projection, et d'autres `false` par collection vide, le comportement dépend du critère
écrit. Le diagnostic devient impossible.

**Vérification.** Un test paramétré sur les énumérations. Voir
[`outillage.md`](outillage.md#s1--test-de-totalité).

### S2. « Non satisfait » et « non évaluable » sont distincts

**Énoncé.** Une specification renvoie un booléen quand elle a pu conclure, et signale explicitement
qu'elle n'a pas pu conclure.

Cet invariant peut sembler contredire `S1`, qui interdit de lever. Cette contradiction n'est
qu'apparente. Elle vient de la confusion de trois cas distincts :

| Cas | Réponse | Invariant |
| --- | --- | --- |
| Une donnée du candidat est **absente** | `false` — c'est une réponse légitime | `S1` |
| La **specification** est malformée : type de critère inconnu, comparaison inapplicable | **ne peut pas arriver** : l'arbre ne s'instancie pas | `V3` |
| Une donnée du candidat est **présente mais inexploitable** : type inattendu, valeur hors domaine | non évaluable, signalé comme tel | `S2` |

Le périmètre de `S2` est donc le troisième cas, et lui seul. C'est le seul qui subsiste à l'exécution
quand `V3` est tenu. Il vient toujours de l'extérieur du domaine : une donnée chargée qui n'a pas la
forme attendue.

```js
// fautif — construit l'erreur, la journalise, puis rend false.
// Indiscernable d'un candidat qui ne remplit simplement pas le critère
check(item) {
  const dataAttr = item[this.#key];
  if (this.#comparison === COMPARISONS.EQUAL) {
    return dataAttr === this.#data;
  }
  const error = new InvalidComparisonError({
    comparisonOperator: this.#comparison,
    typeofCriterion: typeof this.#data,
    typeofData: typeof dataAttr,
  });
  logger.error({ event: 'quest-reward', err: error }, 'Error on quests criterion property');
  return false;
}

// conforme — l'erreur remonte, elle n'est plus avalée derrière un booléen
check(item) {
  const dataAttr = item[this.#key];
  if (this.#comparison === COMPARISONS.EQUAL) {
    return dataAttr === this.#data;
  }
  throw new InvalidComparisonError({
    comparisonOperator: this.#comparison,
    typeofCriterion: typeof this.#data,
    typeofData: typeof dataAttr,
  });
}
```

**Code.** Fautif : [`CriterionProperty.check`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/CriterionProperty.js#L83-L131), simplifié : une seule des branches de comparaison. La forme conforme est hypothétique.

Trois sorties sont possibles. Le moteur en retient **une seule, pour tous ses critères** :

- lever une erreur du domaine ;
- renvoyer un résultat à trois états ;
- renvoyer un booléen accompagné d'une liste de diagnostics.

Le défaut n'est pas de choisir une sortie plutôt qu'une autre. C'est de ne pas choisir.

**Ce qui casse.** Une specification cassée devient indiscernable d'un candidat qui ne remplit pas les
critères. Un utilisateur privé de son résultat par un défaut est traité comme un utilisateur qui n'y a
pas droit, et personne ne le sait.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

### S5. La composition est fermée

**Énoncé.** Un combinateur accepte n'importe quel critère comme enfant, y compris un autre
combinateur, et propage le candidat sans le transformer.

```js
// conforme — le combinateur ne connaît que l'interface, pas les types concrets
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);
  return this.#subRequirements[comparisonFunction]((subRequirement) => subRequirement.isFulfilled(dataInput));
}

// fautif — il connaît ses enfants, donc la composition n'est plus fermée
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);
  return this.#subRequirements[comparisonFunction]((subRequirement) =>
    subRequirement.requirement_type === TYPES.CAPPED_TUBES
      ? subRequirement.isFulfilled(dataInput.cappedTubes)
      : subRequirement.isFulfilled(dataInput),
  );
}
```

**Code.** Conforme : [`ComposedRequirement.isFulfilled`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L98-L112), simplifié : sans sa journalisation. La forme fautive est hypothétique : une variante avec les mêmes noms, qui inspecte le type de ses enfants.

Un combinateur qui refuse un type d'enfant, ou qui modifie le candidat avant de le passer, casse la
propriété.

**Ce qui casse.** Exprimer une condition métier nouvelle demande alors de modifier le moteur. C'est
exactement ce que le pattern sert à éviter.

**Vérification.** Un test de composition. Voir [`outillage.md`](outillage.md#vérifications).

### S6. Le format est un contrat publié

**Énoncé.** Toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable.
Aucune clé existante n'est renommée. Voir
[le format publié](#le-format-dune-specification-pilotée-par-les-données-est-un-contrat-publié).

L'illustration la plus visible de cet invariant est un **nom de champ** : une clé du format publié
garde sa casse d'origine dans le modèle, même quand elle jure avec les conventions du code.

```js
// conforme
class BaseRequirement {
  requirement_type;   // snake_case, parce que c'est la clé du format écrit à la main
  comparison;
}

// fautif — le champ renommé
class BaseRequirement {
  requirementType;
  comparison;
}
```

**Code.** Conforme : [`BaseRequirement`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L27-L29). La forme fautive est hypothétique.

Renommer ce champ en `requirementType` pour la cohérence interne casserait toutes les specifications
déjà écrites en base. C'est exactement ce que l'invariant interdit. C'est pourquoi la forme « laide »
est la bonne ici.

**Le tiers état est le vrai danger** : une valeur qui existe dans le code sans être documentée. Ceux
qui écrivent des specifications ne peuvent pas s'en servir. Ceux qui lisent le code ne savent pas si
elle est supportée. Soit la documentation rattrape, soit le code retire.

**Ce qui casse.** Renommer une clé casse les specifications déjà écrites : en base, dans des imports,
dans une interface d'administration. Ce contenu, le code ne le contrôle pas et ne peut pas le migrer
seul.

**Prérequis de vérification.** L'invariant n'est contrôlable que si une documentation versionnée du
format existe dans le dépôt.

**Vérification.** Un test qui compare les énumérations du code à cette documentation. Voir
[`outillage.md`](outillage.md#s6--ce-qui-manque-avant-de-pouvoir-le-tester).

### S7. Tout critère déclaré est branché sur le candidat

**Énoncé.** Quand la résolution d'une propriété du candidat se fait par nom, l'énumération des noms
autorisés et la surface du candidat forment un contrat implicite. Il doit être vérifié.

Ajouter un critère demande plusieurs étapes, dans plusieurs fichiers :

- exposer la propriété sur le candidat ;
- enregistrer le nom dans l'énumération ;
- charger la donnée dans le repository qui assemble le candidat.

Le schéma du format valide l'étape d'enregistrement :

```js
requirement_type: Joi.string()
  .valid(...Object.values(TYPES.OBJECT))
  .required(),
```

**Code.** [`Requirement.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L126-L128).

Le schéma ne valide pas les deux autres étapes. Un nom peut donc entrer dans l'énumération, passer le
schéma, et ne correspondre à aucune propriété du candidat.

```js
// fautif — le nom traverse tel quel, sans vérifier qu'une propriété du candidat lui correspond
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);
  return this.#criterion.check({ item: dataInput[this.requirement_type], comparisonFunction });
}

// conforme — la correspondance nom ↔ propriété est vérifiée une fois, sur une instance du candidat
const dataInput = new DataForQuest({ eligibility: {}, success: {} });
for (const name of Object.values(TYPES.OBJECT)) {
  expect(name in dataInput, `le critère « ${name} » n'a aucune propriété sur le candidat`).to.be.true;
}
```

**Code.** Fautif : [`ObjectRequirement.isFulfilled`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L163-L191), simplifié : sans la branche tableau ni la journalisation. Le test conforme est hypothétique.

**Ce qui casse.** Un nom enregistré sans donnée derrière produit une violation de `S1` : selon la
forme de la propriété, une exception ou un `false` définitif et silencieux. Le critère est écrit. Il
paraît actif, mais il ne l'est pas.

**L'exception.** Un critère qui porte un algorithme (un calcul, un seuil, une agrégation) n'utilise
pas la résolution par nom. Il appelle une méthode nommée du candidat. Il est hors du périmètre de `S7`
et n'entre pas dans l'énumération. Faute de le distinguer explicitement, la vérification
produit un faux positif.

**Vérification.** Un test de correspondance sur une instance du candidat, puis le typage. Voir
[`outillage.md`](outillage.md#s7--le-test-le-plus-rentable-et-lerreur-à-ne-pas-refaire).

### S8. Un consommateur ne redéfinit pas la specification

**Énoncé.** Un consommateur évalue une specification, ou n'en fait rien. Il ne choisit pas quels
critères comptent.

Les trois degrés de violation, du moins au plus grave :

```js
// 1. il lit la forme interne du format
get targetProfileIds() {
  return this.quest.successRequirements
    .filter((item) => item.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS)
    .map(({ data }) => parseInt(data.targetProfileId.data));
}

// 2. il parcourt les critères et en évalue un isolément
for (const requirement of this.quest.successRequirements) {
  if (requirement.requirement_type === TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
    const isCompleted = dataForQuest ? requirement.isFulfilled(dataForQuest) : false;
    …
  }
}

// 3. il reconstruit la specification avec un sous-ensemble
const successRequirements = this.quest.successRequirements.filter((successRequirements) => {
  return (
    successRequirements.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS ||
    successRequirements.requirement_type === REQUIREMENT_TYPES.CAPPED_TUBES ||
    (successRequirements.requirement_type === REQUIREMENT_TYPES.OBJECT.PASSAGES &&
      this.items.find((item) => item.id === successRequirements.data.moduleId.data))
  );
});
const quest = new Quest({
  id: this.quest.id,
  createdAt: this.quest.createdAt,
  updatedAt: this.quest.updatedAt,
  rewardId: this.quest.rewardId,
  rewardType: this.quest.rewardType,
  eligibilityRequirements: this.quest.eligibilityRequirements,
  successRequirements,
});
return quest.isSuccessful(this.dataForQuest);
```

**Code.** Degré 1 : [`CombinedCourseBlueprint.targetProfileIds`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js#L47-L51). Degré 2 : [`CombinedCourseDetails.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js#L219-L224), simplifié. Degré 3 : [`CombinedCourseDetails.isSuccessful`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js#L302-L321).

À l'inverse, un consommateur conforme se contente d'évaluer :

```js
// conforme — le consommateur évalue la specification entière, il ne redéfinit rien
return quest.isSuccessful(dataForQuest);
```

**Code.** [`check-user-quest-success.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/check-user-quest-success.js#L40).

Le besoin métier derrière est souvent légitime : un critère qui ne doit pas bloquer dans certaines
conditions. Mais il doit devenir une **propriété explicite** du modèle du consommateur, pas un filtrage
de critères au moment d'évaluer.

**Ce qui casse.** Le troisième degré est rédhibitoire : aucune API publiée ne peut exposer
« réinstancie mon Aggregate avec d'autres critères ». Tant que `S8` est violé, le moteur ne peut pas
devenir un Bounded Context distinct de ses consommateurs, et l'ADR 55 reste inapplicable à cette
frontière.

**Vérification.** La revue. Une règle `dependency-cruiser` de chemin la remplace une fois le moteur
découpé en Bounded Context distinct. Voir [`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **S5** | Un prédicat vide est vrai par vacuité | **autorisé**, c'est la sémantique de la composition `all`. Effet : le prédicat ne filtre plus aucun candidat |
| **S5** | Une specification aux prédicats **tous** vides | **cas dégénéré**, pas une exception. Elle est satisfaite par tout candidat. Elle est interdite à l'écriture, pas à l'évaluation |
| **S7** | Un critère algorithmique hors de l'énumération, appelant une méthode du candidat | **autorisé**, hors périmètre de `S7` |
| **V3** | Un critère sans modalité de comparaison, quand la notion n'a pas de sens pour lui | **autorisé** : un seuil ne se compare pas « une parmi » |
| **S1** | Une méthode du candidat qui rend une valeur neutre sur entrée non exploitable | **autorisé**, et c'est `S1` bien appliqué |
| **S1** | Un candidat construit en deux temps, avec un accesseur pour la partie coûteuse à charger | **autorisé** si l'appelant renseigne avant usage. C'est une optimisation, pas une violation de `S1`. Elle est documentée, sinon un relecteur la prend pour un défaut |
| **S8** | Le consommateur porte une propriété qui neutralise un critère | **autorisé**, c'est la réponse conforme à `S8` : une propriété du modèle, pas un filtrage |

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Specification, combinateurs, critères, comparaisons | **unitaire pur** — aucune base, aucune doublure | la logique de composition et de comparaison |
| Totalité et modes d'échec | **unitaire paramétré** sur les énumérations | `S1` et `S2`, en énumérant plutôt qu'en listant des cas |
| Le candidat et ses valeurs par défaut | **unitaire** | l'assemblage, et la forme garantie de chaque propriété |
| Correspondance énumération ↔ candidat | **unitaire** | `S7`, sur une instance |
| Les repositories qui assemblent le candidat | **intégration** | que chaque propriété est effectivement renseignée |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites dans
[`../repository/outillage.md`](../repository/outillage.md#tests-attendus--par-le-même-script).

Deux indices de diagnostic, avec leurs exceptions :

- Une specification qui a besoin d'une **doublure** pour être testée en unitaire viole `V4`. La
  doublure n'est pas une contrainte du test, c'est le diagnostic. Cet indice n'a pas d'exception :
  aucune specification conforme n'en demande une.
- Un test qui **liste des cas** au lieu d'énumérer est un signal. Le domaine est fini et déclaré. Un
  test écrit cas par cas se périme dès qu'une valeur est ajoutée à une énumération, et personne ne le
  saura. Exception : les cas limites d'une comparaison particulière se listent légitimement.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle ou le test correspondant existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ou le test ne couvre pas ;
- `[humain]` : la ligne reste en entier.

Les quatre lignes en `V` reprennent les invariants hérités de `../objet-valeur/README.md`.

```
[ ] [humain]  S8  Aucun consommateur ne filtre les critères ni ne reconstruit la specification
[ ] [auto]    S1  Aucun accès à une propriété du candidat sans traiter son absence
[ ] [humain]  S2  Une donnée présente mais inexploitable est signalée, elle ne renvoie pas false
[ ] [partiel] S6  Toute valeur ajoutée à une énumération du format est documentée
[ ] [partiel] S7  Tout critère de l'énumération a sa propriété sur le candidat ET son chargement
[ ] [auto]    S5  La composition reste fermée ; le candidat n'est pas transformé en cours de route
[ ] [auto]    V4  Aucun import d'infrastructure dans un modèle du domaine, journal compris
[ ] [humain]  V3  Validation à la construction, à tous les niveaux de l'arbre, avant affectation
[ ] [auto]    V1  Aucun champ public mutable, classe de base comprise ; aucun gel inopérant
[ ] [partiel] V7  Aucune collection interne rendue telle quelle
[ ] [humain]  Tests unitaires purs ; les tests énumèrent au lieu de lister des cas
[ ] [humain]  Avant de signaler S1 ou S7, vérifier les exceptions légitimes
```

À terme, huit lignes restent. Cinq sont de jugement : `S8`, `S2`, `V3`, la forme des tests et le
rappel des exceptions. Trois sont partielles, réduites à ce que le test ou la règle ne couvre pas :
`S6`, `S7` pour le chargement de la propriété, et `V7` pour les accès imbriqués.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **S1** totalité | Evans & Fowler, « Specifications » |
| **S2** non satisfait ≠ non évaluable | aucune source : contrainte propre à un moteur piloté par les données |
| **S5** fermeture par composition | Evans & Fowler, « Specifications » |
| **S6** format publié | Evans, *DDD*, Published Language |
| **S7** énumération ↔ candidat | aucune source : contrainte propre à la résolution par nom |
| **S8** pas de redéfinition par le consommateur | Evans, *DDD*, Anticorruption Layer et Bounded Context. ADR 55, « Communication "séquentielle" entre les contextes fonctionnels » |
| Invariants hérités | voir `../objet-valeur/README.md` |
