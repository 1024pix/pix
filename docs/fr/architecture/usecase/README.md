# Usecase

Un usecase réalise une intention du métier : créer une organisation, l'archiver, lui activer une
fonctionnalité. Il charge un [Aggregate](../racine-agregat/README.md) par son
[repository](../repository/README.md), appelle ses méthodes, puis enregistre le résultat. Les règles du
métier vivent dans l'Aggregate, pas dans le usecase. Chaque contexte du code, comme
`organizational-entities` ou `quest`, range ses usecases dans `domain/usecases/`, un fichier par
usecase.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [U1](#u1-aucune-règle-métier-dans-le-usecase) | Aucune règle métier dans le usecase | les `if` sur une propriété métier sont des méthodes du modèle ; aucun `catch` sans filtre |
| [U2](#u2-les-dépendances-arrivent-en-paramètres-jamais-par-import) | Les dépendances arrivent en paramètres, jamais par import | `organizationRepository` et `clock` sont des paramètres, pas des imports |
| [U3](#u3-aucun-import-dinfrastructure) | Aucun import d'infrastructure | aucun chemin `infrastructure/` dans les imports du usecase |
| [U4](#u4-une-intention-métier-un-fichier-un-nom-de-verbe) | Une intention métier, un fichier, un nom de verbe | `archive-organization.ts`, pas `organization.ts` |
| [U5](#u5-aucune-notion-de-transport) | Aucune notion de transport | ni `request`, ni `h`, ni JSON reçu : une `Organization<null>` ou des valeurs typées |
| [U6](#u6-renvoie-des-objets-du-domaine) | Renvoie des objets du domaine | renvoie une `Organization`, rien, ou une valeur ; jamais du JSON |
| [U7](#u7-le-périmètre-transactionnel-est-explicite) | Le périmètre transactionnel est explicite | un usecase qui écrit est enveloppé dans `withTransaction`, et ne modifie qu'un Aggregate |
| [U8](#u8-enregistré-dans-lindex-des-usecases) | Enregistré dans l'index des usecases | chaque usecase est importé et listé dans `domain/usecases/index.ts` |
| [U9](#u9-aucun-accès-direct-au-domaine-dun-autre-contexte) | Aucun accès direct au domaine d'un autre contexte | un autre contexte se lit par un repository local, qui appelle son API interne |

## Exemple complet

Les trois usecases de l'Aggregate `Organization`, leur index, puis un usecase du contexte `quest` qui
lit une organisation par l'[API interne](../api-interne/README.md) d'`organizational-entities`. La
règle du métier de l'exemple : si `LEARNER_IMPORT` est activée, `isManagingStudents` est toujours
`false`. Elle vit dans la méthode `enableFeature()` de l'Aggregate, et aucun usecase ne la réécrit.
Exemple inventé, d'après
[`update-network.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/update-network.usecase.js#L8-L12)
pour la forme, et
[`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L241-L248)
pour la règle.

```ts
// organizational-entities/domain/usecases/create-organization.ts — U4 : le verbe de l'intention
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { Organization } from '../models/organization/index.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';

type CreateOrganizationInput = {
  organization: Organization<null>; // U5 : un objet du domaine, créé par le sérialiseur, pas le JSON reçu
  organizationRepository: OrganizationRepository; // U2 : reçu en paramètre
};

// U7 : l'écriture est dans une transaction
export const createOrganization = withTransaction(
  async ({ organization, organizationRepository }: CreateOrganizationInput): Promise<Organization> => {
    return organizationRepository.add({ organization }); // U6 : l'organisation enregistrée, avec son id
  },
);
```

```ts
// organizational-entities/domain/usecases/archive-organization.ts
// U3 : des imports du domaine seulement, aucun de infrastructure/
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { Clock } from '../../../shared/domain/Clock.js'; // { now(): Date }
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { Organization } from '../models/organization/index.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';

type ArchiveOrganizationInput = {
  organizationId: OrganizationId; // U5 : une valeur typée
  organizationRepository: OrganizationRepository; // U2
  clock: Clock; // U2 : l'heure aussi est une dépendance
};

export const archiveOrganization = withTransaction(
  async ({ organizationId, organizationRepository, clock }: ArchiveOrganizationInput): Promise<Organization> => {
    const organization = await organizationRepository.get({ id: organizationId });
    organization.archive(clock.now()); // U1 : le usecase appelle la méthode, sans condition
    await organizationRepository.update({ organization }); // U7 : un seul Aggregate modifié
    return organization; // U6
  },
);
```

```ts
// organizational-entities/domain/usecases/enable-organization-feature.ts
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { FeatureName, FeatureParams } from '../models/organization/index.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';

type EnableOrganizationFeatureInput = {
  organizationId: OrganizationId;
  featureName: FeatureName;
  params: FeatureParams;
  organizationRepository: OrganizationRepository;
};

// U7 : update() écrit dans organizations et dans organization-features, dans la même transaction
export const enableOrganizationFeature = withTransaction(
  async ({ organizationId, featureName, params, organizationRepository }: EnableOrganizationFeatureInput): Promise<void> => {
    const organization = await organizationRepository.get({ id: organizationId });
    // U1 : le usecase ne teste pas LEARNER_IMPORT : enableFeature() passe isManagingStudents à false
    organization.enableFeature(featureName, params);
    await organizationRepository.update({ organization });
  },
);
```

```ts
// organizational-entities/domain/usecases/index.ts — le câblage du contexte
import { clock } from '../../../shared/infrastructure/clock.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { organizationRepository } from '../../infrastructure/repositories/organization-repository.js';
import { archiveOrganization } from './archive-organization.js';
import { createOrganization } from './create-organization.js';
import { enableOrganizationFeature } from './enable-organization-feature.js';

// U2 : le câblage fournit les dépendances de chaque usecase
const dependencies = { organizationRepository, clock };

// U8 : chaque usecase du dossier est importé, puis listé ici
const usecasesWithoutInjectedDependencies = {
  archiveOrganization,
  createOrganization,
  enableOrganizationFeature,
};

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
```

```ts
// quest/domain/usecases/has-access-to-combined-course.ts — un autre contexte lit une organisation
import type { UserId } from '../../../shared/domain/Id.js';
import type { CombinedCourseRepository } from '../repositories/CombinedCourseRepository.js';
import type { OrganizationLearnerRepository } from '../repositories/OrganizationLearnerRepository.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';

type HasAccessToCombinedCourseInput = {
  userId: UserId;
  code: string;
  combinedCourseRepository: CombinedCourseRepository;
  organizationRepository: OrganizationRepository; // U9 : le repository de quest, qui appelle organizationApi
  organizationLearnerRepository: OrganizationLearnerRepository;
};

// une lecture : pas de withTransaction
export const hasAccessToCombinedCourse = async ({
  userId,
  code,
  combinedCourseRepository,
  organizationRepository,
  organizationLearnerRepository,
}: HasAccessToCombinedCourseInput): Promise<boolean> => {
  const { organizationId } = await combinedCourseRepository.getByCode({ code });
  // U9 : une Organization de quest, un modèle à part qui ne garde que ce dont quest a besoin
  const organization = await organizationRepository.get({ id: organizationId });
  const isLearner = await organizationLearnerRepository.isLearnerOf({ userId, organizationId });
  return organization.acceptsParticipant({ isLearner }); // U1 : la règle est dans le modèle de quest
};
```

## Comment tester

Un usecase se teste avec un test d'intégration, sur une vraie base de données. On l'appelle par
l'index du contexte, comme le fait le [contrôleur](../controleur/README.md). On ne teste pas un
usecase en unitaire avec des stubs : le test vérifierait seulement l'ordre des appels, c'est-à-dire
qu'il recopierait le code. Le test couvre :

- le cas qui marche, avec ce qui est enregistré en base, relu par une requête. Exemple :
  `enables LEARNER_IMPORT and stops managing students` ;
- chaque erreur du domaine qui traverse le usecase, et le fait que rien n'a été enregistré. Exemple :
  `refuses ATTESTATIONS_MANAGEMENT without params, and changes nothing`.

Les règles elles-mêmes se testent dans le test unitaire de l'Aggregate, pas ici. Quand le usecase lit
l'heure, comme `archiveOrganization`, le test passe une horloge fixe à la place de celle du câblage :
`clock: { now: () => now }`.

Le test de `enableOrganizationFeature` :

```ts
// tests/organizational-entities/integration/domain/usecases/enable-organization-feature_test.ts
import { expect } from 'chai';

import { InvalidOrganizationError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCases | enable-organization-feature', function () {
  it('enables LEARNER_IMPORT and stops managing students', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true }).id;
    const featureId = databaseBuilder.factory.buildFeature({ key: 'LEARNER_IMPORT' }).id;
    databaseBuilder.factory.buildOrganizationLearnerImportFormat({ name: 'ONDE' });
    await databaseBuilder.commit();

    // when
    await usecases.enableOrganizationFeature({ organizationId, featureName: 'LEARNER_IMPORT', params: { name: 'ONDE' } });

    // then
    const organization = await knex('organizations').where({ id: organizationId }).first();
    expect(organization.isManagingStudents).to.be.false;
    const feature = await knex('organization-features').where({ organizationId, featureId }).first();
    expect(feature).to.exist;
  });

  it('refuses ATTESTATIONS_MANAGEMENT without params, and changes nothing', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildFeature({ key: 'ATTESTATIONS_MANAGEMENT' });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(usecases.enableOrganizationFeature)({
      organizationId,
      featureName: 'ATTESTATIONS_MANAGEMENT',
      params: null,
    });

    // then
    expect(error).to.be.instanceOf(InvalidOrganizationError);
    const features = await knex('organization-features').where({ organizationId });
    expect(features).to.be.empty;
  });
});
```

## Checklist de revue de code

```
Où sont les règles ?
[ ] U1  Aucun if sur une propriété métier ; la règle est une méthode du modèle
[ ] U1  Aucun catch sans filtre ; seule une erreur du domaine nommée s'attrape

D'où viennent ses dépendances ?
[ ] U2  Repositories, horloge, journal : tout arrive en paramètre
[ ] U3  Aucun import depuis un dossier infrastructure/
[ ] U9  Aucun import d'un autre contexte ; aucune API interne reçue en paramètre

Comment est-il appelé, et que renvoie-t-il ?
[ ] U5  Ni request, ni h, ni payload JSON ; des objets du domaine ou des valeurs typées
[ ] U6  Renvoie un objet du domaine, une valeur ou rien ; jamais du JSON

Que se passe-t-il à l'écriture ?
[ ] U7  withTransaction autour des écritures ; un seul Aggregate modifié
[ ] U7  Un autre Aggregate est modifié par un autre usecase, hors de cette transaction

Le retrouve-t-on ?
[ ] U4  Un fichier, nommé avec le verbe de l'intention
[ ] U8  Importé et listé dans l'index des usecases

Tests
[ ] Un test d'intégration, appelé par l'index, qui relit la base
```

## Référence des règles

### U1. Aucune règle métier dans le usecase

**La règle.** Le usecase enchaîne les appels : charger, appeler une méthode, enregistrer. Une
condition sur l'état d'un objet est une règle du métier : elle devient une méthode de cet objet, et le
usecase appelle la méthode.

**Bon exemple.**

```ts
// enableOrganizationFeature
const organization = await organizationRepository.get({ id: organizationId });
// U1 : le usecase ne teste pas LEARNER_IMPORT : enableFeature() passe isManagingStudents à false
organization.enableFeature(featureName, params);
await organizationRepository.update({ organization });
```

**Mauvais exemple.**

```ts
// enableOrganizationFeature, avec un enableFeature() qui ne touche pas à isManagingStudents
const organization = await organizationRepository.get({ id: organizationId });
organization.enableFeature(featureName, params);
// la règle « une organisation qui importe ses élèves ne les gère pas » est écrite dans le usecase
if (featureName === 'LEARNER_IMPORT') {
  organization.stopManagingStudents();
}
await organizationRepository.update({ organization });
```

**Ce que ça apporte.** La règle est écrite une fois, dans `enableFeature()`. Tout usecase qui active
une fonctionnalité passe par elle, et le test unitaire de l'Aggregate la couvre.

**Sans cette règle.** La condition est recopiée dans chaque usecase qui active une fonctionnalité. Un
usecase d'activation en lot l'oublie. Des organisations importent alors leurs élèves, et gardent
`isManagingStudents` à `true`.

**À savoir.**

- Un usecase sans règle se lit comme une suite d'appels. S'il faut dérouler des conditions pour
  comprendre ce qu'il fait, une règle est sortie du modèle.
- Un `catch` sans filtre qui journalise puis continue est interdit. Il attrape aussi un bug ou une
  base de données en panne, et le usecase répond comme si tout s'était bien passé :

```ts
try {
  organization.archive(clock.now());
  await organizationRepository.update({ organization });
} catch (error) {
  logger.error(error); // l'archivage a échoué, mais l'appelant reçoit une réponse normale
}
```

**Exceptions.**

- Un `if` sur l'absence d'un résultat de chargement est de l'orchestration, pas une règle.
- Un `catch` qui attrape une erreur du domaine nommée, pour décider de la suite, est de
  l'orchestration. Les autres erreurs remontent.
- Un usecase qui ne fait qu'appeler le repository est permis : c'est le cas de `createOrganization`.
  Le point d'entrée existe déjà le jour où une étape s'ajoute.

### U2. Les dépendances arrivent en paramètres, jamais par import

**La règle.** Un usecase n'importe ni repository, ni client, ni horloge, ni journal. Il les reçoit en
paramètres. L'index du contexte les fournit, et un test peut en passer d'autres.

**Bon exemple.**

```ts
// archiveOrganization
type ArchiveOrganizationInput = {
  organizationId: OrganizationId; // U5 : une valeur typée
  organizationRepository: OrganizationRepository; // U2
  clock: Clock; // U2 : l'heure aussi est une dépendance
};
```

**Mauvais exemple.**

```ts
import { organizationRepository } from '../../infrastructure/repositories/organization-repository.js';

export const archiveOrganization = withTransaction(async ({ organizationId }: { organizationId: OrganizationId }) => {
  const organization = await organizationRepository.get({ id: organizationId }); // importé : on ne peut pas le remplacer
  organization.archive(new Date()); // l'heure est lue ici : le test ne peut pas la choisir
  await organizationRepository.update({ organization });
  return organization;
});
```

**Ce que ça apporte.** Un test de `archiveOrganization` passe `clock: { now: () => now }`, et vérifie
que `archivedAt` vaut exactement `now`.

**Sans cette règle.** Le test de `archiveOrganization` doit remplacer la date de tout le processus,
avec de faux timers, pour savoir quelle valeur attendre. Et avec les modules ES (`import` et
`export`), un module importé ne peut pas être remplacé dans un test.

**Exceptions.** Un journal reçu en paramètre est permis : il est injecté, pas importé.

### U3. Aucun import d'infrastructure

**La règle.** Un usecase n'importe rien d'un dossier `infrastructure/`, ni du sien, ni de celui d'un
autre contexte. Ce dont il a besoin dans l'infrastructure lui arrive en paramètre (U2), ou sous forme
de valeur.

**Bon exemple.**

```ts
// archive-organization.ts
// U3 : des imports du domaine seulement, aucun de infrastructure/
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import type { Clock } from '../../../shared/domain/Clock.js'; // { now(): Date }
import type { OrganizationId } from '../../../shared/domain/Id.js';
import type { Organization } from '../models/organization/index.js';
import type { OrganizationRepository } from '../repositories/OrganizationRepository.js';
```

**Mauvais exemple.**

```ts
// enable-organization-feature.ts : un drapeau lu depuis l'infrastructure, au milieu du usecase
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';

if (!(await featureToggles.get('isLearnerImportEnabled'))) {
  throw new FeatureDisabledError();
}
```

**Ce que ça apporte.** Le usecase ne dépend que du domaine. Changer la façon dont les drapeaux ou les
données sont stockés ne touche pas aux usecases.

**Sans cette règle.** Le test de `enableOrganizationFeature` doit modifier le drapeau dans le stockage
partagé, puis le remettre. S'il l'oublie, les tests suivants s'exécutent avec le drapeau modifié.

**À savoir.** Un import d'infrastructure ne se voit pas toujours. Un utilitaire de date ou un journal
importé depuis `shared/infrastructure/` en est un.

**Exceptions.** L'index des usecases, `domain/usecases/index.ts`, importe l'infrastructure : c'est son
travail de câbler les dépendances. Il ne sert pas de précédent pour un usecase.

### U4. Une intention métier, un fichier, un nom de verbe

**La règle.** Un fichier par usecase, nommé avec le verbe de l'intention, en kebab-case. Le verbe vient
de l'Ubiquitous Language du contexte, c'est-à-dire des mots que le métier et le code partagent. Pas de
nom de ressource, pas de nom de couche.

**Bon exemple.**

```
organizational-entities/domain/usecases/
├── archive-organization.ts
├── create-organization.ts
└── enable-organization-feature.ts
```

**Mauvais exemple.**

```
organizational-entities/domain/usecases/
├── organization.ts             ← une ressource : quelles intentions ?
└── organization-archived.ts    ← un état, pas une intention
```

**Ce que ça apporte.** La liste des fichiers du dossier dit ce que le contexte sait faire, sans ouvrir
un seul fichier.

**Sans cette règle.** `organization.ts` regroupe la création, l'archivage et l'activation. Pour savoir
si l'archivage existe, il faut lire le fichier.

**À savoir.** Deux contextes peuvent avoir un usecase du même nom, avec un sens différent. Le chemin de
l'import montre de quel contexte il vient.

### U5. Aucune notion de transport

**La règle.** Un usecase ne sait pas comment il est appelé. Il ne reçoit ni `request`, ni `h`, ni le
payload JSON, et ne choisit pas de code HTTP. Il reçoit des objets du domaine ou des valeurs typées. Le
contrôleur et le [sérialiseur](../serialiseur/README.md) traduisent la requête avant l'appel.

**Bon exemple.**

```ts
// createOrganization
type CreateOrganizationInput = {
  organization: Organization<null>; // U5 : un objet du domaine, créé par le sérialiseur, pas le JSON reçu
  organizationRepository: OrganizationRepository; // U2 : reçu en paramètre
};
```

Le contrôleur appelle `usecases.createOrganization({ organization })`, avec l'`Organization<null>` que
le sérialiseur a construite. `Organization<null>` est une organisation pas encore enregistrée, sans id.

**Mauvais exemple.**

```ts
type CreateOrganizationInput = {
  attributes: Record<string, string>; // les attributs JSON:API, tels que le front les envoie
  userId: number;
  organizationRepository: OrganizationRepository;
};

// dans le usecase
const organization = Organization.create({
  name: attributes['name'],
  type: attributes['type'] as OrganizationType,
  createdBy: userId as UserId,
});
```

**Ce que ça apporte.** Le même usecase sert la route de Pix Admin, un script ou un job. Chacun lui
passe une `Organization<null>`.

**Sans cette règle.** Un script qui crée des organisations depuis un CSV doit fabriquer un faux
payload JSON:API. Et si le front renomme un attribut, le usecase casse.

**À savoir.** Pour vérifier, une question : ce usecase marcherait-il tel quel, appelé depuis un script ?

### U6. Renvoie des objets du domaine

**La règle.** Un usecase renvoie un objet du domaine de son contexte, un
[read-model](../read-model/README.md), une valeur, ou rien. Il ne renvoie jamais un objet construit
pour la réponse HTTP, ni le DTO d'un autre contexte. La mise en forme est le travail du sérialiseur.

**Bon exemple.**

```ts
// archiveOrganization
const organization = await organizationRepository.get({ id: organizationId });
organization.archive(clock.now()); // U1 : le usecase appelle la méthode, sans condition
await organizationRepository.update({ organization }); // U7 : un seul Aggregate modifié
return organization; // U6
```

**Mauvais exemple.**

```ts
// archiveOrganization : un objet construit pour l'écran de Pix Admin
return {
  id: organization.id,
  'is-archived': true,
  'archived-at': dayjs(organization.archivedAt).format('DD/MM/YYYY'),
};
```

**Ce que ça apporte.** Le sérialiseur choisit la forme de la réponse. Changer cette forme ne touche
pas au usecase.

**Sans cette règle.** Pix Admin veut une date au format ISO : il faut modifier le usecase. Et un
script qui archive des organisations reçoit des clés JSON:API au lieu d'une `Organization`.

**Exceptions.** Un usecase qui ne renvoie rien est permis : `enableOrganizationFeature` n'a que des
effets.

### U7. Le périmètre transactionnel est explicite

**La règle.** Un usecase qui écrit est enveloppé dans `withTransaction`. La transaction ne modifie
qu'un seul Aggregate. Si un autre Aggregate doit suivre, un autre usecase le modifie, dans sa propre
transaction. La règle [A7](../racine-agregat/README.md#a7-une-transaction-un-aggregate) de la fiche
Aggregate Root pose le même principe du côté de l'Aggregate. U7 dit où le usecase pose la transaction.

**Bon exemple.**

```ts
// U7 : update() écrit dans organizations et dans organization-features, dans la même transaction
export const enableOrganizationFeature = withTransaction(
  async ({ organizationId, featureName, params, organizationRepository }: EnableOrganizationFeatureInput): Promise<void> => {
    const organization = await organizationRepository.get({ id: organizationId });
    // U1 : le usecase ne teste pas LEARNER_IMPORT : enableFeature() passe isManagingStudents à false
    organization.enableFeature(featureName, params);
    await organizationRepository.update({ organization });
  },
);
```

**Mauvais exemple.** Deux cas.

```ts
// 1. sans withTransaction : chaque requête SQL de update() est validée seule
export const enableOrganizationFeature = async ({ … }: EnableOrganizationFeatureInput): Promise<void> => {
  const organization = await organizationRepository.get({ id: organizationId });
  organization.enableFeature(featureName, params);
  await organizationRepository.update({ organization });
};
```

```ts
// 2. archiveOrganization modifie aussi les adhésions, un autre Aggregate, dans la même transaction.
// membershipRepository est un repository local qui appelle l'API interne de team : U9 est respecté, pas U7
const organization = await organizationRepository.get({ id: organizationId });
organization.archive(clock.now());
await organizationRepository.update({ organization });
await membershipRepository.disableAll({ organizationId });
```

**Ce que ça apporte.**

- La mise à jour de l'organisation et l'ajout de la fonctionnalité réussissent ou échouent ensemble.
- La transaction ne verrouille que les lignes de l'organisation.

**Sans cette règle.**

- Sans `withTransaction` : l'activation de `LEARNER_IMPORT` passe `isManagingStudents` à `false` dans
  `organizations`, puis l'insertion dans `organization-features` échoue. L'organisation ne gère plus
  ses élèves, et n'a pas l'import non plus.
- Avec deux Aggregates : la transaction verrouille l'organisation et toutes ses adhésions. Si la
  désactivation d'une adhésion échoue, l'archivage est annulé aussi, alors qu'il était valide.

**À savoir.**

- Un seul appel à `update()` lance déjà plusieurs requêtes SQL : une sur `organizations`, une ou plusieurs sur `organization-features`. Sans `withTransaction`,
  chacune est validée seule, et une erreur au milieu laisse la base à moitié écrite.
- Le [repository](../repository/README.md) écrit dans la transaction ouverte par `withTransaction`.
  Le usecase n'a rien à lui passer.
- Un `withTransaction` appelé dans une transaction déjà ouverte n'en ouvre pas de nouvelle : il
  rejoint celle qui existe
  ([`DomainTransaction.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/DomainTransaction.js#L29-L33)).
- Quand une action touche deux Aggregates, qui appelle le second usecase n'est pas couvert par cette
  fiche.

### U8. Enregistré dans l'index des usecases

**La règle.** Chaque fichier de `domain/usecases/` est importé dans `domain/usecases/index.ts`, et
listé dans l'objet des usecases. Les appelants passent par `usecases.archiveOrganization(…)`, jamais
par un import direct du fichier.

**Bon exemple.**

```ts
// domain/usecases/index.ts
// U8 : chaque usecase du dossier est importé, puis listé ici
const usecasesWithoutInjectedDependencies = {
  archiveOrganization,
  createOrganization,
  enableOrganizationFeature,
};
```

**Mauvais exemple.**

```ts
// dans un script : le usecase n'est pas dans l'index, on l'importe directement
import { archiveOrganization } from '../domain/usecases/archive-organization.js';

await archiveOrganization({ organizationId, organizationRepository, clock });
```

**Ce que ça apporte.** L'index liste tout ce que le contexte sait faire. Et chaque appelant reçoit les
mêmes dépendances, fournies par le câblage.

**Sans cette règle.** Le script choisit lui-même son repository et son horloge. Et qui lit l'index pour
connaître les usecases du contexte ne voit pas l'archivage.

### U9. Aucun accès direct au domaine d'un autre contexte

**La règle.** Un usecase n'importe rien d'un autre contexte : ni son domaine, ni son infrastructure,
ni ses usecases. Pour lire un autre contexte, il reçoit un repository de son propre contexte. Ce
repository appelle l'API interne du voisin, et traduit sa réponse en un objet du domaine local : c'est
l'Anticorruption Layer, la couche de traduction entre deux contextes. Un usecase ne reçoit jamais
l'API interne elle-même.

**Bon exemple.**

```ts
// hasAccessToCombinedCourse, dans quest
// U9 : une Organization de quest, un modèle à part qui ne garde que ce dont quest a besoin
const organization = await organizationRepository.get({ id: organizationId });
const isLearner = await organizationLearnerRepository.isLearnerOf({ userId, organizationId });
return organization.acceptsParticipant({ isLearner }); // U1 : la règle est dans le modèle de quest
```

**Mauvais exemple.**

```ts
// hasAccessToCombinedCourse, dans quest : l'API interne d'organizational-entities arrive telle quelle
const organization = await organizationApi.getOrganization({ id: organizationId }); // un OrganizationDTO
const hasLearnerImport = await organizationFeatureRepository.isFeatureEnabled({ organizationId, featureName: 'LEARNER_IMPORT' });
const isLearner = await organizationLearnerRepository.isLearnerOf({ userId, organizationId });
return (!hasLearnerImport && !organization.isManagingStudents) || isLearner;
```

**Ce que ça apporte.** Seul le repository de quest connaît `OrganizationDTO`. Si l'API interne change
sa réponse, on modifie ce repository, et les usecases de quest ne bougent pas.

**Sans cette règle.** `organizational-entities` renomme `isManagingStudents` dans son DTO. Chaque usecase de
quest qui lit ce champ casse, et la règle d'accès est recopiée dans chacun d'eux.

**À savoir.** Le même principe vaut pour écrire dans un autre contexte : un repository local appelle
l'API interne du voisin.
