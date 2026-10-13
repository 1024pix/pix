# API interne

Une API interne est ce qu'un Bounded Context publie pour les autres contextes : des fonctions qui
renvoient des DTO. Un DTO est l'objet du contrat, distinct du modèle du domaine. Par exemple,
organizational-entities publie `getOrganization({ id })`, que prescription appelle pour connaître une
organisation. Un Bounded Context, ou contexte, est un dossier de `src/` qui a son propre modèle, comme
organizational-entities ou prescription. Les APIs internes se rangent dans `application/api/`, et
lisent les données par un [usecase](../usecase/README.md) de leur contexte.

Le contexte qui appelle l'API ne la lit jamais depuis son domaine. Il la lit par un
[repository](../repository/README.md) à lui, qui traduit le DTO dans son propre vocabulaire : c'est
l'Anticorruption Layer.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [P1](#p1-un-dto-jamais-un-modèle-du-domaine) | Un DTO, jamais un modèle du domaine | `return new OrganizationDTO(…)`, jamais `return organization` |
| [P2](#p2-passer-par-un-usecase) | Passer par un usecase | `usecases.getOrganizationById({ organizationId })`, importé depuis l'index des usecases ; aucun repository |
| [P3](#p3-un-contrat-documenté) | Un contrat documenté | chaque fonction dit ce qu'elle prend, ce qu'elle renvoie et ce qu'elle lève |
| [P4](#p4-aucune-règle-dans-le-dto) | Aucune règle dans le DTO | le DTO recopie des valeurs ; `isRestricted` est calculé par le domaine |
| [P5](#p5-le-dto-dans-models) | Le DTO dans `models/` | `application/api/models/OrganizationDTO.ts` |
| [P6](#p6-un-contrat-stable) | Un contrat stable | ajouter un champ est permis ; renommer ou retirer se prévoit avec les consommateurs |
| [P7](#p7-même-réponse-pour-tous-les-appelants) | Même réponse pour tous les appelants | pas de paramètre ni de branche selon le contexte qui appelle |
| [P8](#p8-rien-dun-autre-contexte) | Rien d'un autre contexte | l'API n'importe que des fichiers de son propre contexte |
| [P9](#p9-seulement-les-champs-lus) | Seulement les champs lus | chaque champ du DTO est lu par au moins un consommateur |

## Exemple complet

L'API d'organizational-entities renvoie une organisation, sous la forme d'un `OrganizationDTO` à cinq
champs. Le champ `isRestricted` vaut `true` si l'organisation gère ses élèves ou si `LEARNER_IMPORT`
est activée. Exemple inventé, d'après
[`organization-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/api/organization-api.js#L25-L35)
pour l'API, et d'après
[`CampaignToJoin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/domain/read-models/CampaignToJoin.js#L31)
pour la règle de `isRestricted`.

`Organization` est celle de la fiche [Aggregate Root](../racine-agregat/README.md), avec un getter de
plus, `isRestricted`. Le repository de prescription et `CampaignOrganization` sont inventés.

```ts
// organizational-entities/application/api/models/OrganizationDTO.ts — P5 : dans models/
import type { OrganizationId } from '../../../../shared/domain/Id.js';

// P1 : le contrat a ses propres types, il n'importe pas ceux du domaine
export type OrganizationTypeDTO = 'SCO' | 'SUP' | 'PRO' | 'SCO-1D';

type OrganizationDTOProps = {
  id: OrganizationId;
  name: string;
  type: OrganizationTypeDTO;
  isRestricted: boolean;
  isArchived: boolean;
};

export class OrganizationDTO {
  // P9 : cinq champs, chacun lu par au moins un consommateur
  readonly id: OrganizationId;
  readonly name: string;
  readonly type: OrganizationTypeDTO;
  readonly isRestricted: boolean;
  readonly isArchived: boolean;

  // P4 : le constructeur recopie les valeurs, il ne décide rien
  constructor({ id, name, type, isRestricted, isArchived }: OrganizationDTOProps) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.isRestricted = isRestricted;
    this.isArchived = isArchived;
  }
}
```

```ts
// organizational-entities/application/api/organization-api.ts
import type { OrganizationId } from '../../../shared/domain/Id.js';
// P2 : l'index des usecases ; P8 : aucun import d'un autre contexte
import { usecases } from '../../domain/usecases/index.js';
import { OrganizationDTO } from './models/OrganizationDTO.js';

/**
 * P3 : le contrat, lu par les autres contextes sans ouvrir ce fichier
 * Returns the organization with the given id.
 * isRestricted: the organization manages its students, or imports its learners.
 *
 * @throws {NotFoundError} if the organization does not exist
 */
// P7 : un seul paramètre, l'id ; la réponse ne dépend pas de l'appelant
export const getOrganization = async ({ id }: { id: OrganizationId }): Promise<OrganizationDTO> => {
  const organization = await usecases.getOrganizationById({ organizationId: id }); // P2

  // P1 : on construit le DTO, on ne renvoie pas le modèle
  return new OrganizationDTO({
    id: organization.id,
    name: organization.name,
    type: organization.type,
    isRestricted: organization.isRestricted, // P4 : calculé par le domaine
    isArchived: organization.isArchived,
  });
};
```

```ts
// organizational-entities/domain/models/organization/Organization.ts — extrait, dans la classe Organization
// P4 : la règle vit dans le domaine, le DTO en reçoit seulement le résultat
get isRestricted(): boolean {
  return this.#isManagingStudents || this.#features.some((feature) => feature.featureName === 'LEARNER_IMPORT');
}
```

```ts
// prescription/campaign/infrastructure/repositories/organization-repository.ts — chez le consommateur
import type { OrganizationId } from '../../../../shared/domain/Id.js';
import * as organizationApi from '../../../../organizational-entities/application/api/organization-api.js';
import { CampaignOrganization } from '../../domain/models/CampaignOrganization.js';

// l'Anticorruption Layer : le DTO s'arrête ici, le domaine de prescription reçoit son propre objet
export const get = async ({ organizationId }: { organizationId: OrganizationId }): Promise<CampaignOrganization> => {
  const organization = await organizationApi.getOrganization({ id: organizationId });

  return new CampaignOrganization({
    id: organization.id,
    name: organization.name,
    type: organization.type,
    isRestricted: organization.isRestricted,
    isArchived: organization.isArchived,
  });
};
```

## Comment tester

On teste l'API avec un test unitaire. Le usecase est substitué par un stub : le test ne vérifie que la
traduction du modèle vers le DTO. Le test couvre :

- la forme du DTO : seulement les champs du contrat, avec les bonnes valeurs. Exemple :
  `returns only the contract fields` ;
- chaque champ calculé par le domaine, recopié dans le DTO. Exemples :
  `marks an organization that imports its learners as restricted`, `marks an archived organization`.

Le test ne rejoue pas la règle du domaine. S'il faut beaucoup de données métier pour le faire passer,
l'API fait plus que traduire.

Le repository du consommateur se teste à part, chez le consommateur, avec l'API substituée. Exemple :
`translates the organization into a campaign organization`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/application/api/organization-api_test.ts
import { expect } from 'chai';
import sinon from 'sinon';

import * as organizationApi from '../../../../../src/organizational-entities/application/api/organization-api.js';
import { OrganizationDTO } from '../../../../../src/organizational-entities/application/api/models/OrganizationDTO.js';
import { Organization, type OrganizationProps } from '../../../../../src/organizational-entities/domain/models/organization/index.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import type { OrganizationId, UserId } from '../../../../../src/shared/domain/Id.js';

describe('Unit | Organizational Entities | Application | API | organization-api', function () {
  const buildOrganization = (props: Partial<OrganizationProps<OrganizationId>> = {}) =>
    new Organization({
      id: 1 as OrganizationId,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      createdBy: 2 as UserId,
      isManagingStudents: false,
      features: [],
      archivedAt: null,
      ...props,
    });

  const stubUsecase = (organization: Organization) =>
    sinon.stub(usecases, 'getOrganizationById').withArgs({ organizationId: 1 }).resolves(organization);

  describe('#getOrganization', function () {
    it('returns only the contract fields', async function () {
      stubUsecase(buildOrganization());

      const organization = await organizationApi.getOrganization({ id: 1 as OrganizationId });

      expect(organization).to.be.instanceOf(OrganizationDTO);
      expect({ ...organization }).to.deep.equal({
        id: 1,
        name: 'Lycée Victor Hugo',
        type: 'SCO',
        isRestricted: false,
        isArchived: false,
      });
    });

    it('marks an organization that imports its learners as restricted', async function () {
      const learnerImport = { featureName: 'LEARNER_IMPORT', params: null } as const;
      stubUsecase(buildOrganization({ features: [learnerImport] }));

      const organization = await organizationApi.getOrganization({ id: 1 as OrganizationId });

      expect(organization.isRestricted).to.be.true;
    });

    it('marks an archived organization', async function () {
      stubUsecase(buildOrganization({ archivedAt: new Date('2026-01-02') }));

      const organization = await organizationApi.getOrganization({ id: 1 as OrganizationId });

      expect(organization.isArchived).to.be.true;
    });
  });
});
```

## Checklist de revue de code

```
Que renvoie l'API ?
[ ] P1  Chaque fonction renvoie un DTO construit, jamais un modèle du domaine
[ ] P9  Chaque champ du DTO est lu par au moins un consommateur
[ ] P4  Le DTO recopie ou met en forme ; il ne décide rien
[ ] P5  Le DTO est dans application/api/models/

Par où passe-t-elle ?
[ ] P2  Chaque fonction appelle un usecase par l'index des usecases ; aucun repository
[ ] P8  Aucun import d'un autre contexte : ni repository, ni API

Le contrat tient-il ?
[ ] P3  Chaque fonction exportée dit ce qu'elle prend, renvoie et lève
[ ] P6  Aucun renommage ni retrait sans la liste des consommateurs
[ ] P7  Aucun paramètre ni branche selon l'appelant

Comment le consommateur la lit-il ?
[ ] Le consommateur lit l'API par un repository à lui, qui traduit le DTO

Tests
[ ] Un test unitaire de l'API, usecase substitué, qui vérifie seulement la traduction
[ ] Le repository du consommateur a son test, API substituée
```

## Référence des règles

### P1. Un DTO, jamais un modèle du domaine

**La règle.** Chaque fonction de l'API construit un DTO et le renvoie. Elle ne renvoie jamais le
modèle du domaine que lui donne le usecase. Le DTO n'importe pas non plus les types du domaine : il a
les siens.

**Bon exemple.**

```ts
const organization = await usecases.getOrganizationById({ organizationId: id });

return new OrganizationDTO({
  id: organization.id,
  name: organization.name,
  type: organization.type,
  isRestricted: organization.isRestricted,
  isArchived: organization.isArchived,
});
```

**Mauvais exemple.**

```ts
export const getOrganization = async ({ id }: { id: OrganizationId }): Promise<Organization> => {
  return usecases.getOrganizationById({ organizationId: id }); // le modèle du domaine sort tel quel
};
```

**Ce que ça apporte.** organizational-entities peut changer `Organization` sans prévenir personne,
tant que l'API sait encore remplir les cinq champs du DTO.

**Sans cette règle.** On renomme le getter `isArchived` de `Organization`. Le repository de
prescription lisait ce getter : il ne compile plus, et une autre équipe doit modifier son code pour un
changement interne à organizational-entities.

**À savoir.**

- Un DTO qui reprend tous les champs du modèle a le même défaut que le modèle renvoyé tel quel :
  chaque changement du modèle change le contrat. [P9](#p9-seulement-les-champs-lus) dit quels champs
  garder.
- Un type du domaine dans le DTO, comme `OrganizationType`, fait passer chaque changement de ce type
  dans le contrat. Le DTO déclare donc `OrganizationTypeDTO`.

**Exceptions.**

- Une fonction dont le usecase renvoie un nombre, un booléen ou rien peut renvoyer ce résultat tel
  quel : aucun modèle ne sort.
- Une erreur définie dans `application/api/errors.ts` fait partie du contrat, et peut être levée.
- Une enveloppe de pagination autour d'une liste de DTO est permise.

### P2. Passer par un usecase

**La règle.** L'API est une porte d'entrée, comme un contrôleur. Chaque fonction appelle un usecase,
jamais un repository. Elle appelle le usecase par l'index des usecases, `domain/usecases/index.js`,
qui lui injecte ses dépendances.

**Bon exemple.**

```ts
import { usecases } from '../../domain/usecases/index.js';

const organization = await usecases.getOrganizationById({ organizationId: id });
```

**Mauvais exemple.**

```ts
// l'API lit le repository : elle passe à côté du usecase
import { organizationRepository } from '../../infrastructure/repositories/organization-repository.js';

const organization = await organizationRepository.get({ id });
```

```ts
// l'API importe le fichier du usecase : elle doit lui passer elle-même le repository
import { getOrganizationById } from '../../domain/usecases/get-organization-by-id.js';
import { organizationRepository } from '../../infrastructure/repositories/organization-repository.js';

const organization = await getOrganizationById({ organizationId: id, organizationRepository });
```

**Ce que ça apporte.** Une règle de lecture ajoutée au usecase vaut pour tous les appelants : la route
HTTP comme les autres contextes.

**Sans cette règle.** On ajoute une règle au usecase `getOrganizationById` : il lève `NotFoundError`
pour une organisation supprimée. L'API qui lit le repository continue de renvoyer l'organisation supprimée aux autres
contextes.

**À savoir.**

- Importer le fichier du usecase pour casser un import cyclique ne justifie pas l'écart : l'API passe
  toujours par l'index.
- Les repositories de `shared` ne font pas exception. L'API ne les appelle pas non plus.

### P3. Un contrat documenté

**La règle.** Chaque fonction exportée dit ce qu'elle prend, ce qu'elle renvoie et ce qu'elle lève.
Les types TypeScript disent la forme. Le commentaire dit le reste : le sens d'un champ calculé et les
erreurs levées.

**Bon exemple.**

```ts
/**
 * Returns the organization with the given id.
 * isRestricted: the organization manages its students, or imports its learners.
 *
 * @throws {NotFoundError} if the organization does not exist
 */
export const getOrganization = async ({ id }: { id: OrganizationId }): Promise<OrganizationDTO> => {
```

**Mauvais exemple.**

```ts
// rien ne dit ce que veut dire isRestricted, ni ce qui se passe si l'organisation n'existe pas
export const getOrganization = async ({ id }) => {
```

**Ce que ça apporte.** Le consommateur sait quoi appeler et quoi attendre sans lire le code
d'organizational-entities.

**Sans cette règle.** Le consommateur ne sait pas que `getOrganization` lève `NotFoundError`. Il écrit
`if (!organization)`, qui ne s'exécute jamais, et l'erreur remonte jusqu'à l'utilisateur.

**À savoir.** Le script `scripts/generate-api-documentation.js` lit ces commentaires et génère la
documentation de toutes les APIs d'un contexte, dans un fichier `API.md` à la racine du contexte. On
le lance avec `npm run doc:api:<contexte>`, et on committe le fichier généré.

**Exceptions.** Renvoyer `null` quand rien n'est trouvé est permis, si le commentaire le dit.

### P4. Aucune règle dans le DTO

**La règle.** Le DTO recopie des valeurs et peut les mettre en forme. Il ne décide rien : une règle du
métier vit dans le domaine, et le DTO en reçoit le résultat. Le DTO n'a aucun comportement, et il ne
change plus après sa création. Ce n'est donc pas un [Value Object](../objet-valeur/README.md), qui
vérifie ses valeurs et porte des règles.

**Bon exemple.**

```ts
// dans la classe Organization, côté domaine
get isRestricted(): boolean {
  return this.#isManagingStudents || this.#features.some((feature) => feature.featureName === 'LEARNER_IMPORT');
}

// dans getOrganization, côté API
isRestricted: organization.isRestricted,
```

**Mauvais exemple.**

```ts
export class OrganizationDTO {
  constructor(organization: Organization) {
    // la règle du métier est réécrite dans le DTO
    this.isRestricted =
      organization.isManagingStudents ||
      organization.features.some((feature) => feature.featureName === 'LEARNER_IMPORT');
  }
}
```

**Ce que ça apporte.** La règle de `isRestricted` existe à un seul endroit, dans `Organization`.

**Sans cette règle.** Une nouvelle fonctionnalité rend aussi une organisation restreinte. On met à
jour `Organization`, et on oublie le DTO. La route HTTP et prescription ne voient plus la même
organisation.

**Exceptions.** Une mise en forme ne décide rien, elle est permise :

- renommer un champ pour le vocabulaire du contrat ;
- aplatir une structure ;
- composer un libellé à partir de plusieurs champs.

### P5. Le DTO dans `models/`

**La règle.** Le DTO d'une API interne se range dans `application/api/models/`. Pas à la racine de
`application/api/`, ni dans un autre sous-dossier.

**Bon exemple.**

```
organizational-entities/application/api/
├── organization-api.ts
└── models/
    └── OrganizationDTO.ts
```

**Mauvais exemple.**

```
organizational-entities/application/api/
├── organization-api.ts
├── OrganizationDTO.ts                  ← à la racine de api/
└── read-models/
    └── OrganizationForCampaign.ts      ← un DTO rangé sous un autre nom
```

**Ce que ça apporte.** On trouve le contrat d'un contexte au même endroit dans tous les contextes, et
un script peut vérifier l'emplacement.

**Sans cette règle.** Un DTO rangé dans `read-models/` se confond avec un
[read-model](../read-model/README.md) du domaine. On le modifie pour un écran interne, et on change le
contrat sans le savoir.

### P6. Un contrat stable

**La règle.** Un contrat s'étend, il ne se casse pas. Ajouter un champ ou une fonction est permis.
Renommer ou retirer demande de lister les consommateurs et de prévoir le changement avec eux. Changer
le sens d'un champ existant est interdit : on ajoute un autre champ.

**Bon exemple.**

```ts
export class OrganizationDTO {
  readonly id: OrganizationId;
  readonly name: string;
  readonly type: OrganizationTypeDTO;
  readonly isRestricted: boolean;
  readonly isArchived: boolean;
}
```

**Mauvais exemple.**

```ts
export class OrganizationDTO {
  readonly archived: boolean; // isArchived renommé : chaque consommateur qui le lit casse
}
```

**Ce que ça apporte.** organizational-entities peut publier une nouvelle version de son API sans
casser le code des autres équipes.

**Sans cette règle.** On renomme `isArchived` en `archived`. La CI de prescription casse sur un
changement fait dans organizational-entities. Si on change le sens de `isRestricted`, rien ne casse
du tout, et prescription prend de mauvaises décisions sans erreur.

**À savoir.** Chaque contexte liste les contextes dont il dépend dans le champ `dependsOn` de son
`dependencies.json`, et dependency-cruiser refuse un import vers un contexte absent de cette liste.
Les consommateurs d'une API sont donc les contextes qui citent le sien. Un renommage commence par
cette liste.

### P7. Même réponse pour tous les appelants

**La règle.** Une fonction renvoie la même chose quel que soit le contexte qui l'appelle. Pas de
paramètre « pour qui », pas de branche selon l'appelant. Si deux consommateurs ont besoin de deux
réponses différentes, on écrit deux fonctions, chacune avec son nom et son DTO.

**Bon exemple.**

```ts
export const getOrganization = async ({ id }: { id: OrganizationId }): Promise<OrganizationDTO> => {
```

**Mauvais exemple.**

```ts
// la réponse dépend de l'appelant
export const getOrganization = async ({ id, forAdmin }: { id: OrganizationId; forAdmin: boolean }) => {
  const organization = await usecases.getOrganizationById({ organizationId: id });
  return forAdmin ? toOrganizationForAdminDTO(organization) : toOrganizationDTO(organization);
};
```

**Ce que ça apporte.** Chaque fonction a un seul contrat. organizational-entities la change sans
vérifier qui l'appelle avec quel paramètre.

**Sans cette règle.** Pour ajouter un champ à la réponse admin, on modifie la branche `forAdmin`. Un
autre contexte passait `forAdmin: true` par erreur, et reçoit soudain une autre réponse.

**Exceptions.** Une fonction utilisée par un seul consommateur est permise : un contrat commence
souvent ainsi. Son nom dit le besoin, pas l'écran du consommateur.

### P8. Rien d'un autre contexte

**La règle.** Une API interne sert son propre contexte. Elle n'importe ni repository, ni API, ni
usecase d'un autre contexte pour composer sa réponse. Si un consommateur a besoin de données de deux
contextes, il appelle les deux APIs, et assemble les réponses dans un de ses usecases.

**Bon exemple.**

```ts
import { usecases } from '../../domain/usecases/index.js';
import { OrganizationDTO } from './models/OrganizationDTO.js';
```

**Mauvais exemple.**

```ts
// l'API lit les membres dans team pour ajouter memberCount au DTO
import { membershipRepository } from '../../../team/infrastructure/repositories/membership-repository.js';
```

**Ce que ça apporte.** Prescription dépend d'organizational-entities, et de rien d'autre à travers
cette API. Le `dependencies.json` de prescription dit la vérité.

**Sans cette règle.** team change son repository des membres. `getOrganization` casse, et prescription
avec elle. Le `dependencies.json` de prescription ne cite pas team.

**À savoir.** Le mauvais exemple enfreint aussi [P2](#p2-passer-par-un-usecase), qui interdit les
repositories. P8 vise en plus les APIs et les usecases d'un autre contexte, que P2 ne cite pas.

### P9. Seulement les champs lus

**La règle.** Un champ figure dans le DTO parce qu'au moins un consommateur le lit. Un champ qu'aucun
consommateur ne lit n'y figure pas, même s'il existe sur le modèle.

**Bon exemple.**

```ts
export class OrganizationDTO {
  readonly id: OrganizationId;
  readonly name: string;
  readonly type: OrganizationTypeDTO;
  readonly isRestricted: boolean;
  readonly isArchived: boolean;
}
```

**Mauvais exemple.**

```ts
export class OrganizationDTO {
  readonly id: OrganizationId;
  readonly name: string;
  readonly type: OrganizationTypeDTO;
  readonly isRestricted: boolean;
  readonly isArchived: boolean;
  // repris parce qu'ils sont sur le modèle, aucun consommateur ne les lit
  readonly logoUrl: string;
  readonly isManagingStudents: boolean;
  readonly createdBy: UserId;
}
```

**Ce que ça apporte.** Le DTO est la liste exacte de ce qu'organizational-entities s'engage à
maintenir. Tout le reste de `Organization` change sans coordination.

**Sans cette règle.** Le DTO expose aussi `isManagingStudents`. Un nouveau consommateur le lit pour
savoir si l'organisation est restreinte, et oublie `LEARNER_IMPORT`. Une organisation qui importe ses
élèves passe pour non restreinte.

**À savoir.** Aucun outil ne voit un DTO qui recopie le modèle : ni le typage, ni une règle de lint.
C'est la ligne de la checklist à relire avec le plus de soin.
