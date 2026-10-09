# Entity

Une Entity est un objet que le produit suit dans le temps : un utilisateur, une campagne, une
organisation. Elle a un identifiant. Ses valeurs changent, mais elle reste la même Entity. Les Entities
se rangent dans `domain/models/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [E1](#e1-un-identifiant-qui-ne-change-pas) | Un identifiant qui ne change pas | aucune méthode ne modifie l'identifiant |
| [E2](#e2-comparer-par-identifiant) | Comparer par identifiant | on compare les `id`, pas les autres champs |
| [E3](#e3-toujours-valide) | Toujours valide | le constructeur et chaque méthode lèvent une `DomainError` si une règle n'est pas respectée |
| [E4](#e4-aucun-effet-de-bord-extérieur) | Aucun effet de bord extérieur | pas d'import d'infrastructure ; la date du jour est passée en paramètre |
| [E5](#e5-rien-pour-la-base-de-données) | Rien pour la base de données | pas de `toDTO()` ni de `fromDTO()`, c'est le travail du repository |
| [E6](#e6-pas-de-setter) | Pas de setter | chaque changement a sa méthode métier : `rename()`, pas `set name()` |
| [E7](#e7-les-autres-aggregates-par-identifiant) | Les autres Aggregates par identifiant | `createdBy: UserId`, pas `creator: User` |
| [E8](#e8-un-nom-du-métier) | Un nom du métier | un fichier par Entity, en PascalCase, nommé avec le mot du métier |
| [E9](#e9-seule-une-aggregate-root-émet-des-événements) | Seule une Aggregate Root émet des événements | `emitDomainEvent()` est protégé dans `AggregateRoot` |

## Exemple complet

Une organisation simplifiée : un nom, un type, la personne qui l'a créée, les fonctionnalités activées
et une date d'archivage. Exemple inventé, d'après
[`Organization.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/Organization.js#L16-L61).

```ts
// organizational-entities/domain/models/Organization.ts — E8 : un fichier, nommé avec le mot du métier
import type { OrganizationId, UserId } from '../../../shared/domain/Id.js';
import { ArchivedOrganizationError, FeatureAlreadyEnabledError, InvalidOrganizationError } from '../errors.js';
import { type FeatureName, OrganizationFeature } from './OrganizationFeature.js';
import { AggregateRoot } from '../../../shared/domain/models/AggregateRoot.js';
import { OrganizationArchived } from '../events/OrganizationArchived.js';

export const OrganizationTypes = ['SCO', 'SUP', 'PRO', 'SCO-1D'] as const;
export type OrganizationType = (typeof OrganizationTypes)[number];

type OrganizationProps<Id> = {
  id: Id;
  name: string;
  type: OrganizationType;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  features: OrganizationFeature[];
};

// Organization<null> : une organisation neuve, pas encore enregistrée
// Organization : une organisation enregistrée, avec un id
// E9 : une Aggregate Root, qui peut émettre des événements
export class Organization<Id extends OrganizationId | null = OrganizationId> extends AggregateRoot {
  readonly id: Id; // E1 : en lecture seule
  readonly type: OrganizationType;
  readonly createdBy: UserId; // E7 : un autre Aggregate, gardé par son id
  readonly createdAt: Date;
  #name: string; // E6 : privé, seul rename() le modifie
  #updatedAt: Date;
  #archivedAt: Date | null;
  #features: OrganizationFeature[]; // E7 : des objets du même Aggregate, gardés entiers

  // E3 : refuse une organisation invalide
  constructor({ id, name, type, createdBy, createdAt, updatedAt, archivedAt, features }: OrganizationProps<Id>) {
    super();
    assertValidName(name);
    if (!OrganizationTypes.includes(type)) throw new InvalidOrganizationError(`Unknown type: ${type}`);
    this.id = id;
    this.type = type;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.#name = name;
    this.#updatedAt = updatedAt;
    this.#archivedAt = archivedAt;
    this.#features = [...features];
  }

  // une organisation neuve, sans id ; E4 : la date arrive en paramètre
  static create({ name, type, createdBy, now }: { name: string; type: OrganizationType; createdBy: UserId; now: Date }): Organization<null> {
    return new Organization({ id: null, name, type, createdBy, createdAt: now, updatedAt: now, archivedAt: null, features: [] });
  }

  get name(): string {
    return this.#name;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  get archivedAt(): Date | null {
    return this.#archivedAt;
  }

  get isArchived(): boolean {
    return this.#archivedAt !== null;
  }

  get features(): OrganizationFeature[] {
    return [...this.#features];
  }

  // E2 : on compare les id
  isSameAs(other: Organization): boolean {
    return this.id === other.id;
  }

  // E6 : un nom métier ; E3 : tout vérifier avant de modifier
  rename(name: string, now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    assertValidName(name);
    this.#name = name;
    this.#updatedAt = now;
  }

  archive(now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    this.#archivedAt = now;
    this.#updatedAt = now;
    this.emitDomainEvent(new OrganizationArchived({ organizationId: this.id, archivedAt: now })); // E9
  }

  enableFeature(featureName: FeatureName, now: Date): void {
    if (this.isArchived) throw new ArchivedOrganizationError();
    if (this.#features.some((feature) => feature.featureName === featureName)) {
      throw new FeatureAlreadyEnabledError();
    }
    this.#features = [...this.#features, new OrganizationFeature({ featureName, enabledAt: now })];
    this.#updatedAt = now;
  }

  // E5 : pas de toDTO() : la traduction est dans le repository
}

function assertValidName(name: string): void {
  if (name.trim() === '') throw new InvalidOrganizationError('The name is required');
}
```

