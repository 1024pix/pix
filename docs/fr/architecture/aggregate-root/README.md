# Aggregate Root

Un Aggregate est un groupe d'objets qu'au moins une règle du métier relie : on les modifie et on les enregistre
ensemble. L'Aggregate Root est l'objet qu'on appelle pour lire ou modifier le groupe. C'est une
Entity : les règles de [la fiche Entity](../entity/README.md) s'appliquent, plus celles de cette fiche.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| #                                              | Règle                                 | En pratique                                                                        |
| ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------- |
| [A1](#a1-une-règle-relie-les-objets)           | Une règle relie les objets            | on peut écrire au moins une règle qui oblige ces objets à changer ensemble         |
| [A2](#a2-la-racine-est-la-seule-porte-dentrée) | La racine est la seule porte d'entrée | Seule l'Aggregate Root est publique et s'importe via son `index.ts`                |
| [A3](#a3-un-repository-par-aggregate)          | Un repository par Aggregate           | `get()` charge tout le groupe, `update()` enregistre tout le groupe                |
| [A4](#a4-pas-dobjet-dun-autre-aggregate)       | Pas d'objet d'un autre Aggregate      | `createdBy: number`, pas `createdBy: User`                                         |
| [A6](#a6-petit-aggregate)                      | Petit Aggregate                       | seulement les objets qu'une règle relie                                            |
| [A7](#a7-une-transaction-un-aggregate)         | Une transaction, un Aggregate         | les autres Aggregates sont modifiés dans leur propre transaction                   |
| [A8](#a8-la-racine-enregistre-ses-événements)  | La racine enregistre ses événements   | `archive()` enregistre `OrganizationArchivedEvent`, après avoir vérifié ses règles |

## Exemple complet

L'Aggregate `Organization` : une organisation et ses fonctionnalités activées. Exemple inventé, d'après
[`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L241-L248).

Le dossier de l'Aggregate :

```
organizational-entities/domain/models/organization/
├── index.ts                 ← A2 : le seul fichier importable hors du dossier
├── Organization.ts          ← la racine
└── OrganizationFeature.ts   ← un objet interne

organizational-entities/domain/events/
└── OrganizationArchivedEvent.ts   ← A8 : un événement de la racine
```

```ts
// organization/index.ts — A2 : on exporte la racine, et seulement des types pour le reste
export { Organization } from './Organization.js';
export type { OrganizationProps, OrganizationType } from './Organization.js';
export type {
  FeatureName,
  FeatureParams,
  OrganizationFeature,
  OrganizationFeatureProps,
} from './OrganizationFeature.js';
```

```ts
// organization/Organization.ts — l'AggregateRoot
import { AggregateRoot } from '../../../../shared/domain/models/AggregateRoot.js';
import {
  ArchivedOrganizationError,
  ArchiveOrganizationError,
  FeatureAlreadyEnabledError,
  InvalidOrganizationError,
} from '../../errors.js';
import { OrganizationArchivedEvent } from '../../events/OrganizationArchivedEvent.js';
import {
  type FeatureName,
  type FeatureParams,
  OrganizationFeature,
  type OrganizationFeatureProps,
} from './OrganizationFeature.js';

export const OrganizationTypes = ['SCO', 'SUP', 'PRO', 'SCO-1D'] as const;
export type OrganizationType = (typeof OrganizationTypes)[number];

export type OrganizationProps = {
  id: number | null;
  name: string;
  type: OrganizationType;
  createdBy: number;
  isManagingStudents: boolean;
  features: OrganizationFeatureProps[];
  archivedAt: Date | null;
};

export class Organization extends AggregateRoot {
  readonly id: number | null;
  readonly type: OrganizationType;
  readonly createdBy: number; // A4 : un autre Aggregate, gardé par son id
  #name: string;
  #isManagingStudents: boolean;
  #features: OrganizationFeature[]; // A2 : privé. A6 : une règle les relie à isManagingStudents
  #archivedAt: Date | null; // une date du métier : la date d'archivage
  // A6 : pas de membres ni de campagnes, aucune règle ne les relie à l'organisation

  // A1 : la règle est vérifiée à la construction
  constructor({ id, name, type, createdBy, isManagingStudents, features, archivedAt }: OrganizationProps) {
    super();
    assertValidName(name);
    if (!OrganizationTypes.includes(type)) throw new InvalidOrganizationError(`Unknown type: ${type}`);
    if (isManagingStudents && features.some((feature) => feature.featureName === 'LEARNER_IMPORT')) {
      throw new InvalidOrganizationError('An organization that imports its learners does not manage students');
    }
    this.id = id;
    this.type = type;
    this.createdBy = createdBy;
    this.#name = name;
    this.#isManagingStudents = isManagingStudents;
    this.#features = features.map((feature) => new OrganizationFeature(feature));
    this.#archivedAt = archivedAt;
  }

  // une organisation neuve, sans id
  static create({
    name,
    type,
    createdBy,
  }: {
    name: string;
    type: OrganizationType;
    createdBy: number;
  }): Organization<null> {
    return new Organization({
      id: null,
      name,
      type,
      createdBy,
      isManagingStudents: false,
      features: [],
      archivedAt: null,
    });
  }

  get name(): string {
    return this.#name;
  }

  get isManagingStudents(): boolean {
    return this.#isManagingStudents;
  }

  get archivedAt(): Date | null {
    return this.#archivedAt;
  }

  get isArchived(): boolean {
    return this.#archivedAt !== null;
  }

  // A2 : on lit une copie, qui ne permet de modifier ni la liste ni ses éléments (ils sont immuables)
  get features(): ReadonlyArray<OrganizationFeature> {
    return [...this.#features];
  }

  rename(name: string): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    assertValidName(name);
    this.#name = name;
  }

  archive(this: Organization, now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    this.#archivedAt = now;
    this.recordDomainEvent(
      new OrganizationArchivedEvent({
        organizationId: this.id,
        archivedAt: now,
      }),
    ); // A8
  }

  // A1 : la seule façon d'ajouter une fonctionnalité, et c'est ici que la règle est vérifiée
  enableFeature(featureName: FeatureName, params: FeatureParams): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    if (this.#features.some((feature) => feature.featureName === featureName)) throw new FeatureAlreadyEnabledError();

    this.#features = [...this.#features, new OrganizationFeature({ featureName, params })];
    if (featureName === 'LEARNER_IMPORT') {
      this.#isManagingStudents = false; // A1 : la règle qui relie la racine et ses fonctionnalités
    }
  }
}

function assertValidName(name: string): void {
  if (name.trim() === '') throw new InvalidOrganizationError('The name is required');
}
```

```ts
// organization/OrganizationFeature.ts — un objet interne, créé seulement par la racine
import { InvalidOrganizationError } from '../../errors.js';

export type FeatureName = 'LEARNER_IMPORT' | 'MISSIONS_MANAGEMENT' | 'ATTESTATIONS_MANAGEMENT';
export type FeatureParams = Record<string, unknown> | unknown[] | null;
export type OrganizationFeatureProps = {
  featureName: FeatureName;
  params: FeatureParams;
};

export class OrganizationFeature {
  readonly featureName: FeatureName;
  readonly params: FeatureParams;

  constructor({ featureName, params }: OrganizationFeatureProps) {
    if (featureName === 'LEARNER_IMPORT' && (params === null || Array.isArray(params))) {
      throw new InvalidOrganizationError('LEARNER_IMPORT needs an object of params');
    }
    if (featureName === 'ATTESTATIONS_MANAGEMENT' && !Array.isArray(params)) {
      throw new InvalidOrganizationError('ATTESTATIONS_MANAGEMENT needs a list of params');
    }
    this.featureName = featureName;
    this.params = params;
  }
}
```

## Comment tester

On teste l'Aggregate en passant par la racine, avec un test unitaire sans stub, sans mock ni spy. Le test
couvre :

- chaque règle qui relie la racine et ses objets internes, à la création comme à chaque méthode.
- chaque cas d'erreur, et le fait que rien n'a changé après l'erreur.
- qu'on ne peut pas modifier un objet interne depuis l'extérieur.
- chaque événement enregistré, et l'absence d'événement quand la méthode refuse.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/models/organization/Organization_test.ts
import { expect } from 'chai';

import {
  ArchivedOrganizationError,
  ArchiveOrganizationError,
  FeatureAlreadyEnabledError,
  InvalidOrganizationError,
} from '../../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationArchivedEvent } from '../../../../../../src/organizational-entities/domain/events/OrganizationArchivedEvent.js';
import {
  Organization,
  type OrganizationProps,
  type OrganizationType,
} from '../../../../../../src/organizational-entities/domain/models/organization/index.js';

describe('Unit | Organizational Entities | Domain | Models | Organization', function () {
  const buildOrganization = (props: Partial<OrganizationProps<number>> = {}) =>
    new Organization({
      id: 1,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      createdBy: 2,
      isManagingStudents: false,
      features: [],
      archivedAt: null,
      ...props,
    });

  const learnerImportParams = { name: 'GENERIC' };
  const learnerImport = {
    featureName: 'LEARNER_IMPORT',
    params: learnerImportParams,
  } as const;

  describe('constructor', function () {
    it('refuses an organization that imports its learners and manages students', function () {
      expect(() => buildOrganization({ isManagingStudents: true, features: [learnerImport] })).to.throw(
        InvalidOrganizationError,
      );
    });

    it('refuses an unknown type', function () {
      expect(() => buildOrganization({ type: 'UNKNOWN' as string as OrganizationType })).to.throw(
        InvalidOrganizationError,
      );
    });
  });

  describe('#rename', function () {
    it('refuses an empty name, and changes nothing', function () {
      const organization = buildOrganization();

      expect(() => organization.rename(' ')).to.throw(InvalidOrganizationError);
      expect(organization.name).to.equal('Lycée Victor Hugo');
    });
  });

  describe('#enableFeature', function () {
    it('stops managing students when LEARNER_IMPORT is enabled', function () {
      const organization = buildOrganization({ isManagingStudents: true });

      organization.enableFeature('LEARNER_IMPORT', learnerImportParams);

      expect(organization.isManagingStudents).to.be.false;
    });

    it('refuses a feature on an archived organization, and changes nothing', function () {
      const organization = buildOrganization({
        archivedAt: new Date('2026-01-01'),
        isManagingStudents: true,
      });

      expect(() => organization.enableFeature('LEARNER_IMPORT', learnerImportParams)).to.throw(
        ArchivedOrganizationError,
      );
      expect(organization.features).to.be.empty;
      expect(organization.isManagingStudents).to.be.true;
    });

    it('refuses a feature that is already enabled', function () {
      const organization = buildOrganization({ features: [learnerImport] });

      expect(() => organization.enableFeature('LEARNER_IMPORT', learnerImportParams)).to.throw(
        FeatureAlreadyEnabledError,
      );
      expect(organization.features).to.have.lengthOf(1);
    });
  });

  describe('#archive', function () {
    const now = new Date('2026-01-02');

    it('records an OrganizationArchivedEvent', function () {
      const organization = buildOrganization();

      organization.archive(now);

      expect(organization.pullDomainEvents()).to.deep.equal([
        new OrganizationArchivedEvent({ organizationId: 1, archivedAt: now }),
      ]);
    });

    it('archives an organization', function () {
      const organization = buildOrganization();

      organization.archive(now);

      expect(organization.isArchived).to.be.true;
    });
  });
});
```

## Checklist de revue de code

```
Le groupe a-t-il une raison d'exister ?
[ ] A1  On peut écrire la règle qui relie ces objets
[ ] A6  Chaque objet du groupe est concerné par une règle
[ ] A4  Un autre Aggregate est gardé par son id, pas en entier

Peut-on passer à côté de la racine ?
[ ] A2  Champ des objets internes privé ; getters en copie ; seul index.ts s'importe hors du dossier
[ ] A3  Un seul repository ; aucun repository pour un objet interne

Que se passe-t-il à l'écriture ?
[ ] A7  Le usecase ne modifie qu'un Aggregate
[ ] A8  Chaque événement est enregistré par une méthode de la racine, après ses vérifications, et nommé au passé

Tests
[ ] Chaque règle du groupe a son test, passé par la racine
[ ] Le repository a un test qui enregistre puis recharge tout le groupe
```

## Référence des règles

### A1. Une règle relie les objets

**La règle.** Un Aggregate existe parce qu'une règle du métier relie plusieurs objets.

Test simple : on doit pouvoir finir la phrase « à tout moment, … ». Sinon, ce n'est pas un Aggregate.

Exemple: À tout moment, si `LEARNER_IMPORT` est activée, `isManagingStudents` est `false`.

```ts
  enableFeature(featureName: FeatureName, params: FeatureParams): void {
    …
    if (featureName === 'LEARNER_IMPORT') {
      this.#isManagingStudents = false; // A1 : la règle qui relie la racine et ses fonctionnalités
    }
  }
```

**Exemple de code incorrect.**

```ts
// « ces objets sont affichés ensemble sur l'écran de détail » : ce n'est pas une règle
export class OrganizationDetails {
  readonly organization: Organization;
  readonly members: Membership[];
  readonly campaigns: Campaign[];
}
```

Un groupe d'objets lus ensemble pour un écran est un read-model, pas un Aggregate.

**Ce que ça apporte.** On connaît la règle à garantir. Les objets qu'elle relie sont enregistrés dans
la même transaction, et le reste peut être mis à jour après.

**Sans cette règle.** On regroupe des objets « parce qu'ils vont ensemble ». L'Aggregate grossit :
chaque écriture charge des objets inutiles

### A2. La racine est la seule porte d'entrée

**La règle.** Pour lire ou modifier un objet interne, on passe par la racine. Le champ qui contient les
objets internes est privé, et les getters renvoient des copies. Les objets internes n'ont aucune
méthode qui les modifie : avec la copie de la liste, aucun code hors de la racine ne peut donc les
changer. Hors du dossier de l'Aggregate, on n'importe que son `index.ts`, qui exporte la racine et
seulement le type des objets internes.

**Exemple de code correct.**

```ts
// organization/index.ts
export { Organization } from './Organization.js';
export type { OrganizationProps, OrganizationType } from './Organization.js';
export type {
  FeatureName,
  FeatureParams,
  OrganizationFeature,
  OrganizationFeatureProps,
} from './OrganizationFeature.js';
```

```ts
  // A2 : on lit une copie, qui ne permet de modifier ni la liste ni ses éléments (ils sont immuables)
  get features(): ReadonlyArray<OrganizationFeature> {
    return [...this.#features];
  }
```

On exporte seulement les types : on peut s'en servir dans une signature, mais pas écrire
`new OrganizationFeature(…)` depuis l'extérieur.

**Exemple de code incorrect.**

```ts
// Organization : le getter renvoie la liste elle-même, pas une copie
get features(): OrganizationFeature[] {
  return this.#features;
}
```

Un usecase pourrait alors écrire `organization.features.push({ featureName: 'LEARNER_IMPORT', params: { name: 'GENERIC' } })`
sans passer par `enableFeature()`.

**Ce que ça apporte.** Pour ajouter une fonctionnalité, tout le monde passe par `enableFeature()`, qui
met à jour `isManagingStudents`.

**Sans cette règle.** Un import CSV ajoute `LEARNER_IMPORT` directement à la liste. L'organisation a la
fonctionnalité, mais `isManagingStudents` reste à `true`, et la règle du métier est fausse en base.

**Exceptions.** Lire les objets internes est permis, tant qu'on reçoit une copie.

### A3. Un repository par Aggregate

**La règle.** Chaque Aggregate a un seul repository, celui de la racine. `get()` charge tout le groupe,
`update()` enregistre tout le groupe. Un objet interne n'a pas de repository à lui.

**Exemple de code correct.**

```ts
// Repository — A3 : un seul repository pour tout le groupe
export interface OrganizationRepository {
  get({ id }: { id: number }): Promise<Organization>;
  add({ organization }: { organization: Organization<null> }): Promise<Organization>;
  update({ organization }: { organization: Organization }): Promise<void>;
}
```

Le repository écrit dans deux tables : `organizations` et `organization-features`. Le domaine ne voit pas ces tables : il appelle seulement `update()`.

**Exemple de code incorrect.**

```ts
// un repository rien que pour les fonctionnalités : il écrit sans passer par la racine
export interface OrganizationFeatureRepository {
  save(features: OrganizationFeature[]): Promise<void>;
}
```

**Ce que ça apporte.** On enregistre le groupe d'une seule façon, après que l'Aggregate a vérifié ses
règles.

**Sans cette règle.** Un second repository écrit les fonctionnalités sans charger l'organisation. Les
règles de la racine ne sont jamais vérifiées pour ces écritures.

**Exceptions.** Une lecture qui a besoin de plusieurs Aggregates, par exemple pour un écran, passe par
un read-model. Cette règle ne vise que l'écriture.

### A4. Pas d'objet d'un autre Aggregate

**La règle.** Un Aggregate ne garde pas un objet d'un autre Aggregate, seulement son identifiant. Si
une règle a besoin des données de cet objet, la méthode les reçoit en paramètre.

**Exemple de code correct.**

```ts
// Organization
  readonly createdBy: number; // A4 : un autre Aggregate, gardé par son id
```

**Exemple de code incorrect.**

```ts
// Organization
  readonly createdBy: User; // l'objet entier d'un autre Aggregate
```

**Ce que ça apporte.** Quand on charge une organisation, on ne charge pas l'utilisateur qui l'a
créée. On peut modifier et enregistrer un utilisateur sans toucher aux organisations.

**Sans cette règle.** Le repository doit charger l'utilisateur avec chaque organisation : une requête
ou une jointure de plus. Et on peut modifier l'utilisateur en passant par l'organisation, sans passer
par sa propre racine.

**Exceptions.** Les objets du même Aggregate sont gardés entiers : l'organisation garde ses
fonctionnalités entières, pas leurs id (voir [A6](#a6-petit-aggregate)).

### A6. Petit Aggregate

**La règle.** L'Aggregate ne contient que les objets qu'une règle relie. Les autres forment leurs
propres Aggregates.

**Exemple de code correct.**

```ts
// Organization
export class Organization extends AggregateRoot {
  …
  readonly createdBy: number; // A4 : un autre Aggregate, gardé par son id
  #features: OrganizationFeature[]; // A2 : privé. A6 : une règle les relie à isManagingStudents
  // A6 : pas de membres ni de campagnes, aucune règle ne les relie à l'organisation
  …
}
```

**Exemple de code incorrect.**

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

**Exemple de code correct.**

```ts
// Usecase — A7 : un seul Aggregate modifié
const organization = await organizationRepository.get({ id: organizationId });
organization.enableFeature(featureName, params);
await organizationRepository.update({ organization });
```

Quand un autre Aggregate doit suivre, par exemple les membres quand une organisation est archivée, il
réagit à l'événement de la racine ([A8](#a8-la-racine-enregistre-ses-événements)), dans sa propre
transaction.

**Exemple de code incorrect.**

```ts
// un seul usecase modifie trois Aggregates, de deux contextes, dans la même transaction
organization.archive(clock.now());
await organizationRepository.update({ organization });
await membershipRepository.disableAll({ organizationId });
await invitationRepository.deleteAll({ organizationId });
```

**Ce que ça apporte.** Chaque transaction ne verrouille que les lignes de l'Aggregate modifié.

**Sans cette règle.** La transaction verrouille l'organisation, ses membres et ses invitations. Si la
suppression des invitations échoue, l'archivage est annulé aussi, alors qu'il était valide.

**À savoir.** Si deux Aggregates doivent toujours changer ensemble, dans la même transaction, c'est
un signe qu'ils forment un seul Aggregate. Est-ce qu'une règle les relie-t-elle vraiment ?

### A8. La racine enregistre ses événements

**La règle.** Un événement du domaine dit qu'un changement a eu lieu, par exemple « l'organisation est
archivée ». Il est nommé au passé. C'est la méthode de la racine qui fait le changement qui enregistre
l'événement, après avoir vérifié ses règles. L'événement ne contient que des identifiants et des
valeurs, jamais un objet du domaine.

**Exemple de code correct.**

```ts
  // Organization
  archive(this: Organization, now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    this.#archivedAt = now;
    this.recordDomainEvent(new OrganizationArchivedEvent({ organizationId: this.id, archivedAt: now })); // A8
  }
```

**Exemple de code incorrect.**

```ts
// le usecase crée l'événement lui-même
organization.archive(clock.now());
await organizationRepository.update({ organization });
await eventPublisher.publish(new OrganizationArchivedEvent({ organizationId, archivedAt: clock.now() }));
```

**Ce que ça apporte.** Un événement n'existe que si la racine a accepté le changement. Le code qui
réagit à `OrganizationArchivedEvent` sait que l'organisation est vraiment archivée, et à quelle date.

**Sans cette règle.** Le usecase crée l'événement. Un autre usecase qui archive oublie de le créer, et
les autres contextes ne sont jamais prévenus. Ou bien le usecase crée l'événement avec une autre
date que celle enregistrée par la racine.

**À savoir.**

- `recordDomainEvent()` sera défini dans une classe mère `AggregateRoot` : on ne peut pas l'appeler depuis l'extérieur
  de la racine.
- Seule la racine enregistre des événements. Un objet interne, comme `OrganizationFeature`, n'en
  enregistre pas : c'est la racine qui vérifie les règles du groupe.
- Enregistrer n'est pas publier. Le usecase publie les événements de la racine après la validation de
  la transaction.
