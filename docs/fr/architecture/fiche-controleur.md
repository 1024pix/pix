# Fiche — Contrôleur

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - L'ADR 13 conforte `C2` sans le contredire, mais son état est `Proposed` : il ne peut pas être
>   cité comme une décision. Voir le § 10.
> - Ouvrir une transaction dans un contrôleur est la forme que prescrivait l'ADR 9, remplacé par
>   l'ADR 25. La forme dominante place la transaction dans le usecase. Voir `C2`.
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés.

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
| [**X4**](#x4-les-usecases-sont-importés-sans-injection) | les usecases sont importés sans injection | **à corriger** |

Hors numérotation : la [table de décision](#ce-quun-contrôleur-nest-pas) du § 1. L'écart « le
contrôle des droits est écrit dans le contrôleur » n'est pas dans cette fiche : il est sous
[`X1` de `fiche-route.md`](fiche-route.md#x1-le-contrôle-des-droits-est-écrit-dans-le-contrôleur), avec
sa correction et sa vérification.

---

## 1. Rôle

Un contrôleur traduit une requête HTTP en un appel de usecase, et le résultat en réponse.

Trois étapes, dans cet ordre, et rien entre : **extraire**, **appeler**, **rendre**.

```js
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) {
  const { campaignParticipationId } = request.params;
  const userId = extractUserIdFromRequest(request);

  const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  return h.response(dependencies.questResultSerializer.serialize(questResults));
};
```

C'est un *humble object* au sens de Martin. Il est assez simple pour que son test soit trivial, afin
que tout ce qui mérite un vrai test soit testé ailleurs.

Le **ROI** de cette couche est presque entièrement négatif : il vient de ce que le contrôleur ne
contient pas.

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
const passage = await usecases.createPassage({ moduleId, userId });

const passageStartedData = {
  contentHash: moduleVersion,
  occurredAt: new Date(occurredAt),
  passageId: passage.id,
  sequenceNumber,
  type: 'PASSAGE_STARTED',
};

await usecases.recordPassageEvents({ events: [passageStartedData] });

// conforme — version corrigée : l'intention composée a un nom, un fichier et un test d'intégration
const passage = await usecases.startPassage({ moduleId, moduleVersion, userId, occurredAt, sequenceNumber });
```

Le coût de la violation dépasse « deux appels au lieu d'un ». Entre les deux appels, le contrôleur
**fabrique la charge de l'événement** :

- il fixe le type `PASSAGE_STARTED` ;
- il convertit la date ;
- il relie l'événement au passage créé et à la version du module.

Ce sont des décisions du domaine, prises dans un fichier testé en unitaire avec des doublures. Aucune
n'est donc vraiment testée.

**Ce qui casse.** La composition vit dans un contrôleur, où seul le test d'acceptance la vérifie.
C'est le test le plus lent et le plus tardif du dépôt. De plus, l'intention n'a pas de nom, donc elle
est introuvable : personne ne peut savoir qu'elle existe sans lire le contrôleur.

C1 est le seul invariant de cette fiche qui **déplace du coût de vérification** au lieu d'en retirer.

**Faux ami légitime.** Un usecase d'écriture suivi d'un usecase de lecture pour construire la
réponse. Il s'examine au cas par cas : il est parfois justifié, parfois le signe que le premier
usecase ne renvoie pas ce que la réponse demande. Voir le § 3.

### C2. Aucune décision

**Énoncé.** Pas de règle métier. Pas de code d'erreur choisi ici. Pas de transformation au-delà de
l'extraction.

Le code de **succès** est une propriété constante de la route : 200, 201 ou 204 selon la nature de
l'opération. Les codes d'erreur viennent du mappeur d'erreurs : le contrôleur laisse remonter
l'erreur du domaine.

**Le contrat du front.** Le mappeur sert ce contrat, qui n'est pas le statut HTTP mais l'objet d'erreur
complet :

- un `code` fonctionnel, qui identifie la règle violée ;
- un objet `meta`, qui porte les informations dont le front a besoin pour composer son message.

L'ADR 13, à l'état `Proposed`, décrit cette structure. C'est elle qui permet **plusieurs messages
pour un même statut HTTP**. Un `.code(404)` écrit à la main produit une réponse sans `code` et sans
`meta` : le front retombe alors sur son message générique.

**Le cas de la transaction.** Ouvrir une transaction dans un contrôleur, avec
`DomainTransaction.execute` autour de l'appel, est la forme que prescrivait l'ADR 9. L'ADR 25 a
remplacé l'ADR 9. La forme dominante place la transaction dans le usecase, ce qui est cohérent avec
`U7` de `fiche-usecase.md` : c'est le usecase qui sait ce qui doit être atomique. Un contrôleur qui
ouvre une transaction décide donc quelque chose, ce que `C2` exclut.

```js
// fautif — la transaction enveloppe un seul appel de usecase
const createdOrUpdatedTrainingTrigger = await DomainTransaction.execute(async () => {
  return usecases.createOrUpdateTrainingTrigger({ trainingId, threshold, tubes, type });
});

// conforme — version corrigée : la transaction est ouverte dans le usecase, le contrôleur l'appelle seulement
const createdOrUpdatedTrainingTrigger = await usecases.createOrUpdateTrainingTrigger({ trainingId, threshold, tubes, type });
```

L'extrait fautif ne contient **qu'un** appel de usecase. Le contrôleur ne compose rien. La
transaction ne lui sert donc à rien qu'elle ne servirait mieux dans le usecase, où le périmètre
atomique se lit avec la règle qu'il protège.

```js
// fautif — la décision de statut est prise ici
const replication = replicationRepository.getByName(replicationName);

if (!replication) {
  return h.response().code(404);
}

// conforme — le usecase lève, le mappeur traduit
const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });
return h.response(dependencies.questResultSerializer.serialize(questResults));
```

La forme fautive cumule deux violations : elle choisit le statut, **et** elle lit un repository, ce
qui enfreint `C4`. Les deux vont souvent ensemble, parce qu'un contrôleur qui charge lui-même n'a
personne à qui déléguer la décision d'absence.

**Ce qui casse.** Le même cas d'absence produit deux réponses différentes selon le point d'entrée
emprunté. Le front ne reçoit pas le code d'erreur exploitable que le mappeur aurait produit. C'est le
pendant applicatif de `I4` de `fiche-repository.md` : le repository lève une erreur du domaine, le
mappeur lui associe un statut, et personne au milieu ne décide.

### C3. Le sérialiseur est injecté par valeur de paramètre par défaut

**Énoncé.** Le sérialiseur arrive par un troisième paramètre dont la valeur par défaut le fournit.

```js
// fautif — le sérialiseur importé est appelé directement
async function getAllModulesMetadata() {
  const modulesMetadata = await usecases.getModuleMetadataList();

  return moduleMetadataSerializer.serialize(modulesMetadata);
}

// conforme — le sérialiseur arrive par le troisième paramètre
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) { … }
```

**Ce qui casse.** Sous ESM, les exports sont immuables. Sans cette forme, le sérialiseur ne peut pas
être substitué en test, donc le contrôleur n'est pas testable en unitaire. C'est la même contrainte
technique que celle qui motive l'injection ailleurs, décidée par l'ADR 46.

### C4. Aucun accès direct aux données

**Énoncé.** Ni repository, ni client de stockage, ni API interne, ni usecase d'un autre contexte. Le
contrôleur ne connaît que les usecases de **son** contexte.

```js
// fautif — un repository lu directement
import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';

