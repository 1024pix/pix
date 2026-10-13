# Entity

Une Entity est un objet que le produit suit dans le temps : un utilisateur, une campagne, l'adhésion
d'un utilisateur à une organisation. Elle a un identifiant. Ses valeurs changent, mais elle reste la
même Entity. Les Entities se rangent dans `domain/models/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [E1](#e1-un-identifiant-qui-ne-change-pas) | Un identifiant qui ne change pas | aucune méthode ne modifie l'identifiant |
| [E2](#e2-comparer-par-identifiant) | Comparer par identifiant | on compare les `id`, pas les autres champs |
| [E3](#e3-toujours-valide) | Toujours valide | le constructeur et chaque méthode lèvent une `DomainError` si une règle n'est pas respectée |
| [E4](#e4-aucun-effet-de-bord-extérieur) | Aucun effet de bord extérieur | pas d'import d'infrastructure ; la date du jour est passée en paramètre |
| [E5](#e5-rien-pour-la-base-de-données) | Rien pour la base de données | pas de `toDTO()` ni de `fromDTO()`, c'est le travail du repository |
| [E6](#e6-pas-de-setter) | Pas de setter | chaque changement a sa méthode métier : `changeRole()`, pas `set role()` |
| [E7](#e7-les-autres-aggregates-par-identifiant) | Les autres Aggregates par identifiant | `organizationId: OrganizationId`, pas `organization: Organization` |
| [E8](#e8-un-nom-du-métier) | Un nom du métier | un fichier par Entity, en PascalCase, nommé avec le mot du métier |
| [E9](#e9-seule-une-aggregate-root-émet-des-événements) | Seule une Aggregate Root émet des événements | `emitDomainEvent()` est protégé dans `AggregateRoot` |

## Exemple complet

Une adhésion : un utilisateur, une organisation, un rôle (`ADMIN` ou `MEMBER`) et une date de
désactivation. Exemple inventé, d'après
[`Membership.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Membership.js#L8-L41).

```ts
// team/domain/models/Membership.ts — E8 : un fichier, nommé avec le mot du métier
import type { MembershipId, OrganizationId, UserId } from '../../../shared/domain/Id.js';
import { AggregateRoot } from '../../../shared/domain/models/AggregateRoot.js';
import { InvalidMembershipRoleError, MembershipAlreadyDisabledError } from '../errors.js';
import { MembershipDisabled } from '../events/MembershipDisabled.js';

export const MembershipRoles = ['ADMIN', 'MEMBER'] as const;
export type MembershipRole = (typeof MembershipRoles)[number];

type MembershipProps<Id> = {
  id: Id;
  organizationId: OrganizationId;
  userId: UserId;
  role: MembershipRole;
  updatedAt: Date;
  disabledAt: Date | null;
};

// Membership<null> : une adhésion neuve, pas encore enregistrée
// Membership : une adhésion enregistrée, avec un id
// E9 : seule dans son Aggregate, l'adhésion en est la racine, et peut émettre des événements
export class Membership<Id extends MembershipId | null = MembershipId> extends AggregateRoot {
  readonly id: Id; // E1 : en lecture seule
  readonly organizationId: OrganizationId; // E7 : un autre Aggregate, gardé par son id
  readonly userId: UserId; // E7 : un autre Aggregate, gardé par son id
  #role: MembershipRole; // E6 : privé, seul changeRole() le modifie
  #updatedAt: Date;
  #disabledAt: Date | null;

  // E3 : refuse une adhésion invalide
  constructor({ id, organizationId, userId, role, updatedAt, disabledAt }: MembershipProps<Id>) {
    super();
    assertValidRole(role);
    this.id = id;
    this.organizationId = organizationId;
    this.userId = userId;
    this.#role = role;
    this.#updatedAt = updatedAt;
    this.#disabledAt = disabledAt;
  }

  // une adhésion neuve, sans id ; E4 : la date arrive en paramètre
  static create({ organizationId, userId, role, now }: { organizationId: OrganizationId; userId: UserId; role: MembershipRole; now: Date }): Membership<null> {
    return new Membership({ id: null, organizationId, userId, role, updatedAt: now, disabledAt: null });
  }

  get role(): MembershipRole {
    return this.#role;
  }

  get updatedAt(): Date {
    return this.#updatedAt;
  }

  get isDisabled(): boolean {
    return this.#disabledAt !== null;
  }

  // E2 : on compare les id
  isSameAs(other: Membership): boolean {
    return this.id === other.id;
  }

  // E6 : un nom métier ; E3 : tout vérifier avant de modifier
  changeRole(role: MembershipRole, now: Date): void {
    if (this.isDisabled) throw new MembershipAlreadyDisabledError();
    assertValidRole(role);
    this.#role = role;
    this.#updatedAt = now;
  }

  disable(now: Date): void {
    if (this.isDisabled) throw new MembershipAlreadyDisabledError();
    this.#disabledAt = now;
    this.#updatedAt = now;
    this.emitDomainEvent(new MembershipDisabled({ membershipId: this.id, disabledAt: now })); // E9
  }

  // E5 : pas de toDTO() : la traduction est dans le repository
}

function assertValidRole(role: string): void {
  if (!MembershipRoles.includes(role as MembershipRole)) throw new InvalidMembershipRoleError(`Unknown role: ${role}`);
}
```