## Comment tester

Une Entity se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- le constructeur : une Entity invalide n'est pas créée. Exemple : `refuses an empty name` ;
- chaque méthode qui modifie l'Entity : le cas qui marche, et le cas d'erreur. Après une erreur,
  l'Entity n'a pas changé. Exemples : `renames the organization` et
  `refuses an empty name, and changes nothing` ;
- les getters calculés, comme `isArchived`, avec leurs cas limites. Exemple :
  `archives the organization`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/models/Organization_test.ts
describe('Unit | Organizational Entities | Domain | Models | Organization', function () {
  const now = new Date('2026-01-02');

  const buildOrganization = (props: Partial<OrganizationProps<OrganizationId>> = {}) =>
    new Organization({
      id: 1 as OrganizationId,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      createdBy: 2 as UserId,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      archivedAt: null,
      features: [],
      ...props,
    });

  it('refuses an empty name', function () {
    expect(() => buildOrganization({ name: ' ' })).to.throw(InvalidOrganizationError);
  });

  describe('.create', function () {
    it('creates a new organization, without id', function () {
      const organization = Organization.create({ name: 'Lycée Victor Hugo', type: 'SCO', createdBy: 2 as UserId, now });

      expect(organization.id).to.be.null;
      expect(organization.createdAt).to.deep.equal(now);
    });
  });

  describe('#rename', function () {
    it('renames the organization', function () {
      const organization = buildOrganization();

      organization.rename('Lycée Jean Moulin', now);

      expect(organization.name).to.equal('Lycée Jean Moulin');
      expect(organization.updatedAt).to.deep.equal(now);
    });

    it('refuses an empty name, and changes nothing', function () {
      const organization = buildOrganization();

      expect(() => organization.rename(' ', now)).to.throw(InvalidOrganizationError);
      expect(organization.name).to.equal('Lycée Victor Hugo');
    });
  });

  describe('#archive', function () {
    it('archives the organization', function () {
      const organization = buildOrganization();

      organization.archive(now);

      expect(organization.isArchived).to.be.true;
    });

    it('emits an OrganizationArchived event', function () {
      const organization = buildOrganization();

      organization.archive(now);

      expect(organization.pullDomainEvents()).to.deep.equal([
        new OrganizationArchived({ organizationId: 1 as OrganizationId, archivedAt: now }),
      ]);
    });

    it('refuses to archive an organization already archived, and changes nothing', function () {
      const organization = buildOrganization({ archivedAt: new Date('2026-01-01') });

      expect(() => organization.archive(now)).to.throw(ArchivedOrganizationError);
      expect(organization.updatedAt).to.deep.equal(new Date('2026-01-01'));
    });
  });

  describe('#enableFeature', function () {
    it('enables a feature', function () {
      const organization = buildOrganization();

      organization.enableFeature('MISSIONS_MANAGEMENT', now);

      expect(organization.features.map((feature) => feature.featureName)).to.deep.equal(['MISSIONS_MANAGEMENT']);
    });

    it('refuses a feature already enabled, and changes nothing', function () {
      const organization = buildOrganization();
      organization.enableFeature('MISSIONS_MANAGEMENT', now);

      expect(() => organization.enableFeature('MISSIONS_MANAGEMENT', now)).to.throw(FeatureAlreadyEnabledError);
      expect(organization.features).to.have.lengthOf(1);
    });
  });
});
```

## Checklist de revue de code

```
Peut-elle devenir invalide ?
[ ] E3  Le constructeur et chaque méthode refusent un état invalide
[ ] E6  Pas de setter ; chaque changement a sa méthode métier

