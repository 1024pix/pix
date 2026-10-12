# Aggregate Root

Un Aggregate est un groupe d'objets qu'une règle du métier relie : on les modifie et on les enregistre
ensemble. L'Aggregate Root est l'objet qu'on appelle pour lire ou modifier le groupe. C'est une
[Entity](../entite/README.md) : les règles de la fiche Entity s'appliquent, plus celles de cette fiche.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [A1](#a1-une-règle-relie-les-objets) | Une règle relie les objets | on peut écrire la règle qui oblige ces objets à changer ensemble |
| [A2](#a2-la-racine-est-la-seule-porte-dentrée) | La racine est la seule porte d'entrée | le champ qui contient les objets internes est privé ; hors du dossier, seul `index.ts` s'importe |
| [A3](#a3-un-repository-par-aggregate) | Un repository par Aggregate | `get()` charge tout le groupe, `update()` enregistre tout le groupe |
| [A6](#a6-petit-aggregate) | Petit Aggregate | seulement les objets qu'une règle relie ; les autres sont gardés par leur id |
| [A7](#a7-une-transaction-un-aggregate) | Une transaction, un Aggregate | les autres Aggregates sont modifiés dans leur propre transaction |

## Exemple complet

L'Aggregate `Organization` : une organisation et ses fonctionnalités activées. Une règle du métier les
relie : si `LEARNER_IMPORT` est activée, `isManagingStudents` est toujours `false`. Le constructeur
refuse l'état inverse, et `enableFeature()` met le champ à `false`. Exemple inventé, d'après
[`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L240-L247).

Le dossier de l'Aggregate :

```
organizational-entities/domain/models/organization/
├── index.ts                 ← A2 : le seul fichier importable hors du dossier
├── Organization.ts          ← la racine
└── OrganizationFeature.ts   ← un objet interne
```

```ts
// organization/index.ts — A2 : on exporte la racine, et seulement le type des objets internes
export { Organization } from './Organization.js';
export type { OrganizationFeature, FeatureName } from './OrganizationFeature.js';
```

```ts
// organization/OrganizationFeature.ts — un objet interne, créé seulement par la racine
export class OrganizationFeature {
  readonly featureName: FeatureName; // identifie la fonctionnalité dans son organisation
  readonly params: FeatureParams;
  readonly enabledAt: Date;

  constructor({ featureName, params, enabledAt }: OrganizationFeatureProps) {
    if (featureName === 'ATTESTATIONS_MANAGEMENT' && !params) {
      throw new InvalidOrganizationFeatureError('ATTESTATIONS_MANAGEMENT needs params');
    }
    this.featureName = featureName;
    this.params = params;
    this.enabledAt = enabledAt;
  }
}
```

```ts
// organization/Organization.ts — la racine, raccourcie : on a retiré le nom et le type (voir la fiche Entity)
import { ArchivedOrganizationError, FeatureAlreadyEnabledError, InvalidOrganizationError } from '../../errors.js';
import { type FeatureName, type FeatureParams, OrganizationFeature } from './OrganizationFeature.js';

type OrganizationProps<Id> = {
  id: Id;
  createdBy: UserId;
  isManagingStudents: boolean;
  features: OrganizationFeature[];
  archivedAt: Date | null;
};

// Organization<null> : une organisation pas encore enregistrée (voir E1 de la fiche Entity)
export class Organization<Id extends OrganizationId | null = OrganizationId> {
  readonly id: Id;
  readonly createdBy: UserId; // A6 : un autre Aggregate, gardé par son id
  #isManagingStudents: boolean;
  #features: OrganizationFeature[]; // A2 : privé
  #archivedAt: Date | null;

  // A1 : le constructeur est aussi appelé au chargement depuis la base, la règle y est donc vérifiée
  constructor({ id, createdBy, isManagingStudents, features, archivedAt }: OrganizationProps<Id>) {
    if (isManagingStudents && features.some((feature) => feature.featureName === 'LEARNER_IMPORT')) {
      throw new InvalidOrganizationError('An organization that imports its learners does not manage students');
    }
    this.id = id;
    this.createdBy = createdBy;
    this.#isManagingStudents = isManagingStudents;
    this.#features = [...features];
    this.#archivedAt = archivedAt;
  }

  get isManagingStudents(): boolean {
    return this.#isManagingStudents;
  }

  // A2 : on lit une copie, en lecture seule
  get features(): ReadonlyArray<OrganizationFeature> {
    return [...this.#features];
  }

  // A1 : la seule façon d'ajouter une fonctionnalité, et c'est ici que la règle est vérifiée
  enableFeature(featureName: FeatureName, params: FeatureParams, now: Date): void {
    if (this.#archivedAt) throw new ArchivedOrganizationError();
    if (this.#features.some((feature) => feature.featureName === featureName)) throw new FeatureAlreadyEnabledError();

    this.#features = [...this.#features, new OrganizationFeature({ featureName, params, enabledAt: now })];
    if (featureName === 'LEARNER_IMPORT') {
      this.#isManagingStudents = false; // A1 : la règle qui relie la racine et ses fonctionnalités
    }
  }
}
```

```ts
// domain/repositories/OrganizationRepository.ts — A3 : un seul repository pour tout le groupe
export interface OrganizationRepository {
  get(id: OrganizationId): Promise<Organization>; // charge l'organisation et ses fonctionnalités
  add(organization: Organization<null>): Promise<Organization>;
  update(organization: Organization): Promise<void>; // enregistre l'organisation et ses fonctionnalités
}
```

```ts
// domain/usecases/enable-organization-feature.ts — A7 : un seul Aggregate modifié
export const enableOrganizationFeature = async ({
  organizationId,
  featureName,
  params,
  organizationRepository,
  clock,
}: EnableOrganizationFeatureInput): Promise<void> => {
  const organization = await organizationRepository.get(organizationId);
  organization.enableFeature(featureName, params, clock.now());
  await organizationRepository.update(organization);
};
```

## Comment tester

On teste l'Aggregate en passant par la racine, avec un test unitaire sans stub, mock ni spy. Le test
couvre :

- chaque règle qui relie la racine et ses objets internes, à la création comme à chaque méthode.
  Exemples : `refuses an organization that imports its learners and manages students`,
  `stops managing students when LEARNER_IMPORT is enabled` ;
- chaque cas d'erreur, et le fait que rien n'a changé après l'erreur. Exemples :
  `refuses a feature on an archived organization, and changes nothing`,
  `refuses a feature that is already enabled` ;
- qu'on ne peut pas modifier un objet interne depuis l'extérieur. Exemple :
  `cannot change the features through the returned list`.

Le repository se teste à part, avec un test d'intégration sur la base : on enregistre l'Aggregate, on
le recharge, et on vérifie que tout le groupe est revenu. Exemple :
`saves and reloads the organization with its features`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/models/organization/Organization_test.ts
describe('Unit | Organizational Entities | Domain | Models | Organization', function () {
  const now = new Date('2026-01-02');

  const buildOrganization = (props: Partial<OrganizationProps<OrganizationId>> = {}) =>
    new Organization({
      id: 1 as OrganizationId,
      createdBy: 2 as UserId,
      isManagingStudents: false,
      features: [],
      archivedAt: null,
      ...props,
    });

  const learnerImport = new OrganizationFeature({ featureName: 'LEARNER_IMPORT', params: null, enabledAt: now });

  describe('constructor', function () {
    it('refuses an organization that imports its learners and manages students', function () {
      expect(() => buildOrganization({ isManagingStudents: true, features: [learnerImport] })).to.throw(
        InvalidOrganizationError,
      );
    });
  });

  describe('#enableFeature', function () {
    it('stops managing students when LEARNER_IMPORT is enabled', function () {
      const organization = buildOrganization({ isManagingStudents: true });

      organization.enableFeature('LEARNER_IMPORT', null, now);

      expect(organization.isManagingStudents).to.be.false;
    });

    it('refuses a feature on an archived organization, and changes nothing', function () {
      const organization = buildOrganization({ archivedAt: new Date('2026-01-01'), isManagingStudents: true });

      expect(() => organization.enableFeature('LEARNER_IMPORT', null, now)).to.throw(ArchivedOrganizationError);
      expect(organization.features).to.be.empty;
      expect(organization.isManagingStudents).to.be.true;
    });

    it('refuses a feature that is already enabled', function () {
      const organization = buildOrganization({ features: [learnerImport] });

      expect(() => organization.enableFeature('LEARNER_IMPORT', null, now)).to.throw(FeatureAlreadyEnabledError);
      expect(organization.features).to.have.lengthOf(1);
    });
  });

  describe('#features', function () {
    it('cannot change the features through the returned list', function () {
      const organization = buildOrganization();

      // ReadonlyArray interdit push à la compilation. On force le type pour vérifier qu'à l'exécution,
      // on reçoit bien une copie
      (organization.features as OrganizationFeature[]).push(learnerImport);

      expect(organization.features).to.be.empty;
    });
  });
});
```

## Checklist de revue de code

```
Le groupe a-t-il une raison d'exister ?
[ ] A1  On peut écrire la règle qui relie ces objets
[ ] A6  Chaque objet du groupe est concerné par une règle ; le reste est gardé par son id

Peut-on passer à côté de la racine ?
[ ] A2  Objets internes privés ; getters en copie ; seul index.ts s'importe hors du dossier
[ ] A3  Un seul repository ; aucun repository pour un objet interne

Que se passe-t-il à l'écriture ?
[ ] A7  Le usecase ne modifie qu'un Aggregate

Tests
[ ] Chaque règle du groupe a son test, passé par la racine
[ ] Le repository a un test qui enregistre puis recharge tout le groupe
```

## Référence des règles

### A1. Une règle relie les objets

**La règle.** Un Aggregate existe parce qu'une règle du métier relie plusieurs objets. Test simple :
on doit pouvoir finir la phrase « à tout moment, … ». Sinon, ce n'est pas un Aggregate.

**Bon exemple.**

```ts
// à tout moment : si LEARNER_IMPORT est activée, isManagingStudents est false
enableFeature(featureName: FeatureName, params: FeatureParams, now: Date): void {
  …
  if (featureName === 'LEARNER_IMPORT') {
    this.#isManagingStudents = false;
  }
}
```

**Mauvais exemple.**

```ts
// « ces objets sont affichés ensemble sur l'écran de détail » : ce n'est pas une règle
export class OrganizationDetails {
  readonly organization: Organization;
  readonly members: Membership[];
  readonly campaigns: Campaign[];
}
```

Un groupe d'objets lus ensemble pour un écran est un [read-model](../read-model/README.md), pas un
Aggregate.

**Ce que ça apporte.** On connaît la règle à garantir. Les objets qu'elle relie sont enregistrés dans
la même transaction, et le reste peut être mis à jour après.

**Sans cette règle.** On regroupe des objets « parce qu'ils vont ensemble ». L'Aggregate grossit :
chaque écriture charge des objets inutiles, et verrouille des lignes en base pour rien.

**Exceptions.** Un Aggregate peut n'avoir que sa racine, quand la règle ne concerne que ses propres
champs.

### A2. La racine est la seule porte d'entrée

**La règle.** Pour lire ou modifier un objet interne, on passe par la racine. Le champ qui contient les
objets internes est privé, et les getters renvoient des copies en lecture seule. Hors du dossier de
l'Aggregate, on n'importe que son `index.ts`, qui exporte la racine et seulement le type des objets
internes.

**Bon exemple.**

```ts
// organization/index.ts
export { Organization } from './Organization.js';
export type { OrganizationFeature, FeatureName } from './OrganizationFeature.js';
```

```ts
get features(): ReadonlyArray<OrganizationFeature> {
  return [...this.#features];
}
```

On exporte seulement le type : on peut s'en servir dans une signature, mais pas écrire
`new OrganizationFeature(…)` depuis l'extérieur.

**Mauvais exemple.**

```ts
// dans un usecase : on crée l'objet interne et on l'ajoute sans passer par la racine
import { OrganizationFeature } from '../models/organization/OrganizationFeature.js';

organization.features.push(new OrganizationFeature({ featureName: 'LEARNER_IMPORT', params: null, enabledAt: now }));
```

**Ce que ça apporte.** Pour ajouter une fonctionnalité, tout le monde passe par `enableFeature()`, qui
met à jour `isManagingStudents`.

**Sans cette règle.** Un import CSV ajoute `LEARNER_IMPORT` directement à la liste. L'organisation a la
fonctionnalité, mais `isManagingStudents` reste à `true`, et la règle du métier est fausse en base.

**À savoir.** `dependency-cruiser`, l'outil qui vérifie les imports dans la CI, peut faire respecter le
point d'entrée :

```js
{
  name: 'aggregate-entry-point',
  severity: 'error',
  from: { pathNot: '^src/organizational-entities/domain/models/organization/' },
  to: { path: '^src/organizational-entities/domain/models/organization/', pathNot: 'index\\.js$' },
}
```

**Exceptions.** Lire les objets internes est permis, tant qu'on reçoit une copie.

### A3. Un repository par Aggregate

**La règle.** Chaque Aggregate a un seul repository, celui de la racine. `get()` charge tout le groupe,
`update()` enregistre tout le groupe. Un objet interne n'a pas de repository à lui.

**Bon exemple.**

```ts
export interface OrganizationRepository {
  get(id: OrganizationId): Promise<Organization>; // l'organisation et ses fonctionnalités
  add(organization: Organization<null>): Promise<Organization>;
  update(organization: Organization): Promise<void>; // l'organisation et ses fonctionnalités
}
```

Le repository écrit dans deux tables, `organizations` et `organization-features`. Le domaine ne voit
pas ces tables : il appelle seulement `update()`.

**Mauvais exemple.**

```ts
// un repository rien que pour les fonctionnalités : il écrit sans passer par la racine
export interface OrganizationFeatureRepository {
  saveInBatch(features: OrganizationFeature[]): Promise<void>;
}
```

**Ce que ça apporte.** On enregistre le groupe d'une seule façon, après que l'Aggregate a vérifié ses
règles.

**Sans cette règle.** Un second repository écrit les fonctionnalités sans charger l'organisation. Les
règles de la racine ne sont jamais vérifiées pour ces écritures.

**Exceptions.** Une lecture qui a besoin de plusieurs Aggregates, par exemple pour un écran, passe par
un read-model. Cette règle ne vise que l'écriture.

### A6. Petit Aggregate

**La règle.** L'Aggregate ne contient que les objets qu'une règle relie. Les autres forment leurs
propres Aggregates, et sont gardés par leur identifiant.

**Bon exemple.**

```ts
export class Organization {
  #features: OrganizationFeature[]; // une règle relie les fonctionnalités et isManagingStudents
  readonly createdBy: UserId; // un utilisateur est un autre Aggregate
  // pas de membres, pas d'invitations, pas de campagnes : aucune règle ne les relie à l'organisation
}
```

**Mauvais exemple.**

```ts
export class Organization {
  #features: OrganizationFeature[];
  #memberships: Membership[]; // toutes les adhésions, chargées à chaque modification
  #invitations: OrganizationInvitation[];
}
```

**Ce que ça apporte.** Le chargement reste court. Deux personnes peuvent écrire en même temps, l'une
sur l'organisation et l'autre sur un membre, sans conflit.

**Sans cette règle.** Activer une fonctionnalité charge tous les membres de l'organisation. Deux
écritures sans rapport, comme renommer l'organisation et inviter un membre, se retrouvent en conflit.

**À savoir.**

- Avant d'ajouter un objet, se poser la question : doit-il toujours respecter la règle avec le reste,
  ou peut-il être mis à jour après coup ? S'il peut attendre, c'est un autre Aggregate.
- Si le chargement est trop lent en production, et que c'est mesuré : on découpe l'Aggregate, ou on
  fait un read-model pour la lecture concernée. Un Aggregate se charge toujours en entier.

### A7. Une transaction, un Aggregate

**La règle.** Un usecase ne modifie qu'un Aggregate par transaction. Si d'autres Aggregates doivent
suivre, ils sont modifiés ensuite, chacun dans sa propre transaction.

**Bon exemple.**

```ts
// organizational-entities : on archive l'organisation, et c'est tout
const organization = await organizationRepository.get(organizationId);
organization.archive(clock.now());
await organizationRepository.update(organization);
// team désactive ensuite les membres, dans sa propre transaction
```

**Mauvais exemple.**

```ts
// un seul usecase modifie trois Aggregates, de deux contextes, dans la même transaction
organization.archive(clock.now());
await organizationRepository.update(organization);
await membershipRepository.disableAll({ organizationId });
await invitationRepository.deleteAll({ organizationId });
```

**Ce que ça apporte.** Chaque transaction ne verrouille que les lignes de l'Aggregate modifié.

**Sans cette règle.** La transaction verrouille l'organisation, ses membres et ses invitations. Si la
suppression des invitations échoue, l'archivage est annulé aussi, alors qu'il était valide.

**À savoir.** Si deux Aggregates doivent toujours changer ensemble, dans la même transaction, c'est
un signe qu'ils forment un seul Aggregate. À vérifier : une règle les relie-t-elle vraiment ?
