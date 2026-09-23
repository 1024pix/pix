# Fiche — Specification

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

À utiliser dès qu'un objet répond à la question « ce candidat satisfait-il ces critères ? ». Par
exemple :

- un moteur de règles ;
- un ensemble de prérequis ;
- un prédicat métier composable et configuré par des données.

> **À instruire**
>
> - Les numéros `S3`, `S4` et `S9` restent libres et ne sont pas réattribués. Ils réénonçaient des
>   invariants de `fiche-objet-valeur.md`, où vivent les énoncés :
>   - `S3` réénonçait `V4` ;
>   - `S4` réénonçait `V1`, `V2`, `V6` et `V7` ;
>   - `S9` réénonçait `V3`.
> - `X1`, la redéfinition par le consommateur, empêche d'isoler le moteur dans un contexte borné
>   distinct. C'est l'écart le plus structurant de la fiche. C'est aussi le seul dont la correction est
>   un chantier de conception.
> - Le format d'une specification écrite à la main est un contrat publié. Aucune documentation
>   versionnée de ce format n'existe aujourd'hui. Sans elle, `S6` est invérifiable.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants propres** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**S8**](#s8-un-consommateur-ne-redéfinit-pas-la-specification) | un consommateur ne redéfinit pas la specification | **forte** | revue, puis règle après découpage |
| [**S1**](#s1-la-specification-est-totale) | la specification est totale | **forte** | test paramétré |
| [**S2**](#s2--non-satisfait--et--non-évaluable--sont-distincts) | « non satisfait » et « non évaluable » sont distincts | **forte** | revue |
| [**S6**](#s6-le-format-est-un-contrat-publié) | le format est un contrat publié | **forte** | test, après documentation du format |
| [**S7**](#s7-tout-critère-déclaré-est-branché-sur-le-candidat) | tout critère déclaré est branché sur le candidat | moyenne | test, dix lignes |
| [**S5**](#s5-la-composition-est-fermée) | la composition est fermée | hygiène | test de composition |

[**Invariants hérités de l'objet-valeur**](#les-invariants-hérités-de-lobjet-valeur) : les critères et
le candidat sont des objets-valeurs. Les invariants de `fiche-objet-valeur.md` s'appliquent : `V1`
immuabilité, `V2` absence d'identité, `V3` validation à la construction, `V4` pureté, `V6` absence de
cycle de vie, `V7` exposition en lecture seule.

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-un-consommateur-reconstruit-la-specification) | un consommateur reconstruit la specification | **à corriger** |
| [**X2**](#x2--non-satisfait--et--non-évaluable--sont-confondus) | « non satisfait » et « non évaluable » sont confondus | **à corriger** |
| [**X3**](#x3-la-specification-journalise) | la specification journalise | **à corriger** |
| [**X4**](#x4-la-résolution-dune-propriété-du-candidat-se-fait-par-nom) | la résolution d'une propriété du candidat se fait par nom | à surveiller |

Hors numérotation, au § 1 : la [table des quatre éléments](#les-quatre-éléments) du pattern, et le
[format publié](#le-format-dune-specification-pilotée-par-les-données-est-un-contrat-publié) avec ses
trois conséquences.

---

## 1. Rôle

Une Specification porte un **prédicat** sur un autre objet. Elle ne fait rien d'autre : elle ne charge
rien, n'écrit rien, et ne décide pas des conséquences.

### Les quatre éléments

Chaque élément a un rôle distinct :

| Élément | Rôle | Catégorie | Fiche |
| --- | --- | --- | --- |
| **La specification** | l'arbre de critères. Racine d'agrégat si elle est persistée et identifiée | entité, ou racine | `fiche-racine-agregat.md` |
| **Les critères** | les feuilles et les combinateurs du prédicat | objets-valeurs | `fiche-objet-valeur.md` |
| **Le candidat** | l'objet évalué, assemblé pour l'occasion | **objet-valeur** | `fiche-objet-valeur.md` |
| **`isSatisfiedBy(candidat)`** | l'unique point d'entrée | sur la specification | — |

**Le candidat est un objet-valeur**, pas un read-model. Le discriminant du § 1 de
`fiche-objet-valeur.md` le montre : une règle du domaine lit ses valeurs pour décider. Le domaine
raisonne donc avec lui.

Conséquence directe : `V3` s'applique. Le candidat valide à la construction. C'est ce qui rend `S1`
tenable, car un candidat valide garantit la forme de chacune de ses propriétés.

Ne pas le ranger dans `aggregates/`, qui promet une frontière de cohérence qu'il n'a pas. Voir `X1`
de `fiche-racine-agregat.md`.

### Plusieurs prédicats, et le prédicat vide

Une specification peut porter **plusieurs prédicats indépendants** sur le même candidat. C'est le cas
quand le métier distingue plusieurs questions, par exemple « cet utilisateur est-il concerné ? » et
« a-t-il accompli ce qui est demandé ? ». Chaque prédicat est un arbre distinct, évalué séparément.

Les deux énumérations du format sont typiquement celles-ci : un type de critère, et une modalité de
comparaison.

```js
export const TYPES = { COMPOSE: 'compose', CAPPED_TUBES: 'cappedTubes', OBJECT: { … } };
export const COMPARISONS = { ALL: 'all', ONE_OF: 'one-of' };
```

Un prédicat **vide** est vrai par vacuité : une composition `all` sur une liste vide renvoie `true`.
Ce n'est pas un défaut, c'est la sémantique attendue. Il faut le savoir : un prédicat vide ne filtre
plus aucun candidat.

### Le format d'une specification pilotée par les données est un contrat publié

Dès qu'une specification est écrite à la main (JSON en base, CSV d'import, interface d'administration),
son format devient un **Published Language** au sens d'Evans. Trois conséquences suivent :

- ses clés ne se renomment pas pour des raisons de style interne, même si elles jurent avec les
  conventions du code ;
- toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable ;
- un format publié se versionne ou s'étend, il ne se casse pas.

C'est `S6`. Ces trois conséquences distinguent ce format de toute autre structure interne.

### Ce qu'une Specification n'est pas

Si le code correspond à une ligne, ce n'est pas une Specification.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| charge les données du candidat | un repository, puis un usecase qui assemble le candidat | `fiche-repository.md`, `fiche-usecase.md` |
| décide quoi faire du résultat | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle sur un seul objet, sans composition | l'entité ou l'objet-valeur concerné | `fiche-entite.md`, `fiche-objet-valeur.md` |
| applique une règle transverse non composable, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| journalise, mesure, trace | l'appelant — voir `X3` | — |
| filtre les critères avant d'évaluer | nulle part : c'est `S8` | — |
| enrichit le candidat en cours d'évaluation | le usecase, avant l'appel | `fiche-usecase.md` |

---

## 2. Invariants

### Les invariants hérités de l'objet-valeur

Les critères et le candidat sont des objets-valeurs. Les invariants `V1`, `V2`, `V3`, `V4`, `V6` et
`V7` de `fiche-objet-valeur.md` **s'appliquent**. Leurs énoncés, illustrations et pièges sont dans
`fiche-objet-valeur.md`.

Deux de ces pièges comptent en particulier ici : le champ public sur une classe de base abstraite, et
le gel inopérant sur un objet dont l'état est privé.

Deux invariants hérités, `V3` et `V4`, jouent un rôle particulier dans un moteur de règles.

**`V3` : validation à la construction.** Elle élimine le cas d'une specification malformée au moment
de l'évaluation. Un arbre invalide ne s'instancie pas, donc `isSatisfiedBy` n'a rien à vérifier. Sans
elle, `S1` et `S2` deviennent inextricables. Voir la distinction des trois cas sous `S2`.

La validation s'applique à tous les niveaux de l'arbre : la specification, les combinateurs, les
critères, les comparaisons élémentaires. Chacun a son schéma.

**`V4` : pureté.** Aucune I/O, aucun effet de bord. Le candidat entre, un booléen sort. L'entorse la
plus fréquente est la journalisation. C'est `X3` au § 5, qui donne la correction.

### S1. La specification est totale

**Énoncé.** `isSatisfiedBy` est définie pour tout candidat valide, y compris incomplet. Une donnée
absente rend `false`.

Le point sensible est toujours le même : l'accès à une propriété du candidat.

La forme fautive « sans garde » n'existe pas telle quelle dans le code. Elle est dérivée de
`ObjectRequirement.isFulfilled`. Dans cette méthode, une propriété absente et non tableau est transmise
à `#criterion.check()`, qui lève en lisant `item[this.#key]` sur un `item` `undefined`.

```js
// fautif — dérivé de ObjectRequirement.isFulfilled : une propriété absente et non tableau atteint
// #criterion.check() sans garde ; check() lève en lisant item[this.#key] sur un item undefined
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

Le candidat contribue aussi à la totalité. Sa validation à la construction, `V3`, la garantit :

```js
// une projection : la propriété est toujours un objet, ses champs peuvent être undefined
this.organizationLearner = { id: organizationLearner?.id };

// une valeur par défaut : la collection est toujours itérable
constructor({ campaignParticipations = [] }) { … }
```

**Ce qui casse.** Une specification mal câblée lève dans un job asynchrone, où l'exception est souvent
avalée par un `try/catch` que personne ne relit. Le défaut est silencieux et le résultat manquant est
attribué au métier.

**À proscrire : plusieurs modes de réponse pour la même erreur de câblage.** Si certaines propriétés
lèvent, d'autres rendent `false` par projection, et d'autres `false` par collection vide, le
comportement dépend du critère écrit. Le diagnostic devient impossible.

### S2. « Non satisfait » et « non évaluable » sont distincts

**Énoncé.** Une specification renvoie un booléen quand elle a pu conclure, et signale explicitement
qu'elle n'a pas pu conclure.

Cet invariant peut sembler contredire `S1`, qui interdit de lever. Cette contradiction n'est
qu'apparente. Elle vient de trois cas qu'il faut séparer :

| Cas | Réponse | Invariant |
| --- | --- | --- |
| Une donnée du candidat est **absente** | `false` — c'est une réponse légitime | `S1` |
| La **specification** est malformée : type de critère inconnu, comparaison inapplicable | **ne peut pas arriver** : l'arbre ne s'instancie pas | `V3` |
| Une donnée du candidat est **présente mais inexploitable** : type inattendu, valeur hors domaine | non évaluable, à signaler | `S2` |

Le périmètre de `S2` est donc le troisième cas, et lui seul. C'est le seul qui subsiste à l'exécution
quand `V3` est tenu. Il vient toujours de l'extérieur du domaine : une donnée chargée qui n'a pas la
forme attendue.

```js
// fautif — extrait simplifié de CriterionProperty.check() : construit l'erreur, la journalise,
// puis rend false. Indiscernable d'un candidat qui ne remplit simplement pas le critère
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

Trois sorties sont possibles, **à choisir une fois pour tout le moteur** :

- lever une erreur du domaine ;
- renvoyer un résultat à trois états ;
- renvoyer un booléen accompagné d'une liste de diagnostics.

Le défaut n'est pas de choisir une sortie plutôt qu'une autre. C'est de ne pas choisir.

**Ce qui casse.** Une specification cassée devient indiscernable d'un candidat qui ne remplit pas les
critères. Un utilisateur privé de son résultat par un défaut est traité comme un utilisateur qui n'y a
pas droit, et personne ne le sait. Voir `X2` au § 5.

### S5. La composition est fermée

**Énoncé.** Un combinateur accepte n'importe quel critère comme enfant, y compris un autre
combinateur, et propage le candidat sans le transformer.

Le conforme est le vrai `ComposedRequirement.isFulfilled`, sans sa journalisation (voir `X3` au
§ 5). Le fautif n'a pas d'occurrence dans le code : c'est une variante hypothétique, avec les mêmes
noms, qui inspecte le type de ses enfants.

```js
// conforme — dérivé de ComposedRequirement.isFulfilled : le combinateur ne connaît que
// l'interface, pas les types concrets
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

**Ce qui casse.** Exprimer une condition métier nouvelle demande alors de modifier le moteur. C'est
exactement ce que le pattern sert à éviter.

Généralement déjà tenu : c'est un invariant **à protéger**, pas à conquérir. Un combinateur qui refuse
un type d'enfant, ou qui modifie le candidat avant de le passer, casse la propriété.

### S6. Le format est un contrat publié

**Énoncé.** Toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable.
Aucune clé existante n'est renommée. Voir § 1.

L'illustration la plus visible de cet invariant est un **nom de champ** : une clé du format publié
garde sa casse d'origine dans le modèle, même quand elle jure avec les conventions du code.

```js
// conforme — extrait réel de BaseRequirement
class BaseRequirement {
  requirement_type;   // snake_case, parce que c'est la clé du format écrit à la main
  comparison;
}

// fautif — hypothétique : aucune occurrence réelle, le champ n'a jamais été renommé
class BaseRequirement {
  requirementType;
  comparison;
}
```

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
format existe dans le dépôt. Elle n'existe pas.

### S7. Tout critère déclaré est branché sur le candidat

**Énoncé.** Quand la résolution d'une propriété du candidat se fait par nom, l'énumération des noms
autorisés et la surface du candidat forment un contrat implicite. Il doit être vérifié.

Ajouter un critère demande plusieurs étapes, dans plusieurs fichiers :

- exposer la propriété sur le candidat ;
- enregistrer le nom dans l'énumération ;
- charger la donnée dans le repository qui assemble le candidat.

**Seule l'étape d'enregistrement est validée.** Elle l'est par le schéma du format :

```js
requirement_type: Joi.string().valid(...Object.values(TYPES.OBJECT))
```

Rien ne valide les deux autres. Un nom peut donc entrer dans l'énumération, passer le schéma, et
ne correspondre à aucune propriété du candidat.

```js
// fautif — extrait réel de ObjectRequirement.isFulfilled : le nom traverse tel quel,
// sans vérifier qu'une propriété du candidat lui correspond
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

**Ce qui casse.** Un nom enregistré sans donnée derrière produit une violation de `S1` : selon la
forme de la propriété, une exception ou un `false` définitif et silencieux. Le critère est écrit. Il
paraît actif, mais il ne l'est pas.

**L'exception à prévoir.** Un critère qui porte un algorithme (un calcul, un seuil, une agrégation)
n'utilise pas la résolution par nom. Il appelle une méthode nommée du candidat. Il est hors du périmètre
de `S7` et n'entre pas dans l'énumération. Il faut le distinguer explicitement, sinon la vérification
produit un faux positif.

### S8. Un consommateur ne redéfinit pas la specification

**Énoncé.** Un consommateur évalue une specification, ou n'en fait rien. Il ne choisit pas quels
critères comptent.

Les trois degrés de violation, du moins au plus grave :

```js
// 1. il lit la forme interne du format — extrait réel, CombinedCourseBlueprint.targetProfileIds
const ids = quest.successRequirements.map(({ data }) => parseInt(data.targetProfileId.data));

// 2. il évalue une exigence isolée
const done = requirement.isFulfilled(dataInput);

// 3. il reconstruit la specification avec un sous-ensemble — extrait réel,
// CombinedCourseDetails.isSuccessful()
const successRequirements = this.quest.successRequirements.filter(
  (requirement) => requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
);
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

**Ce qui casse.** Le troisième est rédhibitoire : aucune API publiée ne peut exposer « réinstancie mon
agrégat avec d'autres critères ». Tant que `S8` est violé, le moteur ne peut pas devenir un contexte
borné distinct de ses consommateurs. L'ADR 55 reste inapplicable à cette frontière.

À l'inverse, un consommateur conforme se contente d'évaluer :

```js
// conforme — extrait réel, CombinedCourseDetails : le consommateur évalue, il ne redéfinit rien
const isCompleted = dataForQuest ? requirement.isFulfilled(dataForQuest) : false;
```

Le besoin métier derrière est souvent légitime : un critère qui ne doit pas bloquer dans certaines
conditions. Mais il doit devenir une **propriété explicite** du modèle du consommateur, pas un filtrage
de critères au moment d'évaluer. Voir `X1` au § 5.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un prédicat vide est vrai par vacuité | **autorisé**, c'est la sémantique de la composition `all`. Effet à connaître : le prédicat ne filtre plus aucun candidat |
| Un critère algorithmique hors de l'énumération, appelant une méthode du candidat | **autorisé**, hors périmètre de `S7` |
| Un critère sans modalité de comparaison, quand la notion n'a pas de sens pour lui | **autorisé** : un seuil ne se compare pas « une parmi » |
| Une méthode du candidat qui rend une valeur neutre sur entrée non exploitable | **autorisé**, et c'est `S1` bien appliqué |
| Un candidat construit en deux temps, avec un accesseur pour la partie coûteuse à charger | **autorisé** si l'appelant renseigne avant usage. C'est une optimisation, pas une violation de `S1`. À documenter, sinon un relecteur la corrigera |
| Une specification aux prédicats **tous** vides | **cas dégénéré**, pas une exception. Elle est satisfaite par tout candidat. À interdire à l'écriture, pas à l'évaluation |
| Le consommateur porte une propriété qui neutralise un critère | **autorisé**, c'est la réponse conforme à `S8` — une propriété du modèle, pas un filtrage |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **S8** pas de redéfinition par le consommateur | **forte** | C'est le préalable à toute API publiée du moteur, donc à sa réutilisation par un autre contexte |
| **S1** totalité | **forte** | Une specification mal câblée devient un test rouge au lieu d'une exception avalée dans un job |
| **S2** non satisfait ≠ non évaluable | **forte** | Un utilisateur privé de son résultat par un défaut cesse d'être indiscernable d'un utilisateur qui n'y a pas droit |
| **S6** format publié | **forte** | Les specifications déjà écrites continuent de fonctionner, et leur documentation reste vraie |
| **S7** correspondance énumération ↔ candidat | moyenne | Interdit une classe de pannes silencieuses pour dix lignes de test |
| **S5** fermeture par composition | hygiène | Exprimer une condition métier arbitraire sans toucher au moteur. Généralement déjà tenu, donc à protéger plutôt qu'à conquérir |

**Pourquoi quatre invariants sur six sont en rentabilité forte.** C'est inhabituel dans le corpus. Les
modes de défaillance d'un moteur piloté par les données sont silencieux, mais visibles par
l'utilisateur.

Ses entrées sont écrites à la main, hors du code, par des gens qui ne lisent pas les logs. Son
évaluation a lieu dans des jobs. Un défaut ne casse rien : il produit un résultat faux que personne ne
relie à sa cause.

Les invariants hérités gardent le ROI qu'ils ont dans `fiche-objet-valeur.md`. `V3` y est en
rentabilité forte. C'est ici que ce classement se justifie le plus : `V3` élimine un des trois cas de
`S2`.

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si les critères d'une specification donnée sont les bons. Aucun ne dit
si les identifiants qu'elle référence existent. La cohérence référentielle d'un format piloté par les
données est un sujet distinct. Elle se traite à l'écriture, pas à l'évaluation.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `S`, qui est le préfixe des invariants de cette fiche.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un consommateur reconstruit la specification | dérive | Aucune API publiée ne peut couvrir cet usage : le moteur ne peut pas être isolé dans un contexte borné distinct | Le besoin métier est satisfait immédiatement, sans toucher au moteur | **À corriger** |
| **X2** « Non satisfait » et « non évaluable » sont confondus | dérive | Une specification cassée est indiscernable d'un candidat non conforme, et le défaut atteint l'utilisateur sans trace | Journaliser puis rendre `false` est plus court à écrire, et ne casse rien tout de suite | **À corriger** |
| **X3** La specification journalise | dérive | Le domaine dépend de l'infrastructure, et le coût d'évaluation cesse d'être prévisible | Réel — un moteur piloté par les données est difficile à déboguer sans trace | **À corriger** |
| **X4** La résolution d'une propriété du candidat se fait par nom | convention assumée | Rien ne garantit qu'un nom corresponde à une donnée. C'est ce qui rend `S7` nécessaire | Réel — le format s'étend sans toucher au moteur, et une specification nouvelle ne demande aucun déploiement | *À surveiller* |

L'écart « le candidat est rangé avec les agrégats » n'est pas listé ici : il est énoncé sous `X1` de
`fiche-racine-agregat.md`, où se trouve le dossier fautif.

### X1. Un consommateur reconstruit la specification

**Ce que dit la théorie.** Un contexte borné expose un contrat, pas sa forme interne. Evans traite le
sujet sous *Bounded Context* et *Anticorruption Layer*. L'ADR 55 le décide pour Pix.

**Exemple concret.** Le troisième degré de violation de `S8`, extrait réel de
`CombinedCourseDetails.isSuccessful()` :

```js
const successRequirements = this.quest.successRequirements.filter(
  (requirement) => requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
);
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

Le consommateur ne consomme pas un service, il réassemble le modèle d'un autre.

**Correction.** Faire du besoin une propriété explicite du modèle du consommateur. « Ce critère ne doit
pas bloquer dans telles conditions » devient une donnée que le consommateur porte, et que la
specification reçoit. Dans l'état cible, le consommateur ne modifie plus l'arbre des critères.

Puis une **couche de traduction unique** entre le vocabulaire du consommateur et le format de la
specification, dans les deux sens. Elle doit couvrir l'écriture et la lecture. Une traduction qui ne
sert qu'à créer la specification laisse le chemin de lecture accéder au format en direct. Le couplage
reste entier.

C'est un chantier de conception, pas un déplacement de fichiers. La règle `dependency-cruiser` qui
interdirait l'accès direct ne peut être écrite qu'après. Elle est la conséquence du découpage, pas son
moyen.

### X2. « Non satisfait » et « non évaluable » sont confondus

**Ce que dit la théorie.** Evans et Fowler traitent la Specification comme un prédicat total. Ils ne
traitent pas le cas d'une specification non évaluable. L'écart porte donc sur une exigence que les
sources ne formulent pas, mais que le caractère piloté par les données impose.

**Exemple concret.**

```js
// extrait de CriterionProperty.check(), déjà montré sous S2
logger.error({ event: 'quest-reward', err: error }, 'Error on quests criterion property');
return false;
```

Le signe : un `return false` précédé d'une journalisation. Le code traite un incident comme une
réponse.

**Correction.** Choisir une des trois sorties de `S2` :

- erreur du domaine ;
- résultat à trois états ;
- booléen plus diagnostics.

Puis l'appliquer partout. Le choix se fait une fois, au niveau du moteur, pas critère par critère.

Chaque site d'appel doit alors traiter le nouveau cas, et décider ce qu'il en fait. La correction n'est
donc pas mécanique. C'est ce qui explique que l'écart perdure.

### X3. La specification journalise

**Ce que dit la théorie.** Le domaine ne dépend pas de l'infrastructure. C'est `V4`, et la règle de
dépendance de Clean Architecture.

**Exemple concret.**

```js
// dans un objet-valeur du moteur — l'import
import { logger } from '…/shared/infrastructure/utils/logger.js';

// et son usage, au cœur de l'évaluation
isFulfilled(dataInput) {
  const isFulfilled = this.#subRequirements[comparisonFunction](…);

  logger.debug({ name: this.requirement_type, comparisonFunction, isFulfilled });

  return isFulfilled;
}
```

La trace dit quel critère a conclu quoi. C'est l'information nécessaire pour déboguer un moteur piloté
par les données. Le besoin est réel, l'endroit non.

**Correction.** Garder la trace, mais la rendre à l'appelant.

```js
// la specification reste pure, l'appelant décide quoi faire de la trace
isFulfilled(dataInput) {
  return { fulfilled: …, trace: [{ name: this.requirement_type, … }] };
}
```

L'appelant, un usecase, journalise s'il le veut. La specification reste testable sans doublure. Son
coût d'évaluation redevient prévisible.

Cette correction croise `S2` : le même canal de retour peut porter les diagnostics de non-évaluabilité
et la trace de décision. Les traiter ensemble coûte moins que séparément.

### X4. La résolution d'une propriété du candidat se fait par nom

**Ce que dit la théorie.** Rien : la résolution par nom est un choix d'implémentation, pas un écart
avec le pattern. L'écart est avec la vérifiabilité.

**Exemple concret.**

```js
const items = dataInput[this.requirement_type];   // requirement_type vient du format, en base
```

Le nom est stocké en base de données, donc aucun outil ne peut lier la déclaration à son usage.

**Correction.** Aucune sur le principe. La résolution par nom permet d'écrire une specification
nouvelle sans déploiement. C'est le bénéfice central du pattern piloté par les données.

Ce qui est à tenir, c'est la compensation : le test de `S7` vérifie l'étape que rien d'autre ne valide.
Il coûte dix lignes. Sans lui, rien ne compense le coût de la convention.

Ce qui changerait ce verdict : le typage. Un nom de critère typé en `keyof Candidate`, plutôt qu'en
`string`, rend la déclaration sans propriété impossible à la compilation. Voir § 7. À ce moment-là,
`X4` cesse d'être un écart, et le test de `S7` devient inutile.

---

## 6. Vérification déterministe

Les invariants propres se vérifient par des tests plutôt que par du lint, parce que les ensembles
suivants sont finis et déclarés :

- la liste des types de critères ;
- la liste des comparaisons ;
- la surface du candidat.

Un test boucle sur ces ensembles et affirme une propriété. C'est plus simple et plus robuste qu'une
analyse d'AST.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **S7** énumération ↔ candidat | test de correspondance sur une instance | ~10 lignes | aucun |
| **S1** totalité | test de totalité paramétré sur les énumérations | ~30 lignes | aucun |
| **S5** fermeture par composition | test : un combinateur accepte chaque type d'enfant, imbrication comprise | ~20 lignes | aucun |
| **S6** format publié | test comparant les énumérations à une documentation versionnée | ~15 lignes | **impossible aujourd'hui** : la documentation n'existe pas |
| **S8** pas de redéfinition | règle `dependency-cruiser`, **après** le découpage de `X1` | configuration | — |
| **S2** | revue | — | — |
| Invariants hérités | voir § 6 de `fiche-objet-valeur.md` | — | — |

### S7 — le test le plus rentable, et l'erreur à ne pas refaire

La forme naïve est **fausse** :

```js
// FAUX — inspecte le prototype, alors que le contrat porte sur l'instance
for (const name of Object.values(TYPES.OBJECT)) {
  expect(Object.getOwnPropertyNames(DataForQuest.prototype)).to.include(name);
}
```

`Object.getOwnPropertyNames(Candidate.prototype)` ne voit que les méthodes et les accesseurs déclarés
sur le prototype. Un candidat qui expose ses propriétés par **champs assignés au constructeur** (la
forme montrée au § 1) n'a rien sur son prototype. Le test échoue donc sur du code correct. Et il ne dit
rien du cas inverse.

La forme juste interroge une instance :

```js
const dataInput = new DataForQuest({ eligibility: {}, success: {} });
for (const name of Object.values(TYPES.OBJECT)) {
  expect(name in dataInput, `le critère « ${name} » n'a aucune propriété sur le candidat`).to.be.true;
}
```

`in` couvre les champs propres, les accesseurs du prototype et les méthodes : les trois formes sous
lesquelles une propriété du candidat peut exister. Le message d'échec nomme le critère fautif. Sans
ce message, un échec du test est inexploitable.

Dix lignes, aucun faux positif. Si le test passe déjà, il sert de test de non-régression : il interdit
une classe entière de pannes silencieuses.

**Extension plus coûteuse mais utile.** Vérifier que la propriété est renseignée par le repository qui
assemble le candidat, pas seulement exposée. Cela demande une fixture, donc un test d'intégration.

### S1 — test de totalité

```js
const empty = new DataForQuest({ eligibility: {}, success: {} });
for (const name of Object.values(TYPES.OBJECT)) {
  const requirement = buildRequirement({ requirement_type: name, /* … */ });
  expect(() => requirement.isFulfilled(empty)).to.not.throw();
}
```

À étendre à chaque valeur de l'énumération des comparaisons, et à un candidat dont chaque propriété est
absente à tour de rôle.

**Ne pas l'étendre** aux parties du candidat volontairement chargées en deux temps. Voir § 3.

### S6 — ce qui manque avant de pouvoir le tester

Le test est trivial : comparer les valeurs des énumérations du code à une liste documentée. Il ne peut
pas encore être écrit, parce que la liste documentée n'existe pas.

C'est donc le premier travail sur cet invariant. Il ne s'agit pas d'outillage : produire la
documentation du format, versionnée dans le dépôt, puis le test qui l'oppose au code. Dans cet ordre.

### Ce qui n'est pas mécanisable

`S2` demande de juger si une distinction sémantique est faite au bon endroit. Le choix de la sortie est
une décision, pas une propriété vérifiable.

`S8` est un chantier de conception. La règle qui l'interdirait ne peut être écrite qu'une fois le
découpage réalisé : elle en est la conséquence, pas le moyen. C'est la différence avec les autres
lignes de cette table.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **S7** : dix lignes, sur une instance et non sur le prototype
2. **S1** : test paramétré sur les énumérations
3. **S5** : test de composition
4. **Invariants hérités** : la règle de chemin et la règle sur les champs publics, mutualisées avec
   `fiche-objet-valeur.md`
5. **S6** : documenter le format, puis le test qui l'oppose au code
6. **S2** : choisir la sortie, puis reprendre les sites d'appel
7. **S8** : après le découpage de `X1`, la règle de chemin qui le verrouille

### Codemods

Peu rentables ici, contrairement à la fiche repository.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** journalisation | préparation seule | Repérer les imports fautifs, oui. Décider du canal de retour de la trace, non |
| **X2** sortie de non-évaluabilité | non | Chaque site d'appel doit décider ce qu'il fait du nouveau cas |
| **X1** redéfinition | non | C'est de la conception |

Aucun de ces écarts ne se corrige mécaniquement. Chacun demande une décision :

- `X3` : ce que devient la trace ;
- `X2` : quel canal pour signaler l'inévaluable ;
- `X1` : quel découpage entre le moteur et ses consommateurs.

Pour les invariants, le test et la règle suffisent : aucun codemod n'est nécessaire.

---

## 7. Le type

Le pattern se type bien, et c'est une bonne cible de migration : peu de fichiers, aucune I/O, frontière
nette.

```ts
export type DataForQuest = {
  readonly organizationLearner?: { readonly id: number };
  readonly campaignParticipations: readonly CampaignParticipation[];
};

export type Requirement<D> = {
  isFulfilled(dataInput: D): boolean;
};
```

Deux bénéfices. Ils portent précisément sur les invariants les plus souvent en défaut.

**`S1` devient partiellement structurel.** Un candidat aux propriétés optionnelles force le traitement
de l'absence à la compilation : sous `strict`, un accès non gardé ne compile plus. Ce qui reste à la
charge du code : la valeur présente mais hors domaine, qui est le périmètre de `S2`.

**`S7` devient structurel, et `X4` disparaît.** Un `requirement_type` typé en `keyof DataForQuest`,
plutôt qu'en `string`, rend impossible la déclaration d'un critère sans propriété correspondante. Le
test de `S7` devient alors inutile. C'est le seul endroit du corpus où le typage retire un test au lieu
d'en ajouter un.

La limite à connaître : ce bénéfice suppose que le nom vienne du code. Un nom qui vient de la base de
données reste une chaîne au moment où il arrive. La vérification se déplace alors vers la validation du
format, `V3`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Specification, combinateurs, critères, comparaisons | **unitaire pur** — aucune base, aucune doublure | la logique de composition et de comparaison |
| Totalité et modes d'échec | **unitaire paramétré** sur les énumérations | `S1` et `S2`, en énumérant plutôt qu'en listant des cas |
| Le candidat et ses valeurs par défaut | **unitaire** | l'assemblage, et la forme garantie de chaque propriété |
| Correspondance énumération ↔ candidat | **unitaire** | `S7`, sur une instance |
| Les repositories qui assemblent le candidat | **intégration** | que chaque propriété est effectivement renseignée |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Deux indices de diagnostic, avec leurs exceptions.

**Une specification qui a besoin d'une doublure pour être testée en unitaire viole `V4`.** La doublure
n'est pas une contrainte du test, c'est le diagnostic. Cet indice n'a pas d'exception : aucune
specification conforme n'en demande une.

**Un test qui liste des cas au lieu d'énumérer est un signal.** Le domaine est fini et déclaré. Un test
écrit cas par cas se périme dès qu'une valeur est ajoutée à une énumération, et personne ne le saura.
L'exception : les cas limites d'une comparaison particulière se listent légitimement.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. Une ligne `[auto]` disparaît de la checklist dès que
la règle ou le test correspondant existe. Une ligne `[partiel]` reste, réduite à ce que la règle ou le
test ne couvre pas. Une ligne `[humain]` reste entière : aucun moyen déterministe n'est identifié.

Les quatre dernières lignes reprennent les invariants hérités de `fiche-objet-valeur.md`.

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
[ ] [humain]  Avant de signaler S1 ou S7, vérifier les exceptions du § 3
```

À terme, il reste huit lignes. Cinq sont de jugement : `S8`, `S2`, `V3`, la forme des tests et le
rappel des exceptions. Trois sont partielles, réduites à ce que le test ou la règle ne couvre pas :
`S6`, `S7` pour le chargement de la propriété, et `V7` pour les accès imbriqués. `S8` et `S2` restent de jugement parce que leurs écarts, `X1` et `X2`, se corrigent par une
décision que rien ne vérifie ensuite. C'est cohérent avec le § 5.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le cadrage — c'est une Specification, pas un modèle ordinaire | Evans, *DDD*, ch. « Making Implicit Concepts Explicit » | Evans & Fowler, PDF gratuit |
| **S1** totalité | Evans & Fowler, « Specifications » | <https://martinfowler.com/apsupp/spec.pdf> |
| **S2** non satisfait ≠ non évaluable | **aucune source.** Les sources traitent la Specification comme un prédicat total et ne traitent pas le cas d'une donnée présente mais inexploitable | — |
| **S5** fermeture par composition | Evans & Fowler, « Specifications » — la composition y est explicite | même PDF |
| **S6** format publié | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language** | *DDD Reference*, PDF gratuit |
| **S7** énumération ↔ candidat | **aucune source.** Contrainte propre à la résolution par nom, donc à `X4` | — |
| **S8** pas de redéfinition par le consommateur | Evans, même ch. — **Anticorruption Layer**, **Bounded Context**. Pix : **ADR 55** | ADR 55 ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| Le candidat est un objet-valeur | Discriminant du § 1 de `fiche-objet-valeur.md`, sans source externe. Evans pour la catégorie Value Object | *DDD Reference* |
| Invariants hérités | voir § 10 de `fiche-objet-valeur.md` | — |

Deux invariants propres sur six n'ont **aucune source** : `S2` et `S7`. Ils se discutent sur leurs
mérites, pas par appel à une autorité. Ils ont la même origine : le caractère piloté par les données du
moteur, que les sources ne traitent pas.

Tout le reste dépend du cadrage : si un objet n'est pas une Specification, les invariants ci-dessus
ne s'appliquent pas. Le PDF gratuit d'Evans & Fowler suffit pour en juger.