// fautif — la frontière franchie hors API interne
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';

// conforme — les usecases du contexte courant, et eux seuls
import { usecases } from '../domain/usecases/index.js';
```

**Ce qui casse.** Une lecture « juste pour afficher » contourne les règles du domaine. La même question
reçoit alors deux réponses selon le chemin emprunté. Une règle peut ainsi cesser d'être appliquée sans
que personne l'ait décidé.

**Les usecases du contexte courant** sont les seuls que le contrôleur reçoit. Dans l'état cible, ils
arrivent par injection ; aujourd'hui, ils sont le plus souvent importés, ce qui est l'écart `X4` au
§ 5. Aucune forme ne s'étend aux usecases d'un autre contexte : franchir une frontière passe par l'API
interne, selon `U9` de `fiche-usecase.md`.

### C5. Un contrôleur par ressource, une fonction par action

**Énoncé.** Le fichier porte le nom de la ressource. Chaque fonction exportée porte le nom de
l'action. Les fonctions sont regroupées dans un objet exporté que la route référence.

```js
// fautif — la fonction est exportée seule, et la route l'importe par son nom
export async function replicate(request, h, dependencies = { … }) { … }

// conforme — un objet exporté regroupe les actions de la ressource
const questController = {
  checkUserQuest,
  getQuestResults,
  createOrUpdateQuestsInBatch,
  getTemplateForCreateOrUpdateQuestsInBatch,
};

