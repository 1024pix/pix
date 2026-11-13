# Read-model

Par défaut, une lecture passe par les objets du domaine. Le repository
charge l'Aggregate, et le sérialiseur le met
au format de la réponse. Un read-model est l'exception à ce chemin.

Un read-model est un objet assemblé pour une lecture précise, par exemple une ligne de la liste des
campagnes de Pix Orga. On le crée seulement quand une mesure montre que la lecture par l'Aggregate
est trop lente ([RM5](#rm5-seulement-sur-une-lenteur-mesurée)). Un repository le construit alors avec
une requête ciblée, souvent sur plusieurs tables. Le usecase le renvoie sans
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

Une ligne de la liste des campagnes d'une organisation, dans Pix Orga. La liste affiche, pour chaque
campagne, le nombre de participations et le nombre de résultats reçus (participations partagées).
Lire par l'Aggregate `Campaign` demanderait deux requêtes par campagne de la page : la campagne, puis
le compte de ses participations. Il manquerait aussi le nombre de résultats reçus et le nom du
propriétaire. Une mesure en production a montré que compter les participations rendait cette liste
trop lente (RM5). Le read-model fait tout en une requête, qui compte en base. L'exemple laisse de côté
les filtres de la liste et les autres colonnes. Exemple inventé, d'après
[`campaign-report-repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/infrastructure/repositories/campaign-report-repository.js#L106-L162).

```ts
// prescription/campaign/domain/read-models/CampaignListItem.ts — RM4 : rangé dans read-models/
// RM5 : compter les participations par l'Aggregate rendait la liste trop lente (mesure citée dans la PR)
export type CampaignListItemProps = {
  id: number;
  name: string;
  code: string;
  archivedAt: Date | null;
  ownerFirstName: string;
  ownerLastName: string;
  participationsCount: number;
  sharedParticipationsCount: number;
};

export class CampaignListItem {
  readonly id: number; // l'id de la campagne affichée
  readonly name: string;
  readonly code: string;
  readonly archivedAt: Date | null;
  readonly participationsCount: number; // compté en base, par la requête
  readonly sharedParticipationsCount: number;
  readonly ownerFullName: string;

  // RM2 : le constructeur recopie les données, sans rien vérifier
  constructor({
    id,
    name,
    code,
    archivedAt,
    ownerFirstName,
    ownerLastName,
    participationsCount,
    sharedParticipationsCount,
  }: CampaignListItemProps) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.archivedAt = archivedAt;
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
    // RM1 : une mise en forme pour l'écran, elle ne décide rien
    this.ownerFullName = `${ownerFirstName} ${ownerLastName}`;
  }
}
```

```ts
// prescription/campaign/domain/repositories/CampaignListRepository.ts
import type { CampaignListItem } from '../read-models/CampaignListItem.js';

export type PageParams = { number: number; size: number };
export type Pagination = { page: number; pageSize: number; rowCount: number; pageCount: number };

export interface CampaignListRepository {
  findPaginatedByOrganizationId({
    organizationId,
    page,
  }: {
    organizationId: number;
    page: PageParams;
  }): Promise<{ models: CampaignListItem[]; pagination: Pagination }>;
}
```

```ts
// prescription/campaign/infrastructure/repositories/campaign-list-repository.ts
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignListItem } from '../../domain/read-models/CampaignListItem.js';
import type { PageParams } from '../../domain/repositories/CampaignListRepository.js';

// knex ne type pas ses résultats : on déclare la forme de la ligne renvoyée par la requête
type CampaignListRow = {
  id: number;
  name: string;
  code: string;
  archivedAt: Date | null;
  ownerFirstName: string;
  ownerLastName: string;
  participationsCount: number;
  sharedParticipationsCount: number;
};

export const findPaginatedByOrganizationId = async ({
  organizationId,
  page,
}: {
  organizationId: number;
  page: PageParams;
}) => {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('campaigns')
    .select({
      id: 'campaigns.id',
      name: 'campaigns.name',
      code: 'campaigns.code',
      archivedAt: 'campaigns.archivedAt',
      ownerFirstName: 'users.firstName',
      ownerLastName: 'users.lastName',
    })
    // la base compte les participations : aucune participation n'est chargée
    .select(knexConn.raw('COUNT("campaign-participations"."id")::int AS "participationsCount"'))
    .select(
      knexConn.raw(
        `COUNT("campaign-participations"."id") FILTER (WHERE "campaign-participations"."status" = 'SHARED')::int AS "sharedParticipationsCount"`,
      ),
    )
    .join('users', 'users.id', 'campaigns.ownerId')
    .leftJoin('campaign-participations', function () {
      this.on('campaign-participations.campaignId', 'campaigns.id')
        .andOnNull('campaign-participations.deletedAt')
        // une participation améliorée, nouveau passage de la même personne, n'est pas comptée
        .andOnVal('campaign-participations.isImproved', '=', false);
    })
    .where('campaigns.organizationId', organizationId)
    .whereNull('campaigns.deletedAt')
    .groupBy('campaigns.id', 'users.id')
    .orderBy('campaigns.createdAt', 'DESC');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  return { models: results.map(toListItem), pagination };
};

function toListItem(row: CampaignListRow): CampaignListItem {
  return new CampaignListItem({
    id: row.id,
    name: row.name,
    code: row.code, // la valeur de la base est reprise telle quelle
    archivedAt: row.archivedAt,
    ownerFirstName: row.ownerFirstName,
    ownerLastName: row.ownerLastName,
    participationsCount: row.participationsCount,
    sharedParticipationsCount: row.sharedParticipationsCount,
  });
}
```

```ts
// prescription/campaign/domain/usecases/find-paginated-organization-campaigns.ts
import type { CampaignListRepository, PageParams } from '../repositories/CampaignListRepository.js';

// RM3 : le usecase renvoie les lignes sans décider à partir d'elles
export const findPaginatedOrganizationCampaigns = ({
  organizationId,
  page,
  campaignListRepository,
}: {
  organizationId: number;
  page: PageParams;
  campaignListRepository: CampaignListRepository;
}) => {
  return campaignListRepository.findPaginatedByOrganizationId({ organizationId, page });
};
```

## Comment tester

Un read-model se teste avec un test unitaire, sans stub, sans mock ni spy. Le test couvre :

- chaque mise en forme, cas limites compris. Exemple : `joins the first name and the last name of the
  owner`.

Un read-model sans mise en forme n'a pas de test unitaire : il n'a rien à vérifier.

La forme renvoyée par la requête se teste avec le test d'intégration du repository, sur la base.
Exemples : `counts the participations of each campaign of the page`, `does not count deleted
participations`.

Le test unitaire de l'[exemple complet](#exemple-complet) :

```ts
// tests/prescription/campaign/unit/domain/read-models/CampaignListItem_test.ts
import { expect } from 'chai';

import {
  CampaignListItem,
  type CampaignListItemProps,
} from '../../../../../../src/prescription/campaign/domain/read-models/CampaignListItem.js';

describe('Unit | Prescription | Campaign | Domain | ReadModels | CampaignListItem', function () {
  const buildItem = (props: Partial<CampaignListItemProps> = {}): CampaignListItem =>
    new CampaignListItem({
      id: 1,
      name: 'Évaluation de rentrée',
      code: 'RENTREE25',
      archivedAt: null,
      ownerFirstName: 'Camille',
      ownerLastName: 'Martin',
      participationsCount: 120,
      sharedParticipationsCount: 95,
      ...props,
    });

  describe('ownerFullName', function () {
    it('joins the first name and the last name of the owner', function () {
      expect(buildItem({ ownerFirstName: 'Camille', ownerLastName: 'Martin' }).ownerFullName).to.equal(
        'Camille Martin',
      );
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
// CampaignListItem.ts
    // RM1 : une mise en forme pour l'écran, elle ne décide rien
    this.ownerFullName = `${ownerFirstName} ${ownerLastName}`;
```

`ownerFullName` assemble deux colonnes pour l'affichage, par exemple « Camille Martin ». L'Aggregate
`Campaign` n'a aucun calcul équivalent.

**Exemple de code incorrect.**

```ts
// CampaignListItem.ts
export class CampaignListItem {
  …
  // le refus de updateFields(), recopié pour afficher le bouton « Modifier l'envoi multiple »
  get canChangeMultipleSendings(): boolean {
    return this.participationsCount === 0;
  }
}
```

L'envoi multiple permet à une personne de repasser la campagne. `updateFields()`, dans l'Aggregate
`Campaign`, refuse de le changer quand la campagne a déjà des participations.

**Ce que ça apporte.** La règle existe à un seul endroit, dans `Campaign`. La liste affiche les
données de la base, mises en forme, sans rien décider.

**Sans cette règle.** Un jour, `updateFields()` permet de changer l'envoi multiple tant qu'aucune
participation n'est partagée. La liste garde l'ancien calcul et cache le bouton : Pix Orga ne permet
plus le changement.

**À savoir.** Pour savoir si un calcul est une mise en forme, se demander : décide-t-il quelque chose ?
`ownerFullName` sert seulement à afficher. `canChangeMultipleSendings` dit si une action est permise :
c'est une règle, elle va dans l'Aggregate (voir [RM3](#rm3-nentre-pas-dans-une-règle)). L'écran peut
afficher le bouton sans recopier la règle : par exemple, le front tente la modification et affiche le
refus, ou un autre usecase expose une donnée calculée par l'Aggregate.

**Exceptions.** Un read-model sans aucune mise en forme est permis. Le fichier donne alors un nom et
un type à la ligne que renvoie la requête, et le repository, le usecase et le sérialiseur s'en
servent.

### RM2. Aucune validation

**La règle.** Un read-model ne vérifie pas ses données. Elles viennent d'une requête sur la base de
Pix, où l'Aggregate les a écrites après les avoir vérifiées. Une donnée ancienne peut ne pas suivre
les règles d'aujourd'hui : le read-model l'accepte quand même. Il ne lève jamais d'erreur.

**Exemple de code correct.**

```ts
// CampaignListItem.ts
  // RM2 : le constructeur recopie les données, sans rien vérifier
  constructor({
    id,
    name,
    code,
    …
  }: CampaignListItemProps) {
    this.id = id;
    this.name = name;
    this.code = code;
    …
  }
```

```ts
// campaign-list-repository.ts
    code: row.code, // la valeur de la base est reprise telle quelle
```

**Exemple de code incorrect.**

```ts
// CampaignListItem.ts
const CODE_FORMAT = /^[A-Z0-9]{9}$/;

export class CampaignListItem {
  …
  constructor(props: CampaignListItemProps) {
    // vérifie ce que la base vient de renvoyer
    if (!CODE_FORMAT.test(props.code)) {
      throw new CampaignCodeFormatError();
    }
    …
  }
}
```

**Ce que ça apporte.** La liste s'affiche avec les données telles qu'elles sont en base, même une
donnée ancienne qui ne suit pas les règles d'aujourd'hui.

**Sans cette règle.** Une campagne ancienne a un code créé avant le format d'aujourd'hui. Le
constructeur du read-model reprend le contrôle du format et lève. La page de la liste qui contient
cette campagne répond une erreur, et ses autres campagnes ne s'affichent pas.

**Exceptions.** Si les données viennent d'une source externe, comme l'API d'un autre contexte ou un
service tiers, il faut les vérifier. C'est le repository qui le fait, quand il traduit la source. Le
read-model reste sans validation.

### RM3. N'entre pas dans une règle

**La règle.** Aucune règle du métier et aucun usecase ne décide à partir d'un read-model. Le
read-model sert seulement à construire la réponse. Pour décider, un usecase charge l'Aggregate et
appelle sa méthode, comme dans la règle A7
de la fiche Aggregate Root.

**Exemple de code correct.**

```ts
// find-paginated-organization-campaigns.ts
// RM3 : le usecase renvoie les lignes sans décider à partir d'elles
export const findPaginatedOrganizationCampaigns = ({
  organizationId,
  page,
  campaignListRepository,
}: {
  organizationId: number;
  page: PageParams;
  campaignListRepository: CampaignListRepository;
}) => {
  return campaignListRepository.findPaginatedByOrganizationId({ organizationId, page });
};
```

**Exemple de code incorrect.**

```ts
// la décision lit une ligne de la liste
const { models } = await campaignListRepository.findPaginatedByOrganizationId({
  organizationId,
  page: { number: 1, size: 100 },
});
const item = models.find((campaign) => campaign.id === campaignId);
if (item?.archivedAt) throw new ArchivedCampaignError(); // une règle lit le read-model
const campaign = await campaignAdministrationRepository.get(campaignId);
campaign.archive(now, userId);
await campaignAdministrationRepository.update(campaign);
```

**Ce que ça apporte.** Une règle se change à un seul endroit, dans l'Aggregate. On peut aussi changer
la liste, ajouter ou retirer une colonne, sans toucher à aucune règle du métier.

**Sans cette règle.** On change `archive()` pour qu'archiver une campagne déjà archivée ne fasse plus
rien, sans erreur. Le usecase lit toujours `archivedAt` sur la ligne de liste et lève
`ArchivedCampaignError` : Pix Orga affiche toujours le refus.

**À savoir.** L'autre sens est interdit aussi : un modèle du domaine ne fabrique pas de read-model.
`Campaign` n'a pas de méthode `toListItem()`. C'est le repository qui construit la ligne.

### RM4. Rangé à part des modèles du domaine

**La règle.** Un read-model vit dans `domain/read-models/`, à côté de `domain/models/`. Il ne se range
ni dans `domain/models/`, ni dans un dossier `aggregates/`.

**Exemple de code correct.**

```
prescription/campaign/domain/
├── models/
│   └── Campaign.ts
└── read-models/
    └── CampaignListItem.ts
```

**Exemple de code incorrect.**

```
prescription/campaign/domain/
└── models/
    ├── Campaign.ts
    └── CampaignListItem.ts   ← rangé comme un modèle du domaine
```

**Ce que ça apporte.** Le relecteur voit au dossier qu'aucune règle ne lit ce fichier. La règle
d'outil montrée plus bas interdit à `domain/models/` et `domain/services/` d'importer
`domain/read-models/`.

**Sans cette règle.** `CampaignListItem` est rangé dans `models/`, donc la règle d'outil laisse
`Campaign` l'importer. Un développeur ajoute `Campaign.toListItem()`, qui met
`sharedParticipationsCount` à `0` faute de le connaître : l'écran affiche des campagnes sans résultat
reçu.

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
// prescription/campaign/domain/read-models/CampaignListItem.ts — RM4 : rangé dans read-models/
// RM5 : compter les participations par l'Aggregate rendait la liste trop lente (mesure citée dans la PR)
```

**Exemple de code incorrect.**

```ts
// prescription/campaign/domain/read-models/CampaignDetail.ts
// un read-model créé « parce que c'est un écran » : le détail d'une campagne se lit par
// l'Aggregate Campaign, sans mesure de lenteur
```

**Ce que ça apporte.** Chaque donnée a un seul modèle tant qu'aucune mesure n'en demande un second.
L'écran lit les mêmes objets que les règles du métier.

**Sans cette règle.** Le détail d'une campagne a deux requêtes, celle de l'Aggregate et celle du
read-model. On ajoute un champ à `Campaign` : le repository de l'Aggregate le charge, la requête du
read-model l'oublie, et le détail ne l'affiche pas.

**À savoir.**

- La liste des campagnes de Pix Orga est un cas réel. Ses requêtes de comptage des participations
  prenaient près de 75 % du temps de la base, parmi les 20 requêtes les plus présentes en production.
  Pour l'organisation qui avait le plus de campagnes, environ 330, la requête prenait 850 ms. Une fois
  réécrite, elle prend 20 ms ([PR #2185](https://github.com/1024pix/pix/pull/2185)).
  Pour une université de plus de 20 000 étudiants, la page ne s'affichait plus.
- Avant de créer un read-model, une autre piste existe : découper l'Aggregate (voir
  A6).
