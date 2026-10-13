# Read-model

Un read-model est un objet assemblé pour un écran ou une réponse : une ligne de la liste des
organisations de Pix Admin, le détail d'une campagne. Un [repository](../repository/README.md) le
construit avec une requête, souvent sur plusieurs tables. Il traverse le [usecase](../usecase/README.md),
puis sort par le [sérialiseur](../serialiseur/README.md). Aucune règle du métier ne le lit. Les
read-models se rangent dans `domain/read-models/`.

Comme un [Value Object](../objet-valeur/README.md), il ne change pas après sa création (V1) et ne
dépend d'aucune infrastructure (V4). Malgré son nom, ce n'est pas le read model de CQRS : il est lu
dans la même base, dans la même transaction.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [RM1](#rm1-aucune-règle-métier) | Aucune règle métier | seulement des mises en forme pour l'écran : un total, un libellé, `isArchived` |
| [RM2](#rm2-aucune-validation) | Aucune validation | pas de `throw` : les données viennent de notre propre base |
| [RM3](#rm3-nentre-pas-dans-une-règle) | N'entre pas dans une règle | un usecase le renvoie sans le lire ; pour décider, il charge l'[Aggregate](../racine-agregat/README.md) |
| [RM4](#rm4-emplacement) | Emplacement | le fichier est dans `domain/read-models/`, à côté de `domain/models/` |

## Exemple complet

Une ligne de la liste des organisations de Pix Admin. La requête joint deux Aggregates,
l'organisation et son équipe d'administration, et ne lit que les colonnes que la liste affiche.
Exemple inventé, d'après
[`organization-for-admin.repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js#L335-L347).

```ts
// organizational-entities/domain/read-models/OrganizationListItem.ts — RM4 : rangé dans read-models/
import type { OrganizationId } from '../../../shared/domain/Id.js';

// RM2 : un type, sans constructeur, donc sans validation
export type OrganizationListItem = {
  readonly id: OrganizationId; // V1 : en lecture seule ; l'id de l'organisation affichée
  readonly name: string;
  readonly type: string;
  readonly externalId: string | null;
  readonly archivedAt: Date | null;
  readonly administrationTeamName: string | null; // vient d'un autre Aggregate, par la jointure
};

// RM1 : une mise en forme pour l'écran, elle ne décide rien
export const isArchived = (item: OrganizationListItem): boolean => item.archivedAt !== null;
```

```ts
// organizational-entities/domain/repositories/OrganizationListRepository.ts
export interface OrganizationListRepository {
  findPaginatedFiltered(params: {
    filter: OrganizationListFilter;
    page: PageParams;
  }): Promise<{ models: OrganizationListItem[]; pagination: Pagination }>;
}
```

```ts
// organizational-entities/infrastructure/repositories/organization-list-repository.ts
export const findPaginatedFiltered = async ({ filter, page }: FindPaginatedFilteredParams) => {
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
    .modify(applySearchFilters, filter, knexConn)
    .orderBy('organizations.name', 'ASC');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  return { models: results.map(toListItem), pagination };
};

// RM2 : on recopie les colonnes, sans rien vérifier
function toListItem(row: OrganizationListRow): OrganizationListItem {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    externalId: row.externalId,
    archivedAt: row.archivedAt,
    administrationTeamName: row.administrationTeamName,
  };
}
```

```ts
// organizational-entities/domain/usecases/find-paginated-filtered-organizations.ts
// RM3 : le usecase renvoie les lignes sans les lire
export const findPaginatedFilteredOrganizations = ({
  filter,
  page,
  organizationListRepository,
}: FindPaginatedFilteredOrganizationsInput) => {
  return organizationListRepository.findPaginatedFiltered({ filter, page });
};
```

```ts
// organizational-entities/infrastructure/serializers/jsonapi/organization-list-serializer.ts
export const serialize = (items: OrganizationListItem[], pagination: Pagination) =>
  new Serializer('organizations', {
    attributes: ['name', 'type', 'externalId', 'administrationTeamName', 'isArchived'],
    transform: (item: OrganizationListItem) => ({ ...item, isArchived: isArchived(item) }),
    meta: pagination,
  }).serialize(items);
```

## Comment tester

Un read-model se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre chaque mise en
forme, cas limites compris. Exemples : `is archived when the organization has an archive date` et
`is not archived without archive date`.

Un read-model sans mise en forme n'a pas de test unitaire : il n'a rien à vérifier.

La forme renvoyée par la requête se teste avec le test d'intégration du repository, sur la base.
Exemple : `returns the organizations of the page, with the name of their administration team`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/read-models/OrganizationListItem_test.ts
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

Comme un Value Object
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
export const isArchived = (item: OrganizationListItem): boolean => item.archivedAt !== null;
```

`isArchived` dit seulement si la colonne est remplie. L'écran s'en sert pour afficher un badge.

**Mauvais exemple.**

```ts
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
l'Aggregate `Organization`. Pour l'afficher, le read-model lit la
colonne `isManagingStudents`, que l'Aggregate a déjà mise à jour.

**Ce que ça apporte.** La règle existe à un seul endroit, dans `Organization`. La liste affiche ce que
l'Aggregate a enregistré.

**Sans cette règle.** La règle vit dans `Organization` et dans la liste. Le jour où elle change dans
l'Aggregate, la liste de Pix Admin garde l'ancien calcul. Elle affiche « gère des élèves » pour une
organisation qui ne les gère plus.

**À savoir.** Pour savoir si un calcul est une mise en forme, se demander : décide-t-il quelque chose ?
`Organization` a aussi un getter `isArchived`, et `rename()` le lit pour refuser de renommer une
organisation archivée. Dans l'Aggregate, le calcul décide. Dans le read-model, le même calcul sert
seulement à l'affichage.

**Exceptions.** Un read-model sans aucune mise en forme est permis. Nommer la forme que renvoie une
requête suffit à justifier le fichier.

### RM2. Aucune validation

**La règle.** Un read-model ne vérifie pas ses données. Elles viennent d'une requête sur notre propre
base, et l'Aggregate les a déjà vérifiées à l'écriture. Le read-model ne lève donc jamais d'erreur.

**Bon exemple.**

```ts
// un type, sans constructeur, donc sans validation
export type OrganizationListItem = {
  readonly id: OrganizationId;
  readonly name: string;
  …
};
```

```ts
function toListItem(row: OrganizationListRow): OrganizationListItem {
  return {
    id: row.id,
    name: row.name,
    …
  };
}
```

**Mauvais exemple.**

```ts
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

**La règle.** Un read-model sort du domaine, il n'y entre pas. Aucune règle ni aucun usecase ne
décide à partir de lui. Pour décider, un usecase charge l'Aggregate et appelle sa méthode.

**Bon exemple.**

```ts
export const findPaginatedFilteredOrganizations = ({
  filter,
  page,
  organizationListRepository,
}: FindPaginatedFilteredOrganizationsInput) => {
  return organizationListRepository.findPaginatedFiltered({ filter, page });
};
```

Le usecase renvoie les lignes sans les lire. Quand il faut décider, le usecase charge l'Aggregate,
comme `enableOrganizationFeature` dans la fiche Aggregate Root :

```ts
const organization = await organizationRepository.get(organizationId);
organization.enableFeature(featureName, params, clock.now());
await organizationRepository.update(organization);
```

**Mauvais exemple.**

```ts
// enable-organization-feature.ts : la décision lit une ligne de la liste
const {
  models: [item],
} = await organizationListRepository.findPaginatedFiltered({ filter: { id: organizationId }, page: { number: 1, size: 1 } });
if (isArchived(item)) throw new ArchivedOrganizationError(); // une règle lit le read-model
await organizationFeatureRepository.add({ organizationId, featureName, params });
```

**Ce que ça apporte.** On peut changer la liste pour l'écran, ajouter ou retirer une colonne, sans
toucher à aucune règle du métier.

**Sans cette règle.** Le usecase vérifie l'archivage, mais la ligne de liste ne porte pas les
fonctionnalités. La même fonctionnalité est activée deux fois. Et après `LEARNER_IMPORT`,
`isManagingStudents` reste à `true`, parce que `enableFeature()` n'a pas été appelée.

**À savoir.**

- Si une règle a vraiment besoin de lire l'objet, ce n'est pas un read-model. C'est un Value Object,
  rangé dans `domain/models/` : il valide ses valeurs à la construction (V3) et porte ses règles (V5).
- L'autre sens est interdit aussi : un modèle du domaine ne fabrique pas de read-model. `Organization`
  n'a pas de méthode `toListItem()` : c'est le repository qui construit la ligne.

### RM4. Emplacement

**La règle.** Un read-model vit dans `domain/read-models/`, à côté de `domain/models/`. Il ne se range
ni dans `domain/models/`, ni dans un dossier `aggregates/`.

**Bon exemple.**

```
organizational-entities/domain/
├── models/
│   └── Organization.ts
└── read-models/
    └── OrganizationListItem.ts
```

**Mauvais exemple.**

```
organizational-entities/domain/
└── models/
    ├── Organization.ts
    └── OrganizationListItem.ts   ← rangé comme un modèle du domaine
```

**Ce que ça apporte.** Le dossier dit au relecteur qu'aucune règle ne lit ce fichier. Et une règle
d'outil peut interdire à `domain/models/` d'importer `domain/read-models/`, ce qui vérifie RM3.

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
