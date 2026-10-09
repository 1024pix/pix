# Usecase

Un usecase réalise une intention métier de bout en bout, en orchestrant repositories et objets du
domaine. Il vit dans `domain/usecases/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout usecase, y compris à un fichier de `domain/services/` qui
reçoit une I/O. La ligne **Vérification** de chaque invariant dit par quel moyen la règle se vérifie.
Ce qui est en place dans la CI est dans [`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**U1**](#u1-aucune-règle-métier-dans-le-usecase) | aucune règle métier | revue, aucun moyen fiable |
| [**U2**](#u2-les-dépendances-arrivent-en-paramètres-jamais-par-import) | les dépendances arrivent en paramètres | revue |
| [**U3**](#u3-aucun-import-dinfrastructure) | aucun import d'infrastructure | `dependency-cruiser` |
| [**U4**](#u4-une-intention-métier-un-fichier-un-nom-de-verbe) | une intention, un fichier, un nom de verbe | script |
| [**U5**](#u5-aucune-notion-de-transport) | aucune notion de transport | règle ESLint, partielle |
| [**U6**](#u6-renvoie-des-objets-du-domaine) | renvoie des objets du domaine | revue |
| [**U7**](#u7-le-périmètre-transactionnel-est-explicite) | le périmètre transactionnel est explicite | revue |
| [**U8**](#u8-enregistré-dans-lindex-des-usecases) | enregistré dans l'index des usecases | script |
| [**U9**](#u9-aucun-accès-direct-au-domaine-dun-autre-contexte) | aucun accès direct au domaine d'un autre contexte | `dependency-cruiser` |

Hors numérotation : le test de discrimination entre usecase et Domain Service n'est pas dans cette
page. Il est énoncé une fois pour les deux dans [`../service-domaine/README.md`](../service-domaine/README.md).
Le raccourci est dans [Usecase ou Domain Service](#usecase-ou-domain-service).

---

## Rôle

Un usecase réalise **une intention métier** de bout en bout. Il orchestre : il appelle des
repositories, construit ou fait évoluer des objets du domaine, et décide de l'ordre des opérations.

Il ne calcule aucune règle lui-même. Les règles vivent sur les Entities, les Value Objects et les
Aggregate Roots. Le usecase les fait jouer dans le bon ordre, avec les bonnes données.

Le usecase est la couche la plus lue du contexte : il se lit pour comprendre ce que le système fait.
Sa lisibilité compte donc autant que sa correction.

Termes employés dans cette page :

- **Orchestration** : l'ordre des appels et les conditions sur leur résultat, sans décision métier.
- **API interne** : le contrat qu'un Bounded Context publie pour les autres, dans son dossier
  `application/api/`.
- **Fichier de câblage** : `domain/usecases/index.js`, qui injecte les dépendances dans les usecases
  du contexte.

### Le repère pratique

> Un usecase ne contient **aucun calcul métier**. Un `if` sur « l'objet a-t-il été trouvé » est
> légitime ; un `if` sur une condition métier signifie qu'une règle a fui hors du modèle.

### Usecase ou Domain Service

Le test de discrimination est énoncé une seule fois, dans
[`../service-domaine/README.md`](../service-domaine/README.md), parce qu'il n'appartient à aucune des
deux catégories. Il se lit dans la signature.

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom correspond à
`/(Repository|Api|Storage)$/` fait des I/O. C'est donc **un usecase**, quel que soit son dossier, et
sa place est dans `domain/usecases/`. `domain/services/` est réservé aux vrais Domain Services : voir
`X1` de [`../service-domaine/ecarts.md`](../service-domaine/ecarts.md). Tous les invariants de cette
page s'appliquent à ce fichier sans exception.

Le partage entre plusieurs usecases est une raison légitime de factoriser un fichier. Il n'en fait pas
un Domain Service.

### Ce qu'un usecase n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un usecase.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| applique une règle sur des objets d'une même frontière de cohérence | l'Aggregate Root | `../racine-agregat/README.md` |
| applique une règle sur un seul objet | l'Entity ou le Value Object | `../entite/README.md`, `../objet-valeur/README.md` |
| applique une règle sans aucune I/O dans sa signature | un Domain Service, dans `domain/services/` | `../service-domaine/README.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `../specification/README.md` |
| accède à une source de données | un repository | `../repository/README.md` |
| lit une requête HTTP, choisit un code de retour, sérialise | `application/` | `../controleur/README.md`, `../route/README.md`, `../serialiseur/README.md` |
| expose une capacité à un autre contexte | `application/api/` | `../api-interne/README.md` |
| met en forme des données pour une lecture | un read-model, construit par un repository | `../read-model/README.md` |

---

## Invariants

### U1. Aucune règle métier dans le usecase

**Énoncé.** Le usecase ordonne des opérations. Il ne décide pas selon une propriété métier.

Dans l'extrait suivant, les deux formes sont côte à côte :

```js
const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({
  id: combinedCourseForCreation.blueprintId,
});

// conforme : orchestration, le chargement n'a rien rendu
if (!combinedCourseBlueprint) {
  throw new NotFoundError();
}

// fautif : règle métier, « un parcours ne se crée que depuis un modèle partagé à son organisation »
if (!combinedCourseBlueprint.organizationIds.includes(combinedCourseForCreation.organizationId)) {
  throw new ForbiddenAccess();
}
```

**Code.** [`create-combined-course.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/create-combined-course.js#L17-L25), commentaires ajoutés.

Le second `if` lit une propriété du modèle chargé pour décider. La règle appartient donc à ce modèle,
qui la porterait sous un nom :

```js
// conforme : version corrigée du même extrait, la règle est sur l'objet qui la porte
if (!combinedCourseBlueprint.isSharedWith({ organizationId: combinedCourseForCreation.organizationId })) {
  throw new ForbiddenAccess();
}
```

**Code.** La forme corrigée est hypothétique.

**Comment discriminer.** Un `if` qui teste l'existence d'un résultat de chargement est de
l'orchestration. Un `if` qui teste une propriété métier d'un objet du domaine est une règle : elle
appartient à cet objet.

**Ce qui casse.** La même condition finit écrite dans plusieurs usecases, différemment. Quand le
métier change, une seule est mise à jour.

**Indice de lecture.** Un usecase sans règle se comprend en lisant sa suite d'appels. S'il faut
dérouler mentalement des conditions pour savoir ce qu'il fait, U1 est probablement violé.

**Vérification.** La revue. Aucun moyen fiable n'est identifié. Voir
[`outillage.md`](outillage.md#ce-qui-nest-pas-mécanisable).

### U2. Les dépendances arrivent en paramètres, jamais par import

**Énoncé.** Un usecase n'importe pas de repository, ni de client, ni d'API interne. Il les reçoit, et
le câblage a lieu dans l'index du contexte.

```js
// conforme : neuf dépendances reçues, aucune importée
export const createCombinedCourse = async ({
  combinedCourseForCreation,
  creatorId,
  campaignRepository,
  targetProfileRepository,
  accessCodeGenerator,
  accessCodeRepository,
  combinedCourseRepository,
  combinedCourseBlueprintRepository,
  …
}) => { … };

// fautif : un repository importé, à côté de deux repositories reçus
import { AnswersHistoryRepository } from '../../infrastructure/repositories/answers-history-repository.js';

export async function historizeAnswers({
  answersRepository,
  assessmentsRepository,
  targetDate,
  …
}) { … }
```

**Code.** Conforme : [`create-combined-course.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/create-combined-course.js#L4-L16). Fautif : [`historize-answers.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/db-history/domain/usecases/historize-answers.js#L7-L15), simplifié.

**Ce qui casse.** Sous ESM, les exports sont immuables : un module importé ne peut pas être substitué
par une doublure de test. Sans injection, le usecase ne se teste plus isolément.

**Limite de la forme.** Dépendances et entrées métier sont mélangées dans un seul objet déstructuré,
donc rien ne les distingue dans la signature. Voir `X4` de [`ecarts.md`](ecarts.md).

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### U3. Aucun import d'infrastructure

**Énoncé.** Corollaire de U2 côté fichier : un usecase n'importe rien de `infrastructure/`, ni du sien
ni de celui d'un autre contexte.

```js
// fautif : cette forme n'a pas l'air d'un accès à une base de données
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';

const areCombinedCoursesEnabled = await featureToggles.get('areCombinedCoursesEnabled');
if (!areCombinedCoursesEnabled) {
  throw new CombinedCoursesDisabledError();
}
```

**Code.** [`get-verified-code.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-verified-code.js#L15-L18), import à la ligne 2.

Le mot `infrastructure/` est dans le chemin, et c'est le seul indice. Le drapeau se lit à distance.
Le usecase ne peut donc plus être exercé sans le mécanisme de drapeaux. Un paramètre
`areCombinedCoursesEnabled` reçu de l'appelant rendrait pourtant le même service :

```js
// conforme : version corrigée du même extrait, le drapeau arrive en paramètre
export const getVerifiedCode = async ({
  code,
  areCombinedCoursesEnabled,
  campaignRepository,
  combinedCourseRepository,
}) => {
  …
  if (!areCombinedCoursesEnabled) {
    throw new CombinedCoursesDisabledError();
  }
  …
};
```

**Code.** La forme corrigée est hypothétique.

**Ce qui casse.** La couche métier devient dépendante de la façon dont les données sont stockées ou
atteintes. Un changement d'infrastructure remonte donc jusqu'au domaine.

**L'exception apparente** est le fichier de câblage, `domain/usecases/index.js`, qui importe par
définition ce qu'il injecte. Sa présence dans `domain/` est un écart en soi : voir `X3` de
[`ecarts.md`](ecarts.md). Ce fichier est exempté dans la règle de vérification, et il ne sert pas de
précédent.

**Vérification.** Une règle `dependency-cruiser` de chemin, avec l'exemption du câblage. Voir
[`outillage.md`](outillage.md#u3-et-u9--deux-règles-de-chemin).

### U4. Une intention métier, un fichier, un nom de verbe

**Énoncé.** Un fichier par usecase, nommé par le **verbe de l'intention**. Pas par la ressource, pas
par la couche.

```
start-combined-course.js                          conforme : le verbe de l'intention
archive-organization.usecase.js                   conforme
remember-user-has-seen-assessment-instructions.js conforme
candidate-has-seen-certification-instructions.js  fautif : le nom décrit un état, pas l'intention
```

**Code.** [`start-combined-course.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/start-combined-course.js), [`archive-organization.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/archive-organization.usecase.js), [`remember-user-has-seen-assessment-instructions.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/usecases/remember-user-has-seen-assessment-instructions.js), [`candidate-has-seen-certification-instructions.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/enrolment/domain/usecases/candidate-has-seen-certification-instructions.js).

Le nom est celui de l'Ubiquitous Language du contexte. Deux contextes peuvent avoir un usecase du même
nom qui désigne deux choses différentes. C'est attendu, mais cela a un coût à la lecture d'un import.

**Ce qui casse.** La liste des fichiers de `usecases/` cesse d'être la liste de ce que le contexte
sait faire. Cette liste sert de documentation fonctionnelle sans coût d'écriture, et un nom de
ressource la rend muette.

**Vérification.** Un script sur le nom de fichier. Voir [`outillage.md`](outillage.md#vérifications).

### U5. Aucune notion de transport

**Énoncé.** Pas de `request`, pas de `h`, pas de code HTTP, pas de sérialisation, pas d'en-tête. Un
usecase ne sait pas comment il est appelé.

```js
// conforme pour U5 : le code arrive comme une donnée ; le contrôleur a lu request.params.
// Signature seule : le corps de ce fichier est l'exemple fautif de U3
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };

// fautif, hypothétique : le usecase lit la requête HTTP
export const getVerifiedCode = async ({ request, campaignRepository, combinedCourseRepository }) => {
  const { code } = request.params;
  …
};
```

**Code.** Conforme : [`get-verified-code.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-verified-code.js#L6). La forme fautive est hypothétique.

**Test.** *Ce usecase fonctionnerait-il tel quel, appelé depuis un script ou un job ?* Si non, une
préoccupation de transport a fui.

**Ce qui casse.** Le usecase cesse d'être réutilisable hors HTTP. Le même besoin depuis un job oblige
alors à dupliquer l'orchestration.

**Vérification.** Une règle ESLint, qui ne couvre qu'une partie de l'énoncé. Le reste se vérifie en
revue. Voir [`outillage.md`](outillage.md#u5--règle-eslint).

### U6. Renvoie des objets du domaine

**Énoncé.** Un usecase renvoie des objets du domaine local, des read-models du contexte, ou des
scalaires. Jamais un objet façonné pour une réponse HTTP, jamais le DTO d'un autre contexte.

```js
// conforme : un Value Object du contexte
return new VerifiedCode({ code: combinedCourse.code, type: 'combined-course' });

// fautif : un objet assemblé pour la réponse, sans type du domaine
return {
  fullNameFromPix,
  fullNameFromExternalIdentityProvider,
  email: foundUser.email,
  username: foundUser.username,
  authenticationMethods,
};
```

**Code.** Conforme : [`get-verified-code.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-verified-code.js#L20). Fautif : [`find-user-for-oidc-reconciliation.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/domain/usecases/find-user-for-oidc-reconciliation.usecase.js#L73-L79).

**Ce qui casse.** Un objet de réponse renvoyé par le usecase fait entrer la forme de l'API dans le
domaine : changer la réponse oblige à changer le usecase.

Le second cas, le DTO d'un autre contexte, est le plus discret. Il vient presque toujours d'une
violation en amont, dans un repository qui n'a pas traduit. Voir `I1` de
[`../repository/README.md`](../repository/README.md#i1-ne-jamais-renvoyer-une-structure-de-persistance).

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### U7. Le périmètre transactionnel est explicite

**Énoncé.** Un usecase qui écrit à plusieurs endroits dit ce qui doit être atomique.

L'ADR 25 donne le critère :

| La situation | La forme attendue |
| --- | --- |
| Les écritures doivent **échouer ou réussir ensemble** | une transaction, orchestrée dans le usecase, **sans événements** |
| Elles peuvent échouer **indépendamment** | pas de transaction |

Une transaction posée « au cas où » sur des écritures indépendantes est un défaut, pas une précaution.

```js
// conforme : withTransaction enveloppe les deux écritures, et le dit à la lecture
const updateOrganizationInformation = withTransaction(async function ({
  userId,
  organization,
  organizationForAdminRepository,
  …
  learnersApi,
}) {
  …
  if (existingOrganization.shouldDeletePreviousLearners) {
    await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId: organization.id });
  }

  await organizationForAdminRepository.update({
    organization: existingOrganization,
  });
  …
});

// fautif, hypothétique : les mêmes écritures sans withTransaction.
// Rien ne dit si la suppression doit être annulée quand la mise à jour échoue.
const updateOrganizationInformation = async function ({ … }) { … };
```

**Code.** Conforme : [`update-organization-information.usecase.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/update-organization-information.usecase.js#L3-L63), simplifié. La forme fautive est hypothétique.

`learnersApi` y est injectée directement dans le usecase, ce qui est fautif pour U9 : voir `X6` de
[`ecarts.md`](ecarts.md). L'exemple ne vaut ici que pour la transaction.

**Aucun événement dans une transaction.** C'est la décision de l'ADR 25. Un enchaînement qui doit
échouer ensemble se fait donc par **orchestration** dans le usecase, jamais par chorégraphie
d'événements. Le motif de la décision est dans
[`explication.md`](explication.md#le-périmètre-transactionnel).

**Ce qui casse.** Sans cette réponse, chaque écriture multiple est un pari : personne ne sait ce qui
sera annulé si la seconde échoue.

**La transaction de l'appelant.** La transaction n'apparaît pas dans la signature : le repository
obtient sa connexion par `DomainTransaction`, voir `I12` de
[`../repository/README.md`](../repository/README.md#i12-la-connexion-à-la-base-vient-de-domaintransaction).
Sans `withTransaction` dans sa déclaration, rien ne dit si le usecase s'exécute dans la transaction
d'un appelant. La contrepartie est de **documenter le périmètre** quand il n'est pas évident. Voir
`X3` de [`../repository/ecarts.md`](../repository/ecarts.md).

**Sur plusieurs Aggregates.** L'ADR 25 retient la transaction qui en couvre plusieurs quand les
écritures doivent échouer ensemble. Voir `A7` de [`../racine-agregat/README.md`](../racine-agregat/README.md).

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### U8. Enregistré dans l'index des usecases

**Énoncé.** Tout fichier de `domain/usecases/` figure dans l'objet des usecases de l'index du
contexte.

```js
// conforme : domain/usecases/index.js, l'import, puis la clé dans l'objet des usecases
import getCombinedCourseById from './get-combined-course-by-id.js';
…
  getCombinedCourseById,

// fautif : duplicate-module.js est absent de l'index ; un script l'importe directement
import { duplicateModule } from '../domain/usecases/duplicate-module.js';
```

**Code.** Conforme : [`index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/index.js#L77), clé à la ligne 105. Fautif : [`duplicate-module.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/scripts/duplicate-module.js#L7), absent de [l'index du contexte](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/usecases/index.js#L71-L108).

**Ce qui casse.** Rien à l'exécution, parce qu'un usecase peut être importé directement. Mais l'index
cesse d'être la liste exhaustive de ce que le contexte sait faire. Toute lecture d'ensemble devient
donc fausse, pour un humain comme pour un agent.

C'est l'équivalent de `I6` de
[`../repository/README.md`](../repository/README.md#i6-le-repository-est-enregistré-dans-infrastructurerepositoriesindexjs),
où la conséquence est plus grave : là-bas, l'injection ne s'applique pas et le repository échoue au
premier appel.

**Vérification.** Un script de complétude. Voir [`outillage.md`](outillage.md#vérifications).

### U9. Aucun accès direct au domaine d'un autre contexte

**Énoncé.** Un usecase n'importe ni le domaine, ni l'infrastructure, ni les usecases d'un autre
contexte. Il passe par l'**API interne** de ce contexte, et jamais directement : l'API est enveloppée
dans un repository du contexte consommateur, que le usecase reçoit.

Ce repository est l'Anticorruption Layer : il traduit la réponse du voisin dans le langage du domaine
local. C'est la décision de l'ADR 55, et `X6` de [`../repository/ecarts.md`](../repository/ecarts.md).
Un usecase qui reçoit l'API interne elle-même contourne cette traduction : voir `X6` de
[`ecarts.md`](ecarts.md).

```js
// fautif : le domaine d'un voisin, atteint directement
import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';

// conforme pour U9 : campaignRepository enveloppe campaignsApi, l'API interne du voisin.
// Signature seule : le corps de ce fichier est l'exemple fautif de U3
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };
```

**Code.** Fautif : [`get-user-profile.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/profile/domain/usecases/get-user-profile.js#L3). Conforme : [`get-verified-code.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-verified-code.js#L6), et le repository qui enveloppe l'API : [`campaign-repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/repositories/combined-courses/campaign-repository.js#L4-L7).

**Ce qui casse.** Les deux contextes cessent d'être découplés : un changement interne chez le voisin
casse le contexte consommateur, sans qu'aucun contrat n'ait été rompu.

**Vérification.** Une règle `dependency-cruiser` au grain de la couche : une dépendance vers un autre
contexte doit cibler `application/api/`. Voir
[`outillage.md`](outillage.md#u3-et-u9--deux-règles-de-chemin).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| rôle | Un usecase réduit à un seul appel de repository | **autorisé**, décidé en ADR 20. Voir `X5` de [`ecarts.md`](ecarts.md) |
| **U1** | Un `if` sur l'absence d'un résultat de chargement | **autorisé**, c'est de l'orchestration |
| **U6** | Un usecase qui ne renvoie rien | **autorisé** : une intention peut n'avoir que des effets |
| **U3** | Le fichier de câblage `usecases/index.js` importe l'infrastructure | **autorisé**, exempté dans la règle. Voir `X3` de [`ecarts.md`](ecarts.md) |
| **U2** | Un usecase reçoit un journal en dépendance injectée | **autorisé** : injecté, pas importé. À distinguer d'un modèle qui importe l'infrastructure |
| rôle | Un fichier de `services/` sans I/O, testé en unitaire pur | **autorisé**, c'est un vrai Domain Service |
| rôle | Un fichier de `services/` qui reçoit un repository | **pas une exception** : c'est un usecase, à traiter comme tel. Sa place est dans `usecases/` |
| rôle | Un `catch` qui attrape une erreur du domaine **nommée** pour décider de la suite | **autorisé** : c'est de l'orchestration. La journalisation passe par une dépendance injectée, selon `U2` |
| rôle | Un `catch` sans filtre qui journalise puis continue | **pas une exception** : il avale les erreurs de programmation et les rend invisibles. Voir `X7` de [`ecarts.md`](ecarts.md) |

---

## Exemple complet

Un usecase tiré du code : la fonction, son enregistrement dans l'index, son test d'intégration. Les
extraits sont simplifiés : les liens sous le bloc mènent au code complet.

```js
// le usecase : deux dépendances reçues (U2), aucune règle (U1), un objet du domaine renvoyé (U6)
const getCombinedCourseById = async ({ combinedCourseId, combinedCourseRepository, questRepository }) => {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
  const quest = await questRepository.findById({ questId: combinedCourse.questId });

  return new CombinedCourseDetails(combinedCourse, quest);
};
```

```js
// l'index du contexte : U8, l'import puis la clé
import getCombinedCourseById from './get-combined-course-by-id.js';
…
const usecasesWithoutInjectedDependencies = {
  …
  getCombinedCourseById,
  …
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
```

```js
// le test : intégration, base réelle, appel par l'index
it('should return a CombinedCourseDetails instance with quest and combined course data', async function () {
  // given
  const organizationId = databaseBuilder.factory.buildOrganization().id;
  const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({ successRequirements: [ … ] });
  const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({ …, organizationId, questId }).id;
  await databaseBuilder.commit();

  // when
  const result = await usecases.getCombinedCourseById({ combinedCourseId });

  // then
  expect(result).to.be.instanceOf(CombinedCourseDetails);
  expect(result.id).to.equal(combinedCourseId);
  …
});
```

**Code.** Le usecase : [`get-combined-course-by-id.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/get-combined-course-by-id.js#L3-L8). L'index : [`index.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/usecases/index.js#L77-L132). Le test : [`get-combined-course-by-id_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/quest/integration/domain/usecases/get-combined-course-by-id_test.js#L11-L47).

---

## Tests attendus

| Objet | Type de test | Ce qui est vérifié |
| --- | --- | --- |
| Usecase | **intégration uniquement** : base réelle, fixtures | l'orchestration de bout en bout et le résultat |
| Sous-usecase partagé, avec I/O | **intégration**, comme un usecase | idem |

Tester les usecases en intégration seulement est une convention d'équipe. Elle évite des tests
unitaires qui ne feraient que vérifier l'ordre des appels à des doublures, ce qui reproduit
l'implémentation au lieu de la contraindre.

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites dans
[`../repository/outillage.md`](../repository/outillage.md#tests-attendus--par-le-même-script).

Un indice de diagnostic, avec sa limite. Si un usecase demande beaucoup de fixtures pour un cas
simple, son Aggregate est souvent trop gros : voir `A6` de
[`../racine-agregat/README.md`](../racine-agregat/README.md). Limite : un usecase qui traverse
légitimement plusieurs Aggregates en demandera beaucoup sans qu'aucun soit trop gros.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier, aucun moyen déterministe n'est identifié.

```
[ ] [humain]  U1  Aucun calcul métier ; les if portent sur l'existence, pas sur des propriétés métier
[ ] [auto]    U9  Aucun accès au domaine ni à l'infrastructure d'un autre contexte ; API interne, via un repository
[ ] [auto]    U3  Aucun import d'infrastructure
[ ] [humain]  U2  Toutes les dépendances arrivent en paramètres
[ ] [partiel] U5  Aucune notion de transport : ni request, ni code HTTP, ni sérialisation
[ ] [humain]  U6  Renvoie des objets du domaine local, jamais un DTO étranger ni un objet de réponse
[ ] [humain]  U7  Le périmètre atomique est explicite quand plusieurs écritures ont lieu
[ ] [humain]      Aucun catch sans filtre qui journalise puis continue ; seule une erreur du domaine nommée s'attrape
[ ] [partiel] U4  Un fichier, un nom de verbe en kebab-case, Ubiquitous Language du contexte
[ ] [auto]    U8  Enregistré dans l'index des usecases
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du usecase
[ ] [humain]  Test d'intégration ; un fichier de services/ sans I/O est testé en unitaire pur
[ ] [auto]    Si le fichier est dans services/ et reçoit une I/O, c'est un usecase
```

À terme, huit lignes restent : deux `[partiel]`, U5 et U4, et six `[humain]`, U1, U2, U6, U7, le
`catch` sans filtre et le type de test. U1 a, avec U9, le ROI le plus fort de ce dossier, et sa ligne reste humaine : aucun
moyen fiable ne le vérifie.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| **U1** aucune règle métier | Martin, *Clean Architecture*, ch. « Business Rules » |
| **U2** dépendances injectées | ADR 46, « Injecter les dépendances dans l'API » |
| **U3** aucun import d'infrastructure | Martin, « The Clean Architecture » : la règle de dépendance |
| **U4** une intention, un fichier | ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? », et ADR 51, « Arborescence API ». Le nommage par verbe est sans source |
| **U5** aucune notion de transport, **U6** renvoie des objets du domaine | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » |
| **U7** périmètre transactionnel | ADR 25, « Précision sur les transactions et les événements métier », qui remplace l'ADR 9, « Transactions métier » |
| **U8** enregistré dans l'index | convention d'outillage, sans source |
| **U9** API interne, via un repository | ADR 55, « Communication "séquentielle" entre les contextes fonctionnels » |
