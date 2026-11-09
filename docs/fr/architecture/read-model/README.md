# Read-model

Par défaut, une lecture passe par les objets du domaine. Le [repository](../repository/README.md)
charge l'[Aggregate](../aggregate-root/README.md), et le [sérialiseur](../serializer/README.md) le met
au format de la réponse. Un read-model est l'exception à ce chemin.

Un read-model est un objet assemblé pour une lecture précise, par exemple une ligne de la liste des
organisations de Pix Admin. On le crée seulement quand une mesure montre que la lecture par l'Aggregate
est trop lente ([RM5](#rm5-seulement-sur-une-lenteur-mesurée)). Un repository le construit alors avec
une requête ciblée, souvent sur plusieurs tables. Le [usecase](../usecase/README.md) le renvoie sans
décider à partir de lui. Aucune règle du métier ne le lit. Les read-models se rangent dans
`domain/read-models/`.

Il suit les règles [V1](../value-object/README.md#v1-immuable) et
[V4](../value-object/README.md#v4-aucun-effet-de-bord-extérieur) de la fiche Value Object. À la
différence d'un [Value Object](../value-object/README.md), il ne valide pas ses données. Ses données
viennent des tables où l'Aggregate écrit.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [RM1](#rm1-aucune-règle-métier) | Aucune règle métier | seulement des mises en forme pour l'écran : un total, un libellé |
| [RM2](#rm2-aucune-validation) | Aucune validation | pas de `throw` : les données viennent de la base de Pix |
| [RM3](#rm3-nentre-pas-dans-une-règle) | N'entre pas dans une règle | un usecase le renvoie sans décider à partir de lui, et charge l'Aggregate pour décider ; aucun modèle du domaine ne l'importe |
| [RM4](#rm4-rangé-à-part-des-modèles-du-domaine) | Rangé à part des modèles du domaine | le fichier est dans `domain/read-models/`, à côté de `domain/models/` |
| [RM5](#rm5-seulement-sur-une-lenteur-mesurée) | Seulement sur une lenteur mesurée | une mesure (benchmark, trace en production) montre que la lecture par l'Aggregate est trop lente |

## Exemple complet

Une ligne de la liste des organisations de Pix Admin. L'exemple suppose qu'une mesure a montré que
charger chaque organisation entière, avec ses fonctionnalités, rendait cette liste trop lente (RM5). La requête joint deux Aggregates,
l'organisation et son équipe d'administration, et ne lit que les colonnes que la liste affiche.
`externalId` est l'identifiant de l'organisation hors de Pix, par exemple l'UAI d'un lycée (son code
officiel auprès de l'Éducation nationale). L'exemple simplifie le filtre par nom : le vrai filtre
ignore aussi les accents et la ponctuation. L'exemple laisse aussi de côté les autres filtres de la
liste, comme le type ou l'identifiant externe.
Exemple inventé, d'après
[`organization-for-admin.repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js#L335-L347).

```ts
// organizational-entities/domain/read-models/OrganizationListItem.ts — RM4 : rangé dans read-models/
// RM5 : la liste par l'Aggregate est mesurée trop lente (trace citée dans la PR)
import type { OrganizationType } from '../models/organization/index.js';

export type OrganizationListItemProps = {
  id: number;
  name: string;
  type: OrganizationType;
  externalId: string | null;
  archivedAt: Date | null;
  administrationTeamName: string | null;
};

export class OrganizationListItem {
  readonly id: number; // l'id de l'organisation affichée
  readonly name: string;
  readonly type: OrganizationType;
  readonly externalId: string | null;
  readonly archivedAt: Date | null;
  readonly administrationTeamName: string | null; // vient d'un autre Aggregate, par la jointure
  readonly label: string;

  // RM2 : le constructeur recopie les données, sans rien vérifier
  constructor({ id, name, type, externalId, archivedAt, administrationTeamName }: OrganizationListItemProps) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.externalId = externalId;
    this.archivedAt = archivedAt;
    this.administrationTeamName = administrationTeamName;
    // RM1 : une mise en forme pour l'écran, elle ne décide rien
    this.label = externalId ? `${name} (${externalId})` : name;
  }
}
```

```ts
// organizational-entities/domain/repositories/OrganizationListRepository.ts
import type { OrganizationListItem } from '../read-models/OrganizationListItem.js';

export type OrganizationListFilter = { id?: number; name?: string; hideArchived?: boolean };
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
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import type { OrganizationType } from '../../domain/models/organization/index.js';
import { OrganizationListItem } from '../../domain/read-models/OrganizationListItem.js';
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

function toListItem(row: OrganizationListRow): OrganizationListItem {
  return new OrganizationListItem({
    id: row.id,
    name: row.name,
    type: row.type as OrganizationType, // la valeur de la base est reprise telle quelle
    externalId: row.externalId,
    archivedAt: row.archivedAt,
    administrationTeamName: row.administrationTeamName,
  });
}
```

```ts
// organizational-entities/domain/usecases/find-paginated-filtered-organizations.ts
import type {
  OrganizationListFilter,
  OrganizationListRepository,
  PageParams,
} from '../repositories/OrganizationListRepository.js';

// RM3 : le usecase renvoie les lignes sans décider à partir d'elles
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

## Comment tester

Un read-model se teste avec un test unitaire, sans stub, sans mock ni spy. Le test couvre :

- chaque mise en forme, cas limites compris. Exemples : `shows the name followed by the external id`,
  `shows the name alone without external id`.

Un read-model sans mise en forme n'a pas de test unitaire : il n'a rien à vérifier.

La forme renvoyée par la requête se teste avec le test d'intégration du repository, sur la base.
Exemple : `returns the organizations of the page, with the name of their administration team`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/domain/read-models/OrganizationListItem_test.ts
import { expect } from 'chai';

import {
  OrganizationListItem,
  type OrganizationListItemProps,
} from '../../../../../src/organizational-entities/domain/read-models/OrganizationListItem.js';

describe('Unit | Organizational Entities | Domain | ReadModels | OrganizationListItem', function () {
  const buildItem = (props: Partial<OrganizationListItemProps> = {}): OrganizationListItem =>
    new OrganizationListItem({
      id: 1,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      externalId: '0750001A',
      archivedAt: null,
      administrationTeamName: 'Équipe SCO',
      ...props,
    });

  describe('label', function () {
    it('shows the name followed by the external id', function () {
      expect(buildItem({ externalId: '0750001A' }).label).to.equal('Lycée Victor Hugo (0750001A)');
    });

    it('shows the name alone without external id', function () {
      expect(buildItem({ externalId: null }).label).to.equal('Lycée Victor Hugo');
    });
  });
});
```

## Checklist de revue de code

```
Porte-t-il une règle ?
[ ] RM1  Aucune règle du métier, aucun calcul recopié de l'Aggregate ; seulement des mises en forme pour l'écran
[ ] RM3  Aucun usecase ne décide à partir de lui ; aucun modèle du domaine ne l'importe

Vérifie-t-il ses données ?
[ ] RM2  Pas de validation, pas de throw ; une source externe se vérifie dans le repository

Est-il au bon endroit ?
[ ] RM4  Le fichier est dans domain/read-models/

Est-il justifié ?
[ ] RM5  La PR qui le crée cite la mesure qui montre que la lecture par l'Aggregate est trop lente

Tests
[ ] Chaque mise en forme a son test unitaire, sans stub, sans mock ni spy
[ ] Le test d'intégration du repository vérifie la forme renvoyée
```

## Référence des règles

### RM1. Aucune règle métier

**La règle.** Un read-model ne porte aucune règle du métier. Il ne recopie pas non plus un calcul que
l'Aggregate porte déjà. Il peut mettre en forme des données déjà chargées pour l'écran : un total, un
pourcentage, un libellé. Une règle du métier vit dans l'Aggregate, qui l'applique avant d'enregistrer.

**Exemple de code correct.**

```ts
// OrganizationListItem.ts
    // RM1 : une mise en forme pour l'écran, elle ne décide rien
    this.label = externalId ? `${name} (${externalId})` : name;
```

`label` assemble deux colonnes pour l'affichage, par exemple « Lycée Victor Hugo (0750001A) ».
L'Aggregate `Organization` n'a aucun calcul équivalent.

**Exemple de code incorrect.**

```ts
// OrganizationListItem.ts
export class OrganizationListItem {
  …
  readonly featureNames: ReadonlyArray<FeatureName>;
  …
  // les refus d'enableFeature(), recopiés pour afficher le bouton « Activer l'import »
  get canEnableLearnerImport(): boolean {
    return this.archivedAt === null && !this.featureNames.includes('LEARNER_IMPORT');
  }
}
```

`LEARNER_IMPORT` est la fonctionnalité d'import des élèves par fichier. Les refus « organisation
archivée » et « fonctionnalité déjà activée » appartiennent à `enableFeature()`, dans l'Aggregate
`Organization`.

**Ce que ça apporte.** La règle existe à un seul endroit, dans `Organization`. La liste affiche les
données de la base, mises en forme, sans rien décider.

**Sans cette règle.** Un jour, `enableFeature()` accepte `LEARNER_IMPORT` sur une organisation
archivée. La liste garde l'ancien calcul et cache le bouton : Pix Admin ne permet plus l'activation.

**À savoir.** Pour savoir si un calcul est une mise en forme, se demander : décide-t-il quelque chose ?
`label` sert seulement à afficher. `canEnableLearnerImport` dit si une action est permise : c'est une
règle, elle va dans l'Aggregate (voir [RM3](#rm3-nentre-pas-dans-une-règle)). L'écran peut afficher le
bouton sans recopier la règle : par exemple, le front tente l'activation et affiche le refus, ou un
autre usecase expose une donnée calculée par l'Aggregate.

**Exceptions.** Un read-model sans aucune mise en forme est permis. Le fichier donne alors un nom et
un type à la ligne que renvoie la requête, et le repository, le usecase et le sérialiseur s'en
servent.

### RM2. Aucune validation

**La règle.** Un read-model ne vérifie pas ses données. Elles viennent d'une requête sur la base de
Pix, où l'Aggregate les a écrites après les avoir vérifiées. Une donnée ancienne peut ne pas suivre
les règles d'aujourd'hui : le read-model l'accepte quand même. Il ne lève jamais d'erreur.

**Exemple de code correct.**

```ts
// OrganizationListItem.ts
  // RM2 : le constructeur recopie les données, sans rien vérifier
  constructor({ id, name, type, externalId, archivedAt, administrationTeamName }: OrganizationListItemProps) {
    this.id = id;
    this.name = name;
    this.type = type;
    …
  }
```

```ts
// organization-list-repository.ts
    type: row.type as OrganizationType, // la valeur de la base est reprise telle quelle
```

**Exemple de code incorrect.**

```ts
// OrganizationListItem.ts
const UAI_FORMAT = /^\d{7}[A-Z]$/;

export class OrganizationListItem {
  …
  constructor(props: OrganizationListItemProps) {
    // vérifie ce que la base vient de renvoyer
    if (props.type === 'SCO' && props.externalId !== null && !UAI_FORMAT.test(props.externalId)) {
      throw new InvalidOrganizationError('The UAI is not valid');
    }
    …
  }
}
```

**Ce que ça apporte.** La liste s'affiche avec les données telles qu'elles sont en base, même une
donnée ancienne qui ne suit pas les règles d'aujourd'hui.

**Sans cette règle.** Une organisation `SCO` ancienne garde un UAI mal saisi, et le constructeur du
read-model reprend le contrôle du format et lève. La page de la liste qui contient cette organisation
répond une erreur, et ses autres organisations ne s'affichent pas.

**Exceptions.** Si les données viennent d'une source externe, comme l'API d'un autre contexte ou un
service tiers, il faut les vérifier. C'est le repository qui le fait, quand il traduit la source. Le
read-model reste sans validation.

### RM3. N'entre pas dans une règle

**La règle.** Aucune règle du métier et aucun usecase ne décide à partir d'un read-model. Le
read-model sert seulement à construire la réponse. Pour décider, un usecase charge l'Aggregate et
appelle sa méthode, comme dans la règle [A7](../aggregate-root/README.md#a7-une-transaction-un-aggregate)
de la fiche Aggregate Root.

**Exemple de code correct.**

```ts
// find-paginated-filtered-organizations.ts
// RM3 : le usecase renvoie les lignes sans décider à partir d'elles
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

**Exemple de code incorrect.**

```ts
// la décision lit une ligne de la liste
const {
  models: [item],
} = await organizationListRepository.findPaginatedFiltered({
  filter: { id: organizationId },
  page: { number: 1, size: 1 },
});
if (item.archivedAt !== null) throw new ArchivedOrganizationError(); // une règle lit le read-model
const organization = await organizationRepository.get({ id: organizationId });
organization.enableFeature(featureName, params);
await organizationRepository.update({ organization });
```

**Ce que ça apporte.** Une règle se change à un seul endroit, dans l'Aggregate. On peut aussi changer
la liste, ajouter ou retirer une colonne, sans toucher à aucune règle du métier.

**Sans cette règle.** On change `enableFeature()` pour qu'une organisation archivée puisse recevoir
`ATTESTATIONS_MANAGEMENT`, la gestion des attestations de fin de parcours des élèves. Le usecase lit
toujours `archivedAt` sur la ligne de liste et lève `ArchivedOrganizationError` : Pix Admin refuse
toujours l'activation.

**À savoir.** L'autre sens est interdit aussi : un modèle du domaine ne fabrique pas de read-model.
`Organization` n'a pas de méthode `toListItem()`. C'est le repository qui construit la ligne.

### RM4. Rangé à part des modèles du domaine

**La règle.** Un read-model vit dans `domain/read-models/`, à côté de `domain/models/`. Il ne se range
ni dans `domain/models/`, ni dans un dossier `aggregates/`.

**Exemple de code correct.**

```
organizational-entities/domain/
├── models/
│   └── organization/
│       └── Organization.ts
└── read-models/
    └── OrganizationListItem.ts
```

**Exemple de code incorrect.**

```
organizational-entities/domain/
└── models/
    ├── organization/
    │   └── Organization.ts
    └── OrganizationListItem.ts   ← rangé comme un modèle du domaine
```

**Ce que ça apporte.** Le relecteur voit au dossier qu'aucune règle ne lit ce fichier. La règle
d'outil montrée plus bas interdit à `domain/models/` et `domain/services/` d'importer
`domain/read-models/`.

**Sans cette règle.** `OrganizationListItem` est rangé dans `models/`, donc la règle d'outil laisse
`Organization` l'importer. Un développeur ajoute `Organization.toListItem()`, qui met
`administrationTeamName` à `null` faute de le connaître : l'écran affiche des organisations sans équipe.

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

### RM5. Seulement sur une lenteur mesurée

**La règle.** On lit d'abord par les objets du domaine : le repository charge l'Aggregate, le
sérialiseur le met en forme. On crée un read-model seulement quand une mesure montre que cette lecture
est trop lente, par exemple un benchmark ou une trace en production. La PR qui crée le read-model cite
cette mesure.

**Exemple de code correct.**

```ts
// organizational-entities/domain/read-models/OrganizationListItem.ts — RM4 : rangé dans read-models/
// RM5 : la liste par l'Aggregate est mesurée trop lente (trace citée dans la PR)
```

**Exemple de code incorrect.**

```ts
// organizational-entities/domain/read-models/OrganizationDetail.ts
// un read-model créé « parce que c'est un écran » : le détail d'une organisation se lit par
// l'Aggregate Organization, sans mesure de lenteur
```

**Ce que ça apporte.** Chaque donnée a un seul modèle tant qu'aucune mesure n'en demande un second.
L'écran lit les mêmes objets que les règles du métier.

**Sans cette règle.** Le détail d'une organisation a deux requêtes, celle de l'Aggregate et celle du
read-model. On ajoute un champ à `Organization` : le repository de l'Aggregate le charge, la requête
du read-model l'oublie, et le détail ne l'affiche pas.

**À savoir.** Avant de créer un read-model, une autre piste existe : découper l'Aggregate (voir
[A6](../aggregate-root/README.md#a6-petit-aggregate)).
