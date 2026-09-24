# Fiche — Usecase

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés.
> - Le § 6 suppose un plugin ESLint maison, qui n'existe pas encore. Toute règle sur mesure suppose
>   d'abord de le créer.
> - L'ADR 25 remplace l'ADR 9. Sa décision est plus étroite que son titre : elle porte sur les
>   événements dans les transactions. `U7` en donne la règle applicable.
> - Le `try/catch` qui journalise, au § 3, n'a pas de statut décidé.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**U1**](#u1-aucune-règle-métier-dans-le-usecase) | aucune règle métier | **forte** | aucun moyen fiable |
| [**U9**](#u9-aucun-accès-direct-au-domaine-dun-autre-contexte) | aucun accès direct au domaine d'un autre contexte | **forte** | `dependency-cruiser`, délicate |
| [**U3**](#u3-aucun-import-dinfrastructure) | aucun import d'infrastructure | moyenne | `dependency-cruiser` |
| [**U2**](#u2-les-dépendances-arrivent-en-paramètres-jamais-par-import) | les dépendances arrivent en paramètres | moyenne | revue |
| [**U5**](#u5-aucune-notion-de-transport) | aucune notion de transport | moyenne | règle ESLint, partielle |
| [**U6**](#u6-renvoie-des-objets-du-domaine) | renvoie des objets du domaine | moyenne | revue |
| [**U7**](#u7-le-périmètre-transactionnel-est-explicite) | le périmètre transactionnel est explicite | moyenne | revue |
| [**U4**](#u4-une-intention-métier-un-fichier-un-nom-de-verbe) | une intention, un fichier, un nom de verbe | moyenne | script, à mesurer |
| [**U8**](#u8-enregistré-dans-lindex-des-usecases) | enregistré dans l'index des usecases | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-la-règle-métier-vit-dans-le-usecase) | la règle métier vit dans le usecase | **à corriger** |
| [**X2**](#x2-le-usecase-renvoie-un-objet-façonné-pour-la-réponse-http) | le usecase renvoie un objet façonné pour la réponse HTTP | **à corriger** |
| [**X6**](#x6-une-api-interne-est-injectée-directement-dans-le-usecase) | une API interne est injectée directement dans le usecase | **à corriger** |
| [**X4**](#x4-dépendances-et-entrées-métier-sont-mélangées) | dépendances et entrées métier sont mélangées | à surveiller |
| [**X3**](#x3-le-fichier-de-câblage-des-usecases-importe-linfrastructure) | le fichier de câblage des usecases importe l'infrastructure | rien à faire |
| [**X5**](#x5-un-usecase-réduit-à-un-seul-appel-de-repository) | un usecase réduit à un seul appel de repository | rien à faire |

Hors numérotation : le [test de discrimination](fiche-service-domaine.md#le-test-de-discrimination)
entre usecase et Domain Service n'est pas dans cette fiche. Il est au § 1 de
`fiche-service-domaine.md`, énoncé une fois pour les deux. Le raccourci : **un fichier de
`domain/services/` qui reçoit une I/O est un usecase**, et tous les invariants ci-dessous s'y
appliquent.

---

## 1. Rôle

Un usecase réalise **une intention métier** de bout en bout. Il orchestre : il appelle des
repositories, construit ou fait évoluer des objets du domaine, et décide de l'ordre des opérations.

Il ne calcule aucune règle lui-même. Les règles vivent sur les Entities, les Value Objects et les
Aggregate Roots. Le usecase les fait jouer dans le bon ordre, avec les bonnes données.

Le usecase est la couche la plus lue du contexte : il se lit pour comprendre ce que le système fait.
Sa lisibilité compte donc autant que sa correction.

### Le repère pratique

> Un usecase ne contient **aucun calcul métier**. Un `if` sur « l'objet a-t-il été trouvé » est
> légitime ; un `if` sur une condition métier signifie qu'une règle a fui hors du modèle.

### Usecase ou Domain Service

Le test de discrimination est énoncé une seule fois, au § 1 de `fiche-service-domaine.md`, parce qu'il
n'appartient à aucune des deux catégories. Il se lit dans la signature.

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom correspond à
`/(Repository|Api|Storage)$/` fait des I/O. C'est donc **un usecase**, quel que soit son dossier, et
sa place est dans `domain/usecases/`. C'est la correction de X1 de `fiche-service-domaine.md` :
`domain/services/` est réservé aux vrais Domain Services. Tous les invariants de cette fiche
s'appliquent à ce fichier sans exception.

Le partage entre plusieurs usecases est une raison légitime de factoriser un fichier. Il n'en fait pas
un Domain Service.

### Ce qu'un usecase n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un usecase.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| applique une règle sur des objets d'une même frontière de cohérence | l'Aggregate Root | `fiche-racine-agregat.md` |
| applique une règle sur un seul objet | l'Entity ou le Value Object | `fiche-entite.md`, `fiche-objet-valeur.md` |
| applique une règle sans aucune I/O dans sa signature | un Domain Service, dans `domain/services/` | `fiche-service-domaine.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `fiche-specification.md` |
| accède à une source de données | un repository | `repository/README.md` |
| lit une requête HTTP, choisit un code de retour, sérialise | `application/` | `fiche-controleur.md`, `fiche-route.md`, `fiche-serialiseur.md` |
| expose une capacité à un autre contexte | `application/api/` | `fiche-api-interne.md` |
| met en forme des données pour une lecture | un read-model, construit par un repository | `fiche-read-model.md` |

---

## 2. Invariants

### U1. Aucune règle métier dans le usecase

**Énoncé.** Le usecase ordonne des opérations. Il ne décide pas selon une propriété métier.

Dans l'extrait suivant, les deux formes sont côte à côte :

```js
const combinedCourseBlueprint = await combinedCourseBlueprintRepository.findById({
  id: combinedCourseForCreation.blueprintId,
});

// conforme : orchestration — le chargement n'a rien rendu
if (!combinedCourseBlueprint) {
  throw new NotFoundError();
}

// fautif : règle métier — « un parcours ne se crée que depuis un modèle partagé à son organisation »
if (!combinedCourseBlueprint.organizationIds.includes(combinedCourseForCreation.organizationId)) {
  throw new ForbiddenAccess();
}
```

Le second `if` lit une propriété du modèle chargé pour décider. La règle appartient donc à ce modèle,
qui la porterait sous un nom :

```js
// conforme — version corrigée du même extrait : la règle est sur l'objet qui la porte
if (!combinedCourseBlueprint.isSharedWith({ organizationId: combinedCourseForCreation.organizationId })) {
  throw new ForbiddenAccess();
}
```

**Comment discriminer.** Un `if` qui teste l'existence d'un résultat de chargement est de
l'orchestration. Un `if` qui teste une propriété métier d'un objet du domaine est une règle : elle
appartient à cet objet.

**Ce qui casse.** La même condition finit écrite dans plusieurs usecases, différemment. Quand le
métier change, une seule est mise à jour. C'est X1 au § 5.

**Indice de lecture.** Un usecase sans règle se comprend en lisant sa suite d'appels. S'il faut
dérouler mentalement des conditions pour savoir ce qu'il fait, U1 est probablement violé.

### U2. Les dépendances arrivent en paramètres, jamais par import

**Énoncé.** Un usecase n'importe pas de repository, ni de client, ni d'API interne. Il les reçoit, et
le câblage a lieu dans l'index du contexte.

```js
// conforme — neuf dépendances reçues, aucune importée
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

// fautif — un repository importé, à côté de deux repositories reçus
import { AnswersHistoryRepository } from '../../infrastructure/repositories/answers-history-repository.js';

export async function historizeAnswers({
  answersRepository,
  assessmentsRepository,
  targetDate,
  …
}) { … }
```

**Ce qui casse.** Sous ESM, les exports sont immuables : un module importé ne peut pas être substitué
par une doublure de test. Sans injection, le usecase ne se teste plus isolément. C'est le motif de
l'ADR 46. Ce motif est technique, pas stylistique.

**Limite de la forme actuelle.** Dépendances et entrées métier sont mélangées dans un seul objet
déstructuré, donc rien ne les distingue dans la signature. C'est X4 au § 5.

### U3. Aucun import d'infrastructure

**Énoncé.** Corollaire de U2 côté fichier : un usecase n'importe rien de `infrastructure/`, ni du sien
ni de celui d'un autre contexte.

```js
// fautif — cette forme n'a pas l'air d'un accès à une base de données
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';

const areCombinedCoursesEnabled = await featureToggles.get('areCombinedCoursesEnabled');
if (!areCombinedCoursesEnabled) {
  throw new CombinedCoursesDisabledError();
}
```

Le mot `infrastructure/` est dans le chemin, et c'est le seul indice. Le drapeau se lit à distance.
Le usecase ne peut donc plus être exercé sans le mécanisme de drapeaux. Un paramètre
`areCombinedCoursesEnabled` reçu de l'appelant rendrait pourtant le même service :

```js
// conforme — version corrigée du même extrait : le drapeau arrive en paramètre
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

**Ce qui casse.** La couche métier devient dépendante de la façon dont les données sont stockées ou
atteintes. Un changement d'infrastructure remonte donc jusqu'au domaine.

**L'exception apparente** est le fichier de câblage, `domain/usecases/index.js`, qui importe par
définition ce qu'il injecte. Sa présence dans `domain/` est un écart en soi : c'est X3 au § 5. Ce
fichier est exempté dans la règle du § 6, et il ne sert pas de précédent.

### U4. Une intention métier, un fichier, un nom de verbe

**Énoncé.** Un fichier par usecase, nommé par le **verbe de l'intention**. Pas par la ressource, pas
par la couche.

```
start-combined-course.js                          — conforme : le verbe de l'intention
archive-organization.usecase.js                   — conforme
remember-user-has-seen-assessment-instructions.js — conforme
candidate-has-seen-certification-instructions.js  — fautif : le nom décrit un état, pas l'intention
```

Le nom est celui de l'Ubiquitous Language du contexte. Deux contextes peuvent avoir un usecase du même
nom qui désigne deux choses différentes. C'est attendu, mais cela a un coût à la lecture d'un import.

**Ce qui casse.** La liste des fichiers de `usecases/` cesse d'être la liste de ce que le contexte
sait faire. Cette liste sert de documentation fonctionnelle sans coût d'écriture, et un nom de
ressource la rend muette.

### U5. Aucune notion de transport

**Énoncé.** Pas de `request`, pas de `h`, pas de code HTTP, pas de sérialisation, pas d'en-tête. Un
usecase ne sait pas comment il est appelé.

```js
// conforme pour U5 — le code arrive comme une donnée ; le contrôleur a lu request.params.
// Signature seule : le corps de ce fichier est l'exemple fautif de U3
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };

// fautif — hypothétique : le usecase lit la requête HTTP
export const getVerifiedCode = async ({ request, campaignRepository, combinedCourseRepository }) => {
  const { code } = request.params;
  …
};
```

**Test.** *Ce usecase fonctionnerait-il tel quel, appelé depuis un script ou un job ?* Si non, une
préoccupation de transport a fui.

**Ce qui casse.** Le usecase cesse d'être réutilisable hors HTTP. Le même besoin depuis un job oblige
alors à dupliquer l'orchestration.

### U6. Renvoie des objets du domaine

**Énoncé.** Un usecase renvoie des objets du domaine local, des read-models du contexte, ou des
scalaires. Jamais un objet façonné pour une réponse HTTP, jamais le DTO d'un autre contexte.

```js
// conforme — un Value Object du contexte
return new VerifiedCode({ code: combinedCourse.code, type: 'combined-course' });

// fautif — un objet assemblé pour la réponse, sans type du domaine
return {
  fullNameFromPix,
  fullNameFromExternalIdentityProvider,
  email: foundUser.email,
  username: foundUser.username,
  authenticationMethods,
};
```

**Ce qui casse.** Un objet de réponse renvoyé par le usecase fait entrer la forme de l'API dans le
domaine : changer la réponse oblige à changer le usecase. C'est X2 au § 5.

Le second cas, le DTO d'un autre contexte, est le plus discret. Il vient presque toujours d'une
violation en amont, dans un repository qui n'a pas traduit. Voir I1 de `repository/README.md`.

### U7. Le périmètre transactionnel est explicite

**Énoncé.** Un usecase qui écrit à plusieurs endroits dit ce qui doit être atomique.

L'ADR 25 donne le critère :

| La situation | La forme attendue |
| --- | --- |
| Les écritures doivent **échouer ou réussir ensemble** | une transaction, orchestrée dans le usecase, **sans événements** |
| Elles peuvent échouer **indépendamment** | pas de transaction |

Une transaction posée « au cas où » sur des écritures indépendantes est un défaut, pas une précaution.

```js
// conforme — withTransaction enveloppe les deux écritures, et le dit à la lecture
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

// fautif — hypothétique : les mêmes écritures sans withTransaction.
// Rien ne dit si la suppression doit être annulée quand la mise à jour échoue.
const updateOrganizationInformation = async function ({ … }) { … };
```

`learnersApi` y est injectée directement dans le usecase, ce qui est fautif pour U9 : c'est l'écart `X6`
au § 5. L'exemple ne vaut ici que pour la transaction.

**Aucun événement dans une transaction.** C'est la décision de l'ADR 25. Son motif est mesuré : des
deadlocks constatés en production, qui épuisaient le pool de connexions. Un enchaînement qui doit
échouer ensemble se fait donc par **orchestration** dans le usecase, jamais par chorégraphie
d'événements.

**Ce qui casse.** Sans cette réponse, chaque écriture multiple est un pari : personne ne sait ce qui
sera annulé si la seconde échoue.

**Le coût de la forme ambiante.** La transaction n'apparaît pas dans la signature. Sans
`withTransaction` dans sa déclaration, rien ne dit si le usecase s'exécute dans la transaction d'un
appelant. Voir `X3` de `repository/ecarts.md`, où cet écart est instruit. La contrepartie est de
**documenter le périmètre** quand il n'est pas évident.

**Sur plusieurs Aggregates.** L'ADR 25 retient la transaction qui en couvre plusieurs quand les
écritures doivent échouer ensemble. C'est une position différente de celle de Vernon. Voir `A7` et
`X4` de `fiche-racine-agregat.md`, où le choix est instruit.

### U8. Enregistré dans l'index des usecases

**Énoncé.** Tout fichier de `domain/usecases/` figure dans l'objet des usecases de l'index du
contexte.

```js
// conforme — domain/usecases/index.js : l'import, puis la clé dans l'objet des usecases
import getCombinedCourseById from './get-combined-course-by-id.js';
…
  getCombinedCourseById,

// fautif — duplicate-module.js est absent de l'index ; un script l'importe directement
import { duplicateModule } from '../domain/usecases/duplicate-module.js';
```

**Ce qui casse.** Rien à l'exécution, parce qu'un usecase peut être importé directement. Mais l'index
cesse d'être la liste exhaustive de ce que le contexte sait faire. Toute lecture d'ensemble devient
donc fausse, pour un humain comme pour un agent.

C'est l'équivalent de I6 dans `repository/README.md`, où la conséquence est plus grave : là-bas,
l'injection ne s'applique pas et le repository échoue au premier appel.

### U9. Aucun accès direct au domaine d'un autre contexte

**Énoncé.** Un usecase n'importe ni le domaine, ni l'infrastructure, ni les usecases d'un autre
contexte. Il passe par l'**API interne** de ce contexte, et jamais directement : l'API est enveloppée
dans un repository du contexte consommateur, que le usecase reçoit.

Ce repository est l'Anticorruption Layer : il traduit la réponse du voisin dans le langage du domaine
local. C'est la décision de l'ADR 55, et `X6` de `repository/ecarts.md`. Un usecase qui reçoit l'API
interne elle-même contourne cette traduction : c'est l'écart `X6` au § 5.

```js
// fautif — le domaine d'un voisin, atteint directement
import { Scorecard } from '../../../evaluation/domain/models/Scorecard.js';

// conforme pour U9 — campaignRepository enveloppe campaignsApi, l'API interne du voisin.
// Signature seule : le corps de ce fichier est l'exemple fautif de U3
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };
```

**Ce qui casse.** Les deux contextes cessent d'être découplés : un changement interne chez le voisin
casse le contexte consommateur, sans qu'aucun contrat n'ait été rompu. C'est la décision de
l'ADR 55. Ses coûts sont listés et acceptés :

- complexité supplémentaire dans l'infrastructure, par l'injection de dépendances dans les
  repositories ;
- données de test à fournir aux consommateurs ;
- volume de code répétitif, et duplication possible des modèles.

**Faux ami.** Une règle `dependency-cruiser` au grain du contexte laisse passer ces imports quand le
contexte cible est déclaré dans les dépendances autorisées. La vérification utile est au grain de la
**couche** : une dépendance vers un autre contexte doit cibler `application/api/`.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un usecase réduit à un seul appel de repository | **autorisé**, décidé en ADR 20. Voir X5 |
| Un `if` sur l'absence d'un résultat de chargement | **autorisé**, c'est de l'orchestration. U1 |
| Un usecase qui ne renvoie rien | **autorisé** : une intention peut n'avoir que des effets |
| Le fichier de câblage `usecases/index.js` importe l'infrastructure | **autorisé**, exempté dans la règle. Voir X3 |
| Un usecase reçoit un journal en dépendance injectée | **autorisé** : injecté, pas importé. À distinguer d'un modèle qui importe l'infrastructure |
| Un usecase enveloppe son corps dans un `try/catch` qui journalise | **non décidé** : commode, mais avale les erreurs de programmation et les rend invisibles |
| Un fichier de `services/` sans I/O, testé en unitaire pur | **autorisé**, c'est un vrai Domain Service |
| Un fichier de `services/` qui reçoit un repository | **pas une exception** : c'est un usecase, à traiter comme tel. Sa place est dans `usecases/` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **U1** aucune règle métier | **forte** | La règle est écrite une fois, là où sont ses données. Cela empêche trois usecases d'implémenter trois variantes de la même condition |
| **U9** API interne obligatoire | **forte** | Les contextes restent découplés, et le contrat entre eux reste explicite et versionnable |
| **U3** aucun import d'infrastructure | moyenne | La couche métier reste indépendante de la façon dont les données sont atteintes |
| **U2** dépendances injectées | moyenne | Le usecase est testable en substituant ses dépendances. Sous ESM, c'est la seule façon |
| **U5** aucune notion de transport | moyenne | Le même usecase sert une route, un script et un job sans adaptation |
| **U6** renvoie des objets du domaine | moyenne | La forme de l'API ne remonte pas dans le domaine |
| **U7** périmètre transactionnel | moyenne | Ce qui est atomique est connu. Sans cette réponse, chaque écriture multiple est un pari |
| **U4** une intention, un nom de verbe | moyenne | La liste des fichiers est la documentation fonctionnelle du contexte, sans coût d'écriture |
| **U8** enregistré dans l'index | hygiène | L'index reste la carte de ce que le contexte sait faire. Aucun effet à l'exécution |

U1 et U9 ont tous deux une rentabilité forte, mais pas la même vérifiabilité. U9 se vérifie par une
règle de chemin. Aucun moyen fiable ne vérifie U1.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le découpage en usecases est le bon, ni si une intention métier
mérite son usecase. Un usecase par route est une convention, pas une garantie de pertinence : elle
produit aussi des usecases qui ne font que déléguer.

Ils ne disent pas non plus si le fichier devait être un usecase plutôt qu'un Domain Service. Le test
de discrimination du § 1 de `fiche-service-domaine.md` répond à cette question.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `U`, qui est le préfixe des invariants de cette fiche.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** La règle métier vit dans le usecase | dérive | La même règle réécrite dans plusieurs usecases, et différemment. Les modèles se vident | Le usecase se lit d'une traite, sans ouvrir le modèle | **À corriger** |
| **X2** Le usecase renvoie un objet façonné pour la réponse HTTP | dérive | Changer la réponse de l'API oblige à changer le usecase. Il cesse d'être réutilisable hors HTTP | Un contrôleur qui n'a plus rien à faire | **À corriger** |
| **X6** Une API interne est injectée directement dans le usecase | dérive | La réponse du voisin entre dans le domaine sans traduction : un changement de son contrat casse le usecase, et l'Anticorruption Layer est contournée | Un repository de moins à écrire | **À corriger** |
| **X4** Dépendances et entrées métier sont mélangées | convention assumée | Rien ne distingue la frontière du usecase de ses entrées, ni à la lecture ni au typage | Une seule signature, et l'injection reste triviale | *À surveiller* |
| **X3** Le fichier de câblage des usecases importe l'infrastructure | vestige assumé en convention | Nul — le fichier est toujours au même chemin, donc exemptable | Le câblage est là où sont les usecases qu'il câble | *Rien à faire* |
| **X5** Un usecase réduit à un seul appel de repository | convention assumée | Un fichier et un test pour une délégation | Le point d'entrée est toujours au même endroit, et l'ajout d'une règle ne change pas la structure | *Rien à faire* |

### X1. La règle métier vit dans le usecase

**Ce que dit la théorie.** Martin distingue les règles d'entreprise, qui vivent dans les Entities, des
règles applicatives, qui orchestrent. Fowler nomme le symptôme obtenu quand la distinction tombe : le
modèle anémique.

Vu depuis l'Entity, le même écart a pour symptôme le modèle vide. Il est énoncé ici, où se trouve le
fichier fautif, et `fiche-entite.md` y renvoie.

**Exemple concret.**

```js
// dans un usecase — la règle est ici, et le modèle l'ignore
if (!combinedCourseBlueprint.organizationIds.includes(combinedCourseForCreation.organizationId)) {
  throw new ForbiddenAccess();
}
```

Le modèle expose la liste, le usecase fait le test. La duplication est réelle : le même test est
**déjà** écrit à l'intérieur du modèle, dans la méthode qui attache une organisation.

```js
// dans le modèle — la même question, posée deux fois dans deux fichiers
attachOrganizations({ organizationIds }) {
  organizationIds.map((organizationId) => {
    if (this.organizationIds.includes(organizationId)) { … }
  });
}
```

Si le partage se fait un jour aussi par groupe d'organisations, les deux endroits doivent changer, et
seul celui qui sera trouvé changera.

**Correction.** Déplacer la règle sur l'objet qui porte l'état, sous une méthode qui nomme
l'intention : c'est E6 de `fiche-entite.md`. Le usecase passe de la condition à l'appel :
`combinedCourseBlueprint.isSharedWith({ organizationId: combinedCourseForCreation.organizationId })`.

La correction n'est pas mécanique : il faut décider ce qui appartient à l'objet et ce qui est de
l'orchestration. Une condition sur l'état d'un objet lui appartient. Une condition sur l'existence
d'autre chose appartient au usecase.

### X2. Le usecase renvoie un objet façonné pour la réponse HTTP

**Ce que dit la théorie.** La mise en forme pour un consommateur appartient à la couche externe.
Martin la traite sous *Presenters and Humble Objects*.

**Exemple concret.**

```js
// dans un usecase — des champs composés pour l'affichage, dans un objet sur mesure
const fullNameFromPix = `${foundUser.firstName} ${foundUser.lastName}`;
const fullNameFromExternalIdentityProvider = `${sessionContentAndUserInfo.userInfo.firstName} ${sessionContentAndUserInfo.userInfo.lastName}`;

return {
  fullNameFromPix,
  fullNameFromExternalIdentityProvider,
  email: foundUser.email,
  username: foundUser.username,
  authenticationMethods,
};
```

Le signe qui ne trompe pas : une clé nommée d'après le format de sortie, comme `attributes` ou
`included`, dans un fichier de `domain/`. La clé `data` y sert aussi aux métadonnées de journal. La
forme ci-dessus est plus discrète : un objet sans type du domaine, dont les champs sont composés pour
l'écran.

**Correction.** Renvoyer l'objet du domaine, et laisser le sérialiseur produire la forme. Le
déplacement est mécanique quand la mise en forme est isolée. Il ne l'est pas quand le usecase a
construit un objet sur mesure, comme ci-dessus : il faut alors décider si la bonne réponse est un
read-model.

### X6. Une API interne est injectée directement dans le usecase

**Ce que dit la théorie.** Un contexte qui consomme un voisin traduit le modèle de ce voisin à sa
frontière, pour que ce modèle n'entre pas dans le sien : c'est l'Anticorruption Layer d'Evans. L'ADR 55
place cette traduction dans un repository du contexte consommateur.

**Exemple concret.**

```js
// fautif — l'API interne du voisin arrive telle quelle dans le usecase
const updateOrganizationInformation = withTransaction(async function ({ …, learnersApi }) {
  …
  await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId: organization.id });
  …
});

// conforme — forme corrigée (hypothétique) : un repository du contexte enveloppe l'API
const updateOrganizationInformation = withTransaction(async function ({ …, organizationLearnerRepository }) {
  …
  await organizationLearnerRepository.deleteBeforeImportFeature({ userId, organizationId: organization.id });
  …
});
```

Le motif n'est pas isolé : plusieurs contextes injectent ainsi des APIs internes dans leurs
usecases.

**Correction.** Pour chaque usecase concerné, créer ou réutiliser le repository du contexte qui
enveloppe l'API, y traduire la réponse dans le langage local, et injecter ce repository à la place de
l'API. Le signal du § 6 produit la liste. Le remplacement de l'injection est mécanique ; la
traduction demande de décider la forme locale.

### X4. Dépendances et entrées métier sont mélangées

**Ce que dit la théorie.** Rien directement. L'écart porte sur la lisibilité de la frontière, pas sur
un livre.

**Exemple concret.** Un seul objet déstructuré, où rien ne dit ce qui vient de l'appelant et ce qui
vient du câblage :

```js
export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => { … };
```

Sans ouvrir l'index, un lecteur ne peut pas savoir si `code` est une entrée métier ou une dépendance
injectée. Ici, `code` est une entrée métier. Mais `accessCodeGenerator`, vu en U2 dans la même
position, est une dépendance.

**Correction.** Aucune décidée. La forme alternative, deux objets de paramètres `(input, deps)`, est
incrémentale : les fonctions existantes continuent de lire le premier argument, et les nouvelles
déclarent les deux. Elle suppose de vérifier que l'utilitaire d'injection s'en accommode.

C'est un sujet de lisibilité, à instruire séparément, sans rapport avec TypeScript. Ne pas
l'attacher à la migration.

### X3. Le fichier de câblage des usecases importe l'infrastructure

**Ce que dit la théorie.** Clean Architecture place le câblage dans une couche externe, jamais dans le
domaine.

**Exemple concret.**

```js
// domain/usecases/index.js — un fichier du domaine qui importe l'infrastructure
import { repositories } from '../../infrastructure/repositories/index.js';
```

**Correction.** Aucune sur le fichier. Le déplacer coûterait un fichier par contexte plus tous leurs
importateurs, pour zéro changement de comportement. Et le câblage importerait l'infrastructure où
qu'il aille, parce que c'est sa fonction.

Le chemin est fixe. Il est donc **exempté dans la règle** du § 6, ce qui rend celle-ci activable.
L'exemption ne couvre pas le câblage qui importe l'infrastructure d'un **autre** contexte : c'est une
violation, et elle demande une seconde règle.

La règle qui l'exempte est écrite au `repository/outillage.md`.

### X5. Un usecase réduit à un seul appel de repository

**Ce que dit la théorie.** Un usecase réalise une intention. Une délégation n'en est pas une.

**Exemple concret.**

```js
export async function findCombinedCourseByCampaignId({ campaignId, combinedCourseRepository }) {
  return combinedCourseRepository.findByCampaignId({ campaignId });
}
```

**Correction.** Aucune. L'ADR 20 rend le usecase obligatoire, et le bénéfice est réel : le point
d'entrée est toujours au même endroit. Ajouter une règle plus tard ne change donc ni la structure ni
les appelants. Le coût est un fichier et un test.

**Révision.** Une majorité de délégations parmi les usecases d'un contexte rouvre cet écart. Cette
majorité serait un signal sur le découpage, pas sur la convention.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve : la violation est introduite, l'outil doit la signaler, puis la violation
est retirée.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **U3** aucun import d'infrastructure | règle `dependency-cruiser` de chemin, avec exemption du câblage | configuration seule | aucun |
| **X6** API interne injectée dans le usecase, signal | règle ESLint : paramètre en `/Api$/` dans un fichier de `domain/usecases/`, câblage exclu | ~20 lignes | aucun attendu : le suffixe `Api` est la convention des APIs internes |
| **U9** API interne obligatoire | règle `dependency-cruiser` au grain de la couche | configuration seule | aucun, si « un autre contexte » est bien exprimé |
| **U5** aucune notion de transport | règle ESLint : identifiant `request` ou `h`, ou import du framework HTTP | ~20 lignes | aucun attendu |
| **U8** enregistré dans l'index | script `tests/tooling/` | ~30 lignes | aucun |
| Le discriminant du § 1 | règle ESLint : un fichier de `domain/services/` reçoit un paramètre en `/(Repository\|Api\|Storage)$/` | ~20 lignes | aucun, mais **se déclenchera sur l'existant** |
| **U4** nom de verbe | script : nom en kebab-case commençant par un verbe | ~20 lignes | **à mesurer** : la liste des verbes est ouverte |
| **U1**, **U2**, **U6**, **U7** | revue | — | — |

La règle de U5 ne couvre ni les codes HTTP, ni la sérialisation, ni les en-têtes.

### U3 et U9 — deux règles de chemin

```js
{
  name: 'usecase-must-not-import-infrastructure',
  severity: 'error',
  from: {
    path: 'src/.+/domain/usecases/',
    pathNot: 'src/.+/domain/usecases/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/' },
}
```

L'exemption du `pathNot` rend la règle activable malgré X3. Elle est plus large que nécessaire sur un
point : le fichier exempté peut alors importer l'infrastructure d'un **autre** contexte, ce qui reste
une violation.

```js
{
  name: 'context-dependency-must-target-internal-api',
  severity: 'error',
  from: { path: 'src/.+/domain/' },
  to: { path: 'src/.+/(domain|infrastructure)/' },   // à affiner : uniquement vers un AUTRE contexte
}
```

La seconde règle est la plus utile et la plus délicate à écrire. Elle doit exprimer « un autre
contexte que le sien », ce que `dependency-cruiser` fait par groupes capturés dans les chemins. **Elle
se vérifie par contre-épreuve avant tout commit.**

`severity: 'error'` est obligatoire dans les deux cas : la valeur par défaut est `warn`, et seul
`error` fait échouer la commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, les
contextes à sous-contextes ne sont pas atteints, et la règle ne se déclenche jamais, sans le signaler.

### Le discriminant — la règle qui force la décision

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom finit par `Repository`, `Api` ou
`Storage` fait des I/O. Ce n'est donc pas un Domain Service. C'est la règle de signature de D1, dans
`fiche-service-domaine.md`.

La règle est triviale à écrire. Elle se déclenchera sur l'existant, et c'est voulu : elle produit la
liste des fichiers de `services/` à classer. Elle reste en avertissement jusqu'à la fin de ce
classement, préalable à la correction de X1 de `fiche-service-domaine.md`.

Le même parcours d'AST sert l'étape 1 de I1 dans `repository/outillage.md`, qui repère déjà les
paramètres en `/Api$/`.

### Ce qui n'est pas mécanisable

U1 est, avec U9, l'invariant le plus rentable, et c'est le moins vérifiable. Distinguer une condition
d'orchestration d'une règle métier demande de savoir ce qui est métier. Aucun indicateur fiable n'est
identifié.

La **complexité cyclomatique** d'un usecase est un indicateur imparfait : un usecase très ramifié
porte souvent des règles. C'est un signal pour la revue, pas un verdict. Cet indicateur n'est pas
transformé en règle : en faire un seuil bloquant produirait des contournements plutôt que des
corrections.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **U3** : configuration `dependency-cruiser`, avec l'exemption du câblage et contre-épreuve.
2. **U5** : première règle ESLint sur mesure.
3. **U8** : script de complétude de l'index.
4. **Le discriminant** : en avertissement, pour produire la liste des fichiers de `services/` à
   classer.
5. **U9** : une fois « un autre contexte que le sien » exprimé.
6. **U4** : après mesure des faux positifs sur la liste des verbes.

### Codemods

Critère de la table : un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **U8** index | oui, complet | Insère l'import et la clé dans l'index. Purement syntaxique |
| **U4** nommage | oui, complet | Renomme le fichier et réécrit ses imports |
| Le discriminant | oui, une fois le classement fait | Déplace un fichier de `services/` vers `usecases/` et réécrit ses imports. Signale un câblage dédié |
| **X2** objet de réponse | partiel | Retire l'enveloppe quand il y en a une. Ne décide pas si la bonne réponse est un read-model |
| **X1** règle dans le usecase | non | Déplacer une règle vers le bon objet est de la conception |

---

## 7. Le type

Un usecase se type **une fois que ses dépendances le sont**. Il est en bout de chaîne : il consomme
des ports et des modèles. Son typage ne vérifie donc rien tant que ceux-ci sont en JavaScript.

```ts
type GetVerifiedCodeInput = { code: string };
type GetVerifiedCodeDeps = {
  campaignRepository: CampaignRepository;
  combinedCourseRepository: CombinedCourseRepository;
};

export const getVerifiedCode = async (
  input: GetVerifiedCodeInput,
  deps: GetVerifiedCodeDeps,
): Promise<VerifiedCode> => { … };
```

La forme ci-dessus sépare entrées et dépendances, ce que la convention de X4 ne fait pas. Avec un seul
objet, le typage reste possible et correct :

```ts
export const getVerifiedCode = async (
  params: GetVerifiedCodeInput & GetVerifiedCodeDeps,
): Promise<VerifiedCode> => { … };
```

La signature ne distingue toujours pas les deux : c'est X4, et le typage ne le résout pas. Les deux
sujets sont indépendants. La séparation est une décision de lisibilité, pas une conséquence de la
migration.

Le typage apporte ici une vérification : les ports déclarés rendent vérifiable ce que le usecase
appelle sur ses dépendances. Une méthode absente ou mal nommée devient une erreur de compilation. Sans
typage, elle échoue à l'exécution. C'est « Vérifier par le typage » dans `repository/outillage.md`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Usecase | **intégration uniquement** : base réelle, fixtures | l'orchestration de bout en bout et le résultat |
| Sous-usecase partagé, avec I/O | **intégration**, comme un usecase | idem |

Tester les usecases en intégration seulement est une convention d'équipe. Elle évite des tests
unitaires qui ne feraient que vérifier l'ordre des appels à des doublures, ce qui reproduit
l'implémentation au lieu de la contraindre.

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites dans
`repository/outillage.md`.

Un indice de diagnostic, avec sa limite. Si un usecase demande beaucoup de fixtures pour un cas
simple, son Aggregate est souvent trop gros : voir A6 de `fiche-racine-agregat.md`. Limite : un
usecase qui traverse légitimement plusieurs Aggregates en demandera beaucoup sans qu'aucun soit trop
gros.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est identifié.

```
[ ] [humain]  U1  Aucun calcul métier ; les if portent sur l'existence, pas sur des propriétés métier
[ ] [auto]    U9  Aucun accès au domaine ni à l'infrastructure d'un autre contexte — API interne, via un repository
[ ] [auto]    U3  Aucun import d'infrastructure
[ ] [humain]  U2  Toutes les dépendances arrivent en paramètres
[ ] [partiel] U5  Aucune notion de transport : ni request, ni code HTTP, ni sérialisation
[ ] [humain]  U6  Renvoie des objets du domaine local, jamais un DTO étranger ni un objet de réponse
[ ] [humain]  U7  Le périmètre atomique est explicite quand plusieurs écritures ont lieu
[ ] [partiel] U4  Un fichier, un nom de verbe en kebab-case, Ubiquitous Language du contexte
[ ] [auto]    U8  Enregistré dans l'index des usecases
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du usecase
[ ] [humain]  Test d'intégration ; un fichier de services/ sans I/O est testé en unitaire pur
[ ] [auto]    Si le fichier est dans services/ et reçoit une I/O, c'est un usecase
```

À terme, il reste sept lignes : deux `[partiel]`, U5 et U4, et cinq `[humain]`, U1, U2, U6, U7 et le
type de test. U1 a le ROI le plus fort de cette fiche, avec U9, et sa ligne reste humaine : aucun
moyen fiable ne le vérifie (§ 4).

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le usecase comme couche | Martin, *Clean Architecture*, ch. « Business Rules » : distinction *Entities* / *Use Cases* | le livre de 2017 ; billet « The Clean Architecture » gratuit |
| **U1** aucune règle métier | Martin, même ch. : les règles d'entreprise sont dans les Entities, les règles applicatives dans les usecases. Fowler, « AnemicDomainModel », pour le symptôme inverse | bliki gratuit |
| **U2** dépendances injectées | Martin, ch. « The Dependency Inversion Principle ». Pix : **ADR 46**, avec son motif ESM | ADR 46 |
| **U3** aucun import d'infrastructure | Martin, « The Clean Architecture » : la règle de dépendance | billet gratuit |
| **U4** une intention, un fichier | Pix : **ADR 20** pour le caractère obligatoire, **ADR 51** pour l'arborescence. Le nommage par verbe n'a **aucune source** | ADR 20 et 51 |
| **U5** aucune notion de transport, **U6** renvoie des objets du domaine | Martin, ch. « Presenters and Humble Objects » | le livre de 2017 |
| **U7** périmètre transactionnel | Pix : **ADR 25**, qui remplace l'ADR 9 et interdit les événements dans une transaction, sur un motif mesuré : des deadlocks en production. Le critère échouer-ensemble / indépendamment vient de ses conséquences. Vernon, règle 4, pour la cohérence différée | ADR 25 ; dddcommunity.org |
| **U8** enregistré dans l'index | **aucune source** : outillage Pix | — |
| **U9** API interne obligatoire | Pix : **ADR 55**, qui décide les APIs internes synchrones et énumère les coûts acceptés | ADR 55 |
| Le discriminant avec le Domain Service | Evans, *DDD*, ch. « A Model Expressed in Software » : le Service y est défini sans état et sans I/O | *DDD Reference* |

**U8 n'a aucune source.** Le nommage par verbe de U4 n'en a pas non plus : l'ADR 20 ne source que le
caractère obligatoire du usecase. Quatre invariants renvoient directement à un ADR Pix : U2, U4, U7
et U9. Ils sont donc contestables sur pièces plutôt que par appel à une autorité.
