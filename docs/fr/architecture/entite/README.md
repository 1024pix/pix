# Entity

Une Entity est une chose que le métier suit dans le temps : un utilisateur, une campagne, une
organisation. Une Entity a un identifiant. Les valeurs d'une Entity changent, mais l'Entity reste la
même Entity. Les Entities sont dans le dossier `domain/models/`.

En bas de la page, la partie [référence des règles](#référence-des-règles) explique chaque règle avec
un bon exemple et un mauvais exemple.

## Les règles

| # | Règle | En pratique |
| --- | --- | --- |
| [E1](#e1-lidentité-est-explicite-et-stable) | Un identifiant qui ne change pas | un `id` dans l'objet ; aucune méthode ne modifie l'`id` |
| [E2](#e2-légalité-se-fonde-sur-lidentité) | Comparer par identifiant | comparer les `id`, pas les autres champs |
| [E3](#e3-les-invariants-sont-tenus-à-tout-instant) | Toujours valide | le constructeur et chaque méthode refusent un état invalide |
| [E4](#e4-aucune-io-aucune-dépendance-à-linfrastructure) | Aucune I/O | aucun import d'infrastructure ; la date du jour est passée en paramètre |
| [E5](#e5-aucune-méthode-au-service-de-la-persistance) | Rien pour la base de données | pas de `toDTO()` que seul le repository appelle |
| [E6](#e6-aucun-mutateur-nu) | Pas de setter | chaque changement a une méthode avec un nom métier : `rename()`, pas `set name()` |
| [E7](#e7-les-autres-aggregates-sont-référencés-par-identité) | Les autres Aggregates par identifiant | `createdBy: UserId`, pas `creator: User` |
| [E8](#e8-nommage-et-emplacement) | Un nom du métier | un fichier par Entity, en PascalCase, avec un nom du métier |

Une erreur du domaine est une `DomainError`, ou une classe qui hérite de `DomainError`. `DomainError`
est dans le fichier `api/src/shared/domain/errors.js`.

## Exemple complet

Une organisation, simplifiée : un nom, un type, la personne qui a créé l'organisation, et une date
d'archivage. Inventé, d'après
[`Organization.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/Organization.js#L16-L61).

```ts
// organizational-entities/domain/models/Organization.ts — E8 : un fichier, un nom du métier
import type { OrganizationId, UserId } from '../../../shared/domain/Id.js';
import { ArchivedOrganizationError, InvalidOrganizationError } from '../errors.js';

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
};

// Organization<null> : une organisation neuve, pas encore enregistrée
// Organization : une organisation enregistrée, avec un id
export class Organization<Id extends OrganizationId | null = OrganizationId> {
  readonly id: Id; // E1 : l'identifiant, en lecture seule
  readonly type: OrganizationType;
  readonly createdBy: UserId; // E7 : l'identifiant de la personne, pas l'objet User
  readonly createdAt: Date;
  #name: string; // E6 : champ privé, seule la méthode rename() modifie le nom
  #updatedAt: Date;
  #archivedAt: Date | null;

  // E3 : une organisation invalide n'est pas créée
  constructor({ id, name, type, createdBy, createdAt, updatedAt, archivedAt }: OrganizationProps<Id>) {
    assertValidName(name);
    if (!OrganizationTypes.includes(type)) throw new InvalidOrganizationError(`Unknown type: ${type}`);
    this.id = id;
    this.type = type;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.#name = name;
    this.#updatedAt = updatedAt;
    this.#archivedAt = archivedAt;
  }

  // une organisation neuve : pas encore d'id ; E4 : la date est passée en paramètre
  static create({ name, type, createdBy, now }: { name: string; type: OrganizationType; createdBy: UserId; now: Date }): Organization<null> {
    return new Organization({ id: null, name, type, createdBy, createdAt: now, updatedAt: now, archivedAt: null });
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

  // E2 : la comparaison utilise l'id
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
  }

  // E5 : pas de toDTO() ni de toRow() : le repository fait la traduction
}

function assertValidName(name: string): void {
  if (name.trim() === '') throw new InvalidOrganizationError('The name is required');
}
```

## Comment tester

Une Entity se teste avec un test unitaire. Le test n'utilise pas de base de données. Le test n'utilise
pas de **double** : pas de stub, pas de mock, pas de spy. La date est une valeur passée en paramètre.
Le test vérifie :

- le constructeur : une Entity invalide n'est pas créée ;
- chaque méthode qui change l'Entity : le cas qui marche, **et** le refus quand la règle n'est pas
  respectée. Après le refus, l'Entity n'a pas changé ;
- chaque accesseur calculé, comme `isArchived` : les cas limites.

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

    it('refuses to archive an organization already archived, and changes nothing', function () {
      const organization = buildOrganization({ archivedAt: new Date('2026-01-01') });

      expect(() => organization.archive(now)).to.throw(ArchivedOrganizationError);
      expect(organization.updatedAt).to.deep.equal(new Date('2026-01-01'));
    });
  });
});
```

Deux signes d'un problème, pendant l'écriture du test :

- **Le test du refus manque.** C'est l'oubli le plus fréquent. Tester que `archive()` archive ne suffit
  pas : c'est le test du refus qui prouve que la règle E3 est respectée.
- **Le test a besoin d'un double**, ou de bloquer l'heure. L'Entity dépend de l'infrastructure :
  l'Entity ne respecte pas [E4](#e4-aucune-io-aucune-dépendance-à-linfrastructure).

## Comment relire

La checklist suit l'ordre de relecture : les règles qui évitent les bugs les plus graves sont en
premier. Dans un
commentaire de revue, écrire le numéro de la règle et ce qui ne respecte pas la règle : « E6 :
`set name()` permet de changer le nom sans passer par `rename()`, donc sans vérifier le nom ».

```
L'Entity peut-elle devenir invalide ?
[ ] E3  Le constructeur et chaque méthode refusent un état invalide
[ ] E6  Pas de setter ; chaque changement a une méthode avec un nom métier

L'Entity contient-elle trop de choses ?
[ ] E7  Un autre Aggregate est gardé par son identifiant, pas par l'objet entier
[ ] E4  Aucun import d'infrastructure ; ni new Date(), ni Math.random(), ni configuration
[ ] E5  Aucune méthode que seul le repository appelle

L'identifiant est-il clair ?
[ ] E1  Un id dans l'objet ; aucune méthode ne modifie l'id
[ ] E2  Les comparaisons utilisent l'id
[ ] E8  Un fichier, en PascalCase, avec un nom du métier

Les tests
[ ] Chaque méthode qui change l'Entity a un test du refus
```

## Référence des règles

Les bons exemples sont des extraits de l'[exemple complet](#exemple-complet). Les mauvais exemples
montrent la même `Organization` mal écrite.

### E1. L'identité est explicite et stable

**La règle.** L'Entity contient son identifiant. L'identifiant ne change jamais.

**Bon exemple.**

```ts
export class Organization<Id extends OrganizationId | null = OrganizationId> {
  readonly id: Id; // en lecture seule : aucune méthode ne modifie l'id
}
```

**Mauvais exemple.**

```ts
export class Organization {
  id: number; // public et modifiable : n'importe quel code peut changer l'id
}
```

**Ce que ça apporte.** Pour comparer deux Entities ou retrouver une Entity, le code utilise un seul
champ : l'`id`.

**Sans cette règle.** Un code change l'`id` d'une organisation. Le repository enregistre alors les
valeurs de cette organisation sur une autre organisation.

**À savoir.** La base de données crée l'`id` au moment de l'enregistrement. Une Entity neuve n'a donc
pas encore d'`id`. Le type dit si l'Entity a un `id` : `Organization<null>` pour une Entity neuve,
`Organization` pour une Entity enregistrée.

```ts
interface OrganizationRepository {
  add(organization: Organization<null>): Promise<Organization>; // la base crée l'id
  get(id: OrganizationId): Promise<Organization>;
  update(organization: Organization): Promise<void>;
}
```

Chaque usecase dit quel état il accepte :

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

// modification : le usecase reçoit l'id, charge l'Entity, appelle une méthode métier
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

Le compilateur refuse `add()` avec une Entity déjà enregistrée, et `update()` avec une Entity neuve.
Dans une `Organization`, `id` n'est jamais `null`.

### E2. L'égalité se fonde sur l'identité

**La règle.** Deux objets qui ont le même `id` sont la même Entity, même si les autres champs sont
différents. Deux objets qui ont des `id` différents sont deux Entities, même si les autres champs sont
égaux.

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

**Ce que ça apporte.** La même Entity, chargée deux fois à deux moments différents, est reconnue comme
la même Entity.

**Sans cette règle.** Deux organisations qui ont le même nom sont prises pour la même organisation. La
même organisation, chargée avant et après `rename()`, est prise pour deux organisations.

### E3. Les invariants sont tenus à tout instant

**La règle.** Une Entity invalide n'est pas créée. Ensuite, aucune méthode ne rend l'Entity invalide.
Chaque méthode vérifie la règle avant de modifier l'Entity. Si la règle n'est pas respectée, la
méthode lève une erreur du domaine et ne modifie rien.

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

**Ce que ça apporte.** Le code qui reçoit une Entity n'a rien à vérifier : l'Entity est valide. La
règle est écrite une seule fois, dans l'Entity.

**Sans cette règle.** La règle est écrite dans un [usecase](../usecase/README.md). Un autre usecase
renomme l'organisation, oublie la règle, et une organisation a un nom vide.

**À savoir.**

- Un constructeur avec `= {}` et sans aucune vérification accepte `new Organization()` : l'Entity est
  créée vide. Ce code compile, et les tests qui passent des valeurs valides passent : c'est pour
  cela que le problème passe souvent inaperçu.
- Une méthode qui modifie plusieurs champs vérifie tout avant de modifier le premier champ. Sinon,
  une erreur au milieu laisse l'Entity à moitié modifiée.

### E4. Aucune I/O, aucune dépendance à l'infrastructure

**La règle.** Une Entity n'importe rien de l'infrastructure : pas de base de données, pas de log, pas
d'appel HTTP. L'Entity n'appelle pas `new Date()`, pas `Math.random()`, et ne lit pas la
configuration : ces valeurs sont passées en paramètre. Si une règle a besoin d'une donnée que
l'Entity n'a pas, le usecase charge la donnée et passe la donnée à la méthode.

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

**Ce que ça apporte.** Le résultat dépend seulement des paramètres. Le test passe une date et vérifie
le résultat.

**Sans cette règle.** Le test doit bloquer l'heure ou simuler un module. Une Entity qui appelle
`new Date()` donne un résultat différent à chaque exécution du test.

**À savoir.** Un import peut venir de l'infrastructure sans le dire. Un utilitaire importé depuis un
dossier `infrastructure/`, même pour formater une date, est un import d'infrastructure.

### E5. Aucune méthode au service de la persistance

**La règle.** Transformer une Entity pour la base de données est le travail du repository. L'Entity
n'a pas de méthode que seul le repository appelle.

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

**Ce que ça apporte.** L'Entity ne connaît pas la base de données. Un changement dans la base de
données modifie seulement le repository.

**Sans cette règle.** Renommer une colonne de la table oblige à modifier l'Entity.

**Exceptions.** Une méthode qui produit un format décrit dans un document pour l'extérieur, par
exemple un fichier envoyé à un partenaire, est permise. Pour décider, poser la question : si une
colonne de la table changeait de nom, la méthode devrait-elle changer ? Si oui, la méthode sert la
base de données, et la méthode va dans le repository.

### E6. Aucun mutateur nu

**La règle.** Chaque changement de l'Entity passe par une méthode avec un nom métier : `archive()`,
`rename()`. Pas de setter public. Le code extérieur ne modifie pas un champ directement :
`organization.name = 'Lycée Jean Moulin'` dans un usecase ne respecte pas la règle.

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
  this.#name = value; // n'importe quel code peut changer le nom, sans vérification
}
```

**Ce que ça apporte.** Chaque changement passe par une seule méthode. La méthode vérifie la règle
(E3). Le nom de la méthode dit ce qui se passe pour le métier.

**Sans cette règle.** Un setter passe à côté de la règle. La règle E3 est vérifiée seulement dans le
constructeur.

**À savoir.** Une Entity remplie par une suite de setters, `setX()` puis `setY()`, est invalide entre
deux appels. Toutes les valeurs de départ passent par le constructeur.

**Exceptions.** Une Entity sans aucune méthode de changement est permise : certaines Entities ne
changent pas.

### E7. Les autres Aggregates sont référencés par identité

**La règle.** Une Entity ne garde pas un objet d'un autre Aggregate : l'Entity garde l'identifiant de
l'objet. Si une règle a besoin des données de l'autre objet, la méthode reçoit les données en
paramètre.

**Bon exemple.**

```ts
readonly createdBy: UserId; // l'identifiant de la personne
```

**Mauvais exemple.**

```ts
readonly creator: User; // l'objet entier d'un autre Aggregate
```

**Ce que ça apporte.** Charger une Entity charge seulement cette Entity. Chaque Aggregate est modifié
et enregistré seul.

**Sans cette règle.** Le repository doit charger l'utilisateur avec chaque organisation. Plus il y a
d'objets liés, plus le chargement est lent. Et le code peut modifier l'utilisateur à travers
l'organisation.

**Exceptions.** Une Entity garde les objets de son propre Aggregate : un module garde ses sections.

### E8. Nommage et emplacement

**La règle.** Un fichier par Entity, dans le dossier `domain/models/`. Le nom du fichier est le nom
métier de l'Entity, en PascalCase.

**Bon exemple.** `organizational-entities/domain/models/Organization.ts`.

**Mauvais exemple.** `organizational-entities/domain/models/organization-model.ts`.

**Ce que ça apporte.** Une recherche avec le mot du métier, par exemple « Organization », trouve le
fichier.

**Sans cette règle.** Rien ne casse. Le fichier est plus long à trouver, et la revue perd du temps sur
le nom.

**Exceptions.** Deux contextes peuvent avoir chacun une Entity avec le même nom, pour deux choses
différentes. C'est normal : l'import dit de quel contexte vient l'Entity.