Dépend-elle d'autre chose ?
[ ] E7  Un autre Aggregate est gardé par son id, pas en entier
[ ] E4  Pas d'import d'infrastructure, pas de new Date(), Math.random() ni config
[ ] E9  Seule une Aggregate Root émet des événements
[ ] E5  Pas de méthode utilisée seulement par le repository

Son identité est-elle nette ?
[ ] E1  Aucune méthode ne modifie l'identifiant
[ ] E2  Les comparaisons se font sur l'id
[ ] E8  Un fichier en PascalCase, nommé avec le mot du métier

Tests
[ ] Chaque méthode qui modifie l'Entity a un test du cas d'erreur
```

## Référence des règles

### E1. Un identifiant qui ne change pas

**La règle.** L'identifiant est un champ de l'Entity, souvent nommé `id`. Aucune méthode ne le
modifie. Il a un type dédié, comme `OrganizationId`, ou un Value Object : même quand la valeur est un
entier, on ne le type pas en simple `number`.
Dans le code de Pix, l'identifiant prend plusieurs formes :

- un entier créé par la base de données, le cas le plus courant : `Organization` ;
- une chaîne venue du référentiel : `skillId`, `tubeId`, `challengeId` ;
- un UUID : les modules, les chats ;
- une valeur du métier : le `code` d'une campagne, le `slug` d'un module.

**Bon exemple.**

```ts
export class Organization<Id extends OrganizationId | null = OrganizationId> {
  readonly id: Id; // en lecture seule : personne ne peut le modifier
}
```

**Mauvais exemple.**

```ts
export class Organization {
  id: number; // public : modifiable de partout
}
```

**Ce que ça apporte.** Une Entity se compare et se retrouve par son seul identifiant. Et grâce au type
dédié, le compilateur refuse un `UserId` à la place d'un `OrganizationId`.

**Sans cette règle.** Si du code change l'`id` d'une organisation, le repository écrase les données
d'une autre organisation avec les siennes.

**À savoir.** La base de données crée l'`id` à l'enregistrement, donc une Entity neuve n'en a pas
encore. Le type le dit : `Organization<null>` pour une Entity neuve, `Organization` pour une Entity
enregistrée.

```ts
interface OrganizationRepository {
  add(organization: Organization<null>): Promise<Organization>; // la base crée l'id
  get(id: OrganizationId): Promise<Organization>;
  update(organization: Organization): Promise<void>;
}
```

Chaque usecase dit quelle forme il attend :

```ts
// création : le usecase reçoit une Entity neuve
const createOrganization = async ({
  organization,
  organizationRepository,
}: {
  organization: Organization<null>;
  organizationRepository: OrganizationRepository;
}): Promise<Organization> => {
  return organizationRepository.add(organization);
};