export { questController };
```

**Ce qui casse.** Rien à l'exécution. C'est un invariant d'hygiène : il rend le fichier prévisible et
réduit le bruit de revue. Il rend aussi `C1` plus facile à vérifier, parce qu'il donne à la règle du
§ 6 une unité claire à parcourir.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Les usecases du contexte importés sans injection | **toléré** : c'est l'écart `X4`, dont la cible est l'injection. `C4` |
| L'utilisateur extrait de la requête via un utilitaire partagé | **autorisé**, c'est de l'extraction |
| Un code de succès non standard — 201, 204 | **autorisé** — propriété constante de la route. `C2` |
| Un `if` sur la présence d'un paramètre optionnel | **autorisé** |
| Un flux ou un fichier renvoyé plutôt qu'un objet sérialisé, avec ses en-têtes | **autorisé** |
| Un usecase d'écriture suivi d'un usecase de lecture | **examiné au cas par cas** : parfois justifié, parfois le signe que le premier usecase ne renvoie pas ce que la réponse demande. `C1` |
| Un `DomainTransaction.execute` autour de l'appel | **pas une exception** : vestige de l'architecture de l'ADR 9, que l'ADR 25 a remplacé. La transaction appartient au usecase, selon `U7` de `fiche-usecase.md`. `C2` |
| Deux usecases métier enchaînés | **pas une exception** — intention sans nom. C'est `X1` |
| Le contrôle des droits écrit ici | **pas une exception** — voir `R2` et `X1` de `fiche-route.md` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **C1** un seul usecase | **forte** | Chaque intention métier a un nom, un fichier et un test d'intégration. Sans lui, la composition n'est vérifiée qu'en acceptance |
| **C2** aucune décision | **forte** | Le contrôleur devient trivial, donc son test aussi, donc l'effort se concentre là où est la valeur. C'est le mécanisme du *humble object* |
| **C4** aucun accès aux données | **forte** | Le contrôleur ne lit rien en contournant les règles du domaine, donc il ne crée pas de second comportement pour la même question |
| **C3** sérialiseur injecté | moyenne | Rend le contrôleur testable en unitaire sans monter de serveur. Le gain est réel mais limité : ces tests sont peu nombreux et peu coûteux |
| **C5** un contrôleur par ressource | hygiène | Aucun gain mesurable. Rend le fichier prévisible, et donne à la règle de `C1` une unité claire à parcourir |

### Ce que ça n'apporte pas

Ces invariants ne disent pas si l'API HTTP est bien conçue. Ils ne couvrent ni le découpage des
ressources, ni leur granularité, ni la cohérence des adresses. Un contrôleur irréprochable peut servir
une API pénible.

Le ROI de cette couche est négatif, et il a donc une limite. Appliquer les cinq invariants ne rend
pas le contrôleur bon : cela le rend **absent du raisonnement**, ce qui est le but de la couche.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Deux usecases sont appelés à la suite | dérive | Une intention composée existe sans nom, donc introuvable, et vérifiée seulement en acceptance | Pas de fichier de plus à écrire, et la séquence se lit d'une traite | **À corriger** |
| **X2** Un code d'erreur est choisi dans le contrôleur | dérive | Le même cas produit deux réponses selon le point d'entrée, et le front perd le code d'erreur exploitable | Le statut est décidé au plus près de la réponse, sans passer par le domaine | **À corriger** |
| **X3** Un accès direct au repository, ou au domaine d'un voisin | dérive | Les règles du domaine sont contournées, et une frontière de contexte est franchie hors contrat | La lecture est immédiate, sans usecase ni API interne à écrire | **À corriger** |
| **X4** Les usecases sont importés sans injection | vestige | Les usecases n'apparaissent pas dans la signature : le test remplace les méthodes de l'objet `usecases` importé | Faible : aucune enveloppe à poser sur la route | **À corriger** |

### X1. Deux usecases sont appelés à la suite

**Ce que dit la théorie.** L'adaptateur d'entrée ne compose pas. La composition d'intentions est du
travail de usecase : Martin la place dans la couche *Use Cases*, pas dans l'adaptateur.

**Exemple concret.**

```js
const create = async function (request, h, { usecases, passageSerializer }) {
  const {
    'module-id': moduleId,
    'module-version': moduleVersion,
    'occurred-at': occurredAt,
    'sequence-number': sequenceNumber,
  } = request.payload.data.attributes;
  const userId = extractUserIdFromRequest(request);
  const passage = await usecases.createPassage({ moduleId, userId });

  const passageStartedData = {
    contentHash: moduleVersion,
    occurredAt: new Date(occurredAt),
    passageId: passage.id,
    sequenceNumber,
    type: 'PASSAGE_STARTED',
  };

  await usecases.recordPassageEvents({ events: [passageStartedData] });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};
