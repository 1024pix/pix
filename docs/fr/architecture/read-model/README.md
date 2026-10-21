# Read-model

Un read-model est un objet assemblé pour un écran ou une réponse : une ligne de la liste des
organisations de Pix Admin, le détail d'une campagne. Un [repository](../repository/README.md) le
construit avec une requête, souvent sur plusieurs tables. Le [usecase](../usecase/README.md) le
renvoie sans le lire, et le [sérialiseur](../serializer/README.md) le met au format de la réponse.
Aucune règle du métier ne le lit. Les read-models se rangent dans `domain/read-models/`.

Comme un [Value Object](../value-object/README.md), il ne change pas après sa création
([V1](../value-object/README.md#v1-immuable)) et ne dépend d'aucune infrastructure
([V4](../value-object/README.md#v4-aucun-effet-de-bord-extérieur)). Il est lu dans les tables où
l'[Aggregate](../aggregate-root/README.md) écrit.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [RM1](#rm1-aucune-règle-métier) | Aucune règle métier | seulement des mises en forme pour l'écran : un total, un libellé, `isArchived` |
| [RM2](#rm2-aucune-validation) | Aucune validation | pas de `throw` : les données viennent de la base de Pix |
| [RM3](#rm3-nentre-pas-dans-une-règle) | N'entre pas dans une règle | un usecase le renvoie sans le lire ; pour décider, il charge l'Aggregate |
| [RM4](#rm4-rangé-à-part-des-modèles-du-domaine) | Rangé à part des modèles du domaine | le fichier est dans `domain/read-models/`, à côté de `domain/models/` |

## Exemple complet

Une ligne de la liste des organisations de Pix Admin. La requête joint deux Aggregates,
l'organisation et son équipe d'administration, et ne lit que les colonnes que la liste affiche.
Exemple inventé, d'après
[`organization-for-admin.repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js#L335-L347).

```ts
// organizational-entities/domain/read-models/OrganizationListItem.ts — RM4 : rangé dans read-models/
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { OrganizationType } from '../models/organization/index.js';

// RM2 : un type plutôt qu'une classe. Sans constructeur, il n'y a pas d'endroit où valider, et
// le repository renvoie un objet littéral. La mise en forme est donc une fonction à part, plus bas
export type OrganizationListItem = {
  readonly id: OrganizationId; // V1 : en lecture seule ; l'id de l'organisation affichée
  readonly name: string;
  readonly type: OrganizationType;
  readonly externalId: string | null;
  readonly archivedAt: Date | null;
  readonly administrationTeamName: string | null; // vient d'un autre Aggregate, par la jointure
};

// RM1 : une mise en forme pour l'écran, elle ne décide rien
export const isArchived = (item: OrganizationListItem): boolean => item.archivedAt !== null;
```

```ts
// organizational-entities/domain/repositories/OrganizationListRepository.ts
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { OrganizationListItem } from '../read-models/OrganizationListItem.js';

export type OrganizationListFilter = { id?: OrganizationId; name?: string; hideArchived?: boolean };
export type PageParams = { number: number; size: number };
export type Pagination = { page: number; pageSize: number; rowCount: number; pageCount: number };

export interface OrganizationListRepository {
  findPaginatedFiltered({
    filter,
    page,
  }: {
    filter: OrganizationListFilter;
    page: PageParams;
  }): Promise<{ models: OrganizationListItem[]; pagination: Pagination }>;
}
```

```ts
// organizational-entities/infrastructure/repositories/organization-list-repository.ts
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { OrganizationId } from '../../../shared/domain/Id.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import type { OrganizationType } from '../../domain/models/organization/index.js';
import type { OrganizationListItem } from '../../domain/read-models/OrganizationListItem.js';
import type { OrganizationListFilter, PageParams } from '../../domain/repositories/OrganizationListRepository.js';

// knex ne type pas ses résultats : on déclare la forme de la ligne renvoyée par la requête
type OrganizationListRow = {
  id: number;
  name: string;
  type: string;
  externalId: string | null;
  archivedAt: Date | null;
  administrationTeamName: string | null;
};

export const findPaginatedFiltered = async ({ filter, page }: { filter: OrganizationListFilter; page: PageParams }) => {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('organizations')
    .select({
      id: 'organizations.id',
      name: 'organizations.name',
      type: 'organizations.type',
      externalId: 'organizations.externalId',
      archivedAt: 'organizations.archivedAt',
      administrationTeamName: 'administration_teams.name',
    })
    .leftJoin('administration_teams', 'administration_teams.id', 'organizations.administrationTeamId')
    .modify((queryBuilder) => {
      if (filter.id) queryBuilder.where('organizations.id', filter.id);
      if (filter.name) queryBuilder.whereILike('organizations.name', `%${filter.name}%`);
      if (filter.hideArchived) queryBuilder.whereNull('organizations.archivedAt');
    })
    .orderBy('organizations.name', 'ASC');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  return { models: results.map(toListItem), pagination };
};

// RM2 : on recopie les colonnes, sans rien vérifier
function toListItem(row: OrganizationListRow): OrganizationListItem {
  return {
    id: row.id as OrganizationId,
    name: row.name,
    type: row.type as OrganizationType, // la valeur de la base est reprise telle quelle
    externalId: row.externalId,
    archivedAt: row.archivedAt,
    administrationTeamName: row.administrationTeamName,
  };
}
```

```ts
// organizational-entities/domain/usecases/find-paginated-filtered-organizations.ts
import type {
  OrganizationListFilter,
  OrganizationListRepository,
  PageParams,
} from '../repositories/OrganizationListRepository.js';

// RM3 : le usecase renvoie les lignes sans les lire
export const findPaginatedFilteredOrganizations = ({
  filter,
  page,
  organizationListRepository,
}: {
  filter: OrganizationListFilter;
  page: PageParams;
  organizationListRepository: OrganizationListRepository;
}) => {
  return organizationListRepository.findPaginatedFiltered({ filter, page });
};
```

```ts
// organizational-entities/infrastructure/serializers/jsonapi/organization-list-serializer.ts
import jsonapiSerializer from 'jsonapi-serializer';

import { isArchived, type OrganizationListItem } from '../../../domain/read-models/OrganizationListItem.js';
import type { Pagination } from '../../../domain/repositories/OrganizationListRepository.js';

const { Serializer } = jsonapiSerializer;

export const serialize = (items: OrganizationListItem[], pagination: Pagination) =>
  new Serializer('organizations', {
    attributes: ['name', 'type', 'externalId', 'administrationTeamName', 'isArchived'],
    // isArchived est fourni par le read-model : le sérialiseur appelle sa fonction, sans refaire le calcul
    transform: (item: OrganizationListItem) => ({ ...item, isArchived: isArchived(item) }),
    meta: pagination,
  }).serialize(items);
```

## Comment tester

Un read-model se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- chaque mise en forme, cas limites compris. Exemples : `is archived when the organization has an
  archive date`, `is not archived without archive date`.

Un read-model sans mise en forme n'a pas de test unitaire : il n'a rien à vérifier.

La forme renvoyée par la requête se teste avec le test d'intégration du repository, sur la base.
Exemple : `returns the organizations of the page, with the name of their administration team`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/read-models/OrganizationListItem_test.ts
import { expect } from 'chai';

import {
  isArchived,
  type OrganizationListItem,
} from '../../../../../src/organizational-entities/domain/read-models/OrganizationListItem.js';
import type { OrganizationId } from '../../../../../src/shared/domain/Id.js';

describe('Unit | Organizational Entities | Domain | ReadModels | OrganizationListItem', function () {
  const buildItem = (props: Partial<OrganizationListItem> = {}): OrganizationListItem => ({
    id: 1 as OrganizationId,
    name: 'Lycée Victor Hugo',
    type: 'SCO',
    externalId: '0750001A',
    archivedAt: null,
    administrationTeamName: 'Équipe SCO',
    ...props,
  });

  describe('isArchived', function () {
    it('is archived when the organization has an archive date', function () {
      expect(isArchived(buildItem({ archivedAt: new Date('2026-01-01') }))).to.be.true;
    });

    it('is not archived without archive date', function () {
      expect(isArchived(buildItem({ archivedAt: null }))).to.be.false;
    });
  });
});
```

## Checklist de revue de code

```
Porte-t-il une règle ?
[ ] RM1  Aucune règle du métier ; seulement des mises en forme pour l'écran
[ ] RM3  Aucun usecase ne décide à partir de lui ; aucun modèle du domaine ne l'importe

Vérifie-t-il ses données ?
[ ] RM2  Pas de validation, pas de throw ; une source externe se vérifie dans le repository

Est-il au bon endroit ?
[ ] RM4  Le fichier est dans domain/read-models/

Respecte-t-il les règles du Value Object ?
[ ] V1  Champs en readonly, aucune écriture après la création
[ ] V4  Pas d'import d'infrastructure, pas de new Date(), Math.random() ni config

Tests
[ ] Chaque mise en forme a son test unitaire, sans stub, mock ni spy
[ ] Le test d'intégration du repository vérifie la forme renvoyée
```

## Référence des règles

### RM1. Aucune règle métier

**La règle.** Un read-model ne porte aucune règle du métier. Il peut mettre en forme des données déjà
chargées : un total, un pourcentage, un libellé. Une règle du métier vit dans l'Aggregate, qui
l'applique avant d'enregistrer.

**Bon exemple.**

```ts
// OrganizationListItem.ts
// RM1 : une mise en forme pour l'écran, elle ne décide rien
export const isArchived = (item: OrganizationListItem): boolean => item.archivedAt !== null;
```

`isArchived` dit seulement si la colonne est remplie. L'écran s'en sert pour afficher un badge.

**Mauvais exemple.**

```ts
// OrganizationListItem.ts
export type OrganizationListItem = {
  …
  readonly isManagingStudents: boolean;
  readonly featureNames: ReadonlyArray<FeatureName>;
};

// la règle de l'Aggregate, recopiée pour l'écran
export const managesStudents = (item: OrganizationListItem): boolean =>
  item.isManagingStudents && !item.featureNames.includes('LEARNER_IMPORT');
```

La règle « si `LEARNER_IMPORT` est activée, l'organisation ne gère pas d'élèves » appartient à
l'Aggregate `Organization`. Pour l'afficher, le read-model lit la colonne `isManagingStudents`, que
l'Aggregate a déjà mise à jour.

**Ce que ça apporte.** La règle existe à un seul endroit, dans `Organization`. La liste affiche ce que
l'Aggregate a enregistré.

**Sans cette règle.** La règle vit dans `Organization` et dans la liste. Le jour où elle change dans
l'Aggregate, la liste de Pix Admin garde l'ancien calcul. Elle affiche « gère des élèves » pour une
organisation qui ne les gère plus.

**À savoir.** Pour savoir si un calcul est une mise en forme, se demander : décide-t-il quelque chose ?
Ici, `isArchived` sert seulement à afficher un badge. Si un usecase s'en servait pour refuser une
action, le calcul déciderait : il irait dans l'Aggregate (voir [RM3](#rm3-nentre-pas-dans-une-règle)).

**Exceptions.** Un read-model sans aucune mise en forme est permis. Nommer la forme que renvoie une
requête suffit à justifier le fichier.

### RM2. Aucune validation

**La règle.** Un read-model ne vérifie pas ses données. Elles viennent d'une requête sur la base de
Pix, où l'Aggregate les a écrites après les avoir vérifiées. Une donnée ancienne peut ne pas suivre
les règles d'aujourd'hui : le read-model l'accepte quand même. Il ne lève jamais d'erreur.

**Bon exemple.**

```ts
// OrganizationListItem.ts
// RM2 : un type plutôt qu'une classe. Sans constructeur, il n'y a pas d'endroit où valider, et
// le repository renvoie un objet littéral. La mise en forme est donc une fonction à part, plus bas
export type OrganizationListItem = {
  readonly id: OrganizationId; // V1 : en lecture seule ; l'id de l'organisation affichée
  readonly name: string;
  …
};
```

```ts
// organization-list-repository.ts
// RM2 : on recopie les colonnes, sans rien vérifier
function toListItem(row: OrganizationListRow): OrganizationListItem {
  return {
    id: row.id as OrganizationId,
    name: row.name,
    type: row.type as OrganizationType, // la valeur de la base est reprise telle quelle
    …
  };
}
```

**Mauvais exemple.**

```ts
// OrganizationListItem.ts
export class OrganizationListItem {
  constructor(props: OrganizationListItemProps) {
    if (props.name.trim() === '') {
      throw new InvalidOrganizationError('The name is required'); // vérifie ce que la base vient de renvoyer
    }
    …
  }
}
```

**Ce que ça apporte.** La liste s'affiche avec les données telles qu'elles sont en base. Une donnée
ancienne ou incomplète apparaît à l'écran, où quelqu'un peut la corriger.

**Sans cette règle.** Une ancienne organisation a un nom vide en base. Le constructeur lève, et toute
la page de la liste répond une erreur 500. Plus personne ne peut chercher cette organisation dans Pix
Admin, même pour corriger son nom.

**Exceptions.** Si les données viennent d'une source externe, comme l'API d'un autre contexte ou un
service tiers, il faut les vérifier. C'est le repository qui le fait, quand il traduit la source. Le
read-model reste sans validation.

### RM3. N'entre pas dans une règle

**La règle.** Aucune règle du métier et aucun usecase ne décide à partir d'un read-model. Le
read-model sert seulement à construire la réponse. Pour décider, un usecase charge l'Aggregate et
appelle sa méthode.

**Bon exemple.**

```ts
// find-paginated-filtered-organizations.ts
// RM3 : le usecase renvoie les lignes sans les lire
export const findPaginatedFilteredOrganizations = ({
  filter,
  page,
  organizationListRepository,
}: {
  filter: OrganizationListFilter;
  page: PageParams;
  organizationListRepository: OrganizationListRepository;
}) => {
  return organizationListRepository.findPaginatedFiltered({ filter, page });
};
```

Quand il faut décider, le usecase charge l'Aggregate,
comme `enableOrganizationFeature` dans la [fiche Aggregate Root](../aggregate-root/README.md#exemple-complet) :

```ts
// enable-organization-feature.ts
const organization = await organizationRepository.get({ id: organizationId });
organization.enableFeature(featureName, params);
await organizationRepository.update({ organization });
```

**Mauvais exemple.**

```ts
// enable-organization-feature.ts : la décision lit une ligne de la liste
const {
  models: [item],
} = await organizationListRepository.findPaginatedFiltered({
  filter: { id: organizationId },
  page: { number: 1, size: 1 },
});
if (isArchived(item)) throw new ArchivedOrganizationError(); // une règle lit le read-model
await organizationFeatureRepository.add({ organizationId, featureName, params }); // sans passer par l'Aggregate
```

**Ce que ça apporte.** On peut changer la liste pour l'écran, ajouter ou retirer une colonne, sans
toucher à aucune règle du métier.

**Sans cette règle.** Le usecase lit la ligne de liste, puis enregistre la fonctionnalité sans passer
par l'Aggregate. `enableFeature()` n'est pas appelée, donc après `LEARNER_IMPORT`,
`isManagingStudents` reste à `true`. L'organisation importe ses élèves et gère aussi des élèves, ce
que la règle de l'Aggregate interdit.

**À savoir.**

- Si une règle a vraiment besoin de lire l'objet, ce n'est pas un read-model. C'est un Value Object,
  rangé dans `domain/models/` : il valide ses valeurs à la construction
  ([V3](../value-object/README.md#v3-valide-dès-la-construction)) et porte ses règles
  ([V5](../value-object/README.md#v5-contient-ses-règles)).
- L'autre sens est interdit aussi : un modèle du domaine ne fabrique pas de read-model. `Organization`
  n'a pas de méthode `toListItem()`. C'est le repository qui construit la ligne.

### RM4. Rangé à part des modèles du domaine

**La règle.** Un read-model vit dans `domain/read-models/`, à côté de `domain/models/`. Il ne se range
ni dans `domain/models/`, ni dans un dossier `aggregates/`.

**Bon exemple.**

```
organizational-entities/domain/
├── models/
│   └── organization/
│       └── Organization.ts
└── read-models/
    └── OrganizationListItem.ts
```

**Mauvais exemple.**

```
organizational-entities/domain/
└── models/
    ├── organization/
    │   └── Organization.ts
    └── OrganizationListItem.ts   ← rangé comme un modèle du domaine
```

**Ce que ça apporte.** Le dossier dit au relecteur qu'aucune règle ne lit ce fichier. Une règle
d'outil peut aussi interdire à `domain/models/` et `domain/services/` d'importer
`domain/read-models/`. Elle vérifie une partie de RM3 : aucun modèle du domaine ne lit un read-model.
Qu'un usecase ne décide pas à partir d'un read-model reste à vérifier en revue.

**Sans cette règle.** Un développeur trouve `OrganizationListItem` à côté d'`Organization`, et y ajoute
une fonction `canBeArchived()`. La ligne de liste devient une règle du métier. Aucun outil ne le
signale : pour lui, le fichier est un modèle du domaine comme un autre.

**À savoir.**

- La règle d'outil s'écrit avec `dependency-cruiser`, l'outil qui vérifie les imports dans la CI :

  ```js
  {
    name: 'domain-rule-must-not-import-read-model',
    severity: 'error',
    from: { path: 'src/.+/domain/(models|services)/' },
    to: { path: 'src/.+/domain/read-models/' },
  }
  ```

  Le chemin s'écrit `src/.+/` et pas `src/[^/]+/`. Sinon, la règle n'atteint pas les contextes qui ont
  des sous-dossiers, et ne s'y déclenche jamais, sans aucun message.
- Le read-model est sous `domain/` parce qu'un repository de `infrastructure/` le construit. Rangé sous
  `application/`, il ferait dépendre l'infrastructure de l'application.
