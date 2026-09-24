# Specification — écarts

Suivi : où le code des specifications s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un consommateur reconstruit la specification | dérive | Aucune API publiée ne peut couvrir cet usage : le moteur ne peut pas être isolé dans un Bounded Context distinct | Le besoin métier est satisfait immédiatement, sans toucher au moteur | **À corriger** |
| **X2** « Non satisfait » et « non évaluable » sont confondus | dérive | Une specification cassée est indiscernable d'un candidat non conforme, et le défaut atteint l'utilisateur sans trace | Journaliser puis rendre `false` est plus court à écrire, et ne casse rien tout de suite | **À corriger** |
| **X3** La specification journalise | dérive | Le domaine dépend de l'infrastructure, et le coût d'évaluation cesse d'être prévisible | Réel : un moteur piloté par les données est difficile à déboguer sans trace | **À corriger** |
| **X4** La résolution d'une propriété du candidat se fait par nom | convention assumée | Rien ne garantit qu'un nom corresponde à une donnée. C'est ce qui rend `S7` nécessaire | Réel : le format s'étend sans toucher au moteur, et une specification nouvelle ne demande aucun déploiement | *À surveiller* |

L'écart « le candidat est rangé avec les Aggregates » n'est pas listé ici : il est énoncé sous `X1` de
`../racine-agregat/ecarts.md`, où se trouve le dossier fautif.

---

### X1. Un consommateur reconstruit la specification

**Exemple concret.** Le troisième degré de violation de
[`S8`](README.md#s8-un-consommateur-ne-redéfinit-pas-la-specification) :

```js
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

**Code.** [`CombinedCourseDetails.isSuccessful`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js#L302-L321).

Le consommateur ne consomme pas un service, il réassemble le modèle d'un autre.

**Verdict.** À corriger. Le bénéfice, un besoin satisfait sans toucher au moteur, ne compense pas le
coût : le moteur ne peut pas devenir un Bounded Context distinct. La théorie est dans
[`explication.md`](explication.md#x1-un-consommateur-reconstruit-la-specification).

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

**Exemple concret.**

```js
if (error) {
  logger.error({ event: 'quest-reward', err: error }, 'Error on quests criterion property');
}
return false;
```

**Code.** [`CriterionProperty.check`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/CriterionProperty.js#L127-L130), déjà montré sous
[`S2`](README.md#s2--non-satisfait--et--non-évaluable--sont-distincts).

Le signe : un `return false` précédé d'une journalisation. Le code traite un incident comme une
réponse.

**Verdict.** À corriger. Le seul bénéfice est un code plus court à écrire. La théorie est dans
[`explication.md`](explication.md#x2--non-satisfait--et--non-évaluable--sont-confondus).

**Correction.** Choisir une des trois sorties de `S2` :

- erreur du domaine ;
- résultat à trois états ;
- booléen plus diagnostics.

Puis l'appliquer partout. Le choix se fait une fois, au niveau du moteur, pas critère par critère.

Chaque site d'appel doit alors traiter le nouveau cas, et décider ce qu'il en fait. La correction n'est
donc pas mécanique. C'est ce qui explique que l'écart perdure.

### X3. La specification journalise

**Exemple concret.**

```js
// dans un Value Object du moteur — l'import
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';

// et son usage, au cœur de l'évaluation
isFulfilled(dataInput) {
  const comparisonFunction = getComparisonFunction(this.comparison);

  const isFulfilled = this.#subRequirements[comparisonFunction]((subRequirement) =>
    subRequirement.isFulfilled(dataInput),
  );

  logger.debug({
    name: this.requirement_type,
    comparisonFunction,
    isFulfilled,
  });

  return isFulfilled;
}
```

**Code.** L'import : [`Requirement.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L4). L'usage : [`ComposedRequirement.isFulfilled`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L98-L112).

La trace dit quel critère a conclu quoi. C'est l'information nécessaire pour déboguer un moteur piloté
par les données.

**Verdict.** À corriger. Le besoin est réel, l'endroit non. La théorie est dans
[`explication.md`](explication.md#x3-la-specification-journalise).

**Correction.** Garder la trace, mais la rendre à l'appelant.

```js
// la specification reste pure, l'appelant décide quoi faire de la trace
isFulfilled(dataInput) {
  return { fulfilled: …, trace: [{ name: this.requirement_type, … }] };
}
```

**Code.** Hypothétique.

L'appelant, un usecase, journalise s'il le veut. La specification reste testable sans doublure. Son
coût d'évaluation redevient prévisible.

Cette correction croise `S2` : le même canal de retour peut porter les diagnostics de non-évaluabilité
et la trace de décision. Les traiter ensemble coûte moins que séparément.

### X4. La résolution d'une propriété du candidat se fait par nom

**Exemple concret.**

```js
if (Array.isArray(dataInput[this.requirement_type])) {   // requirement_type vient du format, en base
  const isFulfilled = dataInput[this.requirement_type].some((item) => {
```

**Code.** [`ObjectRequirement.isFulfilled`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L166-L167).

Le nom est stocké en base de données, donc aucun outil ne peut lier la déclaration à son usage.

**Verdict.** À surveiller. La résolution par nom permet d'écrire une specification nouvelle sans
déploiement. C'est le bénéfice central du pattern piloté par les données. La théorie est dans
[`explication.md`](explication.md#x4-la-résolution-dune-propriété-du-candidat-se-fait-par-nom).

**Correction.** Aucune sur le principe. La compensation est le test de
[`S7`](README.md#s7-tout-critère-déclaré-est-branché-sur-le-candidat) : il vérifie l'étape que rien
d'autre ne valide. Il coûte dix lignes. Sans lui, rien ne compense le coût de la convention.

**Révision.** Le typage change ce verdict. Un nom de critère typé en `keyof Candidate`, plutôt qu'en
`string`, rend la déclaration sans propriété impossible à la compilation. Voir
[`outillage.md`](outillage.md#vérifier-par-le-typage). `X4` cesse alors d'être un écart, et le test de
`S7` devient inutile.