```

Le signal : deux `await usecases.` dans la même fonction.

**Correction.** Nommer l'intention composée et la déplacer dans `domain/usecases/`. Le contrôleur
retrouve un seul appel.

Ce qui rend la correction non mécanique : il faut trouver le nom, et décider si la séquence est bien
une intention unique du point de vue métier. Si elle ne l'est pas, c'est le découpage de l'API qu'il
faut revoir, pas le contrôleur.

Le cas « écriture puis lecture » est à traiter à part : voir le faux ami de `C1`.

### X2. Un code d'erreur est choisi dans le contrôleur

**Ce que dit la théorie.** L'adaptateur traduit, il ne décide pas. Le passage d'une erreur du domaine
à un code HTTP est une traduction, donc cette traduction a un endroit unique.

**Exemple concret.**

```js
const replication = replicationRepository.getByName(replicationName);

if (!replication) {
  return h.response().code(404);
}
```

L'extrait a trois défauts :

- la décision de statut est prise ici ;
- le contrôleur lit un repository, ce que `C4` exclut ;
- `replicationRepository.getByName` renvoie `undefined`, alors que selon `I3` de
  `fiche-repository.md` un `get*` lève.

**Correction.** Faire lever le domaine, et laisser le mappeur d'erreurs traduire. Le contrôleur perd
sa condition.

Ce qui rend la correction non mécanique : il faut choisir l'erreur de domaine à lever. Ce choix
détermine le code HTTP **et** le code d'erreur exploitable par le front. C'est la même décision que
celle de `I4` de `fiche-repository.md`.

### X3. Un accès direct au repository, ou au domaine d'un voisin

**Ce que dit la théorie.** La règle de dépendance : la couche externe n'atteint pas l'infrastructure
en sautant le domaine. De plus, l'ADR 55 décide que toute frontière de contexte passe par l'API
interne.

**Exemple concret.**

```js
import { chatRepository } from '../infrastructure/repositories/index.js';
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';
```

**Correction.** Le premier cas est mécanique : écrire le usecase qui manque. C'est souvent une
délégation d'une ligne, ce que l'ADR 20 admet (voir `X5` de `fiche-usecase.md`).

Le second cas est moins mécanique. Il faut vérifier que le contexte voisin expose la capacité par son
API interne, et l'y ajouter sinon. Voir `fiche-api-interne.md`.

Les deux cas se vérifient par configuration seule. Ils sont donc faciles à empêcher pour l'avenir,
même si le rattrapage prend du temps.

### X4. Les usecases sont importés sans injection

**Ce que dit la théorie.** Les dépendances arrivent en paramètres. C'est `U2` de `fiche-usecase.md`,
et le motif ESM vaut ici aussi : un export importé ne peut pas être substitué.

**Exemple concret.**

```js
// fautif — les usecases sont importés : le test doit remplacer les méthodes de l'objet importé
import { usecases } from '../../domain/usecases/index.js';

