# Entity

Une Entity est une chose que le métier suit dans le temps : un utilisateur, une campagne, un passage
dans un module. Une Entity a un identifiant. Les valeurs d'une Entity changent, mais l'Entity reste la
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
| [E6](#e6-aucun-mutateur-nu) | Pas de setter | chaque changement a une méthode avec un nom métier : `archive()`, pas `setStatus()` |
| [E7](#e7-les-autres-aggregates-sont-référencés-par-identité) | Les autres Aggregates par identifiant | `organizationId`, pas `organization` |
| [E8](#e8-nommage-et-emplacement) | Un nom du métier | un fichier par Entity, en PascalCase, avec un nom du métier |

Une erreur du domaine est une `DomainError`, ou une classe qui hérite de `DomainError`. `DomainError`
est dans le fichier `api/src/shared/domain/errors.js`.

## Exemple complet

Version corrigée du fichier [`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L1-L16).
Un `Passage` est le passage d'un utilisateur dans un module.

```js
import { PassageTerminatedError } from '../errors.js';

class Passage {
  #terminatedAt; // E6 : champ privé, seule la méthode terminate() modifie le champ

  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id; // E1 : l'identifiant
    this.moduleId = moduleId; // E7 : l'identifiant du module, pas le module
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#terminatedAt = terminatedAt;
  }

  get terminatedAt() {
    return this.#terminatedAt;
  }

  // E6 : un nom métier ; E4 : la date est passée en paramètre
  terminate({ now }) {
    if (this.#terminatedAt) throw new PassageTerminatedError(); // E3 : refuser un passage déjà terminé
    this.#terminatedAt = now;
  }
}

export { Passage };
```

Ici, le constructeur ne vérifie rien : aucune règle du domaine ne dit quels champs sont obligatoires
pour un passage. Si une règle existait, le constructeur vérifierait la règle et lèverait une erreur du
domaine (E3).

Le test vérifie le changement et le refus :

```js
describe('Unit | Devcomp | Domain | Models | Passage', function () {
  describe('#terminate', function () {
    it('terminates the passage at the given date', function () {
      const now = new Date('2024-01-02');
      const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123 });

      passage.terminate({ now });

      expect(passage.terminatedAt).to.deep.equal(now);
    });

    it('refuses to terminate a passage already terminated', function () {
      const terminatedAt = new Date('2024-01-01');
      const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123, terminatedAt });

      expect(() => passage.terminate({ now: new Date('2024-01-02') })).to.throw(PassageTerminatedError);
      expect(passage.terminatedAt).to.deep.equal(terminatedAt); // le refus ne modifie rien
    });
  });
});
```

## Comment tester

Une Entity se teste avec un test unitaire. Le test n'utilise pas de base de données. Le test n'utilise
pas de **double** : pas de stub, pas de mock, pas de spy. La date est une valeur passée en paramètre.
Le test vérifie :

- le constructeur : une Entity invalide n'est pas créée, si une règle dit ce qui est valide ;
- chaque méthode qui change l'Entity : le cas qui marche, **et** le refus quand la règle n'est pas
  respectée. Après le refus, l'Entity n'a pas changé ;
- chaque accesseur calculé, comme `isArchived` : les cas limites.

Deux signes d'un problème, pendant l'écriture du test :

- **Le test du refus manque.** C'est l'oubli le plus fréquent. Tester que `terminate()` termine ne
  suffit pas : c'est le test du refus qui prouve que la règle E3 est respectée.
- **Le test a besoin d'un double**, ou de bloquer l'heure. L'Entity dépend de l'infrastructure :
  l'Entity ne respecte pas [E4](#e4-aucune-io-aucune-dépendance-à-linfrastructure).

## Comment relire

La checklist suit l'ordre de relecture : les questions les plus utiles sont en premier. Dans un
commentaire de revue, écrire le numéro de la règle et ce qui ne respecte pas la règle : « E6 :
`set status()` permet de mettre n'importe quel statut, sans passer par `complete()` ».

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

Les exemples viennent du code de Pix. Quand un exemple est corrigé ou inventé, c'est écrit sous
l'exemple.

### E1. L'identité est explicite et stable

**La règle.** L'Entity contient son identifiant. L'identifiant ne change jamais.

**Bon exemple.**

```js
class Passage {
  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id; // aucune méthode ne modifie l'id ensuite
    …
  }
}
```

[`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L1-L9), simplifié.

**Mauvais exemple.**

```js
class Passage {
  constructor({ moduleId, userId }) { … } // pas d'id : impossible de savoir de quel passage il s'agit
}
```

Inventé.

