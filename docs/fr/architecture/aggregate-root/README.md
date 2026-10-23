# Aggregate Root

Un Aggregate est un groupe d'objets qu'une règle du métier relie : on les modifie et on les enregistre
ensemble. L'Aggregate Root est l'objet qu'on appelle pour lire ou modifier le groupe. C'est une
[Entity](../entity/README.md) : les règles de la fiche Entity s'appliquent, plus celles de cette fiche.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [A1](#a1-une-règle-relie-les-objets) | Une règle relie les objets | on peut écrire la règle qui oblige ces objets à changer ensemble |
| [A2](#a2-la-racine-est-la-seule-porte-dentrée) | La racine est la seule porte d'entrée | le champ qui contient les objets internes est privé ; hors du dossier, seul `index.ts` s'importe |
| [A3](#a3-un-repository-par-aggregate) | Un repository par Aggregate | `get()` charge tout le groupe, `update()` enregistre tout le groupe |
| [A4](#a4-pas-dobjet-dun-autre-aggregate) | Pas d'objet d'un autre Aggregate | `createdBy: number`, pas `createdBy: User` |
| [A6](#a6-petit-aggregate) | Petit Aggregate | seulement les objets qu'une règle relie |
| [A7](#a7-une-transaction-un-aggregate) | Une transaction, un Aggregate | les autres Aggregates sont modifiés dans leur propre transaction |
| [A8](#a8-la-racine-enregistre-ses-événements) | La racine enregistre ses événements | `archive()` enregistre `OrganizationArchivedEvent`, après avoir vérifié ses règles |

## Exemple complet

L'Aggregate `Organization` : une organisation et ses fonctionnalités activées. Une règle du métier les
relie : si `LEARNER_IMPORT` est activée, `isManagingStudents` est toujours `false`. Le constructeur
refuse l'état inverse, et `enableFeature()` met le champ à `false`. L'organisation garde aussi ses
lots de places, des places achetées pour une période. Une seconde règle les relie : on n'archive pas
une organisation qui a encore des places actives ou en attente. L'exemple ajoute des règles : il refuse
d'ajouter des places à une organisation archivée, et d'activer une fonctionnalité sur une organisation
archivée. Il laisse de côté la suppression d'un lot de places et un nombre de places non défini.
Exemple inventé, d'après
[`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L241-L248)
et
[`archive-organization.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/archive-organization.usecase.js#L17-L21).

Le dossier de l'Aggregate :

```
organizational-entities/domain/models/organization/
├── index.ts                 ← A2 : le seul fichier importable hors du dossier
├── Organization.ts          ← la racine
├── OrganizationFeature.ts   ← un objet interne
└── PlacesLot.ts             ← un objet interne

organizational-entities/domain/events/
└── OrganizationArchivedEvent.ts   ← A8 : un événement de la racine
```

```ts
// shared/domain/models/AggregateRoot.ts — A8 : la liste des événements de la racine
export type DomainEvent = { readonly eventName: string; readonly payload: Record<string, unknown> };

export abstract class AggregateRoot {
  #domainEvents: DomainEvent[] = [];

  // protected : seule une méthode de la racine enregistre un événement
  protected recordDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  // rend les événements et vide la liste, d'où le nom « pull »
  pullDomainEvents(): DomainEvent[] {
    const events = this.#domainEvents;
    this.#domainEvents = [];
    return events;
  }
}
```

```ts
// organizational-entities/domain/events/OrganizationArchivedEvent.ts — A8 : un fait, nommé au passé

export class OrganizationArchivedEvent {
  static readonly eventName = 'organization.archived';
  readonly eventName = OrganizationArchivedEvent.eventName;
  readonly payload: { organizationId: number; archivedAt: Date }; // des id et des valeurs

  constructor(payload: { organizationId: number; archivedAt: Date }) {
    this.payload = payload;
  }
}
```

```ts
// organization/index.ts — A2 : on exporte la racine, et seulement des types pour le reste
export { Organization } from './Organization.js';
export type { OrganizationProps, OrganizationType } from './Organization.js';
export type { FeatureName, FeatureParams, OrganizationFeature, OrganizationFeatureProps } from './OrganizationFeature.js';
export type { PlacesLot, PlacesLotProps } from './PlacesLot.js';
```

```ts
// organization/OrganizationFeature.ts — un objet interne, créé seulement par la racine
import { InvalidOrganizationError } from '../../errors.js';

export type FeatureName = 'LEARNER_IMPORT' | 'MISSIONS_MANAGEMENT' | 'ATTESTATIONS_MANAGEMENT';
export type FeatureParams = Record<string, unknown> | unknown[] | null; // un objet, un tableau ou rien
export type OrganizationFeatureProps = { featureName: FeatureName; params: FeatureParams };

export class OrganizationFeature {
  readonly featureName: FeatureName; // identifie la fonctionnalité dans son organisation
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

```ts
// organization/PlacesLot.ts — un objet interne : des places achetées pour une période
export type PlacesLotProps = { count: number; activationDate: Date; expirationDate: Date | null };

export class PlacesLot {
  readonly count: number;
  readonly activationDate: Date;
  readonly expirationDate: Date | null; // null : le lot n'expire pas

  constructor({ count, activationDate, expirationDate }: PlacesLotProps) {
    this.count = count;
    this.activationDate = activationDate;
    this.expirationDate = expirationDate;
  }

  // un lot pas encore expiré est actif ou en attente ; la date du jour arrive en paramètre
  isExpiredAt(now: Date): boolean {
    return this.expirationDate !== null && this.expirationDate < now;
  }
}
```

```ts
// organization/Organization.ts — la racine
import { AggregateRoot } from '../../../../shared/domain/models/AggregateRoot.js';
import {
  ArchivedOrganizationError,
  ArchiveOrganizationError,
  FeatureAlreadyEnabledError,
  InvalidOrganizationError,
} from '../../errors.js';
import { OrganizationArchivedEvent } from '../../events/OrganizationArchivedEvent.js';
import { type FeatureName, type FeatureParams, OrganizationFeature, type OrganizationFeatureProps } from './OrganizationFeature.js';
import { PlacesLot, type PlacesLotProps } from './PlacesLot.js';

// as const plutôt qu'un enum : la configuration TypeScript de Pix (erasableSyntaxOnly) interdit les enum
export const OrganizationTypes = ['SCO', 'SUP', 'PRO', 'SCO-1D'] as const;
export type OrganizationType = (typeof OrganizationTypes)[number];

export type OrganizationProps<Id> = {
  id: Id;
  name: string;
  type: OrganizationType;
  createdBy: number;
  isManagingStudents: boolean;
  features: OrganizationFeatureProps[]; // des données : c'est la racine qui crée ses objets internes
  placesLots: PlacesLotProps[];
  archivedAt: Date | null;
};

// Organization<null> : une organisation pas encore enregistrée (voir E1 de la fiche Entity)
export class Organization<Id extends number | null = number> extends AggregateRoot {
  readonly id: Id;
  readonly type: OrganizationType;
  readonly createdBy: number; // A4 : un autre Aggregate, gardé par son id
  #name: string;
  #isManagingStudents: boolean;
  #features: OrganizationFeature[]; // A2 : privé. A6 : une règle les relie à isManagingStudents
  #placesLots: PlacesLot[]; // A2 : privé. A6 : une règle les relie à l'archivage
  #archivedAt: Date | null; // une date du métier : la date d'archivage
  // A6 : pas de membres ni de campagnes, aucune règle ne les relie à l'organisation

  // A1 : la règle est vérifiée à la construction
  constructor({ id, name, type, createdBy, isManagingStudents, features, placesLots, archivedAt }: OrganizationProps<Id>) {
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
    this.#placesLots = placesLots.map((placesLot) => new PlacesLot(placesLot));
    this.#archivedAt = archivedAt;
  }

  // une organisation neuve, sans id
  static create({ name, type, createdBy }: { name: string; type: OrganizationType; createdBy: number }): Organization<null> {
    return new Organization({ id: null, name, type, createdBy, isManagingStudents: false, features: [], placesLots: [], archivedAt: null });
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

  // A2 : une copie, comme pour les fonctionnalités
  get placesLots(): ReadonlyArray<PlacesLot> {
    return [...this.#placesLots];
  }

  rename(name: string): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    assertValidName(name);
    this.#name = name;
  }

  // la date d'archivage arrive en paramètre : l'Entity ne lit pas l'horloge
  // this: Organization : seule une organisation enregistrée, qui a un id, peut être archivée
  // A1 : une organisation qui a encore des places actives ou en attente n'est pas archivée
  archive(this: Organization, now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    if (this.#placesLots.some((placesLot) => !placesLot.isExpiredAt(now))) throw new ArchiveOrganizationError();
    this.#archivedAt = now;
    this.recordDomainEvent(new OrganizationArchivedEvent({ organizationId: this.id, archivedAt: now })); // A8
  }

  // A1 : la règle inverse : on n'ajoute pas de places à une organisation archivée
  addPlacesLot(placesLot: PlacesLotProps): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    this.#placesLots = [...this.#placesLots, new PlacesLot(placesLot)];
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
// domain/repositories/OrganizationRepository.ts — A3 : un seul repository pour tout le groupe
import type { Organization } from '../models/organization/index.js';

export interface OrganizationRepository {
  get({ id }: { id: number }): Promise<Organization>; // l'organisation, ses fonctionnalités et ses lots de places
  add({ organization }: { organization: Organization<null> }): Promise<Organization>;
  update({ organization }: { organization: Organization }): Promise<void>; // tout le groupe, lots de places compris
}
```

```ts
// domain/usecases/enable-organization-feature.ts — A7 : un seul Aggregate modifié
// raccourci : la transaction est montrée dans la fiche usecase
import type { FeatureName, FeatureParams } from '../models/organization/index.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';

export const enableOrganizationFeature = async ({
  organizationId,
  featureName,
  params,
  organizationRepository,
}: {
  organizationId: number;
  featureName: FeatureName;
  params: FeatureParams;
  organizationRepository: OrganizationRepository;
}): Promise<void> => {
  const organization = await organizationRepository.get({ id: organizationId });
  organization.enableFeature(featureName, params);
  await organizationRepository.update({ organization });
};
```

## Comment tester

On teste l'Aggregate en passant par la racine, avec un test unitaire sans stub, mock ni spy. Le test
couvre :

- chaque règle qui relie la racine et ses objets internes, à la création comme à chaque méthode.
  Exemples : `refuses an organization that imports its learners and manages students`,
  `stops managing students when LEARNER_IMPORT is enabled`,
  `refuses places on an archived organization, and changes nothing` ;
- chaque cas d'erreur, et le fait que rien n'a changé après l'erreur. Exemples :
  `refuses a feature on an archived organization, and changes nothing`,
  `refuses a feature that is already enabled`, `refuses an empty name, and changes nothing` ;
- qu'on ne peut pas modifier un objet interne depuis l'extérieur. Exemple :
  `cannot change the features through the returned list` ;
- chaque événement enregistré, et l'absence d'événement quand la méthode refuse. Exemples :
  `records an OrganizationArchivedEvent`,
  `refuses an organization that still has active or pending places, and records no event`.

Le repository se teste à part, avec un test d'intégration sur la base : on enregistre l'Aggregate, on
le recharge, et on vérifie que tout le groupe est revenu. Exemple :
`saves and reloads the organization with its features and its places lots`.

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
      placesLots: [],
      archivedAt: null,
      ...props,
    });

  const learnerImportParams = { name: 'GENERIC' };
  const learnerImport = { featureName: 'LEARNER_IMPORT', params: learnerImportParams } as const;

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
      const organization = buildOrganization({ archivedAt: new Date('2026-01-01'), isManagingStudents: true });

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

    it('refuses an organization that still has active or pending places, and records no event', function () {
      const placesLot = { count: 30, activationDate: new Date('2026-01-01'), expirationDate: new Date('2026-12-31') };
      const organization = buildOrganization({ placesLots: [placesLot] });

      expect(() => organization.archive(now)).to.throw(ArchiveOrganizationError);
      expect(organization.isArchived).to.be.false;
      expect(organization.pullDomainEvents()).to.be.empty;
    });

    it('refuses an organization that has pending places', function () {
      const placesLot = { count: 30, activationDate: new Date('2026-03-01'), expirationDate: null };
      const organization = buildOrganization({ placesLots: [placesLot] });

      expect(() => organization.archive(now)).to.throw(ArchiveOrganizationError);
      expect(organization.isArchived).to.be.false;
    });

    it('archives an organization whose places have all expired', function () {
      const placesLot = { count: 30, activationDate: new Date('2025-01-01'), expirationDate: new Date('2025-12-31') };
      const organization = buildOrganization({ placesLots: [placesLot] });

      organization.archive(now);

      expect(organization.isArchived).to.be.true;
    });
  });

  describe('#addPlacesLot', function () {
    it('refuses places on an archived organization, and changes nothing', function () {
      const organization = buildOrganization({ archivedAt: new Date('2026-01-01') });

      expect(() =>
        organization.addPlacesLot({ count: 30, activationDate: new Date('2026-02-01'), expirationDate: null }),
      ).to.throw(ArchivedOrganizationError);
      expect(organization.placesLots).to.be.empty;
    });
  });

  describe('#features', function () {
    it('cannot change the features through the returned list', function () {
      const organization = buildOrganization();

      // ReadonlyArray interdit push à la compilation. On force le type pour vérifier qu'à l'exécution,
      // on reçoit bien une copie
      (organization.features as unknown as unknown[]).push(learnerImport);

      expect(organization.features).to.be.empty;
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

**La règle.** Un Aggregate existe parce qu'une règle du métier relie plusieurs objets. Test simple :
on doit pouvoir finir la phrase « à tout moment, … ». Sinon, ce n'est pas un Aggregate.

**Exemple de code correct.**

```ts
// Organization
  // A1 : la seule façon d'ajouter une fonctionnalité, et c'est ici que la règle est vérifiée
  enableFeature(featureName: FeatureName, params: FeatureParams): void {
    …
    if (featureName === 'LEARNER_IMPORT') {
      this.#isManagingStudents = false; // A1 : la règle qui relie la racine et ses fonctionnalités
    }
  }
```

La phrase se finit : à tout moment, si `LEARNER_IMPORT` est activée, `isManagingStudents` est `false`.

**Exemple de code incorrect.**

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
objets internes est privé, et les getters renvoient des copies. Les objets internes n'ont aucune
méthode qui les modifie : avec la copie de la liste, aucun code hors de la racine ne peut donc les
changer. Hors du dossier de l'Aggregate, on n'importe que son `index.ts`, qui exporte la racine et
seulement le type des objets internes.

**Exemple de code correct.**

```ts
// organization/index.ts
export { Organization } from './Organization.js';
export type { OrganizationProps, OrganizationType } from './Organization.js';
export type { FeatureName, FeatureParams, OrganizationFeature, OrganizationFeatureProps } from './OrganizationFeature.js';
export type { PlacesLot, PlacesLotProps } from './PlacesLot.js';
```

```ts
// Organization
  // A2 : on lit une copie, qui ne permet de modifier ni la liste ni ses éléments (ils sont immuables)
  get features(): ReadonlyArray<OrganizationFeature> {
    return [...this.#features];
  }
```

On exporte seulement le type : on peut s'en servir dans une signature, mais pas écrire
`new OrganizationFeature(…)` depuis l'extérieur.

**Exemple de code incorrect.**

```ts
// Organization : le getter renvoie la liste elle-même, pas une copie
get features(): OrganizationFeature[] {
  return this.#features;
}
```

Un usecase peut alors écrire `organization.features.push({ featureName: 'LEARNER_IMPORT', params: { name: 'GENERIC' } })`
sans passer par `enableFeature()`.

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
  to: { path: '^src/organizational-entities/domain/models/organization/', pathNot: 'index\\.(js|ts)$' },
}
```

**Exceptions.** Lire les objets internes est permis, tant qu'on reçoit une copie.

### A3. Un repository par Aggregate

**La règle.** Chaque Aggregate a un seul repository, celui de la racine. `get()` charge tout le groupe,
`update()` enregistre tout le groupe. Un objet interne n'a pas de repository à lui.

**Exemple de code correct.**

```ts
// domain/repositories/OrganizationRepository.ts — A3 : un seul repository pour tout le groupe
…
export interface OrganizationRepository {
  get({ id }: { id: number }): Promise<Organization>; // l'organisation, ses fonctionnalités et ses lots de places
  add({ organization }: { organization: Organization<null> }): Promise<Organization>;
  update({ organization }: { organization: Organization }): Promise<void>; // tout le groupe, lots de places compris
}
```

Le repository écrit dans trois tables : `organizations`, `organization-features` et
`organization-places`. Le domaine ne voit pas ces tables : il appelle seulement `update()`.

**Exemple de code incorrect.**

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
propres Aggregates, et sont gardés par leur identifiant.

**Exemple de code correct.**

```ts
// Organization
export class Organization<Id extends number | null = number> extends AggregateRoot {
  …
  readonly createdBy: number; // A4 : un autre Aggregate, gardé par son id
  …
  #features: OrganizationFeature[]; // A2 : privé. A6 : une règle les relie à isManagingStudents
  #placesLots: PlacesLot[]; // A2 : privé. A6 : une règle les relie à l'archivage
  #archivedAt: Date | null; // une date du métier : la date d'archivage
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
// domain/usecases/enable-organization-feature.ts — A7 : un seul Aggregate modifié
…
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
un signe qu'ils forment un seul Aggregate. À vérifier : une règle les relie-t-elle vraiment ?

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
    if (this.#placesLots.some((placesLot) => !placesLot.isExpiredAt(now))) throw new ArchiveOrganizationError();
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

- `recordDomainEvent()` est `protected` dans `AggregateRoot` : on ne peut pas l'appeler depuis l'extérieur
  de la racine.
- Seule la racine enregistre des événements. Un objet interne, comme `OrganizationFeature`, n'en
  enregistre pas : c'est la racine qui vérifie les règles du groupe.
- Enregistrer n'est pas publier. Le usecase publie les événements de la racine après la validation de
  la transaction, avec `DomainTransaction.addSuccessHandler` : voir la fiche
  [usecase](../usecase/README.md).