// modification : le usecase reçoit l'id, charge l'Entity puis appelle sa méthode
const archiveOrganization = async ({
  organizationId,
  organizationRepository,
  clock,
}: {
  organizationId: OrganizationId;
  organizationRepository: OrganizationRepository;
  clock: Clock;
}): Promise<Organization> => {
  const organization = await organizationRepository.get(organizationId);
  organization.archive(clock.now());
  await organizationRepository.update(organization);
  return organization;
};
```

Le compilateur vérifie que `add()` ne reçoit pas une Entity déjà enregistrée, et que `update()` ne
reçoit pas une Entity neuve. Une `Organization`, sans `<null>`, a toujours un `id`.

### E2. Comparer par identifiant

**La règle.** Deux objets avec le même `id` sont la même Entity, même si leurs autres champs
diffèrent. Deux objets avec des `id` différents sont deux Entities, même si tout le reste est égal.

**Bon exemple.**

```ts
isSameAs(other: Organization): boolean {
  return this.id === other.id;
}
```

**Mauvais exemple.**

```ts
isSameAs(other: Organization): boolean {
  return this.name === other.name; // compare le nom, pas l'id
}
```

**Ce que ça apporte.** La même Entity, chargée à deux moments différents, est bien reconnue comme la
même.

**Sans cette règle.** Deux organisations qui portent le même nom sont confondues. Et la même
organisation, chargée avant puis après `rename()`, passe pour deux organisations.

### E3. Toujours valide

**La règle.** Une Entity invalide n'est jamais créée, et aucune méthode ne peut la rendre invalide.
Chaque méthode vérifie d'abord la règle. Si la règle n'est pas respectée, elle lève une erreur du
domaine et ne modifie rien.

**Bon exemple.**

```ts
rename(name: string, now: Date): void {
  if (this.isArchived) throw new ArchivedOrganizationError(); // vérifier d'abord
  assertValidName(name); // vérifier d'abord
  this.#name = name; // modifier ensuite
  this.#updatedAt = now;
}
```

**Mauvais exemple.**

```ts
constructor({ id, name, type, createdBy }: OrganizationProps = {}) {
  this.id = id;
  this.name = name; // aucune vérification : new Organization() crée une organisation vide
  this.type = type;
  this.createdBy = createdBy;
}
```

**Ce que ça apporte.** Quand on reçoit une organisation, on sait que son nom n'est pas vide et que son
type existe. Il n'y a rien à revérifier, et la règle n'est écrite qu'une fois, dans l'Entity.

**Sans cette règle.** La règle est écrite dans un [usecase](../usecase/README.md). Un autre usecase
renomme l'organisation sans la vérifier, et on se retrouve avec un nom vide.

**À savoir.**

- Un constructeur avec `= {}` et sans vérification accepte `new Organization()`, et crée une
  organisation vide. Ça compile, et un test qui ne vérifie pas ce cas
  ne voit rien.
- Si une méthode modifie plusieurs champs, elle vérifie tout avant de modifier le premier. Sinon, une
  erreur en cours de route laisse l'Entity à moitié modifiée.

### E4. Aucun effet de bord extérieur

**La règle.** Une Entity n'importe rien de l'infrastructure : pas de base de données, pas de log, pas
d'appel HTTP. Elle n'appelle pas `new Date()` ni `Math.random()`, et ne lit pas la configuration. Ces
valeurs arrivent en paramètre. Si une règle a besoin d'une donnée que l'Entity n'a pas, le usecase la
charge et la passe en paramètre.

**Bon exemple.**

```ts
archive(now: Date): void {
  if (this.isArchived) throw new ArchivedOrganizationError();
  this.#archivedAt = now; // la date est passée en paramètre
  this.#updatedAt = now;
}
```

**Mauvais exemple.**

```ts
archive(): void {
  if (this.isArchived) throw new ArchivedOrganizationError();
  this.#archivedAt = new Date(); // l'Entity lit l'heure
  this.#updatedAt = new Date();
}
```

**Ce que ça apporte.** Le résultat ne dépend que des paramètres. Le test passe une date et vérifie le
résultat.

**Sans cette règle.** Le test doit figer l'heure ou simuler un module. Et une Entity qui appelle
`new Date()` ne donne pas le même résultat d'un lancement à l'autre.

**À savoir.** Un import d'infrastructure ne se voit pas toujours. Un utilitaire importé depuis un
dossier `infrastructure/`, même pour formater une date, en est un.

### E5. Rien pour la base de données

**La règle.** Traduire une Entity vers la base de données, ou l'inverse, c'est le travail du
repository. L'Entity n'a pas de méthode que seul le repository utilise, comme `toDTO()` ou
`fromDTO()`.

**Bon exemple.**

```ts
// organizational-entities/infrastructure/repositories/organization-repository.ts
const toRow = (organization: Organization<OrganizationId | null>) => ({
  id: organization.id,
  name: organization.name,
  type: organization.type,
  createdBy: organization.createdBy,
  updatedAt: organization.updatedAt,
  archivedAt: organization.archivedAt,
});
```

La traduction est une fonction du repository, pas une méthode de l'Entity.

**Mauvais exemple.**

```ts
export class Organization {
  toDTO() {
    // seul le repository appelle cette méthode
    return { id: this.id, name: this.name, type: this.type, created_by: this.createdBy };
  }
}
```

**Ce que ça apporte.** L'Entity ne contient aucun nom de colonne. Un changement dans la base de
données ne touche que le repository.

**Sans cette règle.** Renommer une colonne oblige à modifier l'Entity.

### E6. Pas de setter

**La règle.** Chaque changement passe par une méthode au nom métier, comme `archive()` ou `rename()`.
Pas de setter public, et pas de champ modifié depuis l'extérieur : `organization.name = 'Lycée Jean
Moulin'` dans un usecase ne respecte pas la règle.

**Bon exemple.**

```ts
#name: string; // privé

rename(name: string, now: Date): void {
  …
}
```

**Mauvais exemple.**

```ts
#name: string;

set name(value: string) {
  this.#name = value; // tout le monde peut changer le nom, sans vérification
}
```

**Ce que ça apporte.** Chaque changement passe par une seule méthode, qui vérifie la règle (E3). Et le
nom de la méthode dit ce qui se passe côté métier.