**Ce que ça apporte.** Pour comparer deux Entities ou retrouver une Entity, le code utilise un seul
champ : l'`id`.

**Sans cette règle.** Chaque partie du code invente sa façon de reconnaître l'Entity. Un jour, deux
parties du code ne reconnaissent pas la même Entity.

**À savoir.** La base de données crée l'`id` au moment de l'enregistrement. Une Entity neuve n'a donc
pas encore d'`id`. Le type dit si l'Entity a un `id` : `Organization<null>` pour une Entity neuve,
`Organization` pour une Entity enregistrée.

```ts
class Organization<Id extends OrganizationId | null = OrganizationId> {
  readonly id: Id;
  …

  // une Entity neuve : pas encore d'id
  static create({ name, type, createdBy, now }: CreateProps): Organization<null> {
    return new Organization({ id: null, name, type, createdBy, createdAt: now, updatedAt: now, credit: 0, archivedAt: null });
  }
}

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

Inventé, d'après `Organization`.

### E2. L'égalité se fonde sur l'identité

**La règle.** Deux objets qui ont le même `id` sont la même Entity, même si les autres champs sont
différents. Deux objets qui ont des `id` différents sont deux Entities, même si les autres champs sont
égaux.

**Bon exemple.**

```js
static areEqualById(oneSkill, otherSkill) {
  return oneSkill.id === otherSkill.id;
}
```

[`Skill.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Skill.js#L46-L52), simplifié.

**Mauvais exemple.**

```js
static areEqual(oneSkill, otherSkill) {
  return oneSkill.name === otherSkill.name; // compare le nom, pas l'id
}
```

