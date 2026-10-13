# Repository

Un repository charge et enregistre les objets du domaine. Le domaine déclare ce dont il a besoin dans
une interface, le port : `OrganizationRepository` sait charger, ajouter et mettre à jour une
organisation. L'infrastructure implémente ce port avec la base de données, un fichier, un service HTTP
ou l'API interne d'un autre contexte (un autre dossier de `src/`, comme `team`). Le port se range dans
`domain/repositories/`, l'implémentation dans `infrastructure/repositories/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [I1](#i1-renvoie-des-objets-du-domaine) | Renvoie des objets du domaine | `get({ id })` renvoie une `Organization`, jamais la ligne de la table |
| [I2](#i2-reçoit-des-objets-du-domaine) | Reçoit des objets du domaine | `update({ organization })` reçoit l'Aggregate entier, jamais un objet aux noms de colonnes |
| [I3](#i3-get-lève-find-renvoie-null) | `get*` lève, `find*` renvoie `null` | `get()` lève `OrganizationNotFound` ; un `find*` renvoie `null` ou une liste vide |
| [I4](#i4-des-erreurs-du-domaine) | Des erreurs du domaine | le repository lève une erreur de `domain/errors.js`, jamais une `Error` nue ni l'erreur de la base |
| [I5](#i5-les-dépendances-arrivent-en-paramètre) | Les dépendances arrivent en paramètre | pas d'import d'API interne ni de client ; l'index les injecte |
| [I6](#i6-enregistré-dans-lindex-du-contexte) | Enregistré dans l'index du contexte | tout repository figure dans `infrastructure/repositories/index.ts` |
| [I9](#i9-un-nom-de-fichier-cohérent) | Un nom de fichier cohérent | même convention que les autres repositories du contexte |
| [I10](#i10-aucune-règle-métier) | Aucune règle métier | des `if` sur l'existence d'une ligne, jamais sur une propriété métier |
| [I11](#i11-pas-dimport-dun-autre-repository) | Pas d'import d'un autre repository | composer deux repositories, c'est le travail du [usecase](../usecase/README.md) |
| [I12](#i12-la-connexion-vient-de-domaintransaction) | La connexion vient de `DomainTransaction` | `DomainTransaction.getConnection()`, jamais un import de `knex` |

## Exemple complet

Le repository de l'[Aggregate Root](../racine-agregat/README.md) `Organization` : il charge et
enregistre l'organisation et ses fonctionnalités, dans les tables `organizations` et
`organization-features`. On reprend l'Aggregate `Organization` de la fiche Aggregate Root, et sa règle :
si `LEARNER_IMPORT` est activée, `isManagingStudents` est toujours `false`. Exemple inventé, d'après
[`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L241-L248).

Chaque fonction du repository reçoit un objet de paramètres nommés, `get({ id })` plutôt que
`get(id)` : l'injection de dépendances de Pix ajoute ses entrées à cet objet (voir
[I5](#i5-les-dépendances-arrivent-en-paramètre)).

Le port, déclaré par le domaine :

```ts
// organizational-entities/domain/repositories/OrganizationRepository.ts
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { Organization } from '../models/organization/index.js';

export interface OrganizationRepository {
  get({ id }: { id: OrganizationId }): Promise<Organization>; // I3 : lève OrganizationNotFound
  // I1, I2 : un objet du domaine en entrée et en sortie ; Organization<null> est une organisation pas encore enregistrée
  add({ organization }: { organization: Organization<null> }): Promise<Organization>;
  update({ organization }: { organization: Organization }): Promise<void>; // I2 : l'Aggregate entier
}
```

L'implémentation :

```ts
// organizational-entities/infrastructure/repositories/organization-repository.ts
// I9 : nommé avec la même convention que les autres repositories du contexte
// I5 : aucun import d'API interne ni de client ; I11 : aucun import d'un autre repository
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { OrganizationId, UserId } from '../../../shared/domain/Id.js';
import { FeatureNotFound, OrganizationNotFound } from '../../domain/errors.js';
import {
  type FeatureName,
  type FeatureParams,
  Organization,
  type OrganizationFeature,
  type OrganizationType,
} from '../../domain/models/organization/index.js';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.js';

// les colonnes que le domaine utilise ; createdAt et updatedAt n'en font pas partie, la base les fixe
type OrganizationRow = {
  id: OrganizationId;
  name: string;
  type: OrganizationType;
  createdBy: UserId;
  isManagingStudents: boolean;
  archivedAt: Date | null;
};

type FeatureRow = { key: FeatureName; params: FeatureParams };

const get = async ({ id }: { id: OrganizationId }): Promise<Organization> => {
  const knexConn = DomainTransaction.getConnection(); // I12
  const row: OrganizationRow | undefined = await knexConn('organizations')
    .where({ id })
    .first('id', 'name', 'type', 'createdBy', 'isManagingStudents', 'archivedAt');
  if (!row) {
    throw new OrganizationNotFound({ meta: { organizationId: id } }); // I3 : get lève ; I4 : une erreur du domaine
  }

  const featureRows: FeatureRow[] = await knexConn('organization-features')
    .join('features', 'features.id', 'organization-features.featureId')
    .where({ organizationId: id })
    .select('features.key', 'organization-features.params');

  return toDomain(row, featureRows); // I1 : on renvoie une Organization, pas la ligne
};

// I2 : on reçoit une Organization neuve, sans id
const add = async ({ organization }: { organization: Organization<null> }): Promise<Organization> => {
  const knexConn = DomainTransaction.getConnection();
  // la base crée l'id, createdAt et updatedAt
  const [{ id }] = await knexConn('organizations').insert(toRow(organization)).returning('id');
  await insertFeatures(id, organization.features);
  return get({ id });
};

// I2 : on reçoit l'Aggregate entier, et on enregistre tout le groupe
const update = async ({ organization }: { organization: Organization }): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();
  // I10 : on écrit ce que l'Aggregate a décidé, sans rien recalculer ; la base fixe updatedAt avec now()
  const updatedCount = await knexConn('organizations')
    .where({ id: organization.id })
    .update({ ...toRow(organization), updatedAt: knexConn.fn.now() });
  if (updatedCount === 0) {
    throw new OrganizationNotFound({ meta: { organizationId: organization.id } }); // I10 : un if sur l'existence d'une ligne
  }

  // le repository ne sait pas quelles fonctionnalités ont changé : il les remplace toutes
  await knexConn('organization-features').where({ organizationId: organization.id }).delete();
  await insertFeatures(organization.id, organization.features);
};

async function insertFeatures(organizationId: OrganizationId, features: ReadonlyArray<OrganizationFeature>): Promise<void> {
  if (features.length === 0) return;

  const knexConn = DomainTransaction.getConnection();
  const featureIds: { id: number; key: FeatureName }[] = await knexConn('features')
    .whereIn('key', features.map((feature) => feature.featureName))
    .select('id', 'key');

  const rows = features.map((feature) => {
    const featureId = featureIds.find(({ key }) => key === feature.featureName)?.id;
    if (!featureId) {
      throw new FeatureNotFound({ meta: { featureName: feature.featureName } }); // I4
    }
    return { organizationId, featureId, params: feature.params };
  });

  await knexConn('organization-features').insert(rows);
}

// I1 : la ligne est traduite en objet du domaine, et le constructeur vérifie les règles de l'Aggregate.
// Les fonctionnalités sont passées comme des données : c'est la racine qui crée ses objets internes.
function toDomain(row: OrganizationRow, featureRows: FeatureRow[]): Organization {
  return new Organization({
    id: row.id,
    name: row.name,
    type: row.type,
    createdBy: row.createdBy,
    isManagingStudents: row.isManagingStudents,
    features: featureRows.map(({ key, params }) => ({ featureName: key, params })),
    archivedAt: row.archivedAt,
  });
}

// pas d'id : la base le crée à l'insertion, et update() le met dans le where
function toRow(organization: Organization<OrganizationId | null>): Omit<OrganizationRow, 'id'> {
  return {
    name: organization.name,
    type: organization.type,
    createdBy: organization.createdBy,
    isManagingStudents: organization.isManagingStudents,
    archivedAt: organization.archivedAt,
  };
}

export const organizationRepository: OrganizationRepository = { get, add, update };
```

L'index du contexte, qui branche tous ses repositories :

```ts
// organizational-entities/infrastructure/repositories/index.ts — I6 : tous les repositories du contexte
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { organizationRepository } from './organization-repository.js';

const repositoriesWithoutInjectedDependencies = {
  organizationRepository,
  // … et tous les autres repositories du dossier
};

// I5 : les API internes et les clients sont importés ici, jamais dans un repository
const dependencies = {};

export const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);
```

## Comment tester

Un repository adossé à la base se teste avec un test d'intégration, sur une vraie base, sans stub,
mock ni spy. Le test couvre :

- chaque méthode du port, en enregistrant puis en rechargeant l'objet. On vérifie qu'on récupère un
  objet du domaine, avec tout son groupe. Exemples : `saves a new organization and returns it with its
  id`, `saves and reloads the organization with its features` ;
- chaque erreur levée, avec sa classe. Exemple : `throws OrganizationNotFound when the organization
  does not exist` ;
- l'écriture annulée quand la transaction échoue. Exemple : `does not keep the organization when the
  transaction fails`.

Les autres sources se testent autrement :

- un repository qui lit l'API interne d'un autre contexte : un test unitaire, l'API remplacée par un
  stub. Seule la traduction en objet du domaine est testée ;
- un repository qui appelle un service HTTP externe : un test d'intégration, le service intercepté par
  `nock`, une bibliothèque qui répond à la place du vrai service. On vérifie la requête envoyée et la
  traduction de la réponse.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/integration/infrastructure/repositories/organization-repository_test.ts
import { expect } from 'chai';

import { OrganizationNotFound } from '../../../../../src/organizational-entities/domain/errors.js';
import { Organization } from '../../../../../src/organizational-entities/domain/models/organization/index.js';
import { organizationRepository } from '../../../../../src/organizational-entities/infrastructure/repositories/organization-repository.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import type { OrganizationId, UserId } from '../../../../../src/shared/domain/Id.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Infrastructure | Repositories | organization-repository', function () {
  let createdBy: UserId;

  beforeEach(async function () {
    createdBy = databaseBuilder.factory.buildUser().id as UserId;
    databaseBuilder.factory.buildFeature({ key: 'LEARNER_IMPORT' });
    await databaseBuilder.commit();
  });

  const buildNewOrganization = () => Organization.create({ name: 'Lycée Victor Hugo', type: 'SCO', createdBy });

  describe('#add', function () {
    it('saves a new organization and returns it with its id', async function () {
      const organization = await organizationRepository.add({ organization: buildNewOrganization() });

      expect(organization).to.be.an.instanceOf(Organization);
      expect(organization.id).to.be.a('number');
      expect(organization.name).to.equal('Lycée Victor Hugo');
    });
  });

  describe('#get', function () {
    it('throws OrganizationNotFound when the organization does not exist', async function () {
      const error = await catchErr(organizationRepository.get)({ id: 999 as OrganizationId });

      expect(error).to.be.an.instanceOf(OrganizationNotFound);
    });
  });

  describe('#update', function () {
    it('saves and reloads the organization with its features', async function () {
      const organization = await organizationRepository.add({ organization: buildNewOrganization() });
      organization.rename('Lycée Jean Moulin');
      organization.enableFeature('LEARNER_IMPORT', null);

      await organizationRepository.update({ organization });

      const reloaded = await organizationRepository.get({ id: organization.id });
      expect(reloaded.name).to.equal('Lycée Jean Moulin');
      expect(reloaded.features.map((feature) => feature.featureName)).to.deep.equal(['LEARNER_IMPORT']);
    });
  });

  describe('in a transaction', function () {
    it('does not keep the organization when the transaction fails', async function () {
      await catchErr(DomainTransaction.execute)(async () => {
        await organizationRepository.add({ organization: buildNewOrganization() });
        throw new Error('the usecase fails after add()');
      });

      const organizations = await knex('organizations').where({ name: 'Lycée Victor Hugo' });
      expect(organizations).to.be.empty;
    });
  });
});
```

## Checklist de revue de code

```
Qu'est-ce qui entre et qui sort ?
[ ] I1  Chaque fonction renvoie un objet du domaine, une liste d'objets du domaine, ou rien
[ ] I2  Chaque paramètre est un objet du domaine ou un identifiant, jamais une ligne ou un DTO
[ ] I2  update() reçoit l'Aggregate entier, pas la liste des champs modifiés
[ ] I3  Les get* lèvent ; les find* renvoient null ou une liste vide
[ ] I4  Chaque erreur levée vient de domain/errors.js ; aucun catch ne relâche l'erreur de la base

Fait-il autre chose que traduire ?
[ ] I10 Pas de if sur une propriété métier, seulement sur l'existence d'une ligne
[ ] I11 Aucun import d'un autre repository

Comment est-il branché ?
[ ] I12 La connexion vient de DomainTransaction.getConnection(), pas d'un import de knex
[ ] I5  Aucun import d'API interne ni de client : ils arrivent en paramètre
[ ] I6  Le repository figure dans infrastructure/repositories/index.ts
[ ] I9  Le nom du fichier suit la convention des autres repositories du contexte

Tests
[ ] Base de données : un test d'intégration qui enregistre puis recharge l'objet
[ ] API interne d'un autre contexte : un test unitaire de la traduction, l'API remplacée par un stub
```

## Référence des règles

### I1. Renvoie des objets du domaine

**La règle.** Chaque fonction du repository renvoie un objet du domaine, une liste d'objets du
domaine, ou rien. Un objet du domaine est déclaré dans le `domain/` du contexte, ou dans
`shared/domain/`. Une ligne de la base, la réponse d'un service HTTP ou le DTO de l'API interne d'un
autre contexte sont traduits avant de sortir.

**Bon exemple.**

```ts
// organization-repository.ts, dans get()
const featureRows: FeatureRow[] = await knexConn('organization-features')
  .join('features', 'features.id', 'organization-features.featureId')
  .where({ organizationId: id })
  .select('features.key', 'organization-features.params');

return toDomain(row, featureRows);
```

**Mauvais exemple.**

```ts
// organization-repository.ts, dans get()
const featureRows = await knexConn('organization-features')
  .join('features', 'features.id', 'organization-features.featureId')
  .where({ organizationId: id })
  .select('features.key', 'organization-features.params');

return { ...row, features: featureRows }; // la ligne sort telle quelle, avec les noms de colonnes
```

**Ce que ça apporte.** L'objet renvoyé passe par le constructeur de `Organization`, qui vérifie les
règles de l'Aggregate. Le usecase reçoit une organisation valide, avec ses méthodes.

**Sans cette règle.** Une ligne de la base garde `isManagingStudents` à `true` alors que
`LEARNER_IMPORT` est activée. Le repository la renvoie sans passer par le constructeur, et le usecase
travaille sur une organisation qui viole la règle de l'Aggregate.

**À savoir.**

- Envelopper la ligne dans une classe aux mêmes champs ne suffit pas. La forme de la table reste dans
  le domaine. La traduction produit les champs dont le domaine a besoin.
- Le DTO de l'API interne d'un autre contexte n'est pas un objet du domaine local, même s'il a déjà la
  forme d'un objet. Le repository qui lit cette API le traduit dans un modèle du contexte. C'est
  l'Anticorruption Layer : voir la fiche [API interne](../api-interne/README.md).
- Une liste paginée renvoie une enveloppe `{ models, pagination }`. Les `models` sont des objets du
  domaine.

### I2. Reçoit des objets du domaine

**La règle.** Chaque paramètre d'une fonction du repository est un objet du domaine ou un
identifiant. Jamais une ligne de la base, jamais un objet littéral aux noms de colonnes, jamais le DTO
d'un autre contexte. `update()` reçoit l'Aggregate entier.

**Bon exemple.**

```ts
// organization-repository.ts
const update = async ({ organization }: { organization: Organization }): Promise<void> => {
  …
};
```

**Mauvais exemple.**

```ts
// dans un usecase : on écrit la colonne voulue, sans charger l'organisation
await organizationRepository.update({ id: organizationId, isManagingStudents: true });

// organization-repository.ts : update() reçoit une ligne
const update = async (row: Partial<OrganizationRow>): Promise<void> => {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('organizations').where({ id: row.id }).update(row);
};
```

**Ce que ça apporte.** Pour enregistrer une organisation, il faut d'abord la charger et la modifier
par ses méthodes. Les règles de l'Aggregate sont vérifiées avant chaque écriture.

**Sans cette règle.** Un usecase passe `{ isManagingStudents: true }` pour une organisation qui
importe ses élèves. Aucune méthode de `Organization` n'est appelée, et la base contient un état que le
constructeur aurait refusé.

**À savoir.**

- Une requête HTTP ne devient pas une requête SQL. Une route qui change seulement le nom d'une
  organisation passe quand même par l'Aggregate : le usecase charge l'organisation avec `get()`,
  appelle `rename()`, puis l'enregistre avec `update()`. C'est ce chargement qui permet à l'Aggregate
  de vérifier ses règles avant l'écriture.
- `update()` reçoit toujours l'Aggregate entier, jamais la liste des champs modifiés. Le repository
  peut n'écrire que les colonnes qui ont changé, pour écrire moins. C'est une optimisation interne au
  repository : le port, le usecase et l'Aggregate ne changent pas.

### I3. `get*` lève, `find*` renvoie `null`

**La règle.** Le début du nom dit ce qui se passe quand rien n'est trouvé. Une fonction `get…` lève
une erreur du domaine. Une fonction `find…` renvoie `null` pour un objet, une liste vide pour une
liste.

**Bon exemple.**

```ts
// organization-repository.ts
const get = async ({ id }: { id: OrganizationId }): Promise<Organization> => {
  const knexConn = DomainTransaction.getConnection();
  const row: OrganizationRow | undefined = await knexConn('organizations')
    .where({ id })
    .first('id', 'name', 'type', 'createdBy', 'isManagingStudents', 'archivedAt');
  if (!row) {
    throw new OrganizationNotFound({ meta: { organizationId: id } });
  }
  …
};
```

**Mauvais exemple.**

```ts
// organization-repository.ts
const get = async ({ id }: { id: OrganizationId }): Promise<Organization | null> => {
  const knexConn = DomainTransaction.getConnection();
  const row = await knexConn('organizations').where({ id }).first();
  if (!row) return null; // le nom annonce une erreur, la fonction renvoie null
  …
};
```

**Ce que ça apporte.** Le usecase qui appelle `get()` n'écrit pas de `if (!organization)`. Si
l'organisation n'existe pas, `get()` lève `OrganizationNotFound`, et l'API renvoie le code
`ORGANIZATION_NOT_FOUND` au client.

**Sans cette règle.** `archiveOrganization` appelle `get()` puis `organization.archive(…)`. Pour un id
inconnu, `get()` renvoie `null`, et le usecase plante sur `Cannot read properties of null`. Le client
reçoit une 500 au lieu de l'erreur `ORGANIZATION_NOT_FOUND`.

### I4. Des erreurs du domaine

**La règle.** Un repository lève les erreurs du `domain/errors.js` de son contexte, ou de
`shared/domain/errors.js`. Il ne lève pas d'`Error` nue. Il ne laisse pas sortir l'erreur de la base :
un `catch` traduit chaque erreur qu'il attrape.

**Bon exemple.**

```ts
// organization-repository.ts, dans insertFeatures()
const featureId = featureIds.find(({ key }) => key === feature.featureName)?.id;
if (!featureId) {
  throw new FeatureNotFound({ meta: { featureName: feature.featureName } });
}
```

[`FeatureNotFound`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/errors.js#L85-L91)
porte un code, `FEATURE_NOT_FOUND`, que le front sait traiter.

**Mauvais exemple.**

```ts
// organization-repository.ts, dans insertFeatures()
const featureId = featureIds.find(({ key }) => key === feature.featureName)?.id;
if (!featureId) {
  throw new Error(`Unknown feature ${feature.featureName}`); // une Error nue, sans code
}
```

```ts
// organization-repository.ts, dans insertFeatures()
try {
  await knexConn('organization-features').insert(rows);
} catch (error) {
  if (knexUtils.foreignKeyConstraintViolated(error)) {
    throw new FeatureNotFound();
  }
  throw error; // les autres erreurs de la base sortent telles quelles
}
```

**Ce que ça apporte.** Le mappeur d'erreurs de l'API associe chaque erreur du domaine à un statut HTTP
et à un code. Pix Admin reçoit `FEATURE_NOT_FOUND` et affiche le bon message.

**Sans cette règle.** Une `Error` nue, ou l'erreur de la base, sort en 500 sans code. Pix Admin
affiche une erreur générique, et personne ne sait quelle fonctionnalité manque.

**À savoir.** Pour traduire une violation de contrainte, il faut savoir laquelle a sauté. Les
contraintes de la base portent donc un nom qui dit l'intention métier.

### I5. Les dépendances arrivent en paramètre

**La règle.** Un repository n'importe ni l'API interne d'un autre contexte, ni un client de stockage,
ni un client HTTP. Il les reçoit en paramètres nommés, remplis par l'index du contexte. Hors du
domaine de son contexte, il n'importe que `DomainTransaction`, comme le demande I12.

**Bon exemple.**

```ts
// organization-repository.ts : rien d'autre que DomainTransaction et le domaine
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { OrganizationId, UserId } from '../../../shared/domain/Id.js';
import { FeatureNotFound, OrganizationNotFound } from '../../domain/errors.js';
import {
  type FeatureName,
  type FeatureParams,
  Organization,
  type OrganizationFeature,
  type OrganizationType,
} from '../../domain/models/organization/index.js';
import type { OrganizationRepository } from '../../domain/repositories/OrganizationRepository.js';
```

```ts
// index.ts : c'est ici qu'on importerait une API ou un client
const dependencies = {};
```

**Mauvais exemple.**

```ts
// organization-repository.ts
import * as organizationApi from '../../../team/application/api/organization.js'; // l'API d'un autre contexte

const add = async ({ organization }: { organization: Organization<null> }): Promise<Organization> => {
  …
  await organizationApi.createProOrganizationInvitation({ organizationId: id, … });
  return get({ id });
};
```

**Ce que ça apporte.** L'index liste tout ce que le contexte utilise hors de lui. Un test peut
remplacer une dépendance reçue en paramètre par un stub.

**Sans cette règle.** Le test de `add()` ne peut pas remplacer l'API de team, parce que les exports
d'un module ESM ne se modifient pas. Chaque test crée une vraie invitation. Et rien dans l'index ne dit
que organizational-entities dépend de team.

**À savoir.** `injectDependencies` ajoute chaque entrée de `dependencies` aux paramètres nommés des
fonctions des repositories. Un repository qui lit l'API d'un autre contexte la déclare donc dans ses
paramètres, par exemple `({ id, organizationLearnerApi })`, et l'index la met dans `dependencies`.
Voir [`dependency-injection.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/infrastructure/utils/dependency-injection.js#L46-L70).

### I6. Enregistré dans l'index du contexte

**La règle.** Tout repository du dossier `infrastructure/repositories/` figure dans l'index du
contexte, qu'il reçoive des dépendances ou non. Les usecases reçoivent leurs repositories depuis cet
index, et seulement depuis lui. Il n'y a qu'une façon de brancher un repository.

**Bon exemple.**

```ts
// infrastructure/repositories/index.ts
const repositoriesWithoutInjectedDependencies = {
  organizationRepository,
  // … et tous les autres repositories du dossier
};
```

Le même index, dans un contexte réel :
[`quest/infrastructure/repositories/index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/repositories/index.js#L38-L80).

**Mauvais exemple.**

```ts
// domain/usecases/index.ts : le repository est importé directement, sans passer par l'index
import { organizationRepository } from '../../infrastructure/repositories/organization-repository.js';
```

**Ce que ça apporte.** L'index est la liste complète des repositories du contexte. On y lit en un
coup d'œil ce que le contexte lit et écrit, et ce qu'il utilise des autres contextes.

**Sans cette règle.** Un jour, on ajoute une API en paramètre à `organizationRepository`. Comme il
n'est pas dans l'index, l'injection ne s'applique pas : le paramètre reste `undefined`, et le
repository plante au premier appel en production.

### I9. Un nom de fichier cohérent

**La règle.** Les noms des fichiers de repository suivent la même convention dans tout le contexte.
Deux conventions existent : `organization-repository.ts` et `organization.repository.ts`. Un contexte
choisit l'une et s'y tient.

**Bon exemple.**

```
infrastructure/repositories/
├── index.ts
├── network-repository.ts
├── organization-repository.ts
└── tag-repository.ts
```

**Mauvais exemple.**

```
infrastructure/repositories/
├── index.ts
├── network.repository.ts
├── organization-repository.ts
└── tag.repository.ts
```

**Ce que ça apporte.** On trouve le fichier en tapant son nom, sans essayer les deux formes.

**Sans cette règle.** Pas de bug. On cherche `organization.repository`, on ne trouve rien, et on crée
un second repository pour l'organisation.

### I10. Aucune règle métier

**La règle.** Un repository traduit et enregistre. Il ne contient aucun `if` sur une propriété métier
de l'objet, et n'enchaîne pas des écritures dont l'ordre porte une décision. Un `if` sur l'existence
d'une ligne est permis.

**Bon exemple.**

```ts
// organization-repository.ts, dans update()
const updatedCount = await knexConn('organizations')
  .where({ id: organization.id })
  .update({ ...toRow(organization), updatedAt: knexConn.fn.now() });
if (updatedCount === 0) {
  throw new OrganizationNotFound({ meta: { organizationId: organization.id } });
}
```

```ts
// organization-repository.ts, dans toRow()
isManagingStudents: organization.isManagingStudents,
```

**Mauvais exemple.**

```ts
// organization-repository.ts
function toRow(organization: Organization<OrganizationId | null>): Omit<OrganizationRow, 'id'> {
  const importsLearners = organization.features.some((feature) => feature.featureName === 'LEARNER_IMPORT');
  return {
    …
    isManagingStudents: importsLearners ? false : organization.isManagingStudents, // la règle de l'Aggregate, recopiée
  };
}
```

```ts
// organization-repository.ts
const update = async ({ organization }: { organization: Organization }): Promise<void> => {
  …
  if (organization.isArchived) {
    // une décision métier : archiver supprime les invitations et désactive les membres
    await knexConn('organization-invitations').where({ organizationId: organization.id }).delete();
    await knexConn('memberships').where({ organizationId: organization.id }).update({ disabledAt: new Date() });
  }
};
```

**Ce que ça apporte.** Chaque règle a une seule place : l'Aggregate, ou le usecase quand elle
enchaîne plusieurs opérations. Qui change la règle la trouve là, et nulle part ailleurs.

**Sans cette règle.** L'équipe change la règle de `LEARNER_IMPORT` dans `enableFeature()`. La copie
dans `toRow()` n'est pas mise à jour. Le test de l'Aggregate passe, mais la base enregistre l'ancienne
règle.

**À savoir.** Une fonction `get*` ou `find*` qui écrit cache presque toujours une règle métier.
Exemple : un `getOrCreate…` qui réactive un élève désactivé. On la découpe en opérations nommées, et
le usecase décide.

### I11. Pas d'import d'un autre repository

**La règle.** Un repository n'importe aucun autre repository, ni de son contexte ni d'un autre.
Composer deux repositories, c'est le travail du usecase.

**Bon exemple.**

```ts
// organization-repository.ts, dans update()
await knexConn('organization-features').where({ organizationId: organization.id }).delete();
await insertFeatures(organization.id, organization.features);
```

Le repository de l'Aggregate écrit lui-même dans les deux tables du groupe.

**Mauvais exemple.**

```ts
// organization-repository.ts
import * as organizationFeatureRepository from './organization-feature-repository.js';

const update = async ({ organization }: { organization: Organization }): Promise<void> => {
  …
  await organizationFeatureRepository.saveInBatch(organization.features); // un repository en appelle un autre
};
```

**Ce que ça apporte.** On lit le usecase et on voit chaque accès aux données. Un repository reste un
port, qu'on remplace sans toucher aux autres.

**Sans cette règle.** `organizationFeatureRepository` est aussi appelé par un autre usecase, qui
enregistre des fonctionnalités sans charger l'organisation. On modifie `saveInBatch()` pour ce
usecase, et `update()` change de comportement sans que personne relise ce fichier.

### I12. La connexion vient de `DomainTransaction`

**La règle.** Un repository prend sa connexion à la base avec `DomainTransaction.getConnection()`. Il
n'importe jamais la connexion `knex`. `getConnection()` rend la transaction en cours s'il y en a une,
la connexion ordinaire sinon. Le repository n'a donc pas à savoir s'il tourne dans une transaction. Voir
[`DomainTransaction.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/DomainTransaction.js#L82-L90).

**Bon exemple.**

```ts
// organization-repository.ts
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

const add = async ({ organization }: { organization: Organization<null> }): Promise<Organization> => {
  const knexConn = DomainTransaction.getConnection();
  // la base crée l'id, createdAt et updatedAt
  const [{ id }] = await knexConn('organizations').insert(toRow(organization)).returning('id');
  …
};
```

**Mauvais exemple.**

```ts
// organization-repository.ts
import { knex } from '../../../../db/knex-database-connection.js';

const add = async ({ organization }: { organization: Organization<null> }): Promise<Organization> => {
  const [{ id }] = await knex('organizations').insert(toRow(organization)).returning('id'); // hors de la transaction
  …
};
```

**Ce que ça apporte.** Toutes les requêtes d'un usecase lancé dans une transaction passent par cette
transaction. Si le usecase échoue, toutes ses écritures sont annulées.

**Sans cette règle.** Le usecase de création ajoute l'organisation, puis échoue à l'étape suivante. La
transaction est annulée, mais l'organisation, écrite sur la connexion importée, reste en base. Rien ne
le signale.

**Exceptions.**

- Un repository qui lit le datamart importe la connexion du datamart,
  [`datamart/knex-database-connection.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/datamart/knex-database-connection.js#L1-L6).
  `DomainTransaction` ne couvre que la base principale.
- Une écriture qui doit rester en base même si la transaction en cours échoue, comme l'état d'un import
  enregistré quand l'import échoue. La fonction reçoit alors la connexion en paramètre, et l'appelant
  lui passe une connexion hors transaction :

  ```ts
  const saveImportState = async ({ importState, knexConn = DomainTransaction.getConnection() }) => { … };
  ```

  Importer `knex` dans le repository reste interdit, même dans ce cas : rien n'y dirait que l'écriture
  sort de la transaction exprès.