// conforme — les usecases arrivent en paramètre, par une enveloppe posée sur la route
handler: handlerWithDependencies(passageController.create),
```

La forme conforme existe déjà : un contexte l'emploie, avec une enveloppe qui passe au contrôleur un
objet `dependencies` contenant les usecases et les sérialiseurs. Le framework HTTP n'empêche donc pas
l'injection des usecases. Sa limite porte sur l'injection des **contrôleurs** dans les routes.

L'ADR 46 écarte l'injection des usecases dans les contrôleurs sans en donner de motif. Cette exception
est un vestige : la cible est l'injection de toutes les dépendances, et un chantier transverse
d'injection est en cours.

**Correction.** Faire recevoir au contrôleur ses usecases en paramètre, par la même enveloppe que le
contexte qui le fait déjà. Le chantier transverse d'injection fixe la forme définitive ; un
contrôleur neuf suit la forme déjà en place.

Le coût de la forme actuelle est limité : les tests unitaires de contrôleur remplacent les méthodes
de l'objet `usecases` importé, et la logique est ailleurs. C'est ce qui rend la correction
progressive plutôt qu'urgente.
---

## 6. Vérification déterministe

Il n'existe aucun plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure.

**Révision.** Ce paragraphe disparaît dès qu'un plugin ESLint maison existe.

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
commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, les contextes à sous-contextes ne
sont pas atteints, et la règle ne se déclenche jamais, sans le signaler. La contre-épreuve est
obligatoire.

La seconde règle, sur la frontière de contexte, est la même que `U9` de `fiche-usecase.md`. Elle a la
même difficulté : exprimer « un autre contexte que le sien ». Une seule configuration couvre les deux
couches.

### C1 — compter les appels de usecase

La règle est décidable localement. Elle compte les appels de méthode sur l'identifiant `usecases`
dans le corps d'une fonction exportée d'un fichier de contrôleur. Au-delà d'un appel, elle signale.

Le cas « écriture puis lecture » produit un faux positif attendu. Il se traite **par exclusion
nominative**, pas en affaiblissant la règle. Une liste de fonctions exemptées, courte et relue, vaut
mieux qu'un seuil à deux, qui laisserait passer les vrais cas.

### C2 — les codes d'erreur

Un `.code()` avec un littéral supérieur ou égal à 400 dans un contrôleur est un signal fiable.

Les chemins qui ne passent pas par le domaine peuvent produire un faux positif, par exemple un
téléversement trop volumineux. Ces chemins doivent être exclus explicitement. Le code de **succès**
n'est pas concerné : la règle ne porte que sur le seuil 400.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **C4** — les deux règles de chemin, mutualisées avec `fiche-usecase.md`
2. **C5** — script de nommage
3. **C2** — règle ESLint, après mesure des chemins hors domaine
4. **C1** — règle ESLint, avec sa liste d'exclusion

### Codemods

Peu d'écarts se prêtent à un codemod, ce qui est cohérent avec la nature de la couche.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** accès direct | partiel | Remplacer un appel de repository par un appel de usecase existant, oui. Écrire le usecase manquant, non |
| **X1** deux usecases | non | Trouver le nom de l'intention composée est de la conception |
| **X2** code d'erreur | non | Choisir l'erreur de domaine détermine le code HTTP et le code d'erreur |

---

## 7. Le type

Le **gain** du typage est faible sur cette couche, pour deux raisons :

- les objets de requête et de réponse du framework sont typés de façon large ;
- la validation déclarée sur la route produit un contrôle à l'exécution que le typage ne connaît
  pas. Le type de `request.params` n'est pas déduit du schéma de la route.

Le typage apporte deux choses. Typer le troisième paramètre documente ce qui est substituable en
test. Les usecases typés rendent vérifiable ce que le contrôleur appelle sur eux : une méthode absente
devient une erreur de compilation.

```ts
const getQuestResults = async function (
  request: Request,
  h: ResponseToolkit,
  dependencies = { questResultSerializer },
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

Rien d'autre. Les statuts et la sécurité se vérifient au niveau de la route, en acceptance. Voir
`fiche-route.md`.

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Un indice de diagnostic, avec sa limite :

- Un test de contrôleur qui demande des **fixtures métier** est le signe que `C1` ou `C2` est violé :
  le contrôleur décide de quelque chose qui dépend de l'état.
- Limite : un contrôleur qui renvoie un fichier peut demander un montage sans rien décider.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

```
[ ] [auto]    C4  Aucun accès aux repositories ; aucun usecase d'un autre contexte
[ ] [partiel] C1  Un seul usecase appelé
[ ] [partiel] C2  Aucune décision : ni règle métier, ni code d'erreur choisi ici
[ ] [humain]  C2  Aucune transaction ouverte ici — elle appartient au usecase
[ ] [humain]  C3  Le sérialiseur est injecté par valeur de paramètre par défaut
[ ] [auto]    C5  Nom de fichier = ressource, nom de fonction = action, objet exporté
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du contrôleur
[ ] [humain]  Test unitaire avec usecase et sérialiseur substitués, sans fixture métier
[ ] [humain]  Aucun contrôle de droit ici — voir R2 de fiche-route.md
```

À terme, il reste six lignes : deux `[partiel]` et quatre `[humain]`. Deux invariants sur cinq,
`C4` et `C5`, se vérifient sans revue, et `C1` et `C2` en partie. C'est la contrepartie d'une couche
dont le rôle est de ne rien contenir : ce qui ne doit pas y être se détecte mieux que ce qui doit y
être.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, et **C2** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le contrôleur est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit |
| **C1** un usecase par point d'entrée | Pix : **ADR 20**, qui rend le usecase obligatoire pour toute route | ADR 20 |
| La transaction hors du contrôleur | Pix : **ADR 25**, qui remplace l'ADR 9. Celui-ci plaçait `DomainTransaction.execute` dans le contrôleur ; l'ADR 25 ne le reprend pas, et la forme dominante place la transaction dans le usecase | ADR 9 et 25 |
| **C3** sérialiseur injecté | Pix : **ADR 46**, et son motif ESM. L'ADR écarte l'injection des usecases dans les contrôleurs sans motif ; la cible est désormais l'injection, voir `X4` | ADR 46 |
| **C4** aucun accès aux données | Martin, « The Clean Architecture » — la règle de dépendance. Pix : **ADR 55** pour la frontière entre contextes | billet gratuit ; ADR 55 |
| **C5** nommage | **aucune source** — convention de rangement | — |
| Le mappeur d'erreurs (`C2`, `X2`) | Pix : **ADR 44**, qui rend le code d'erreur obligatoire. **ADR 13** décrit la structure de l'objet d'erreur JSON:API — `status`, `code` fonctionnel, `title`, `detail`, `meta` — et pose que plusieurs messages peuvent correspondre à un même statut HTTP. **Son état est `Proposed`** : il éclaire le raisonnement, il ne fait pas autorité | ADR 13 et 44 |

**Un invariant sur cinq n'a aucune source** : `C5`, et c'est celui que le § 4 classe en hygiène. Les
quatre autres renvoient à Martin ou à un ADR, ce qui les rend contestables sur pièces.