[`Skill.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Skill.js#L38-L44), simplifié.

**Ce que ça apporte.** La même Entity, chargée deux fois à deux moments différents, est reconnue comme
la même Entity.

**Sans cette règle.** Deux Entities qui ont le même nom sont prises pour la même Entity. La même
Entity, chargée avant et après un changement de nom, est prise pour deux Entities.

### E3. Les invariants sont tenus à tout instant

**La règle.** Une Entity invalide n'est pas créée. Ensuite, aucune méthode ne rend l'Entity invalide.
Chaque méthode vérifie la règle avant de modifier l'Entity. Si la règle n'est pas respectée, la
méthode lève une erreur du domaine et ne modifie rien.

**Bon exemple.**

```js
terminate({ now }) {
  if (this.#terminatedAt) throw new PassageTerminatedError(); // vérifier avant de modifier
  this.#terminatedAt = now;
}
```

Extrait de l'[exemple complet](#exemple-complet).

**Mauvais exemple.**

```js
terminate() {
  this.terminatedAt = new Date(); // rien n'empêche de terminer deux fois
}
```

[`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L11-L13), avant la correction.

**Ce que ça apporte.** Le code qui reçoit une Entity n'a rien à vérifier : l'Entity est valide. La
règle est écrite une seule fois, dans l'Entity.

**Sans cette règle.** La règle est écrite dans un [usecase](../usecase/README.md). Un autre usecase appelle `terminate()`,
oublie la règle, et un passage est terminé deux fois.

**À savoir.**

- Un constructeur comme `constructor({ id, name } = {})`, sans aucune vérification, accepte
  `new Campaign()` : l'Entity est créée vide. Ce code ressemble à du code correct : c'est pour cela
  que le problème passe souvent inaperçu.
- Une méthode qui modifie plusieurs champs vérifie tout avant de modifier le premier champ. Sinon,
  une erreur au milieu laisse l'Entity à moitié modifiée.

### E4. Aucune I/O, aucune dépendance à l'infrastructure

**La règle.** Une Entity n'importe rien de l'infrastructure : pas de base de données, pas de log, pas
d'appel HTTP. L'Entity n'appelle pas `new Date()`, pas `Math.random()`, et ne lit pas la
configuration : ces valeurs sont passées en paramètre. Si une règle a besoin d'une donnée que
l'Entity n'a pas, le usecase charge la donnée et passe la donnée à la méthode.

**Bon exemple.**

```js
updateRole({ role, updatedByUserId, now }) {
  this.role = role;
  this.updatedAt = now; // la date est passée en paramètre
  if (updatedByUserId) this.updatedByUserId = updatedByUserId;
}
```

Version corrigée du mauvais exemple ci-dessous.

**Mauvais exemple.**

```js
updateRole({ role, updatedByUserId }) {
  this.role = role;
  this.updatedAt = new Date(); // l'Entity lit l'heure
  if (updatedByUserId) this.updatedByUserId = updatedByUserId;
}
```

[`CertificationCenterMembership.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/team/domain/models/CertificationCenterMembership.js#L35-L42), simplifié.

**Ce que ça apporte.** Le résultat dépend seulement des paramètres. Le test passe une date et vérifie
le résultat.

**Sans cette règle.** Le test doit bloquer l'heure ou simuler un module. Une Entity qui appelle
`new Date()` donne un résultat différent à chaque exécution du test.

**À savoir.** Un import peut aussi venir de l'infrastructure sans le dire. Par exemple,
[`UserLogin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/models/UserLogin.js#L2)
importe `anonymizeGeneralizeDate` depuis `shared/infrastructure/`.

### E5. Aucune méthode au service de la persistance

**La règle.** Transformer une Entity pour la base de données est le travail du repository. L'Entity
n'a pas de méthode que seul le repository appelle.

**Bon exemple.**

```js
// dans le repository : une fonction du repository transforme la ligne de la table en Entity
function _toDomain({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
  return new Passage({ id, moduleId, userId, createdAt, updatedAt, terminatedAt });
}
```

[`passage-repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/repositories/passage-repository.js#L49-L51).

**Mauvais exemple.**

```js
class Quest {
  toDTO() {
    // seul le repository appelle cette méthode
    return { id: this.id, rewardType: this.rewardType, rewardId: this.rewardId, … };
  }
}
```

[`Quest.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/entities/Quest.js#L155-L165), simplifié.

**Ce que ça apporte.** L'Entity ne connaît pas la base de données. Un changement dans la base de
données modifie seulement le repository.

**Sans cette règle.** Renommer une colonne de la table oblige à modifier l'Entity.

**Exceptions.** Une méthode qui produit un format décrit dans un document pour l'extérieur, par
exemple un fichier envoyé à un partenaire, est permise. Pour
décider, poser la question : si une colonne de la table changeait de nom, la méthode devrait-elle
changer ? Si oui, la méthode sert la base de données, et la méthode va dans le repository.

### E6. Aucun mutateur nu

**La règle.** Chaque changement de l'Entity passe par une méthode avec un nom métier : `archive()`,
`complete()`, `rename()`. Pas de setter public. Le code extérieur ne modifie pas un champ
directement : `campaign.status = 'ARCHIVED'` dans un usecase ne respecte pas la règle.

**Bon exemple.**

```js
complete({ now }) {
  this.updatedAt = now;
  this.#status = CombinedCourseParticipationStatuses.COMPLETED;
}
```

Version corrigée de [`CombinedCourseParticipation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-course-participations/entities/CombinedCourseParticipation.js#L28-L31) :
le champ `status` devient privé, et la date est passée en paramètre.

**Mauvais exemple.**

```js
class DataForQuest {
  #success;
  get success() { return Object.freeze(this.#success); }
  set success(value) { this.#success = value; } // n'importe quel code peut changer la valeur
}
```

[`DataForQuest.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/quests/aggregates/DataForQuest.js#L1-L20), simplifié.
Le champ est protégé en lecture, mais le setter permet de modifier le champ.

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

```js
this.organizationId = organizationId;
this.userId = userId;
```

Version corrigée du mauvais exemple ci-dessous.

**Mauvais exemple.**

```js
this.organization = organization; // l'objet entier d'un autre Aggregate
this.organizationId = organization?.id ?? organizationId;
this.user = user; // l'objet entier d'un autre Aggregate
this.userId = user?.id ?? userId;
```

[`Membership.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/Membership.js#L23-L26).

**Ce que ça apporte.** Charger une Entity charge seulement cette Entity. Chaque Aggregate est modifié
et enregistré seul.

**Sans cette règle.** Le repository doit charger l'organisation et l'utilisateur avec chaque
`Membership`. Plus il y a d'objets liés, plus le chargement est lent. Et le code peut modifier
l'organisation à travers le `Membership`.

**Exceptions.** Une Entity garde les objets de son propre Aggregate : un module garde ses sections.

### E8. Nommage et emplacement

**La règle.** Un fichier par Entity, dans le dossier `domain/models/`. Le nom du fichier est le nom
métier de l'Entity, en PascalCase.

**Bon exemple.** `devcomp/domain/models/Passage.js`.

**Mauvais exemple.** `devcomp/domain/models/passage-model.js`. Inventé.

**Ce que ça apporte.** Le fichier est facile à trouver. Le nom du fichier est le mot du métier.

**Sans cette règle.** Rien ne casse. Le fichier est plus long à trouver, et la revue perd du temps sur
le nom.

**Exceptions.** Deux contextes peuvent avoir chacun une Entity avec le même nom, pour deux choses
différentes. C'est normal : l'import dit de quel contexte vient l'Entity.
