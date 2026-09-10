# Fiche — Usecase

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés.
> - **ADR 9 et 25 lus le 2026-09-08.** L'ADR 25 **remplace** l'ADR 9, et sa décision est plus étroite
>   que le titre ne le suggère : elle porte sur les événements dans les transactions. `U7` en donne la
>   règle utilisable, désormais sourcée.
> - X1 et X3 sont des écarts que deux autres fiches traitent depuis l'autre bord. Vérifier à chaque
>   reprise qu'ils ne sont énoncés qu'ici.

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
| [**U5**](#u5-aucune-notion-de-transport) | aucune notion de transport | moyenne | règle ESLint |
| [**U6**](#u6-renvoie-des-objets-du-domaine) | renvoie des objets du domaine | moyenne | revue |
| [**U7**](#u7-le-périmètre-transactionnel-est-explicite) | le périmètre transactionnel est explicite | moyenne | revue |
| [**U4**](#u4-une-intention-métier-un-fichier-un-nom-de-verbe) | une intention, un fichier, un nom de verbe | moyenne | script, à mesurer |
| [**U8**](#u8-enregistré-dans-lindex-des-usecases) | enregistré dans l'index des usecases | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-la-règle-métier-vit-dans-le-usecase) | la règle métier vit dans le usecase | **à corriger** |
| [**X2**](#x2-le-usecase-renvoie-un-objet-façonné-pour-la-réponse-http) | le usecase renvoie un objet façonné pour la réponse HTTP | **à corriger** |
| [**X3**](#x3-le-fichier-de-câblage-des-usecases-importe-linfrastructure) | le fichier de câblage des usecases importe l'infrastructure | rien à faire |
| [**X4**](#x4-dépendances-et-entrées-métier-sont-mélangées) | dépendances et entrées métier sont mélangées | à surveiller |
| [**X5**](#x5-un-usecase-réduit-à-un-seul-appel-de-repository) | un usecase réduit à un seul appel de repository | rien à faire |

L'artefact le plus cherché n'est pas dans cette fiche : le **discriminant usecase / service de
domaine** est au § 1 de `fiche-service-domaine.md`, énoncé une fois pour les deux. Le raccourci utile :
**un fichier de `domain/services/` qui reçoit une I/O est un usecase**, et tous les invariants
ci-dessous s'y appliquent.

---

## 1. Rôle

Un usecase réalise **une intention métier** de bout en bout. Il orchestre : il appelle des
repositories, construit ou fait évoluer des objets du domaine, et décide de l'ordre des opérations.

Il ne calcule aucune règle lui-même. Les règles vivent sur les entités, les objets-valeurs et les
racines d'agrégat ; le usecase les fait jouer dans le bon ordre, avec les bonnes données.

C'est la couche la plus lue du contexte : on ouvre un usecase pour comprendre ce que le système fait.
Sa qualité de lecture compte donc autant que sa correction.

### Le repère pratique

> Un usecase ne contient **aucun calcul métier**. Un `if` sur « l'objet a-t-il été trouvé » est
> légitime ; un `if` sur une condition métier signifie qu'une règle a fui hors du modèle.

### Usecase ou service de domaine

Le discriminant tient dans la signature, et il est énoncé au § 1 de `fiche-service-domaine.md` — une
fois, parce qu'il n'appartient à aucune des deux catégories.

Ce qu'il faut en retenir ici : un fichier de `domain/services/` qui reçoit un paramètre dont le nom
correspond à `/(Repository|Api|Storage)$/` fait des I/O, donc **c'est un usecase**, quel que soit son
dossier. Tous les invariants de cette fiche s'y appliquent sans exception.

Le partage entre plusieurs usecases est une raison légitime de factoriser un fichier. Ce n'est pas ce
qui en ferait un service de domaine.

### Ce qu'un usecase n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un usecase.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| applique une règle sur des objets d'une même frontière de cohérence | la racine d'agrégat | `fiche-racine-agregat.md` |
| applique une règle sur un seul objet | l'entité ou l'objet-valeur | `fiche-entite.md`, `fiche-objet-valeur.md` |
| applique une règle sans aucune I/O dans sa signature | `domain/services/` | `fiche-service-domaine.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `fiche-specification.md` |
| accède à une source de données | un repository | `fiche-repository.md` |
| lit une requête HTTP, choisit un code de retour, sérialise | `application/` | `fiche-controleur.md`, `fiche-route.md`, `fiche-serialiseur.md` |
| expose une capacité à un autre contexte | `application/api/` | `fiche-api-interne.md` |
| met en forme des données pour une lecture | un read-model, construit par un repository | `fiche-read-model.md` |

---

## 2. Invariants

### U1. Aucune règle métier dans le usecase

**Énoncé.** Le usecase ordonne des opérations. Il ne décide pas selon une propriété métier.

```js
// fautif — la règle « un parcours archivé n'accepte plus de participation » vit ici,
// donc elle sera réécrite ailleurs
if (course.archivedAt !== null) {
  throw new CourseArchivedError();
}
await participationRepository.save({ … });

// conforme — la règle est sur l'objet qui la porte
course.addParticipation({ learnerId });
await courseRepository.save({ course });
```

**Comment discriminer.** Un `if` qui teste l'existence d'un résultat de chargement est de
l'orchestration. Un `if` qui teste une propriété métier d'un objet du domaine est une règle : elle
appartient à cet objet.

**Ce qui casse.** La même condition finit écrite dans plusieurs usecases, différemment, et une seule
est mise à jour quand le métier change. C'est X1 au § 5.

**Indice de lecture.** Un usecase sans règle se comprend en lisant sa suite d'appels. S'il faut
dérouler mentalement des conditions pour savoir ce qu'il fait, U1 est probablement violé.

### U2. Les dépendances arrivent en paramètres, jamais par import

**Énoncé.** Un usecase n'importe pas de repository, ni de client, ni d'API interne. Il les reçoit, et
le câblage a lieu dans l'index du contexte.

```js
// conforme
export async function startCourse({ userId, code, courseRepository, participationRepository }) { … }
```

**Ce qui casse.** Sous ESM les exports sont immuables : un module importé ne peut pas être substitué
par une doublure de test. Sans injection, le usecase devient intestable isolément. C'est le motif de
l'ADR 46, et il est technique, pas stylistique.

**Limite de la forme actuelle.** Dépendances et entrées métier sont mélangées dans un seul objet
déstructuré, donc rien ne les distingue dans la signature. C'est X4 au § 5.

### U3. Aucun import d'infrastructure

**Énoncé.** Corollaire de U2 côté fichier : un usecase n'importe rien de `infrastructure/`, ni du sien
ni de celui d'un autre contexte.

```js
// fautif
import { knex } from '../../../db/knex-database-connection.js';
```

**Ce qui casse.** La couche métier devient dépendante de la façon dont les données sont stockées ou
atteintes, donc un changement d'infrastructure remonte jusqu'au domaine.

**L'exception apparente** est le fichier de câblage, `domain/usecases/index.js`, qui importe par
définition ce qu'il injecte. Sa présence dans `domain/` est un écart en soi — c'est X3 au § 5 — et il
est exempté dans la règle du § 6 plutôt que de servir de précédent.

### U4. Une intention métier, un fichier, un nom de verbe

**Énoncé.** Un fichier par usecase, nommé par le **verbe de l'intention** : `start-course`,
`archive-organization`, `reward-user`. Pas par la ressource, pas par la couche.

Le nom est celui du langage ubiquitaire du contexte. Deux contextes peuvent avoir un usecase du même
nom désignant deux choses différentes : c'est attendu, mais ça se paie à la lecture d'un import.

**Ce qui casse.** La liste des fichiers de `usecases/` cesse d'être la liste de ce que le contexte
sait faire. C'est la documentation fonctionnelle la moins chère disponible, et un nom de ressource la
rend muette.

### U5. Aucune notion de transport

**Énoncé.** Pas de `request`, pas de `h`, pas de code HTTP, pas de sérialisation, pas d'en-tête. Un
usecase ne sait pas comment il est appelé.

Le test : *ce usecase fonctionnerait-il tel quel appelé depuis un script ou un job ?* Si non, une
préoccupation de transport a fui.

**Ce qui casse.** Le usecase cesse d'être réutilisable hors HTTP. Le même besoin depuis un job oblige
alors à dupliquer l'orchestration.

### U6. Renvoie des objets du domaine

**Énoncé.** Un usecase renvoie des objets du domaine local, des read-models du contexte, ou des
scalaires. Jamais un objet façonné pour une réponse HTTP, jamais le DTO d'un autre contexte.

**Ce qui casse.** Un objet de réponse renvoyé par le usecase fait entrer la forme de l'API dans le
domaine : changer la réponse oblige à changer le usecase. C'est X2 au § 5.

Le second cas — le DTO d'un autre contexte — est le plus discret : il vient presque toujours d'une
violation en amont, dans un repository qui n'a pas traduit. Voir I1 de `fiche-repository.md`.

### U7. Le périmètre transactionnel est explicite

**Énoncé.** Un usecase qui écrit à plusieurs endroits dit ce qui doit être atomique.

L'ADR 25 donne le critère, et il est net :

| La situation | Ce qu'il faut faire |
| --- | --- |
| Les écritures doivent **échouer ou réussir ensemble** | une transaction, orchestrée dans le usecase, **sans événements** |
| Elles peuvent échouer **indépendamment** | pas de transaction |

Le second point est celui qu'on oublie : une transaction posée « au cas où » sur des écritures
indépendantes est un défaut, pas une précaution.

**Aucun événement dans une transaction.** C'est la décision de l'ADR 25, et son motif est mesuré : des
deadlocks constatés en production, qui épuisaient le pool de connexions. Un enchaînement qui doit
échouer ensemble se fait donc par **orchestration** dans le usecase, jamais par chorégraphie
d'événements.

**Ce qui casse.** Sans cette réponse, chaque écriture multiple est un pari : personne ne sait ce qui
sera annulé si la seconde échoue.

**Le coût de la forme ambiante.** La transaction n'apparaît pas dans la signature, donc la lecture
seule ne suffit pas à savoir si le usecase s'exécute dans une transaction. Voir `X3` de
`fiche-repository.md`, où cet écart est instruit. La contrepartie est de **documenter le périmètre**
quand il n'est pas évident.

**Sur plusieurs agrégats.** L'ADR 25 retient explicitement la transaction qui en couvre plusieurs
quand les écritures doivent échouer ensemble. C'est une position différente de celle de Vernon — voir
`A7` et `X4` de `fiche-racine-agregat.md`, où le choix est instruit.

### U8. Enregistré dans l'index des usecases

**Énoncé.** Tout fichier de `domain/usecases/` figure dans l'objet des usecases de l'index du
contexte.

**Ce qui casse.** Rien à l'exécution — un usecase peut être importé directement. Mais l'index cesse
d'être la liste exhaustive de ce que le contexte sait faire, donc toute lecture d'ensemble devient
fausse, pour un humain comme pour un agent.

C'est l'équivalent de I6 dans `fiche-repository.md`, où la conséquence est plus grave : là-bas
l'injection ne s'applique pas et le repository échoue au premier appel.

### U9. Aucun accès direct au domaine d'un autre contexte

**Énoncé.** Un usecase n'importe ni le domaine, ni l'infrastructure, ni les usecases d'un autre
contexte. Il passe par l'**API interne** de ce contexte, injectée comme les autres dépendances.

```js
// fautif — le domaine d'un voisin, atteint directement
import { Thing } from '../../autre-contexte/domain/models/Thing.js';

// conforme — l'API interne, injectée
export async function doSomething({ id, autreContexteApi }) { … }
```

**Ce qui casse.** Les deux contextes cessent d'être découplés : un changement interne chez le voisin
casse le nôtre, sans qu'aucun contrat n'ait été rompu. C'est la décision de l'ADR 55, dont les coûts
sont listés et acceptés — complexité supplémentaire dans l'infrastructure, duplication possible des
modèles.

**Attention à un faux ami.** Une règle `dependency-cruiser` au grain du contexte laisse passer ces
imports quand le contexte cible est déclaré dans les dépendances autorisées. La vérification utile est
au grain de la **couche** : une dépendance vers un autre contexte doit cibler `application/api/`.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un usecase réduit à un seul appel de repository | **autorisé**, décidé en ADR 20. Voir X5 |
| Un `if` sur l'absence d'un résultat de chargement | **autorisé**, c'est de l'orchestration. U1 |
| Un usecase qui ne renvoie rien | **autorisé** — une intention peut n'avoir que des effets |
| Le fichier de câblage `usecases/index.js` importe l'infrastructure | **autorisé**, exempté dans la règle. Voir X3 |
| Un usecase reçoit un journal en dépendance injectée | **autorisé** — injecté, pas importé. À distinguer d'un modèle qui importe l'infrastructure |
| Un usecase enveloppe son corps dans un `try/catch` qui journalise | **à discuter** — commode, mais avale les erreurs de programmation et les rend invisibles |
| Un fichier de `services/` sans I/O, testé en unitaire pur | **autorisé**, c'est un vrai service de domaine |
| Un fichier de `services/` qui reçoit un repository | **pas une exception** — c'est un usecase, à traiter comme tel |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **U1** aucune règle métier | **forte** | La règle est écrite une fois, là où sont ses données. C'est ce qui empêche trois usecases d'implémenter trois variantes de la même condition |
| **U9** API interne obligatoire | **forte** | Les contextes restent découplés, et le contrat entre eux reste explicite et versionnable |
| **U3** aucun import d'infrastructure | moyenne | La couche métier reste indépendante de la façon dont les données sont atteintes |
| **U2** dépendances injectées | moyenne | Le usecase est testable en substituant ses dépendances — sous ESM, c'est la seule façon |
| **U5** aucune notion de transport | moyenne | Le même usecase sert une route, un script et un job sans adaptation |
| **U6** renvoie des objets du domaine | moyenne | La forme de l'API ne remonte pas dans le domaine |
| **U7** périmètre transactionnel | moyenne | On sait ce qui est atomique. Sans cette réponse, chaque écriture multiple est un pari |
| **U4** une intention, un nom de verbe | moyenne | La liste des fichiers est la documentation fonctionnelle du contexte, et elle est gratuite |
| **U8** enregistré dans l'index | hygiène | L'index reste la carte de ce que le contexte sait faire. Aucun effet à l'exécution |

U1 est à la fois le plus rentable et le seul sans moyen de vérification fiable. C'est la tension
propre à cette fiche : ce qu'on aurait le plus intérêt à contrôler est ce qu'on contrôle le moins.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le découpage en usecases est le bon, ni si une intention métier
mérite son usecase. Un usecase par route est une convention, pas une garantie de pertinence : elle
produit aussi des usecases qui ne font que déléguer.

Et ils ne disent pas si le fichier méritait d'être un usecase plutôt qu'un service de domaine. C'est
le test du § 1 de `fiche-service-domaine.md` qui répond.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `U`, qui est le préfixe des invariants de cette fiche.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** La règle métier vit dans le usecase | dérive | La même règle réécrite dans plusieurs usecases, et différemment. Les modèles se vident | Le usecase se lit d'une traite, sans ouvrir le modèle | **À corriger** |
| **X2** Le usecase renvoie un objet façonné pour la réponse HTTP | dérive | Changer la réponse de l'API oblige à changer le usecase. Il cesse d'être réutilisable hors HTTP | Un contrôleur qui n'a plus rien à faire | **À corriger** |
| **X3** Le fichier de câblage des usecases importe l'infrastructure | vestige assumé en convention | Nul — le fichier est toujours au même chemin, donc exemptable | Le câblage est là où sont les usecases qu'il câble | *Rien à faire* |
| **X4** Dépendances et entrées métier sont mélangées | convention assumée | Rien ne distingue la frontière du usecase de ses entrées, ni à la lecture ni au typage | Une seule signature, et l'injection reste triviale | *À surveiller* |
| **X5** Un usecase réduit à un seul appel de repository | convention assumée | Un fichier et un test pour une délégation | Le point d'entrée est toujours au même endroit, et l'ajout d'une règle ne change pas la structure | *Rien à faire* |

### X1. La règle métier vit dans le usecase

**Ce que dit la théorie.** Martin distingue les règles d'entreprise, qui vivent dans les entités, des
règles applicatives, qui orchestrent. Fowler nomme le symptôme obtenu quand la distinction tombe : le
modèle anémique.

Cet écart est le même que celui vu depuis l'entité, où le symptôme est le modèle vide. Il est énoncé
ici, où se trouve le fichier fautif — `fiche-entite.md` y renvoie.

**Exemple concret.**

```js
// dans un usecase — la règle est ici, et l'entité l'ignore
if (thing.archivedAt !== null) throw new AlreadyArchivedError(thing.id);
await thingRepository.update({ id: thing.id, archivedAt: now });
```

La même condition existe dans un autre usecase, écrite autrement, et une seule des deux a été mise à
jour quand la règle a changé.

**Correction.** Déplacer la règle sur l'objet qui porte l'état, sous une méthode qui nomme
l'intention — c'est E6 de `fiche-entite.md`. Le usecase passe de la condition à l'appel :
`thing.archive({ archivedBy, now })`.

Ce qui rend la correction non mécanique : il faut décider ce qui appartient à l'objet et ce qui est de
l'orchestration. Une condition sur l'état d'un objet lui appartient. Une condition sur l'existence
d'autre chose appartient au usecase.

### X2. Le usecase renvoie un objet façonné pour la réponse HTTP

**Ce que dit la théorie.** La mise en forme pour un consommateur appartient à la couche externe.
Martin la traite sous *Presenters and Humble Objects*.

**Exemple concret.**

```js
// dans un usecase — la forme de la réponse est décidée ici
return {
  data: { type: 'things', id: String(thing.id), attributes: { … } },
};
```

Le signe qui ne trompe pas : une clé nommée d'après le format de sortie — `data`, `attributes`,
`included` — dans un fichier de `domain/`.

**Correction.** Renvoyer l'objet du domaine, et laisser le sérialiseur produire la forme. Le
déplacement est mécanique quand la mise en forme est isolée ; il ne l'est pas quand le usecase a
construit un objet sur mesure, auquel cas il faut décider si la bonne réponse est un read-model.

### X3. Le fichier de câblage des usecases importe l'infrastructure

**Ce que dit la théorie.** Clean Architecture place le câblage dans une couche externe, jamais dans le
domaine.

**Exemple concret.**

```js
// domain/usecases/index.js — un fichier du domaine qui importe l'infrastructure
import { repositories } from '../../infrastructure/repositories/index.js';
```

**Correction.** Aucune sur le fichier. Le déplacer coûterait un fichier par contexte plus tous leurs
importateurs, pour zéro changement de comportement — et le câblage importerait l'infrastructure où
qu'il aille, c'est sa fonction.

Le chemin étant fixe, il est **exempté dans la règle** du § 6, ce qui rend celle-ci activable. Ce que
l'exemption ne couvre pas : le câblage important l'infrastructure d'un **autre** contexte, qui reste
une violation et demande une seconde règle.

`fiche-repository.md` traite le même écart depuis la règle qui l'exempte.

### X4. Dépendances et entrées métier sont mélangées

**Ce que dit la théorie.** Rien directement. L'écart est avec la lisibilité de la frontière, pas avec
un livre.

**Exemple concret.** Un seul objet déstructuré, où rien ne dit ce qui vient de l'appelant et ce qui
vient du câblage :

```js
export async function startCourse({ userId, code, courseRepository, participationRepository }) { … }
```

Un lecteur ne peut pas savoir, sans ouvrir l'index, si `code` est une entrée métier ou une dépendance
injectée.

**Correction.** Aucune décidée. La forme alternative — deux objets de paramètres, `(input, deps)` —
est incrémentale : les fonctions existantes continuent de lire le premier argument, et les nouvelles
déclarent les deux. Elle suppose de vérifier que l'utilitaire d'injection s'en accommode.

C'est un sujet de lisibilité, à instruire séparément et sans rapport avec TypeScript. Ne pas
l'attacher à la migration.

### X5. Un usecase réduit à un seul appel de repository

**Ce que dit la théorie.** Un usecase réalise une intention. Une délégation n'en est pas une.

**Exemple concret.**

```js
export async function getThing({ id, thingRepository }) {
  return thingRepository.getById({ id });
}
```

**Correction.** Aucune. L'ADR 20 rend le usecase obligatoire, et le bénéfice est réel : le point
d'entrée est toujours au même endroit, donc ajouter une règle plus tard ne change pas la structure ni
les appelants. Le coût est un fichier et un test.

Ce qui rouvrirait le dossier : constater que la majorité des usecases d'un contexte sont des
délégations. Ce serait un signal sur le découpage, pas sur la convention.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve : introduire la violation, confirmer que l'outil sort, retirer la
violation.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **U3** aucun import d'infrastructure | règle `dependency-cruiser` de chemin, avec exemption du câblage | configuration seule | aucun |
| **U9** API interne obligatoire | règle `dependency-cruiser` au grain de la couche | configuration seule | aucun, si « un autre contexte » est bien exprimé |
| **U5** aucune notion de transport | règle ESLint : identifiant `request` ou `h`, ou import du framework HTTP | ~20 lignes | aucun attendu |
| **U8** enregistré dans l'index | script `tests/tooling/` | ~30 lignes | aucun |
| Le discriminant du § 1 | règle ESLint : un fichier de `domain/services/` reçoit un paramètre en `/(Repository\|Api\|Storage)$/` | ~20 lignes | aucun, mais **sortira sur l'existant** |
| **U4** nom de verbe | script : nom en kebab-case commençant par un verbe | ~20 lignes | **à mesurer** — la liste des verbes est ouverte |
| **U1**, **U2**, **U6**, **U7** | revue | — | — |

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

L'exemption du `pathNot` est ce qui rend la règle activable malgré X3. Elle est plus large que
nécessaire sur un point : le fichier exempté peut alors importer l'infrastructure d'un **autre**
contexte, ce qui reste une violation.

```js
{
  name: 'context-dependency-must-target-internal-api',
  severity: 'error',
  from: { path: 'src/.+/domain/' },
  to: { path: 'src/.+/(domain|infrastructure)/' },   // à affiner : uniquement vers un AUTRE contexte
}
```

La seconde est la plus utile et la plus délicate à écrire : il faut exprimer « un autre contexte que
le sien », ce que `dependency-cruiser` fait par groupes capturés dans les chemins. **À vérifier par
contre-épreuve avant de committer.**

`severity: 'error'` est obligatoire dans les deux cas : la valeur par défaut est `warn`, et seul
`error` fait échouer la commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à
sous-contextes ne sont pas atteints et la règle ne se déclenche jamais, sans le signaler.

### Le discriminant — la règle qui force la décision

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom finit par `Repository`, `Api` ou
`Storage` fait des I/O, donc n'est pas un service de domaine.

Elle est triviale à écrire et sortira sur l'existant. **C'est son intérêt** : elle transforme une
ambiguïté de vocabulaire en décision datée. À introduire en avertissement le temps de trancher X1 de
`fiche-service-domaine.md`.

Le même parcours d'AST sert I1 étape 1 de `fiche-repository.md`, qui repère déjà les paramètres en
`/Api$/`.

### Ce qui n'est pas mécanisable

U1 est le plus important et le moins vérifiable : distinguer une condition d'orchestration d'une règle
métier demande de savoir ce qui est métier. Aucun proxy fiable n'est identifié.

Un indicateur imparfait, à ne pas transformer en règle : la **complexité cyclomatique** d'un usecase.
Un usecase très ramifié porte souvent des règles. C'est un signal pour la revue, pas un verdict, et le
transformer en seuil bloquant produirait des contournements plutôt que des corrections.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **U3** — configuration `dependency-cruiser`, avec l'exemption du câblage et contre-épreuve
2. **U5** — première règle ESLint sur mesure
3. **U8** — script de complétude de l'index
4. **Le discriminant** — en avertissement, pour produire la liste des fichiers de `services/` à classer
5. **U9** — après avoir su exprimer « un autre contexte que le sien »
6. **U4** — après mesure des faux positifs sur la liste des verbes

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **U8** index | oui, complet | Insérer l'import et la clé dans l'index. Purement syntaxique |
| **U4** nommage | oui, complet | Renommer le fichier et réécrire ses imports |
| Le discriminant | oui, une fois le classement fait | Déplacer un fichier de `services/` vers `usecases/` et réécrire ses imports. Signaler si son câblage est dédié |
| **X2** objet de réponse | partiel | Retirer l'enveloppe, oui. Décider si la bonne réponse est un read-model, non |
| **X1** règle dans le usecase | non | Déplacer une règle vers le bon objet est de la conception |

---

## 7. Le type

Un usecase se type **une fois que ses dépendances le sont**. Il est en bout de chaîne : il consomme
des ports et des modèles, donc son typage ne vérifie rien tant que ceux-ci sont en JavaScript.

```ts
type StartCourseInput = { userId: number; code: string };
type StartCourseDeps = { courseRepository: CourseRepository; userRepository: UserRepository };

export async function startCourse(input: StartCourseInput, deps: StartCourseDeps): Promise<void> { … }
```

La forme ci-dessus sépare entrées et dépendances, ce qui n'est pas la convention actuelle. Avec un
seul objet, le typage reste possible et correct :

```ts
export async function startCourse(params: StartCourseInput & StartCourseDeps): Promise<void> { … }
```

La signature ne distingue toujours pas les deux — c'est X4, et le typage ne le résout pas. Les deux
sujets sont indépendants : la séparation est une décision de lisibilité, pas une conséquence de la
migration.

Ce que le typage apporte réellement ici : les ports déclarés rendent vérifiable ce que le usecase
appelle sur ses dépendances. Une méthode absente ou mal nommée devient une erreur de compilation, là
où elle échoue aujourd'hui à l'exécution. C'est le § 7 de `fiche-repository.md`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Usecase | **intégration uniquement** — base réelle, fixtures | l'orchestration de bout en bout et le résultat |
| Sous-usecase partagé, avec I/O | **intégration**, comme un usecase | idem |

Le choix de tester les usecases en intégration seulement est une convention d'équipe. Elle évite des
tests unitaires qui ne feraient que vérifier l'ordre des appels à des doublures, ce qui reproduit
l'implémentation au lieu de la contraindre.

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Un indice de diagnostic, avec sa borne. **Si un usecase demande beaucoup de fixtures pour un cas
simple, c'est souvent que son agrégat est trop gros** — voir A6 de `fiche-racine-agregat.md`. La
borne : un usecase qui traverse légitimement plusieurs agrégats en demandera beaucoup sans qu'aucun
soit trop gros.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [humain]  U1  Aucun calcul métier ; les if portent sur l'existence, pas sur des propriétés métier
[ ] [auto]    U9  Aucun accès au domaine ni à l'infrastructure d'un autre contexte — API interne seulement
[ ] [auto]    U3  Aucun import d'infrastructure
[ ] [humain]  U2  Toutes les dépendances arrivent en paramètres
[ ] [auto]    U5  Aucune notion de transport : ni request, ni code HTTP, ni sérialisation
[ ] [humain]  U6  Renvoie des objets du domaine local, jamais un DTO étranger ni un objet de réponse
[ ] [humain]  U7  Le périmètre atomique est explicite quand plusieurs écritures ont lieu
[ ] [partiel] U4  Un fichier, un nom de verbe en kebab-case, langage ubiquitaire du contexte
[ ] [auto]    U8  Enregistré dans l'index des usecases
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du usecase
[ ] [humain]  Test d'intégration ; un fichier de services/ sans I/O est testé en unitaire pur
[ ] [auto]    Si le fichier est dans services/ et reçoit une I/O, c'est un usecase
```

À terme il reste cinq lignes, toutes de jugement : U1, U2, U6, U7 et le type de test. U1 est le plus
rentable des invariants de cette fiche et il figure parmi les cinq — c'est la tension relevée au § 4.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le usecase comme couche | Martin, *Clean Architecture*, ch. « Business Rules » — distinction *Entities* / *Use Cases* | le livre de 2017 ; billet « The Clean Architecture » gratuit |
| **U1** aucune règle métier | Martin, même ch. — les règles d'entreprise sont dans les entités, les règles applicatives dans les usecases. Fowler, « AnemicDomainModel » pour le symptôme inverse | bliki gratuit |
| **U2** dépendances injectées | Martin, ch. « The Dependency Inversion Principle ». Pix : **ADR 46**, avec son motif ESM | ADR 46 |
| **U3** aucun import d'infrastructure | Martin, « The Clean Architecture » — la règle de dépendance | billet gratuit |
| **U4** une intention, un fichier | Pix : **ADR 20** pour le caractère obligatoire, **ADR 51** pour l'arborescence. Le nommage par verbe n'a **aucune source** | ADR 20 et 51 |
| **U5**, **U6** aucune notion de transport | Martin, ch. « Presenters and Humble Objects » | le livre de 2017 |
| **U7** périmètre transactionnel | Pix : **ADR 25**, qui remplace l'ADR 9 et interdit les événements dans une transaction, sur un motif mesuré — des deadlocks en production. Le critère échouer-ensemble / indépendamment vient de ses conséquences. Vernon, règle 4, pour la cohérence différée | ADR 25 ; dddcommunity.org |
| **U8** enregistré dans l'index | **aucune source** — outillage Pix | — |
| **U9** API interne obligatoire | Pix : **ADR 55**, qui décide les APIs internes synchrones et énumère les coûts acceptés | ADR 55 |
| Le discriminant avec le service de domaine | Evans, *DDD*, ch. « A Model Expressed in Software » — le Service y est défini sans état et sans I/O | *DDD Reference* |

**Deux invariants sur neuf n'ont aucune source** : U8, et le nommage par verbe de U4. Quatre
invariants renvoient directement à un ADR Pix, ce qui les rend contestables sur pièces plutôt que par
appel à une autorité.
