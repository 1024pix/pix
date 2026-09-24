# Repository

Un repository est le port par lequel le domaine atteint l'extérieur. Il vit dans
`infrastructure/repositories/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout repository. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**I1**](#i1-ne-jamais-renvoyer-une-structure-de-persistance) | ne jamais renvoyer une structure de persistance | règle ESLint, en deux étapes, puis typage |
| [**I2**](#i2-ne-jamais-accepter-une-structure-de-persistance-en-entrée) | n'accepte pas de structure de persistance en entrée | typage |
| [**I3**](#i3-get-lève-find-renvoie-null-ou-une-collection-vide) | `get*` lève, `find*` renvoie `null` | règle ESLint |
| [**I4**](#i4-les-erreurs-levées-appartiennent-au-domaine) | les erreurs levées appartiennent au domaine | `no-restricted-syntax`, partiel |
| [**I5**](#i5-les-dépendances-externes-arrivent-en-paramètre-jamais-par-import) | dépendances injectées, jamais importées | `dependency-cruiser` |
| [**I6**](#i6-le-repository-est-enregistré-dans-infrastructurerepositoriesindexjs) | enregistré dans l'index du contexte | script |
| [**I9**](#i9-nommage-du-fichier) | nommage cohérent dans le contexte | script |
| [**I10**](#i10-aucune-règle-métier-dans-le-repository) | aucune règle métier | règle ESLint pour le signal, revue pour le reste |
| [**I11**](#i11-un-repository-nimporte-pas-un-autre-repository) | n'importe pas un autre repository | `dependency-cruiser` |
| [**I12**](#i12-la-connexion-à-la-base-vient-de-domaintransaction) | la connexion à la base vient de `DomainTransaction` | `dependency-cruiser` |

Les numéros I7 et I8 ne sont pas attribués.

---

## Rôle

Un repository traduit dans les deux sens entre le langage du domaine local et une source de données.
La source peut être une table de la base, un fichier, un service HTTP externe, un cache, une file de
messages, ou l'API interne d'un autre Bounded Context. Toutes vont dans `infrastructure/repositories/`,
parce que le domaine ne sait pas de quelle source il s'agit.

Termes employés dans cette page :

- **Port** : l'interface dont le domaine a besoin, que l'infrastructure implémente. Le repository est
  un port.
- **Passe-plat** : une fonction qui renvoie ce qu'elle reçoit d'une source, sans le traduire.
- **API interne** : le contrat qu'un Bounded Context publie pour les autres, dans son dossier
  `application/api/`.

### Ce qu'est un objet du domaine local

Notion utilisée par I1 et I2, les invariants de sortie et d'entrée du repository.

Un objet du domaine local est un type déclaré dans le `domain/` **du contexte courant**, dont ce
contexte contrôle la construction, ou dans `shared/domain/`, le Shared Kernel que tous les contextes
partagent.

| Est un objet du domaine local | N'en est pas un |
| --- | --- |
| une Entity, une Aggregate Root | une ligne de base de données |
| un Value Object | une charge utile HTTP désérialisée |
| un read-model produit par un repository du contexte | le DTO publié par l'API interne d'un autre contexte |
| un modèle de `shared/domain/` | un modèle du `domain/` d'un autre contexte |

La dernière ligne de droite porte le cas le plus facile à manquer. Le format d'un voisin vient de
l'extérieur, même quand il a déjà la forme d'un objet. Sa traduction est le travail du repository.

Un modèle de `shared/domain/` reste local pour I1, même quand sa place serait dans un Bounded
Context. Son rangement est une question de découpage, pas de repository : voir
[`explication.md`](explication.md#le-shared-kernel).

### Ce que le repository n'est pas

Table de décision. Si le code correspond à une ligne, il ne va pas dans le repository.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| enchaîne plusieurs repositories, décide de l'ordre des opérations | `domain/usecases/` | `../fiche-usecase.md` |
| applique une règle sur des objets d'une même frontière de cohérence | l'Aggregate Root, dans `domain/models/` | `../fiche-racine-agregat.md` |
| applique une règle qui traverse plusieurs Aggregates, sans aucune I/O | `domain/services/` | `../fiche-service-domaine.md` |
| contraint une valeur | un Value Object, dans `domain/models/` | `../fiche-objet-valeur.md` |
| valide la cohérence interne d'une Entity | le constructeur du modèle, dans `domain/models/` | `../fiche-entite.md` |
| décide si un utilisateur a le droit | `domain/usecases/`, ou un pre-handler déclaré sur la route | `../fiche-usecase.md`, `../fiche-route.md` |
| transforme un modèle en JSON:API pour une réponse HTTP | `infrastructure/serializers/` | `../fiche-serialiseur.md` |
| expose une donnée du contexte à un autre contexte | `application/api/` | `../fiche-api-interne.md` |

Repère : un repository ne contient aucun branchement sur une condition métier. Un `if` sur
l'existence d'une ligne est légitime. Un `if` sur une propriété métier de l'objet ne l'est pas.

---

## Invariants

### I1. Ne jamais renvoyer une structure de persistance

**Énoncé.** Toute valeur renvoyée est un objet du domaine local, un scalaire, ou une enveloppe de
pagination. Jamais une ligne SQL, jamais le DTO d'un autre contexte, jamais le corps d'une réponse
HTTP. La règle se vérifie par fonction, pas par fichier.

```js
// conforme — la ligne est traduite en objet du domaine local
const organizationLearner = await knexConn('view-active-organization-learners')
  .where({ userId, organizationId })
  .first('*');
