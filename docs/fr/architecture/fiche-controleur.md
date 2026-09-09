# Fiche — Contrôleur

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - L'ADR 13, sur la gestion des erreurs entre l'API et l'IHM, n'a pas été lu. Il pourrait préciser le
>   rôle du mappeur d'erreurs invoqué par `C2`, voire le contredire.
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés.
> - L'écart « le contrôle des droits est écrit dans le contrôleur » n'est pas énoncé ici. Il l'est sous
>   `X1` de `fiche-route.md`, où vivent sa correction et sa vérification.

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
| [**C1**](#c1-un-seul-usecase-par-point-dentrée) | un seul usecase par point d'entrée | **forte** | règle ESLint |
| [**C2**](#c2-aucune-décision) | aucune décision | **forte** | règle ESLint, à mesurer |
| [**C4**](#c4-aucun-accès-direct-aux-données) | aucun accès direct aux données | **forte** | `dependency-cruiser` |
| [**C3**](#c3-le-sérialiseur-est-injecté-par-valeur-de-paramètre-par-défaut) | le sérialiseur est injecté par valeur de paramètre par défaut | moyenne | revue |
| [**C5**](#c5-un-contrôleur-par-ressource-une-fonction-par-action) | un contrôleur par ressource, une fonction par action | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-deux-usecases-sont-appelés-à-la-suite) | deux usecases sont appelés à la suite | **à corriger** |
| [**X2**](#x2-un-code-derreur-est-choisi-dans-le-contrôleur) | un code d'erreur est choisi dans le contrôleur | **à corriger** |
| [**X3**](#x3-un-accès-direct-au-repository-ou-au-domaine-dun-voisin) | un accès direct au repository, ou au domaine d'un voisin | **à corriger** |
| [**X4**](#x4-les-usecases-sont-importés-sans-injection) | les usecases sont importés sans injection | rien à faire |

---

## 1. Rôle

Un contrôleur traduit une requête HTTP en un appel de usecase, et le résultat en réponse.

Trois étapes, dans cet ordre, et rien entre : **extraire**, **appeler**, **rendre**.

```js
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) {
  const { campaignParticipationId } = request.params;
  const userId = extractUserIdFromRequest(request);

  const results = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  return h.response(dependencies.questResultSerializer.serialize(results));
};
```

C'est un *humble object* au sens de Martin : assez bête pour que son test soit trivial, afin que tout
ce qui mérite d'être testé sérieusement le soit ailleurs.

**Le ROI de cette couche est presque entièrement négatif** : il vient de ce que le contrôleur ne
contient pas. C'est ce qui explique la brièveté de la fiche — et une fiche longue sur un contrôleur
serait le signe qu'on lui demande trop.

### Ce qu'un contrôleur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un contrôleur.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| réalise l'intention métier | un usecase | `fiche-usecase.md` |
| valide la forme des entrées | la route | `fiche-route.md` |
| contrôle les droits | un pre-handler déclaré sur la route | `fiche-route.md` |
| met en forme la réponse | un sérialiseur | `fiche-serialiseur.md` |
| choisit un code d'erreur à partir d'une erreur métier | le mappeur d'erreurs du contexte | — |
| accède aux données | un repository, appelé par un usecase | `fiche-repository.md` |
| expose une capacité à un autre contexte | `application/api/` | `fiche-api-interne.md` |

---

## 2. Invariants

### C1. Un seul usecase par point d'entrée

**Énoncé.** Une fonction de contrôleur appelle un usecase, et un seul.

```js
// fautif — quelle est l'intention métier de cette séquence ?
await usecases.archiveCourse({ courseId });
await usecases.notifyParticipants({ courseId });

// conforme — l'intention composée a un nom, un fichier et un test d'intégration
await usecases.archiveCourseAndNotifyParticipants({ courseId });
```

**Ce qui casse.** La composition vit dans un contrôleur, où elle n'est vérifiée qu'en acceptance — le
test le plus lent et le plus tardif du dépôt. Et l'intention n'a pas de nom, donc elle est
introuvable : personne ne peut savoir qu'elle existe sans lire le contrôleur.

C'est le seul invariant de cette fiche qui **déplace du coût de vérification** plutôt que d'en
retirer.

**Faux ami légitime** : un usecase d'écriture suivi d'un usecase de lecture pour construire la
réponse. Parfois justifié, parfois le signe que le premier devrait renvoyer ce qu'il faut. À trancher
au cas par cas — voir § 3.

### C2. Aucune décision

**Énoncé.** Pas de règle métier. Pas de code d'erreur choisi ici. Pas de transformation au-delà de
l'extraction.

Le code de **succès** est une propriété constante de la route — 200, 201, 204 selon la nature de
l'opération. Les codes d'**erreur** viennent du mappeur d'erreurs : le contrôleur laisse remonter
l'erreur du domaine.

```js
// fautif — la décision de statut est prise ici
const result = await usecases.getSomething({ id });
if (!result) return h.response().code(404);

// conforme — le usecase lève, le mappeur traduit
const result = await usecases.getSomething({ id });
return h.response(serializer.serialize(result));
```

**Ce qui casse.** Le même cas d'absence produit deux réponses différentes selon le point d'entrée
emprunté, et le front ne reçoit pas le code d'erreur exploitable que le mappeur aurait produit. C'est
le pendant applicatif de `I4` de `fiche-repository.md` : le repository lève une erreur du domaine, le
mappeur lui associe un statut, personne au milieu ne décide.

### C3. Le sérialiseur est injecté par valeur de paramètre par défaut

**Énoncé.** Le sérialiseur arrive par un troisième paramètre dont la valeur par défaut le fournit.

```js
const handler = async function (request, h, dependencies = { someSerializer }) { … }
```

**Ce qui casse.** Sous ESM les exports sont immuables : sans cette forme, le sérialiseur ne peut pas
être substitué en test, donc le contrôleur n'est pas testable en unitaire. C'est la même contrainte
technique que celle qui motive l'injection ailleurs, décidée par l'ADR 46.

### C4. Aucun accès direct aux données

**Énoncé.** Ni repository, ni client de stockage, ni API interne, ni usecase d'un autre contexte. Le
contrôleur ne connaît que les usecases de **son** contexte.

```js
// fautif — la porte dérobée
import { thingRepository } from '../../infrastructure/repositories/index.js';

// fautif — la frontière franchie hors API interne
import { usecases } from '../../../autre-contexte/domain/usecases/index.js';
```

**Ce qui casse.** Une lecture « juste pour afficher » contourne les règles du domaine, et la même
question reçoit deux réponses selon le chemin emprunté. C'est la voie la plus courte pour qu'une règle
cesse d'être appliquée sans que personne l'ait décidé.

**L'exception à ne pas généraliser** : les usecases du contexte courant sont importés directement,
sans injection, parce que le framework HTTP ne permet pas d'injecter dans les routes. C'est `X4` au
§ 5. Cette exception ne s'étend **pas** aux usecases d'un autre contexte — franchir une frontière
passe par l'API interne, `U9` de `fiche-usecase.md`.

### C5. Un contrôleur par ressource, une fonction par action

**Énoncé.** Le fichier porte le nom de la ressource ; chaque fonction exportée porte le nom de
l'action ; elles sont regroupées dans un objet exporté que la route référence.

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier prévisible et réduit le
bruit de revue. Il rend aussi `C1` plus facile à vérifier, en donnant à la règle du § 6 une unité
claire à parcourir.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Les usecases du contexte importés sans injection | **autorisé**, contrainte du framework. `C4`, et voir `X4` |
| L'utilisateur extrait de la requête via un utilitaire partagé | **autorisé**, c'est de l'extraction |
| Un code de succès non standard — 201, 204 | **autorisé** — propriété constante de la route. `C2` |
| Un `if` sur la présence d'un paramètre optionnel | **autorisé** |
| Un flux ou un fichier renvoyé plutôt qu'un objet sérialisé, avec ses en-têtes | **autorisé** |
| Un usecase d'écriture suivi d'un usecase de lecture | **à discuter** — parfois justifié, parfois le signe que le premier devrait renvoyer ce qu'il faut. `C1` |
| Deux usecases métier enchaînés | **pas une exception** — intention sans nom. C'est `X1` |
| Le contrôle des droits écrit ici | **pas une exception** — voir `R2` et `X1` de `fiche-route.md` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **C1** un seul usecase | **forte** | Chaque intention métier a un nom, un fichier et un test d'intégration. Sans lui, la composition n'est vérifiée qu'en acceptance |
| **C2** aucune décision | **forte** | Le contrôleur devient trivial, donc son test aussi, donc l'effort se concentre là où est la valeur. C'est le mécanisme du *humble object* |
| **C4** aucun accès aux données | **forte** | Empêche la porte dérobée : une lecture qui contourne les règles du domaine et crée deux comportements pour la même question |
| **C3** sérialiseur injecté | moyenne | Rend le contrôleur testable en unitaire sans monter de serveur. Le gain est réel mais borné : ces tests sont peu nombreux et peu coûteux |
| **C5** un contrôleur par ressource | hygiène | Aucun gain mesurable. Rend le fichier prévisible, et donne à la règle de `C1` une unité claire à parcourir |

### Ce que ça n'apporte pas

Rien ici ne dit si l'API HTTP est bien conçue — découpage des ressources, granularité, cohérence des
adresses. Un contrôleur irréprochable peut servir une API pénible.

Et le ROI de cette couche étant négatif, il a une borne : appliquer les cinq invariants ne rend pas le
contrôleur bon, ça le rend **absent du raisonnement**. C'est l'objectif.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Deux usecases sont appelés à la suite | dérive | Une intention composée existe sans nom, donc introuvable, et vérifiée seulement en acceptance | Pas de fichier de plus à écrire, et la séquence se lit d'une traite | **À corriger** |
| **X2** Un code d'erreur est choisi dans le contrôleur | dérive | Le même cas produit deux réponses selon le point d'entrée, et le front perd le code d'erreur exploitable | Le statut est décidé au plus près de la réponse, sans passer par le domaine | **À corriger** |
| **X3** Un accès direct au repository, ou au domaine d'un voisin | dérive | Les règles du domaine sont contournées, et une frontière de contexte est franchie hors contrat | La lecture est immédiate, sans usecase ni API interne à écrire | **À corriger** |
| **X4** Les usecases sont importés sans injection | convention assumée | Le contrôleur ne peut pas substituer ses usecases en test, donc ses tests unitaires portent sur les sérialiseurs seulement | Réel — le framework HTTP ne permet pas d'injecter dans les routes, et l'alternative serait un conteneur à câbler | *Rien à faire* |

### X1. Deux usecases sont appelés à la suite

**Ce que dit la théorie.** L'adaptateur d'entrée ne compose pas. La composition d'intentions est du
travail de usecase — Martin la place dans la couche *Use Cases*, pas dans l'adaptateur.

**Exemple concret.**

```js
const archive = async function (request, h) {
  const { courseId } = request.params;
  await usecases.archiveCourse({ courseId });
  await usecases.notifyParticipants({ courseId });
  return h.response().code(204);
};
```

Le signe qui ne trompe pas : deux `await usecases.` dans la même fonction.

**Correction.** Nommer l'intention composée et la déplacer dans `domain/usecases/`. Le contrôleur
retrouve un seul appel.

Ce qui rend la correction non mécanique : il faut trouver le nom, et décider si la séquence est bien
une intention unique du point de vue métier. Si elle ne l'est pas, c'est le découpage de l'API qu'il
faut revoir, pas le contrôleur.

Le cas « écriture puis lecture » est à traiter à part : voir le faux ami de `C1`.

### X2. Un code d'erreur est choisi dans le contrôleur

**Ce que dit la théorie.** L'adaptateur traduit, il ne décide pas. Le passage d'une erreur du domaine
à un code HTTP est une traduction, donc elle a un endroit unique.

**Exemple concret.**

```js
const result = await usecases.getSomething({ id });
if (!result) return h.response().code(404);
```

Deux défauts en un : la décision est prise ici, et le usecase renvoie `null` là où `I3` de
`fiche-repository.md` voudrait qu'un `get*` lève.

**Correction.** Faire lever le domaine, et laisser le mappeur d'erreurs traduire. Le contrôleur perd
sa condition.

Ce qui rend la correction non mécanique : il faut choisir l'erreur de domaine à lever, ce qui
détermine le code HTTP **et** le code d'erreur exploitable par le front. C'est la même décision que
celle de `X4` de `fiche-repository.md`.

### X3. Un accès direct au repository, ou au domaine d'un voisin

**Ce que dit la théorie.** La règle de dépendance : la couche externe n'atteint pas l'infrastructure
en sautant le domaine. Et l'ADR 55 décide que toute frontière de contexte passe par l'API interne.

**Exemple concret.**

```js
import { thingRepository } from '../../infrastructure/repositories/index.js';
import { usecases as voisinUsecases } from '../../../autre-contexte/domain/usecases/index.js';
```

**Correction.** Mécanique dans le premier cas : écrire le usecase qui manque, souvent une délégation
d'une ligne — ce que l'ADR 20 admet, voir `X5` de `fiche-usecase.md`.

Moins mécanique dans le second : il faut vérifier que le contexte voisin expose bien la capacité par
son API interne, et l'y ajouter sinon. C'est `fiche-api-interne.md`.

Les deux cas se vérifient par configuration seule, ce qui les rend faciles à empêcher pour l'avenir
même si le rattrapage prend du temps.

### X4. Les usecases sont importés sans injection

**Ce que dit la théorie.** Les dépendances arrivent en paramètres. C'est `U2` de `fiche-usecase.md`,
et le motif ESM vaut ici aussi : un export importé ne peut pas être substitué.

**Exemple concret.**

```js
import { usecases } from '../../domain/usecases/index.js';   // pas injecté
```

**Correction.** Aucune. Le framework HTTP construit les routes au démarrage sans passer par un
conteneur d'injection, donc le contrôleur n'a pas de point d'entrée où recevoir ses usecases.
L'ADR 46 assume explicitement cette exception.

Ce que la convention coûte réellement est borné : les tests unitaires de contrôleur substituent le
sérialiseur — c'est `C3` — et vérifient que le bon usecase est appelé avec les bons paramètres en
espionnant le module. Ce qui n'est pas substituable n'a pas besoin de l'être, la logique étant
ailleurs.

Ce qui rouvrirait le dossier : l'introduction d'un conteneur d'injection pour d'autres raisons. À ce
moment-là, l'exception cesse d'être nécessaire.

---

## 6. Vérification déterministe

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **C4** aucun accès aux données | règle `dependency-cruiser` : `application/**` ne dépend pas de `infrastructure/repositories/**` | configuration seule | aucun |
| **C4** frontière de contexte | règle `dependency-cruiser` : aucune dépendance vers le domaine d'un **autre** contexte | configuration | aucun, si « un autre contexte » est bien exprimé |
| **C1** un seul usecase | règle ESLint : plus d'un appel sur `usecases` dans une fonction de contrôleur | ~30 lignes | faibles — le cas « écriture puis lecture » |
| **C2** aucune décision | règle ESLint : `.code()` avec un littéral supérieur ou égal à 400 | ~20 lignes | **à mesurer** |
| **C5** nommage | script `tests/tooling/` : nom du fichier et de l'objet exporté | ~20 lignes | aucun |
| **C3** sérialiseur injecté | revue | — | — |

### C4 — la plus rentable, et elle est en configuration

```js
{
  name: 'controller-must-not-access-repositories',
  severity: 'error',
  from: { path: 'src/.+/application/' },
  to: { path: 'src/.+/infrastructure/repositories/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans le signaler. Contre-épreuve obligatoire.

La seconde règle — la frontière de contexte — est la même que `U9` de `fiche-usecase.md`, avec la même
difficulté : exprimer « un autre contexte que le sien ». Une seule configuration couvre les deux
couches.

### C1 — compter les appels de usecase

Décidable localement : compter les appels de méthode sur l'identifiant `usecases` dans le corps d'une
fonction exportée d'un fichier de contrôleur. Plus d'un, on signale.

Faux positif attendu sur le cas « écriture puis lecture ». **À traiter par exclusion nominative**
plutôt qu'en affaiblissant la règle : une liste de fonctions exemptées, courte et relue, vaut mieux
qu'un seuil à deux qui laisserait passer les vrais cas.

### C2 — les codes d'erreur

Un `.code()` avec un littéral supérieur ou égal à 400 dans un contrôleur est un signal fiable.

Faux positif possible sur les chemins qui ne passent pas par le domaine — un téléversement trop
volumineux, par exemple — à exclure explicitement. Le code de **succès** n'est pas concerné : la règle
ne porte que sur le seuil 400.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **C4** — les deux règles de chemin, mutualisées avec `fiche-usecase.md`
2. **C5** — script de nommage
3. **C2** — règle ESLint, après mesure des chemins hors domaine
4. **C1** — règle ESLint, avec sa liste d'exclusion

### Codemods

Peu de matière, et c'est cohérent avec la nature de la couche.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** accès direct | partiel | Remplacer un appel de repository par un appel de usecase existant, oui. Écrire le usecase manquant, non |
| **X1** deux usecases | non | Trouver le nom de l'intention composée est de la conception |
| **X2** code d'erreur | non | Choisir l'erreur de domaine détermine le code HTTP et le code d'erreur |

---

## 7. Le type

**Le gain est faible sur cette couche, et il faut le dire.** Les objets de requête et de réponse du
framework sont typés de façon large, et la validation déclarée sur la route produit un contrôle à
l'exécution que le typage ne connaît pas : le type de `request.params` n'est pas déduit du schéma de la
route.

Ce que le typage apporte réellement : typer le troisième paramètre documente ce qui est substituable en
test, et les usecases typés rendent vérifiable ce que le contrôleur appelle sur eux — une méthode
absente devient une erreur de compilation.

```ts
const getById = async function (
  request: Request,
  h: ResponseToolkit,
  dependencies = { thingSerializer },
) { … }
```

C'est un candidat **tardif** : le contrôleur est en bout de chaîne, donc son typage ne vérifie rien
tant que les usecases et les sérialiseurs sont en JavaScript.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Contrôleur | **unitaire**, usecase et sérialiseur substitués | que le bon usecase est appelé avec les bons paramètres, et que la réponse est sérialisée |

Rien d'autre. Les statuts et la sécurité se vérifient au niveau de la route, en acceptance — voir
`fiche-route.md`.

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Un indice de diagnostic, avec sa borne. **Un test de contrôleur qui demande des fixtures métier est le
signe que `C1` ou `C2` est violé** : le contrôleur décide de quelque chose qui dépend de l'état.
La borne : un contrôleur qui renvoie un fichier peut demander un montage sans rien décider.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce qu'elle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [auto]    C4  Aucun accès aux repositories ; aucun usecase d'un autre contexte
[ ] [partiel] C1  Un seul usecase appelé
[ ] [partiel] C2  Aucune décision : ni règle métier, ni code d'erreur choisi ici
[ ] [humain]  C3  Le sérialiseur est injecté par valeur de paramètre par défaut
[ ] [auto]    C5  Nom de fichier = ressource, nom de fonction = action, objet exporté
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du contrôleur
[ ] [humain]  Test unitaire avec usecase et sérialiseur substitués, sans fixture métier
[ ] [humain]  Aucun contrôle de droit ici — voir R2 de fiche-route.md
```

À terme il reste quatre lignes, toutes de jugement, et la part automatisable de cette fiche est
élevée : trois de ses cinq invariants se vérifient sans revue. C'est la contrepartie d'une couche dont
le rôle est de ne rien contenir — ce qui ne doit pas y être se détecte mieux que ce qui doit y être.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, et **C2** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le contrôleur est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit |
| **C1** un usecase par point d'entrée | Pix : **ADR 20**, qui rend le usecase obligatoire pour toute route | ADR 20 |
| **C3** sérialiseur injecté | Pix : **ADR 46**, et son motif ESM. L'exception des usecases non injectés y est explicitement assumée | ADR 46 |
| **C4** aucun accès aux données | Martin, « The Clean Architecture » — la règle de dépendance. Pix : **ADR 55** pour la frontière entre contextes | billet gratuit ; ADR 55 |
| **C5** nommage | **aucune source** — convention de rangement | — |
| Le mappeur d'erreurs (`C2`, `X2`) | Pix : **ADR 44**, qui rend le code d'erreur obligatoire. **ADR 13** non lu — voir l'encadré en tête | ADR 13 et 44 |

**Un invariant sur cinq n'a aucune source** : `C5`, et c'est celui que le § 4 classe en hygiène. Les
quatre autres renvoient à Martin ou à un ADR, ce qui les rend contestables sur pièces.
