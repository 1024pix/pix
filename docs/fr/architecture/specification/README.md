# Specification

Une Specification répond à une question : ce candidat remplit-il ces critères ? Dans Pix, une quête en
est une. Elle décide par exemple si un élève a droit à l'attestation de sixième. Ses critères sont
écrits en JSON et enregistrés en base, hors du code. Les Specifications se rangent dans
`domain/models/`.

Une Specification a quatre éléments :

- **la specification**, l'arbre des critères. Ici, la quête : une [Entity](../entite/README.md) ;
- **les critères**, les feuilles et les combinateurs de l'arbre. Ce sont des
  [Value Objects](../objet-valeur/README.md) ;
- **le candidat**, l'objet évalué, assemblé pour l'occasion. C'est aussi un Value Object ;
- **la méthode d'évaluation**, ici `isEligible(candidat)`, le seul point d'entrée.

Les critères et le candidat sont des Value Objects : les règles de la fiche Value Object
s'appliquent, plus celles de cette fiche.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [S1](#s1-la-specification-répond-toujours) | La specification répond toujours | une donnée absente du candidat rend `false`, sans lever d'erreur |
| [S2](#s2--non-rempli--et--impossible-à-évaluer--sont-distincts) | « Non rempli » et « impossible à évaluer » sont distincts | une donnée présente mais inexploitable lève une erreur du domaine, elle ne rend pas `false` |
| [S5](#s5-la-composition-est-fermée) | La composition est fermée | un combinateur accepte n'importe quel critère, et passe le candidat sans le modifier |
| [S6](#s6-le-format-est-un-contrat-publié) | Le format est un contrat publié | aucune clé du JSON n'est renommée ; une nouvelle valeur est documentée avant d'être utilisée |
| [S7](#s7-tout-critère-déclaré-est-branché-sur-le-candidat) | Tout critère déclaré est branché sur le candidat | chaque nom de critère est une propriété du candidat, vérifiée par le typage et par un test |
| [S8](#s8-un-consommateur-ne-redéfinit-pas-la-specification) | Un consommateur ne redéfinit pas la specification | le usecase appelle `isEligible()`, sans filtrer ni reconstruire les critères |

## Exemple complet

L'éligibilité à l'attestation de sixième. L'élève y a droit si son organisation est de type `SCO`, si
elle gère des élèves ou porte le tag `AEFE`, et s'il a participé à une campagne d'un profil cible
donné. Le candidat reprend trois champs de l'organisation, dont `isManagingStudents`, lu sur
l'[Aggregate Root](../racine-agregat/README.md) `Organization`. Exemple inventé, d'après
[`Requirement.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/Requirement.js#L63-L191),
[`CriterionProperty.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/value-objects/CriterionProperty.js#L83-L131)
et la quête de sixième des seeds,
[`build-quests.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/db/seeds/data/team-prescription/build-quests.js#L183-L251).

Les critères, tels qu'ils sont écrits en base :

```json
[
  {
    "requirement_type": "organization",
    "comparison": "all",
    "data": { "type": { "data": "SCO", "comparison": "equal" } }
  },
  {
    "requirement_type": "organization",
    "comparison": "one-of",
    "data": {
      "isManagingStudents": { "data": true, "comparison": "equal" },
      "tags": { "data": ["AEFE"], "comparison": "all" }
    }
  },
  {
    "requirement_type": "campaignParticipations",
    "comparison": "all",
    "data": { "targetProfileId": { "data": 123, "comparison": "equal" } }
  }
]
```

```ts
// quest/domain/models/quests/Eligibility.ts — le candidat
type OrganizationData = { type?: string; isManagingStudents?: boolean; tags?: string[] };
type CampaignParticipationData = { id: number; targetProfileId: number };
export type EligibilityProps = { organization?: OrganizationData; campaignParticipations?: CampaignParticipationData[] };

export class Eligibility {
  readonly organization: OrganizationData;
  readonly campaignParticipations: ReadonlyArray<CampaignParticipationData>;

  // S1 : chaque propriété a toujours la même forme ; un champ manquant vaut undefined, une liste manquante est vide
  constructor({ organization = {}, campaignParticipations = [] }: EligibilityProps) {
    this.organization = {
      type: organization.type,
      isManagingStudents: organization.isManagingStudents,
      tags: [...(organization.tags ?? [])],
    };
    this.campaignParticipations = [...campaignParticipations];
  }
}
```

```ts
// quest/domain/models/quests/CriterionProperty.ts — compare un champ du candidat à la valeur attendue
import { InvalidComparisonError, InvalidRequirementError } from '../../errors.js';

// S6 : les valeurs du format publié, documentées avec le format
export const CRITERION_COMPARISONS = { EQUAL: 'equal', ONE_OF: 'one-of', ALL: 'all' } as const;
type CriterionComparison = (typeof CRITERION_COMPARISONS)[keyof typeof CRITERION_COMPARISONS];
type Scalar = string | number | boolean;
export type CriterionJson = { data: Scalar | Scalar[]; comparison: CriterionComparison };

export class CriterionProperty {
  readonly #key: string;
  readonly #expected: Scalar | Scalar[];
  readonly #comparison: CriterionComparison;

  constructor({ key, data, comparison }: { key: string } & CriterionJson) {
    if (comparison !== CRITERION_COMPARISONS.EQUAL && !Array.isArray(data)) {
      throw new InvalidRequirementError(`"${comparison}" needs a list of values`);
    }
    this.#key = key;
    this.#expected = Array.isArray(data) ? [...data] : data;
    this.#comparison = comparison;
  }

  check(item: Record<string, unknown>): boolean {
    const value = item[this.#key];
    if (value === undefined || value === null) return false; // S1 : une donnée absente rend false

    if (this.#comparison === CRITERION_COMPARISONS.EQUAL) return value === this.#expected;

    const expected = this.#expected as Scalar[];
    if (this.#comparison === CRITERION_COMPARISONS.ONE_OF) {
      return Array.isArray(value)
        ? expected.some((expectedValue) => value.includes(expectedValue))
        : expected.includes(value as Scalar);
    }
    if (!Array.isArray(value)) {
      // S2 : la donnée est là, mais on ne peut pas conclure ; on le dit au lieu de rendre false
      throw new InvalidComparisonError({ comparisonOperator: 'all', typeofCriterion: 'array', typeofData: typeof value });
    }
    return expected.every((expectedValue) => value.includes(expectedValue));
  }
}
```

```ts
// quest/domain/models/quests/Requirement.ts — les critères et le combinateur
import { InvalidRequirementError } from '../../errors.js';
import { type CriterionJson, CriterionProperty } from './CriterionProperty.js';
import type { Eligibility } from './Eligibility.js';

// S6 : les valeurs du format publié, documentées avec le format
export const REQUIREMENT_TYPES = {
  COMPOSE: 'compose',
  // S7 : chaque nom est une propriété du candidat, sinon la compilation échoue
  OBJECT: {
    ORGANIZATION: 'organization',
    CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
  } satisfies Record<string, keyof Eligibility>,
} as const;
export const REQUIREMENT_COMPARISONS = { ALL: 'all', ONE_OF: 'one-of' } as const;

type ObjectRequirementType = (typeof REQUIREMENT_TYPES.OBJECT)[keyof typeof REQUIREMENT_TYPES.OBJECT];
type RequirementComparison = (typeof REQUIREMENT_COMPARISONS)[keyof typeof REQUIREMENT_COMPARISONS];
export type RequirementJson =
  | { requirement_type: 'compose'; comparison: RequirementComparison; data: RequirementJson[] }
  | { requirement_type: ObjectRequirementType; comparison: RequirementComparison; data: Record<string, CriterionJson> };

export interface Requirement {
  isFulfilled(candidate: Eligibility): boolean;
}

export class ComposedRequirement implements Requirement {
  readonly #children: Requirement[];
  readonly #comparison: RequirementComparison;

  constructor({ children, comparison }: { children: Requirement[]; comparison: RequirementComparison }) {
    this.#children = [...children];
    this.#comparison = comparison;
  }

  // S5 : un enfant est un critère ou un autre combinateur ; le candidat passe tel quel
  isFulfilled(candidate: Eligibility): boolean {
    return this.#comparison === REQUIREMENT_COMPARISONS.ONE_OF
      ? this.#children.some((child) => child.isFulfilled(candidate))
      : this.#children.every((child) => child.isFulfilled(candidate));
  }
}

export class ObjectRequirement implements Requirement {
  readonly requirement_type: ObjectRequirementType; // S6 : la clé du format garde sa casse snake_case
  readonly #comparison: RequirementComparison;
  readonly #properties: CriterionProperty[];

  constructor({ requirement_type, comparison, data }: Extract<RequirementJson, { requirement_type: ObjectRequirementType }>) {
    this.requirement_type = requirement_type;
    this.#comparison = comparison;
    this.#properties = Object.entries(data).map(([key, criterion]) => new CriterionProperty({ key, ...criterion }));
  }

  isFulfilled(candidate: Eligibility): boolean {
    const value = candidate[this.requirement_type];
    if (value === undefined) return false; // S1 : le nom vient de la base, on ne suppose pas la propriété
    const items = Array.isArray(value) ? value : [value];
    return items.some((item) => this.#matches(item));
  }

  #matches(item: Record<string, unknown>): boolean {
    return this.#comparison === REQUIREMENT_COMPARISONS.ONE_OF
      ? this.#properties.some((property) => property.check(item))
      : this.#properties.every((property) => property.check(item));
  }
}

const isObjectRequirementType = (type: string): type is ObjectRequirementType =>
  (Object.values(REQUIREMENT_TYPES.OBJECT) as string[]).includes(type);

// S6 : traduit le format publié en objets ; le JSON vient de la base, un type inconnu ne s'instancie pas
export function buildRequirement(json: RequirementJson): Requirement {
  if (json.requirement_type === REQUIREMENT_TYPES.COMPOSE) {
    return new ComposedRequirement({ children: json.data.map(buildRequirement), comparison: json.comparison });
  }
  if (!isObjectRequirementType(json.requirement_type)) {
    throw new InvalidRequirementError(`Unknown requirement_type "${json.requirement_type}"`);
  }
  return new ObjectRequirement(json);
}
```

```ts
// quest/domain/models/quests/Quest.ts — la specification, raccourcie à l'éligibilité
import type { Eligibility } from './Eligibility.js';
import { ComposedRequirement, REQUIREMENT_COMPARISONS, type RequirementJson, buildRequirement } from './Requirement.js';

export class Quest {
  readonly id: QuestId;
  readonly #eligibilityRequirements: ComposedRequirement; // S8 : aucun getter sur les critères

  constructor({ id, eligibilityRequirements }: { id: QuestId; eligibilityRequirements: RequirementJson[] }) {
    this.id = id;
    this.#eligibilityRequirements = new ComposedRequirement({
      children: eligibilityRequirements.map(buildRequirement),
      comparison: REQUIREMENT_COMPARISONS.ALL,
    });
  }

  // le seul point d'entrée
  isEligible(eligibility: Eligibility): boolean {
    return this.#eligibilityRequirements.isFulfilled(eligibility);
  }
}
```

```ts
// quest/domain/usecases/reward-user.ts — raccourci : seule l'éligibilité est montrée
const quests = await questRepository.findAllWithReward();
const eligibilities = await eligibilityRepository.find({ userId });

// S8 : le usecase évalue chaque quête entière, il ne choisit pas quels critères comptent
const eligibleQuests = quests.filter((quest) => eligibilities.some((eligibility) => quest.isEligible(eligibility)));
```

## Comment tester

Une Specification se teste avec un test unitaire, sans stub, mock ni spy. Le test passe par la
méthode d'évaluation, et couvre :

- la règle du métier, cas par cas. Exemples : `is eligible for an SCO organization tagged AEFE that
  does not manage students`, `is not eligible for an organization that is not SCO` ;
- la réponse sur un candidat vide, pour chaque type de critère. Le test parcourt l'énumération au lieu
  de lister des cas. Exemple : `answers false on an empty candidate for organization` ;
- l'erreur sur une donnée qu'on ne peut pas comparer. Exemple : `throws when a value cannot be
  compared` ;
- un combinateur dans un combinateur. Exemple : `accepts a combinator inside a combinator` ;
- la correspondance entre l'énumération et le candidat. Exemple : `has a candidate property for every
  requirement type` ;
- le refus d'un type inconnu à la construction. Exemple : `refuses an unknown requirement type`.

Le format publié se teste à part : un test compare les valeurs des énumérations à la documentation du
format, versionnée dans le dépôt. Exemple : `documents every value of the format`.

Le repository qui assemble le candidat se teste avec un test d'intégration : chaque propriété du
candidat est renseignée. Exemple : `loads the organization type, isManagingStudents and tags`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/quest/unit/domain/models/quests/Quest_test.ts
describe('Unit | Quest | Domain | Models | Quest', function () {
  const sixthGradeEligibility: RequirementJson[] = [
    { requirement_type: 'organization', comparison: 'all', data: { type: { data: 'SCO', comparison: 'equal' } } },
    {
      requirement_type: 'organization',
      comparison: 'one-of',
      data: {
        isManagingStudents: { data: true, comparison: 'equal' },
        tags: { data: ['AEFE'], comparison: 'all' },
      },
    },
    {
      requirement_type: 'campaignParticipations',
      comparison: 'all',
      data: { targetProfileId: { data: 123, comparison: 'equal' } },
    },
  ];

  const buildQuest = (eligibilityRequirements: RequirementJson[] = sixthGradeEligibility) =>
    new Quest({ id: 1 as QuestId, eligibilityRequirements });

  const buildEligibility = ({ organization = {} }: EligibilityProps = {}) =>
    new Eligibility({
      organization: { type: 'SCO', isManagingStudents: true, tags: [], ...organization },
      campaignParticipations: [{ id: 1, targetProfileId: 123 }],
    });

  describe('#isEligible', function () {
    it('is eligible for an SCO organization that manages students', function () {
      expect(buildQuest().isEligible(buildEligibility())).to.be.true;
    });

    it('is eligible for an SCO organization tagged AEFE that does not manage students', function () {
      const eligibility = buildEligibility({ organization: { isManagingStudents: false, tags: ['AEFE'] } });

      expect(buildQuest().isEligible(eligibility)).to.be.true;
    });

    it('is not eligible for an organization that is not SCO', function () {
      const eligibility = buildEligibility({ organization: { type: 'PRO' } });

      expect(buildQuest().isEligible(eligibility)).to.be.false;
    });

    for (const requirement_type of Object.values(REQUIREMENT_TYPES.OBJECT)) {
      it(`answers false on an empty candidate for ${requirement_type}`, function () {
        const quest = buildQuest([{ requirement_type, comparison: 'all', data: { id: { data: 1, comparison: 'equal' } } }]);

        expect(quest.isEligible(new Eligibility({}))).to.be.false;
      });
    }

    it('throws when a value cannot be compared', function () {
      const quest = buildQuest([
        { requirement_type: 'organization', comparison: 'all', data: { type: { data: ['SCO'], comparison: 'all' } } },
      ]);

      expect(() => quest.isEligible(buildEligibility())).to.throw(InvalidComparisonError);
    });

    it('accepts a combinator inside a combinator', function () {
      const quest = buildQuest([
        { requirement_type: 'compose', comparison: 'one-of', data: [{ requirement_type: 'compose', comparison: 'all', data: sixthGradeEligibility }] },
      ]);

      expect(quest.isEligible(buildEligibility())).to.be.true;
    });
  });

  describe('constructor', function () {
    it('refuses an unknown requirement type', function () {
      const unknownType = { requirement_type: 'certifications', comparison: 'all', data: {} } as unknown as RequirementJson;

      expect(() => buildQuest([unknownType])).to.throw(InvalidRequirementError);
    });
  });

  describe('Eligibility', function () {
    it('has a candidate property for every requirement type', function () {
      const eligibility = new Eligibility({});

      for (const name of Object.values(REQUIREMENT_TYPES.OBJECT)) {
        expect(eligibility, `no candidate property for "${name}"`).to.have.property(name);
      }
    });
  });
});
```

## Checklist de revue de code

```
Répond-elle toujours ?
[ ] S1  Une donnée absente du candidat rend false, sans lever d'erreur
[ ] S2  Une donnée présente mais inexploitable lève une erreur du domaine, elle ne rend pas false

Peut-on ajouter un critère sans toucher au moteur ?
[ ] S5  Un combinateur accepte tout critère, et passe le candidat sans le modifier
[ ] S7  Chaque nom de critère est une propriété du candidat, et le repository la charge

Les critères déjà écrits en base marchent-ils encore ?
[ ] S6  Aucune clé du format renommée ; toute nouvelle valeur est documentée avant d'être utilisée

Qui décide du résultat ?
[ ] S8  Le consommateur appelle la méthode d'évaluation, sans filtrer ni reconstruire les critères

Tests
[ ] Un test unitaire, sans stub, mock ni spy
[ ] Les tests de S1 et S7 parcourent les énumérations au lieu de lister des cas
```

## Référence des règles

### S1. La specification répond toujours

**La règle.** La méthode d'évaluation rend un booléen pour tout candidat valide, même incomplet. Une
donnée absente du candidat rend `false`. Le candidat y aide : son constructeur donne toujours la même
forme à chaque propriété.

**Bon exemple.**

```ts
isFulfilled(candidate: Eligibility): boolean {
  const value = candidate[this.requirement_type];
  if (value === undefined) return false; // S1 : le nom vient de la base, on ne suppose pas la propriété
  const items = Array.isArray(value) ? value : [value];
  return items.some((item) => this.#matches(item));
}
```

```ts
check(item: Record<string, unknown>): boolean {
  const value = item[this.#key];
  if (value === undefined || value === null) return false; // S1 : une donnée absente rend false
  …
}
```

**Mauvais exemple.**

```ts
isFulfilled(candidate: Eligibility): boolean {
  const value = candidate[this.requirement_type]; // undefined si le candidat n'a pas cette propriété
  const items = Array.isArray(value) ? value : [value];
  return items.some((item) => this.#matches(item)); // check() lit undefined[key] et lève une TypeError
}
```

**Ce que ça apporte.** Un candidat incomplet reçoit une réponse : il n'a pas droit à l'attestation.
L'évaluation des autres quêtes continue.

**Sans cette règle.** `rewardUser` évalue toutes les quêtes dans un seul `try/catch`, qui journalise
l'erreur. Une `TypeError` sur une quête arrête la boucle : l'élève ne reçoit aucune des attestations
suivantes, même celles auxquelles il a droit. Personne ne relie l'attestation manquante au critère.

**Exceptions.** Un candidat construit en deux temps est permis, si l'appelant le complète avant
l'évaluation. Par exemple, la partie coûteuse à charger, comme les acquis de l'élève, n'est chargée
que pour les quêtes où il est éligible.

### S2. « Non rempli » et « impossible à évaluer » sont distincts

**La règle.** La specification rend un booléen quand elle peut conclure. Quand une donnée est présente
mais inexploitable, elle le signale. Le moteur choisit une seule façon de le signaler, pour tous ses
critères : ici, une erreur du domaine.

**Bon exemple.**

```ts
if (!Array.isArray(value)) {
  // S2 : la donnée est là, mais on ne peut pas conclure ; on le dit au lieu de rendre false
  throw new InvalidComparisonError({ comparisonOperator: 'all', typeofCriterion: 'array', typeofData: typeof value });
}
return expected.every((expectedValue) => value.includes(expectedValue));
```

**Mauvais exemple.**

```ts
if (!Array.isArray(value)) {
  logger.error({ event: 'quest-reward' }, 'Error on quests criterion property');
  return false; // même réponse qu'un candidat qui ne remplit pas le critère
}
return expected.every((expectedValue) => value.includes(expectedValue));
```

**Ce que ça apporte.** Un critère mal écrit ou une donnée mal chargée se voit. L'erreur remonte au
usecase, qui décide quoi en faire.

**Sans cette règle.** Le repository charge les tags sous forme de chaîne, `'AEFE'` au lieu de
`['AEFE']`. Le critère rend `false`, et un élève d'une organisation `AEFE` n'a pas son attestation. On
le traite comme un élève qui n'y a pas droit, et personne ne le sait.

**À savoir.** Trois cas se ressemblent. Chacun a sa réponse :

- une donnée du candidat est absente : `false`, c'est `S1` ;
- un critère est mal écrit, par exemple un type inconnu : l'arbre ne se construit pas, c'est la règle
  V3 de la fiche Value Object ;
- une donnée du candidat est présente mais inexploitable : une erreur, c'est `S2`.

Trois façons de signaler le troisième cas existent : une erreur du domaine, un résultat à trois états,
ou un booléen avec une liste de diagnostics. Le défaut n'est pas d'en choisir une plutôt qu'une autre.
C'est d'en mélanger plusieurs selon le critère.

### S5. La composition est fermée

**La règle.** Un combinateur accepte n'importe quel critère comme enfant, y compris un autre
combinateur. Il ne connaît que la méthode `isFulfilled()` de ses enfants, et leur passe le candidat sans
le modifier.

**Bon exemple.**

```ts
isFulfilled(candidate: Eligibility): boolean {
  return this.#comparison === REQUIREMENT_COMPARISONS.ONE_OF
    ? this.#children.some((child) => child.isFulfilled(candidate))
    : this.#children.every((child) => child.isFulfilled(candidate));
}
```

**Mauvais exemple.**

```ts
isFulfilled(candidate: Eligibility): boolean {
  return this.#children.every((child) =>
    // le combinateur regarde le type de l'enfant, et lui passe une autre donnée
    child instanceof ObjectRequirement && child.requirement_type === 'organization'
      ? child.isFulfilled(new Eligibility({ organization: candidate.organization }))
      : child.isFulfilled(candidate),
  );
}
```

**Ce que ça apporte.** « `SCO`, et qui gère des élèves ou porte le tag `AEFE` » s'écrit en JSON, en
combinant des critères existants. On ne touche pas au code du moteur.

**Sans cette règle.** Chaque nouvelle condition du métier demande de modifier le combinateur, puis de
déployer. Une condition écrite en base sans ce déploiement donne un résultat faux.

**À savoir.** Une composition `all` sur une liste vide rend `true`. C'est le comportement attendu, mais
une quête sans aucun critère d'éligibilité rend alors tous les élèves éligibles.

### S6. Le format est un contrat publié

**La règle.** Le JSON des critères est écrit à la main et enregistré en base, hors du code. Ses clés
ne se renomment pas, même quand elles ne suivent pas les conventions du code. Toute valeur ajoutée à
une énumération est documentée avec le format avant d'être utilisée. Le format s'étend, il ne casse
pas.

**Bon exemple.**

```ts
export class ObjectRequirement implements Requirement {
  readonly requirement_type: ObjectRequirementType; // S6 : la clé du format garde sa casse snake_case
  …
}
```

**Mauvais exemple.**

```ts
export class ObjectRequirement implements Requirement {
  readonly requirementType: ObjectRequirementType; // renommé pour suivre le camelCase du code
  …
}

// buildRequirement lit maintenant json.requirementType, absent de tous les critères en base
```

**Ce que ça apporte.** Les quêtes déjà en base continuent de se construire après chaque déploiement.
Ceux qui écrivent les critères savent quelles valeurs ils peuvent utiliser.

**Sans cette règle.** Après le renommage, `buildRequirement` ne reconnaît plus aucun critère en base.
Aucune quête ne se construit, et plus aucun élève ne reçoit d'attestation. Le code ne peut pas migrer
seul ce contenu, écrit à la main.

**À savoir.** Une valeur présente dans le code mais pas dans la documentation pose aussi problème.
Ceux qui écrivent les critères ne peuvent pas s'en servir, et ceux qui lisent le code ne savent pas si
elle est prise en charge. On documente la valeur, ou on la retire du code.

### S7. Tout critère déclaré est branché sur le candidat

**La règle.** Un critère trouve sa donnée par son nom : `candidate[this.requirement_type]`. Chaque nom
de l'énumération doit donc être une propriété du candidat, chargée par le repository qui l'assemble.
Le typage le vérifie, et un test le vérifie à l'exécution.

**Bon exemple.**

```ts
OBJECT: {
  ORGANIZATION: 'organization',
  CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
} satisfies Record<string, keyof Eligibility>,
```

**Mauvais exemple.**

```ts
OBJECT: {
  ORGANIZATION: 'organization',
  CAMPAIGN_PARTICIPATIONS: 'campaignParticipations',
  CERTIFICATIONS: 'certifications', // aucune propriété du candidat ne porte ce nom
},
```

**Ce que ça apporte.** On ne peut pas ajouter un nom à l'énumération sans ajouter la propriété au
candidat. La compilation échoue sinon.

**Sans cette règle.** Une quête utilise le critère `certifications`. Il passe la validation, puisque le
nom est dans l'énumération. Mais le candidat n'a pas cette propriété : le critère rend toujours `false`
par `S1`, et la quête ne donne jamais son attestation. Le critère a l'air actif, sans l'être.

**À savoir.** Le typage et le test ne vérifient pas que le repository charge la donnée. Un test
d'intégration du repository le fait.

**Exceptions.** Un critère qui porte un calcul, comme un seuil de maîtrise sur des sujets, ne trouve
pas sa donnée par son nom. Il appelle une méthode du candidat. Il n'entre pas dans l'énumération
`OBJECT`, et cette règle ne le vise pas.

### S8. Un consommateur ne redéfinit pas la specification

**La règle.** Un consommateur évalue la specification entière, ou ne l'évalue pas. Il ne choisit pas
quels critères comptent. Il ne lit pas le format des critères, n'évalue pas un critère seul, et ne
reconstruit pas la specification avec une partie de ses critères.

**Bon exemple.**

```ts
// S8 : le usecase évalue chaque quête entière, il ne choisit pas quels critères comptent
const eligibleQuests = quests.filter((quest) => eligibilities.some((eligibility) => quest.isEligible(eligibility)));
```

**Mauvais exemple.**

```ts
// suppose un getter eligibilityRequirements sur la quête
const requirements = quest.eligibilityRequirements.filter(
  (requirement) => requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
);
// la quête est reconstruite sans ses critères sur l'organisation
const questWithoutOrganization = new Quest({ id: quest.id, eligibilityRequirements: requirements });
return questWithoutOrganization.isEligible(eligibility);
```

**Ce que ça apporte.** Les critères d'une quête ont un seul sens, celui de la quête. On peut changer la
façon dont le moteur les évalue sans relire ses consommateurs.

**Sans cette règle.** Le usecase ignore les critères sur l'organisation : un élève d'une organisation
`PRO` reçoit l'attestation de sixième. Et le moteur ne peut pas devenir un Bounded Context à part, car
aucune [API interne](../api-interne/README.md) ne peut proposer « reconstruis ma quête avec d'autres critères ».

**À savoir.** Sans getter sur les critères, comme dans l'exemple complet, un consommateur ne peut pas
les filtrer.

**Exceptions.** Le besoin derrière un filtrage est souvent réel : un critère ne doit pas bloquer dans
certains cas. Il devient alors une propriété du modèle du consommateur, que la specification reçoit.
Ce n'est pas une violation de `S8`.