if (!organizationLearner) return null;
return new OrganizationLearner(organizationLearner);

// fautif — passe-plat : le DTO UserTeamsInfo publié par le contexte voisin sort tel quel
const getUserTeamsInfo = async ({ userId, dependencies = { userTeamsApi } }) => {
  return dependencies.userTeamsApi.getUserTeamsInfo(userId);
};
```

**Code.** Conforme : [`registration-organization-learner-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/prescription/organization-learner/infrastructure/repositories/registration-organization-learner-repository.js#L7-L11). Fautif : [`user-teams-api.repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/privacy/infrastructure/repositories/user-teams-api.repository.js#L12-L14).

**Ce qui casse.** Le usecase lit un objet dont la forme est décidée par un autre contexte. Un
renommage dans ce contexte casse le contexte appelant à l'exécution, sans qu'aucune règle de
dépendance ne se déclenche.

**Forme interdite.** Envelopper le DTO étranger dans une classe locale aux mêmes champs ne rend pas
le code conforme : la forme de l'autre contexte reste dans le domaine. La traduction produit un type
local dont les champs sont ceux que le domaine utilise.

**Vérification.** Une règle ESLint pour le passe-plat, en deux étapes, et le typage pour le reste.
Voir [`outillage.md`](outillage.md#i1--deux-étapes).

### I2. Ne jamais accepter une structure de persistance en entrée

**Énoncé.** Les paramètres métier sont des objets du domaine local, des identifiants ou des
primitives. Jamais une ligne SQL, jamais le DTO d'un autre contexte, même reconditionné en objet
littéral.

```js
// conforme — des identifiants
await findOrganizationLearner({ userId, organizationId });

// fautif — dans le usecase, le DTO étranger reconditionné en littéral
const user = await userRepository.findById({ userId });   // I1 violé en amont
await combinedCourseParticipantRepository.getOrCreateNewOrganizationLearner({
  userId,
  organizationId: combinedCourse.organizationId,
  organizationLearner: { firstName: user.firstName, lastName: user.lastName },
});
```

**Code.** Conforme : [`combined-course-participant-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/prescription/combined-course-participant-repository.js#L7). Fautif : [`start-combined-course.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/domain/usecases/start-combined-course.js#L10-L16).

**Ce qui casse.** Même mécanique que I1, mais la fuite traverse le usecase. I2 découle de I1 : si
aucun repository ne renvoie de DTO étranger, aucun ne circule pour être passé en entrée.

**Vérification.** Le typage. Voir [`outillage.md`](outillage.md#vérifier-par-le-typage).

### I3. `get*` lève, `find*` renvoie `null` ou une collection vide

**Énoncé.** Le préfixe du nom annonce le comportement en cas d'absence. `get…` lève une erreur du
domaine. `find…` renvoie `null` pour un élément, un tableau vide pour une collection.

```js
// fautif — un nom qui annonce une lecture tolérante, un corps qui lève
const findByTemporaryKey = async function (temporaryKey) {
  const knexConn = DomainTransaction.getConnection();
  const accountRecoveryDemandDTO = await knexConn
    .where({ temporaryKey })
    .select(/* … */)
    .from('account-recovery-demands')
    .first();

  if (!accountRecoveryDemandDTO) {
    throw new NotFoundError('No account recovery demand found');
  }

  return _toDomain(accountRecoveryDemandDTO);
};

// conforme, forme corrigée — le même corps, sous le nom qui annonce qu'il lève
const getByTemporaryKey = async function (temporaryKey) { /* corps identique */ };
```

**Code.** Fautif : [`account-recovery-demand.repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js#L15-L28). La forme corrigée est hypothétique.

Les deux corps sont identiques. Seul le nom dit à l'appelant s'il doit prévoir un `try` ou un test
à `null`.

**Ce qui casse.** Sans typage, le nom est le seul contrat. S'il ne correspond pas au comportement,
chaque site d'appel doit lire l'implémentation.

**Vérification.** Une règle ESLint. Voir [`outillage.md`](outillage.md#i3--règle-eslint).

### I4. Les erreurs levées appartiennent au domaine

**Énoncé.** Un repository lève des erreurs du `domain/errors.js` de son contexte ou de celui de
`shared/`. Il ne laisse pas remonter une erreur du pilote de base. Il ne lève pas d'`Error` nu.

```js
} catch (error) {
  // conforme — une contrainte nommée, traduite en erreur du domaine
  if (knexUtils.isUniqConstraintViolated(error) && error.constraint === 'one_active_organization_learner') {
    throw new OrganizationLearnersCouldNotBeSavedError(…);
  }

  // fautif — la ligne suivante du même catch
  throw error;
}
```

**Code.** [`combined-course-participant-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/prescription/combined-course-participant-repository.js#L32-L40).

Le motif fautif est le `catch` qui traduit un cas connu et relâche les autres. Une violation non
reconnue est traduite, elle aussi, en une erreur du domaine.

**Ce qui casse.** Le mappeur d'erreurs associe les erreurs du domaine aux codes HTTP et à un code
d'erreur exploitable par le front. Une erreur non domaine produit une 500, sans code ni
métadonnées : le client ne peut ni la traiter ni la traduire.

**Prérequis.** La traduction suppose que les contraintes de base portent un nom qui exprime
l'intention métier. C'est l'ADR 34, voir [Sources](#sources).

**Vérification.** `no-restricted-syntax` pour l'`Error` nu. Le `catch` qui relâche se vérifie en
revue. Voir [`outillage.md`](outillage.md#i4--sélecteur-eslint).

### I5. Les dépendances externes arrivent en paramètre, jamais par import

**Énoncé.** Un repository n'importe pas l'API interne d'un autre contexte, ni un client de stockage,
ni un client HTTP. Il les reçoit en paramètres nommés, remplis par l'injection depuis
`infrastructure/repositories/index.js`.

```js
// conforme — l'index du contexte importe l'API, le repository la reçoit
// infrastructure/repositories/index.js
import * as userApi from '../../../identity-access-management/application/api/users-api.js';

// fautif — le repository importe lui-même, et se donne l'API comme valeur par défaut
import * as privacyUsersApi from '../../../privacy/application/api/users-api.js';

const canSelfDeleteAccount = async ({ userId, dependencies = { privacyUsersApi } }) => { … };
```

**Code.** Conforme : [`index.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/index.js#L4). Fautif : [`privacy-users-api.repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/deprecated/infrastructure/repositories/privacy-users-api.repository.js#L1-L5).

La forme fautive est trompeuse : `dependencies` est un paramètre, donc un test peut substituer une
doublure. Mais l'import reste écrit dans le fichier, donc le repository reste couplé au voisin.

**Exception.** `DomainTransaction` est importé, pas injecté : c'est la forme que prescrit I12. C'est
la seule dépendance dans ce cas.

**Ce qui casse.** Sous ESM, les exports sont immuables. Sans injection, la dépendance ne peut pas être
substituée par une doublure de test : le repository devient intestable en unitaire.

**Vérification.** Une règle `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#i11-et-i5--règles-de-chemin).

### I6. Le repository est enregistré dans `infrastructure/repositories/index.js`

**Énoncé.** Tout fichier de `infrastructure/repositories/` figure dans l'objet des repositories de
l'index du contexte, qu'il reçoive des dépendances ou non. Un seul régime de câblage existe : les
usecases reçoivent leurs repositories depuis cet index.

```js
// conforme — l'index importe l'API du voisin et le repository, puis les marie
import * as userApi from '../../../identity-access-management/application/api/users-api.js';
import * as combinedCourseRepository from './combined-courses/combined-course-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };

const repositoriesWithoutInjectedDependencies = { combinedCourseRepository, /* … */ };
const dependencies = { userApi, /* … */ };
const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

// fautif — le fichier existe dans le dossier et n'est pas déclaré ici
```

**Code.** Conforme : [`index.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/index.js#L4-L80). Le cas fautif est hypothétique.

L'index importe les API des contextes voisins pour les injecter : c'est la forme que prescrit I5.

**Ce qui casse.** L'injection ne s'applique qu'aux entrées de cet objet. Un repository absent n'a
jamais ses dépendances remplies : elles restent `undefined`, et il échoue au premier appel. Un
repository sans dépendance ne casse pas, mais il crée un second régime de câblage, et l'index cesse
d'être la liste complète des ports du contexte.

**Vérification.** Un script de complétude. Voir
[`outillage.md`](outillage.md#i6-et-i9--un-script-de-complétude).

### I9. Nommage du fichier

**Énoncé.** Les noms de fichier sont cohérents à l'intérieur du contexte. Deux conventions existent,
`sujet-repository.js` et `sujet.repository.js`. Un contexte n'en mélange pas deux. Aucune convention
globale n'est choisie.

**Ce qui casse.** Rien. Invariant d'hygiène : le fichier est plus facile à trouver.

**Vérification.** Le script de complétude de I6.

### I10. Aucune règle métier dans le repository

**Énoncé.** Un repository ne contient aucun branchement sur une condition métier, et aucun
enchaînement d'opérations dont l'ordre porte une intention.

```js
// fautif — le nom annonce une lecture, le corps réactive un enregistrement désactivé
export async function getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId }) {
  const existing = await findOrganizationLearner({ userId, organizationId });

  if (existing) {
    if (existing.isDisabled) {
      await knexConnection('organization-learners')
        .update({ isDisabled: false })
        .where({ id: existing.id });        // décision métier
    }
    return _toDomain({ id: existing.id });
  } else {
    // sinon insertion
  }
}

// conforme — trois opérations nommées, la décision remonte au usecase
export async function findOrganizationLearner({ userId, organizationId }) { … }
export async function createOrganizationLearner({ … }) { … }
export async function reactivateOrganizationLearner({ id }) { … }
```

**Code.** Fautif : [`combined-course-participant-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/prescription/combined-course-participant-repository.js#L6-L42), simplifié. La forme corrigée est hypothétique.

La règle cachée ici est une règle métier : un élève désactivé qui revient sur un parcours est
réactivé sans que l'appelant le sache.

**Cas limite, jugé en revue.** Une garde sur un paramètre optionnel n'est pas une règle métier. Un
enchaînement qui décrit un processus relève de `domain/usecases/`.

**Ce qui casse.** La règle vit à un endroit où personne ne la cherche. Elle sera réécrite
différemment ailleurs, et une modification du métier n'ira pas la chercher là.

**Vérification.** Une règle ESLint signale une fonction de lecture qui écrit (`get*`, `find*`,
`is*`, `has*`). Le signal désigne l'endroit à relire, il ne prouve pas la violation. Le reste de
l'invariant se vérifie en revue.
Voir [`outillage.md`](outillage.md#i10-signal--préfixe-de-lecture-sur-une-fonction-qui-écrit).

### I11. Un repository n'importe pas un autre repository

**Énoncé.** Un repository n'importe aucun autre repository, ni de son contexte ni d'un autre.
Composer deux accès relève du usecase.

```js
// fautif — le repository importe d'autres repositories et compose leurs appels
import * as knowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as skillRepository from '../../../shared/infrastructure/repositories/skill-repository.js';

export async function findPaginatedFilteredRecommendedByUserId({ userId, filters = {}, page, lang }) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({ userId });
  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));
  …
}

// conforme, forme corrigée — le usecase compose, chaque repository reste un port
const findPaginatedFilteredTutorials = async function ({
  userId, filters, page, lang, knowledgeElementRepository, skillRepository, tutorialRepository,
}) {
  const invalidatedKnowledgeElements = await knowledgeElementRepository.findInvalidatedAndDirectByUserId({ userId });
  const skills = await skillRepository.findOperativeByIds(invalidatedKnowledgeElements.map(({ skillId }) => skillId));
  …
};
```

**Code.** Fautif : [`tutorial-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/devcomp/infrastructure/repositories/tutorial-repository.js#L79-L93), simplifié : les appels y sont dans un `Promise.all`. La forme corrigée est hypothétique. Le usecase actuel ne reçoit que `tutorialRepository` : [`find-paginated-filtered-tutorials.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/devcomp/domain/usecases/find-paginated-filtered-tutorials.js#L3-L10).

**Ce qui casse.** L'orchestration se retrouve à un endroit où aucune autre règle ne la cherche : I5
ne voit que les API et les clients, I10 que les conditions métier. Vers un autre contexte, l'import
franchit en plus une frontière hors de l'API interne.

**Vérification.** Une règle `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#i11-et-i5--règles-de-chemin).

### I12. La connexion à la base vient de `DomainTransaction`

**Énoncé.** Un repository obtient toujours sa connexion à la base par
`DomainTransaction.getConnection()`. Il n'importe jamais la connexion `knex` elle-même. Deux cas font
exception, décrits aux [exceptions légitimes](#exceptions-légitimes) : le datamart, qui est une autre
base, et l'écriture qui doit survivre à l'échec de la transaction en cours.

```js
// fautif — la connexion knex est importée
import { knex } from '../../../../db/knex-database-connection.js';

async list() {
  const frameworkDtos = await knex.select('*').from(tableName).orderBy('name');
  return frameworkDtos.map(toDomain);
}

// conforme — forme corrigée du même extrait
async list() {
  const knexConn = DomainTransaction.getConnection();
  const frameworkDtos = await knexConn.select('*').from(tableName).orderBy('name');
  return frameworkDtos.map(toDomain);
}
```

**Code.** Fautif : [`framework-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/learning-content/infrastructure/repositories/framework-repository.js#L16-L19), import à la ligne 1. La forme corrigée remplace l'import par celui de `DomainTransaction`.

`DomainTransaction.getConnection()` rend la transaction en cours s'il y en a une, et la connexion
ordinaire sinon. Le repository n'a donc pas à savoir s'il tourne dans une transaction.

**Ce qui casse.** Une requête sur la connexion importée s'exécute hors de la transaction en cours.
Une écriture n'est pas annulée si la transaction échoue, et une lecture ne voit pas ce que la
transaction a déjà écrit. Rien ne le signale.

**Vérification.** Une règle `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#i12--règle-de-chemin).

---

## Exceptions légitimes

Sans cette section, un relecteur signale du code correct. Chaque exception ne vaut que pour
l'invariant de sa ligne.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **I1** | `save` renvoie l'identifiant créé | autorisé |
| **I1** | `saveInBatch` renvoie un tableau d'identifiants | autorisé |
| **I1** | `delete*` renvoie un nombre de lignes affectées | autorisé |
| **I1** | `count*`, `exists*`, et toute agrégation renvoyant un scalaire calculé côté base | autorisé : un scalaire est le langage du domaine |
| **I1** | Enveloppe de pagination autour d'objets traduits | autorisé si le contenu est traduit |
| **I1** | Une fonction `is*` / `has*` renvoie un booléen | autorisé |
| **I1** | Une fonction ne renvoie rien | autorisé |
| **I3** | Une fonction `find*` renvoie `null` | autorisé : c'est l'énoncé même |
| **I3** | `getOrCreate*` ne lève pas alors qu'il commence par `get` | autorisé seulement pour cet invariant : il crée au lieu de lever. I10 s'applique, et le signal de I10 le désigne quand il écrit |
| **I5** | `DomainTransaction` est importé et non injecté | autorisé : c'est la forme que prescrit I12 |
| **I12** | Un repository qui lit le datamart importe la connexion `knex` du datamart | autorisé : `DomainTransaction` ne couvre que la base principale |
| **I12** | Une écriture doit survivre à l'échec de la transaction en cours, comme l'état d'un import enregistré même quand l'import échoue | autorisé si la fonction reçoit `knexConn` en paramètre et que l'appelant lui passe une connexion hors transaction. Importer `knex` dans le repository reste fautif : rien n'y dit que l'écriture échappe à la transaction exprès |
| **I12** | Une fonction reçoit `knexConn` en paramètre, avec `DomainTransaction.getConnection()` en valeur par défaut | autorisé si un appelant passe une autre connexion : hors transaction, réplica, pool distinct |
| forme du fichier | Un repository de `jobs/` est une classe étendant une classe de base partagée, exportée en singleton | autorisé. La conversion en module de fonctions ne doit pas être faite |

Pour I1, un identifiant ou un scalaire est le langage du domaine. Ce qui est interdit, c'est la forme
de la persistance : un objet dont les clés sont des colonnes, ou un DTO étranger.

---

## Exemple complet

Un repository qui enveloppe l'API interne d'un voisin, tiré du code : la fonction, son
enregistrement, son test. Les extraits sont simplifiés : les liens sous les blocs mènent au code
complet.

```js
// le repository
import { OrganizationLearner } from '../../domain/models/OrganizationLearner.js';

const getById = async function ({ organizationLearnerId, organizationLearnerApi }) {
  const learner = await organizationLearnerApi.get(organizationLearnerId);

  return new OrganizationLearner(learner);   // traduit dans le modèle local : I1
};
```

```js
// l'index du contexte — I6 et I5 : il importe l'API et l'injecte
import * as organizationLearnerApi from '../../../prescription/organization-learner/application/api/organization-learners-api.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';

const repositoriesWithoutInjectedDependencies = { organizationLearnerRepository, /* … */ };
const dependencies = { organizationLearnerApi };
const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);
```

```js
// le test — unitaire, l'API substituée : seul le mapping est testé
it('should return the student corresponding to the id', async function () {
  const rawStudent = { id: 1234, firstName: 'Léon', lastName: 'De Bruxelles', division: '4ème', organizationId: 23456 };
  const expectedStudent = new OrganizationLearner(rawStudent);
  const organizationLearnerApiStub = { get: sinon.stub() };
  organizationLearnerApiStub.get.withArgs(rawStudent.id).resolves(rawStudent);

  const student = await repositories.organizationLearnerRepository.getById({
    organizationLearnerId: rawStudent.id,
    organizationLearnerApi: organizationLearnerApiStub,
  });

  expect(student).to.deep.equal(expectedStudent);
});
```

**Code.** Le repository : [`organization-learner-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/school/infrastructure/repositories/organization-learner-repository.js#L14-L18). L'index : [`index.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/school/infrastructure/repositories/index.js#L1-L18). Le test : [`organization-learner-repository_test.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/tests/school/unit/infrastructure/repositories/organization-learner-repository_test.js#L27-L46).

Pour un repository adossé à la base, la forme est celle de I12 : `DomainTransaction.getConnection()`,
une requête, puis une traduction en objet du domaine. Le test est un test d'intégration.

---

## Tests attendus

| Source du repository | Type de test | Ce qui est vérifié |
| --- | --- | --- |
| Base de données | intégration uniquement | la requête et le mapping vers le domaine |
| API interne d'un autre contexte | unitaire, API substituée | uniquement le mapping vers le domaine |
| Service HTTP externe | intégration, le service intercepté par `nock` | la requête envoyée, adresse et contenu, et la traduction de la réponse |

**Code.** Service HTTP externe : [`prompt-repository_test.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/tests/llm/integration/infrastructure/repositories/prompt-repository_test.js#L30-L55).

Indice de diagnostic : un repository adossé à une API qui n'a rien à tester en unitaire ne traduit
en général rien, donc viole I1. Cet indice ne vaut pas pour les cas des exceptions légitimes : une
fonction qui renvoie un scalaire, un booléen ou rien n'a rien à traduire.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

```
[ ] [partiel] I1  Aucun return ne rend directement une ligne de base, un DTO étranger ou une réponse HTTP
[ ] [partiel] I4  Tout throw cible une erreur du domaine ; aucun catch ne relâche l'erreur brute
[ ] [auto]    I6  Le fichier est enregistré dans infrastructure/repositories/index.js
[ ] [auto]    I12 La connexion vient de DomainTransaction.getConnection(), jamais d'un import de knex
[ ] [auto]    I11 Aucun import d'un autre repository, de ce contexte ou d'un autre
[ ] [partiel] I10 Aucune fonction en get*/find*/is*/has* qui écrit, sauf écriture sans règle métier jugée en revue
[ ] [humain]  I2  Aucun paramètre métier n'est une ligne de base ou un DTO étranger, même reconditionné
[ ] [auto]    I3  Les get* lèvent, les find* renvoient null ou une collection vide
[ ] [auto]    I5  Aucun import d'API interne ni de client ; ils arrivent en paramètres (sauf DomainTransaction)
[ ] [humain]  I10 Aucun branchement sur une condition métier, aucun enchaînement qui porte une intention
[ ] [auto]    I9  Nommage cohérent avec le reste du contexte
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du repository
[ ] [partiel] Test au bon endroit : intégration si base, unitaire avec API substituée si API interne
[ ] [humain]  Avant de signaler une violation de I1 ou I2, vérifier les exceptions légitimes
```

À terme, sept lignes restent : quatre `[partiel]` et trois `[humain]`.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **I1**, **I2** structure de persistance | Evans, *DDD*. ADR 55, « Communication "séquentielle" entre les contextes fonctionnels », qui accepte la duplication des modèles entre contextes |
| **I3** `get*` lève, `find*` renvoie `null` | convention d'équipe, sans source |
| **I4** erreurs du domaine | ADR 44, « Gestion des erreurs de l'API dans les clients », et ADR 34, « Nom des contraintes sur la base PG » |
| **I5** dépendances injectées | ADR 46, « Injecter les dépendances dans l'API », et ADR 24, « Faut-il encapsuler les appels http dans l'API ? » |
| **I6** enregistré dans l'index | convention d'outillage, conséquence de l'ADR 46 |
| **I9** nommage | convention d'équipe, sans source |
| **I10** aucune règle métier | Martin, *Clean Architecture* |
| **I11** pas d'import de repository | déduction : composer deux accès relève du usecase |
| **I12** connexion par `DomainTransaction` | décision d'équipe, sans ADR. L'ADR 9, « Transactions métier », prescrivait une autre forme : voir [`explication.md`](explication.md) |