## Comment tester

Une Entity se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- le constructeur : une Entity invalide n'est pas créée. Exemple : `refuses an unknown role` ;
- chaque méthode qui modifie l'Entity : le cas qui marche, et le cas d'erreur. Après une erreur,
  l'Entity n'a pas changé. Exemples : `changes the role` et
  `refuses an unknown role, and changes nothing` ;
- les getters calculés, comme `isDisabled`, avec leurs cas limites. Exemple :
  `disables the membership`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/team/unit/domain/models/Membership_test.ts
describe('Unit | Team | Domain | Models | Membership', function () {
  const now = new Date('2026-01-02');

  const buildMembership = (props: Partial<MembershipProps<MembershipId>> = {}) =>
    new Membership({
      id: 1 as MembershipId,
      organizationId: 2 as OrganizationId,
      userId: 3 as UserId,
      role: 'MEMBER',
      updatedAt: new Date('2026-01-01'),
      disabledAt: null,
      ...props,
    });

  it('refuses an unknown role', function () {
    expect(() => buildMembership({ role: 'OWNER' as MembershipRole })).to.throw(InvalidMembershipRoleError);
  });

  describe('.create', function () {
    it('creates a new membership, without id', function () {
      const membership = Membership.create({ organizationId: 2 as OrganizationId, userId: 3 as UserId, role: 'ADMIN', now });

      expect(membership.id).to.be.null;
      expect(membership.role).to.equal('ADMIN');
    });
  });

  describe('#changeRole', function () {
    it('changes the role', function () {
      const membership = buildMembership();

      membership.changeRole('ADMIN', now);

      expect(membership.role).to.equal('ADMIN');
      expect(membership.updatedAt).to.deep.equal(now);
    });

    it('refuses an unknown role, and changes nothing', function () {
      const membership = buildMembership();

      expect(() => membership.changeRole('OWNER' as MembershipRole, now)).to.throw(InvalidMembershipRoleError);
      expect(membership.role).to.equal('MEMBER');
    });
  });

  describe('#disable', function () {
    it('disables the membership', function () {
      const membership = buildMembership();

      membership.disable(now);

      expect(membership.isDisabled).to.be.true;
    });

    it('refuses to disable a membership already disabled, and changes nothing', function () {
      const membership = buildMembership({ disabledAt: new Date('2026-01-01') });

      expect(() => membership.disable(now)).to.throw(MembershipAlreadyDisabledError);
      expect(membership.updatedAt).to.deep.equal(new Date('2026-01-01'));
    });

    it('emits a MembershipDisabled event', function () {
      const membership = buildMembership();

      membership.disable(now);

      expect(membership.pullDomainEvents()).to.deep.equal([
        new MembershipDisabled({ membershipId: 1 as MembershipId, disabledAt: now }),
      ]);
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
modifie. Il a un type dédié, comme `MembershipId`, ou un Value Object : même quand la valeur est un
entier, on ne le type pas en simple `number`.
Dans le code de Pix, l'identifiant prend plusieurs formes :

- un entier créé par la base de données, le cas le plus courant : `Membership` ;
- une chaîne venue du référentiel : `skillId`, `tubeId`, `challengeId` ;
- un UUID : les modules, les chats ;
- une valeur du métier : le `code` d'une campagne, le `slug` d'un module.

**Bon exemple.**

```ts
export class Membership<Id extends MembershipId | null = MembershipId> extends AggregateRoot {
  readonly id: Id; // en lecture seule : personne ne peut le modifier
}
```

**Mauvais exemple.**

```ts
export class Membership {
  id: number; // public : modifiable de partout
}
```

**Ce que ça apporte.** Une Entity se compare et se retrouve par son seul identifiant. Et grâce au type
dédié, le compilateur refuse un `UserId` à la place d'un `MembershipId`.

**Sans cette règle.** Si du code change l'`id` d'une adhésion, le repository écrase les données d'une
autre adhésion avec les siennes.

**À savoir.** La base de données crée l'`id` à l'enregistrement, donc une Entity neuve n'en a pas
encore. Le type le dit : `Membership<null>` pour une Entity neuve, `Membership` pour une Entity
enregistrée.

```ts
interface MembershipRepository {
  add(membership: Membership<null>): Promise<Membership>; // la base crée l'id
  get(id: MembershipId): Promise<Membership>;
  update(membership: Membership): Promise<void>;
}
```

Chaque usecase dit quelle forme il attend :

```ts
// création : le usecase reçoit une Entity neuve
const createMembership = async ({
  membership,
  membershipRepository,
}: {
  membership: Membership<null>;
  membershipRepository: MembershipRepository;
}): Promise<Membership> => {
  return membershipRepository.add(membership);
};

// modification : le usecase reçoit l'id, charge l'Entity puis appelle sa méthode
const disableMembership = async ({
  membershipId,
  membershipRepository,
  clock,
}: {
  membershipId: MembershipId;
  membershipRepository: MembershipRepository;
  clock: Clock;
}): Promise<Membership> => {
  const membership = await membershipRepository.get(membershipId);
  membership.disable(clock.now());
  await membershipRepository.update(membership);
  return membership;
};
```

Le compilateur vérifie que `add()` ne reçoit pas une Entity déjà enregistrée, et que `update()` ne
reçoit pas une Entity neuve. Une `Membership`, sans `<null>`, a toujours un `id`.

### E2. Comparer par identifiant

**La règle.** Deux objets avec le même `id` sont la même Entity, même si leurs autres champs
diffèrent. Deux objets avec des `id` différents sont deux Entities, même si tout le reste est égal.

**Bon exemple.**

```ts
isSameAs(other: Membership): boolean {
  return this.id === other.id;
}
```

**Mauvais exemple.**

```ts
isSameAs(other: Membership): boolean {
  return this.userId === other.userId; // compare l'utilisateur, pas l'id
}
```

**Ce que ça apporte.** La même Entity, chargée à deux moments différents, est bien reconnue comme la
même.

**Sans cette règle.** Les adhésions d'un même utilisateur à deux organisations différentes sont
confondues. On désactive alors la mauvaise.

### E3. Toujours valide

**La règle.** Une Entity invalide n'est jamais créée, et aucune méthode ne peut la rendre invalide.
Chaque méthode vérifie d'abord la règle. Si la règle n'est pas respectée, elle lève une erreur du
domaine et ne modifie rien.

**Bon exemple.**

```ts
changeRole(role: MembershipRole, now: Date): void {
  if (this.isDisabled) throw new MembershipAlreadyDisabledError(); // vérifier d'abord
  assertValidRole(role); // vérifier d'abord
  this.#role = role; // modifier ensuite
  this.#updatedAt = now;
}
```

**Mauvais exemple.**

```ts
constructor({ id, organizationRole, organizationId, userId }: MembershipProps = {}) {
  this.id = id;
  this.organizationRole = organizationRole; // aucune vérification au constructeur
  …
}

validateRole(): void { … } // une méthode à part, que l'appelant doit penser à appeler
```

**Ce que ça apporte.** Quand on reçoit une adhésion, on sait que son rôle existe. Il n'y a rien à
revérifier, et la règle n'est écrite qu'une fois, dans l'Entity.

**Sans cette règle.** Le rôle est vérifié par une méthode à part. Un usecase oublie de l'appeler, et on
enregistre une adhésion avec le rôle `OWNER`, que le reste du code ne connaît pas.

**À savoir.**

- Un constructeur avec `= {}` et sans vérification accepte `new Membership()`, et crée une adhésion
  vide. Ça compile, et un test qui ne vérifie pas ce cas ne voit rien.
- Si une méthode modifie plusieurs champs, elle vérifie tout avant de modifier le premier. Sinon, une
  erreur en cours de route laisse l'Entity à moitié modifiée.

### E4. Aucun effet de bord extérieur

**La règle.** Une Entity n'importe rien de l'infrastructure : pas de base de données, pas de log, pas
d'appel HTTP. Elle n'appelle pas `new Date()` ni `Math.random()`, et ne lit pas la configuration. Ces
valeurs arrivent en paramètre. Si une règle a besoin d'une donnée que l'Entity n'a pas, le usecase la
charge et la passe en paramètre.

**Bon exemple.**

```ts
disable(now: Date): void {
  if (this.isDisabled) throw new MembershipAlreadyDisabledError();
  this.#disabledAt = now; // la date arrive en paramètre
  this.#updatedAt = now;
}
```

**Mauvais exemple.**

```ts
disable(): void {
  if (this.isDisabled) throw new MembershipAlreadyDisabledError();
  this.#disabledAt = new Date(); // l'Entity lit l'heure
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
// team/infrastructure/repositories/membership-repository.ts
const toRow = (membership: Membership<MembershipId | null>) => ({
  id: membership.id,
  organizationId: membership.organizationId,
  userId: membership.userId,
  organizationRole: membership.role,
  updatedAt: membership.updatedAt,
});
```

La traduction est une fonction du repository, pas une méthode de l'Entity.

**Mauvais exemple.**

```ts
export class Membership {
  toDTO() {
    // seul le repository appelle cette méthode
    return { id: this.id, organizationRole: this.role, organization_id: this.organizationId };
  }
}
```

**Ce que ça apporte.** L'Entity ne contient aucun nom de colonne. Un changement dans la base de
données ne touche que le repository.

**Sans cette règle.** Renommer la colonne `organizationRole` oblige à modifier l'Entity.

### E6. Pas de setter

**La règle.** Chaque changement passe par une méthode au nom métier, comme `changeRole()` ou
`disable()`. Pas de setter public, et pas de champ modifié depuis l'extérieur : un usecase qui écrit
`membership.disabledAt = new Date()` ne respecte pas la règle.

**Bon exemple.**

```ts
#role: MembershipRole; // privé

changeRole(role: MembershipRole, now: Date): void {
  …
}
```

**Mauvais exemple.**

```ts
#role: MembershipRole;

set role(value: MembershipRole) {
  this.#role = value; // tout le monde peut changer le rôle, sans vérification
}
```

**Ce que ça apporte.** Chaque changement passe par une seule méthode, qui vérifie la règle (E3). Et le
nom de la méthode dit ce qui se passe côté métier.

**Sans cette règle.** Un setter modifie le champ sans rien vérifier. `membership.role = 'OWNER'` donne
une adhésion au rôle inconnu, sans aucune erreur.

**À savoir.** Une adhésion remplie par `setUserId(…)` puis `setRole(…)` est invalide entre les deux
appels : elle a un utilisateur, mais pas de rôle. Les valeurs de départ passent toutes par le
constructeur.

**Exceptions.** Une Entity sans méthode de modification est permise : certaines Entities ne changent
jamais.

### E7. Les autres Aggregates par identifiant

**La règle.** Une Entity ne garde pas un objet d'un autre Aggregate, seulement son identifiant. Si une
règle a besoin des données de cet objet, la méthode les reçoit en paramètre.

**Bon exemple.**

```ts
readonly organizationId: OrganizationId;
readonly userId: UserId;
```

**Mauvais exemple.**

```ts
readonly organization: Organization; // l'objet entier d'un autre Aggregate
readonly user: User; // l'objet entier d'un autre Aggregate
```

**Ce que ça apporte.** Quand on charge une adhésion, on ne charge ni l'organisation ni l'utilisateur
avec. On peut modifier et enregistrer l'un sans toucher aux autres.

**Sans cette règle.** Le repository doit charger l'organisation et l'utilisateur avec chaque adhésion.
Chaque objet lié ajoute une requête ou une jointure. Et on peut modifier l'organisation en passant par
l'adhésion.

**Exceptions.** Une Entity garde entiers les objets de son propre Aggregate. Une adhésion n'en a pas,
mais une organisation garde ses fonctionnalités : voir la fiche
[Aggregate Root](../racine-agregat/README.md).

### E8. Un nom du métier

**La règle.** Un fichier par Entity, dans `domain/models/`. Le fichier porte le nom métier de l'Entity,
en PascalCase.

**Bon exemple.** `team/domain/models/Membership.ts`.

**Mauvais exemple.** `team/domain/models/member-model.ts`.

**Ce que ça apporte.** En cherchant le mot du métier, par exemple « Membership », on trouve le
fichier.

**Sans cette règle.** On ne retrouve pas le fichier en cherchant le mot du métier, et il faut l'ouvrir
pour savoir ce qu'il contient.

**Exceptions.** Deux contextes, comme `prescription` et `team` dans `src/`, peuvent avoir chacun une
Entity du même nom, avec un sens différent. Le chemin de l'import montre de quel contexte elle vient.

### E9. Seule une Aggregate Root émet des événements

**La règle.** Un événement du domaine annonce qu'un changement a eu lieu, par exemple « l'adhésion est
désactivée ». Seule une Aggregate Root émet des événements, depuis ses propres méthodes. Pour
l'imposer, `emitDomainEvent()` est protégée dans la classe `AggregateRoot` : on ne peut pas l'appeler
de l'extérieur. Une adhésion est seule dans son Aggregate : elle en est donc la racine.

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
disable(now: Date): void {
  if (this.isDisabled) throw new MembershipAlreadyDisabledError();
  this.#disabledAt = now;
  this.#updatedAt = now;
  this.emitDomainEvent(new MembershipDisabled({ membershipId: this.id, disabledAt: now }));
}
```

**Mauvais exemple.**

```ts
// une Entity interne à l'Aggregate Organization émet elle-même
export class OrganizationFeature {
  enable(now: Date): void {
    …
    domainEvents.emit(new FeatureEnabled({ featureName: this.featureName }));
  }
}
```

**Ce que ça apporte.** L'événement est émis par la racine, celle qui vérifie les règles de tout
l'Aggregate. Quand `MembershipDisabled` est émis, `disable()` a déjà vérifié que l'adhésion n'était pas
désactivée.

**Sans cette règle.** Une Entity interne émet un événement sans que la racine ait vérifié les règles.
Le code qui réagit à l'événement traite un changement que la racine n'a pas validé.

**À savoir.** Les événements sont publiés après l'enregistrement, quand la transaction est validée.
C'est un code placé autour du usecase qui s'en charge, comme `runInTransaction`. Le usecase et le
repository ne publient rien eux-mêmes.