**Sans cette règle.** Un setter modifie le champ sans rien vérifier. `organization.name = ''` donne une
organisation sans nom, sans aucune erreur.

**À savoir.** Une organisation remplie par `setName(…)` puis `setType(…)` est invalide entre les deux
appels : elle a un nom, mais pas de type. Les valeurs de départ passent toutes par le constructeur.

**Exceptions.** Une Entity sans méthode de modification est permise : certaines Entities ne changent
jamais.

### E7. Les autres Aggregates par identifiant

**La règle.** Une Entity ne garde pas un objet d'un autre Aggregate, seulement son identifiant. Si une
règle a besoin des données de cet objet, la méthode les reçoit en paramètre.

**Bon exemple.**

```ts
readonly createdBy: UserId; // l'identifiant de la personne
```

**Mauvais exemple.**

```ts
readonly creator: User; // l'objet entier d'un autre Aggregate
```

**Ce que ça apporte.** Quand on charge une organisation, on ne charge pas l'utilisateur avec. On peut
modifier et enregistrer l'un sans toucher à l'autre.

**Sans cette règle.** Le repository doit charger l'utilisateur avec chaque organisation. Chaque objet
lié ajoute une requête ou une jointure. Et on peut modifier l'utilisateur en passant par
l'organisation.

**Exceptions.** Une Entity garde entiers les objets de son propre Aggregate. Dans l'exemple complet,
`Organization` garde ses `OrganizationFeature`, mais seulement l'identifiant de `createdBy`, car un
utilisateur est un autre Aggregate.

**À savoir.** Si le chargement d'un Aggregate est trop lent en production, et que c'est mesuré, il y a
deux options. Soit on découpe l'Aggregate, si aucune règle ne relie ses objets. Soit on écrit une
requête dédiée à cette lecture, un read-model. Mais on ne charge jamais une Entity à moitié.

### E8. Un nom du métier

**La règle.** Un fichier par Entity, dans `domain/models/`. Le fichier porte le nom métier de l'Entity,
en PascalCase.

**Bon exemple.** `organizational-entities/domain/models/Organization.ts`.

**Mauvais exemple.** `organizational-entities/domain/models/orga-model.ts`.

**Ce que ça apporte.** En cherchant le mot du métier, par exemple « Organization », on trouve le
fichier.

**Sans cette règle.** On ne retrouve pas le fichier en cherchant le mot du métier, et il faut l'ouvrir
pour savoir ce qu'il contient.

**Exceptions.** Deux contextes, comme `prescription` et `team` dans `src/`, peuvent avoir chacun une
Entity du même nom, avec un sens différent. Le chemin de l'import montre de quel contexte elle vient.

### E9. Seule une Aggregate Root émet des événements

**La règle.** Un événement du domaine annonce qu'un changement a eu lieu, par exemple « l'organisation
est archivée ». Seule une Aggregate Root émet des événements, depuis ses propres méthodes. Pour
l'imposer, `emitDomainEvent()` est protégée dans la classe `AggregateRoot` : on ne peut pas l'appeler
de l'extérieur.

**Bon exemple.**

```ts
// shared/domain/models/AggregateRoot.ts
export abstract class AggregateRoot {
  #domainEvents: DomainEvent[] = [];

  protected emitDomainEvent(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  // renvoie les événements et vide la liste, d'où le nom « pull »
  pullDomainEvents(): DomainEvent[] {
    const events = this.#domainEvents;
    this.#domainEvents = [];
    return events;
  }
}
```

```ts
archive(now: Date): void {
  if (this.isArchived) throw new ArchivedOrganizationError();
  this.#archivedAt = now;
  this.#updatedAt = now;
  this.emitDomainEvent(new OrganizationArchived({ organizationId: this.id, archivedAt: now }));
}
```

**Mauvais exemple.**

```ts
export class OrganizationFeature {
  enable(now: Date): void {
    …
    domainEvents.emit(new FeatureEnabled({ featureName: this.featureName })); // une Entity interne émet elle-même
  }
}
```

**Ce que ça apporte.** L'événement est émis par la racine, celle qui vérifie les règles de tout
l'Aggregate. Quand
`OrganizationArchived` est émis, `archive()` a déjà vérifié toutes les règles de l'archivage.

**Sans cette règle.** Une Entity interne émet un événement sans que la racine ait vérifié les règles.
Le code qui réagit à l'événement traite un changement que la racine n'a pas validé.

**À savoir.** Les événements sont publiés après l'enregistrement, quand la transaction est validée.
C'est un code placé autour du usecase qui s'en charge, comme `runInTransaction`. Le usecase et le
repository ne publient rien eux-mêmes.
