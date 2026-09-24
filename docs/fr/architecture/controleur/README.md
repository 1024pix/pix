# Contrôleur

Un contrôleur traduit une requête HTTP en un appel de usecase, et le résultat en réponse. Il vit dans
`application/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout contrôleur. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) · [Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**C1**](#c1-un-seul-usecase-par-point-dentrée) | un seul usecase par point d'entrée | règle ESLint |
| [**C2**](#c2-aucune-décision) | aucune décision | règle ESLint pour le code d'erreur, revue pour le reste |
| [**C3**](#c3-les-dépendances-arrivent-en-paramètre) | les dépendances arrivent en paramètre | revue |
| [**C4**](#c4-aucun-accès-direct-aux-données) | aucun accès direct aux données | `dependency-cruiser` |
| [**C5**](#c5-un-contrôleur-par-ressource-une-fonction-par-action) | un contrôleur par ressource, une fonction par action | script |

Hors numérotation : la [table de décision](#ce-quun-contrôleur-nest-pas) du rôle.

---

## Rôle

Un contrôleur fait trois étapes, dans cet ordre, et rien entre : **extraire**, **appeler**,
**rendre**.

```js
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) {
  const { campaignParticipationId } = request.params;
  const userId = extractUserIdFromRequest(request);

  const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  const serializedQuestResults = dependencies.questResultSerializer.serialize(questResults);

  return h.response(serializedQuestResults);
};
```

**Code.** [`quest-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/quest-controller.js#L7-L16).

Terme employé dans cette page :

- **Humble object** : au sens de Martin, un objet assez simple pour que son test soit trivial, afin
  que tout ce qui mérite un vrai test soit testé ailleurs. Le contrôleur en est un.

### Ce qu'un contrôleur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un contrôleur.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| réalise l'intention métier | un usecase | `../usecase/README.md` |
| valide la forme des entrées | la route | `../route/README.md` |
| contrôle les droits | un pre-handler déclaré sur la route | `../route/README.md` |
| met en forme la réponse | un sérialiseur | `../serialiseur/README.md` |
| choisit un code d'erreur à partir d'une erreur métier | le mappeur d'erreurs du contexte | — |
| accède aux données | un repository, appelé par un usecase | `../repository/README.md` |
| expose une capacité à un autre contexte | `application/api/` | `../api-interne/README.md` |

---

## Invariants

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

**Code.** Fautif : [`passage-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-controller.js#L12-L25), simplifié. La forme corrigée est hypothétique.

Entre les deux appels, le contrôleur **fabrique la charge de l'événement** :

- il fixe le type `PASSAGE_STARTED` ;
- il convertit la date ;
- il relie l'événement au passage créé et à la version du module.

Ce sont des décisions du domaine, prises dans un fichier testé en unitaire avec des doublures. Aucune
n'est donc vraiment testée.

**Faux ami légitime.** Un usecase d'écriture suivi d'un usecase de lecture pour construire la
réponse. Il s'examine au cas par cas : il est parfois justifié, parfois le signe que le premier
usecase ne renvoie pas ce que la réponse demande. Voir les
[exceptions légitimes](#exceptions-légitimes).

**Ce qui casse.** La composition vit dans un contrôleur, où seul le test d'acceptance la vérifie :
c'est le test le plus lent et le plus tardif du dépôt. L'intention n'a pas de nom, donc elle est
introuvable : personne ne peut savoir qu'elle existe sans lire le contrôleur.

**Vérification.** Une règle ESLint, avec une liste d'exclusion nominative. Voir
[`outillage.md`](outillage.md#c1--compter-les-appels-de-usecase).

### C2. Aucune décision

**Énoncé.** Pas de règle métier. Pas de code d'erreur choisi ici. Pas de transformation au-delà de
l'extraction.

Le code de **succès** est une propriété constante de la route : 200, 201 ou 204 selon la nature de
l'opération. Les codes d'erreur viennent du mappeur d'erreurs : le contrôleur laisse remonter
l'erreur du domaine.

```js
// fautif — la décision de statut est prise ici
const replication = replicationRepository.getByName(replicationName);

if (!replication) {
  return h.response().code(404);
}

// conforme — le usecase lève, le mappeur traduit
const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });
const serializedQuestResults = dependencies.questResultSerializer.serialize(questResults);
return h.response(serializedQuestResults);
```

**Code.** Fautif : [`replications-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/maddo/application/replications-controller.js#L16-L20). Conforme : [`quest-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/quest-controller.js#L11-L15).

La forme fautive cumule deux violations : elle choisit le statut, **et** elle lit un repository, ce
qui enfreint `C4`.

**Le cas de la transaction.** Ouvrir une transaction dans un contrôleur, avec
`DomainTransaction.execute` autour de l'appel, est une décision. La transaction appartient au
usecase, selon `U7` de `../usecase/README.md` : c'est le usecase qui sait ce qui doit être atomique.
`C2` l'exclut donc du contrôleur.

```js
// fautif — la transaction enveloppe un seul appel de usecase
const createdOrUpdatedTrainingTrigger = await DomainTransaction.execute(async () => {
  return usecases.createOrUpdateTrainingTrigger({ trainingId, threshold, tubes, type });
});

// conforme — version corrigée : la transaction est ouverte dans le usecase, le contrôleur l'appelle seulement
const createdOrUpdatedTrainingTrigger = await usecases.createOrUpdateTrainingTrigger({ trainingId, threshold, tubes, type });
```

**Code.** Fautif : [`training-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/trainings/training-controller.js#L60-L67), simplifié. La forme corrigée est hypothétique.

L'extrait fautif ne contient **qu'un** appel de usecase : le contrôleur ne compose rien. L'histoire
de cette règle est dans
[`explication.md`](explication.md#la-transaction-hors-du-contrôleur).

**Ce qui casse.** Le même cas d'absence produit deux réponses différentes selon le point d'entrée
emprunté. Le front ne reçoit pas le code d'erreur exploitable que le mappeur aurait produit. C'est le
pendant applicatif de `I4` de `../repository/README.md` : le repository lève une erreur du domaine,
le mappeur lui associe un statut, et personne au milieu ne décide.

**Vérification.** Une règle ESLint pour le code d'erreur choisi ici. La règle métier et la
transaction se vérifient en revue. Voir [`outillage.md`](outillage.md#c2--les-codes-derreur).

### C3. Les dépendances arrivent en paramètre

**Énoncé.** Les dépendances du contrôleur, sérialiseurs et usecases, arrivent en paramètre. Aucune
n'est importée puis appelée directement. Deux formes sont admises :

- **la forme par défaut**, pour tout contrôleur neuf : une enveloppe posée sur la route passe au
  contrôleur un objet de dépendances qui contient ses usecases et ses sérialiseurs ;
- **la forme admise** : une valeur par défaut sur le troisième paramètre fournit le sérialiseur.

```js
// par défaut — l'enveloppe de la route injecte usecases et sérialiseur
handler: handlerWithDependencies(passageController.create),

const create = async function (request, h, { usecases, passageSerializer }) { … };

// admise — la valeur par défaut du troisième paramètre fournit le sérialiseur
const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) { … };

// fautif — le sérialiseur importé est appelé directement
async function getAllModulesMetadata() {
  const modulesMetadata = await usecases.getModuleMetadataList();

  return moduleMetadataSerializer.serialize(modulesMetadata);
}
```

**Code.** Par défaut : [`passage-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-route.js#L17) et [`passage-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-controller.js#L4). Admise : [`quest-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/quest-controller.js#L7). Fautif : [`module-metadata-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/modules-metadata/module-metadata-controller.js#L4-L8).

La forme par défaut est la seule qui injecte aussi les usecases. Un contrôleur qui l'emploie n'aura
rien à changer quand l'équipe choisira une forme unique.

**Ce qui casse.** Sous ESM, les exports sont immuables. Une dépendance importée ne peut pas être
substituée en test, donc le contrôleur n'est pas testable en unitaire. C'est la même contrainte
technique que celle qui motive l'injection ailleurs, décidée par l'ADR 46.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### C4. Aucun accès direct aux données

**Énoncé.** Ni repository, ni client de stockage, ni API interne, ni usecase d'un autre contexte. Le
contrôleur ne connaît que les usecases de **son** contexte.

```js
// fautif — un repository lu directement
import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';

// fautif — la frontière franchie hors API interne
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';

// conforme — les usecases du contexte courant, et eux seuls, reçus par l'enveloppe (C3)
const create = async function (request, h, { usecases, passageSerializer }) { … };
```

**Code.** Fautif, le repository : [`challenge-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/challenges/challenge-controller.js#L1). Fautif, la frontière : [`assessment-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/assessments/assessment-controller.js#L6). Conforme : [`passage-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-controller.js#L4).

**Les usecases du contexte courant** sont les seuls que le contrôleur reçoit. Aucune forme ne
s'étend aux usecases d'un autre contexte : franchir une frontière passe par l'API interne, selon `U9`
de `../usecase/README.md`.

**Ce qui casse.** Une lecture « juste pour afficher » contourne les règles du domaine. La même question
reçoit alors deux réponses selon le chemin emprunté. Une règle peut ainsi cesser d'être appliquée sans
que personne l'ait décidé.

**Vérification.** Deux règles `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#c4--règles-de-chemin).

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

**Code.** Fautif : [`replications-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/maddo/application/replications-controller.js#L5-L12), simplifié. Conforme : [`quest-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/quest-controller.js#L45-L52).

**Ce qui casse.** Rien à l'exécution. Invariant d'hygiène : il rend le fichier prévisible et réduit
le bruit de revue. Il rend aussi `C1` plus facile à vérifier, parce qu'il donne à sa règle une unité
claire à parcourir.

**Vérification.** Un script de nommage. Voir [`outillage.md`](outillage.md#vérifications).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Les usecases du contexte importés, avec le sérialiseur en valeur par défaut | **admis** : c'est la seconde forme de `C3`. `C4` |
| L'utilisateur extrait de la requête via un utilitaire partagé | **autorisé**, c'est de l'extraction |
| Un code de succès non standard : 201, 204 | **autorisé**, propriété constante de la route. `C2` |
| Un `if` sur la présence d'un paramètre optionnel | **autorisé** |
| Un flux ou un fichier renvoyé plutôt qu'un objet sérialisé, avec ses en-têtes | **autorisé** |
| Un usecase d'écriture suivi d'un usecase de lecture | **examiné au cas par cas** : parfois justifié, parfois le signe que le premier usecase ne renvoie pas ce que la réponse demande. `C1` |
| Un `DomainTransaction.execute` autour de l'appel | **pas une exception** : la transaction appartient au usecase, selon `U7` de `../usecase/README.md`. `C2` |
| Deux usecases métier enchaînés | **pas une exception** : intention sans nom. `C1` |
| Le contrôle des droits écrit ici | **pas une exception** : voir `R2` de `../route/README.md` |

---

## Exemple complet

Le contrôleur des passages, dans la forme par défaut de `C3` : le fichier, son enregistrement sur la
route, son test. Ce fichier n'est pas entièrement conforme : le bloc ci-dessous est sa version
corrigée. Les fonctions déjà conformes et sans rapport avec les corrections
sont abrégées.

```js
// le contrôleur — version corrigée
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';

const create = async function (request, h, { usecases, passageSerializer }) {
  const {
    'module-id': moduleId,
    'module-version': moduleVersion,
    'occurred-at': occurredAt,
    'sequence-number': sequenceNumber,
  } = request.payload.data.attributes;
  const userId = extractUserIdFromRequest(request);

  const passage = await usecases.startPassage({ moduleId, moduleVersion, userId, occurredAt, sequenceNumber });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};

const verifyAndSaveAnswer = async function (request, h, { usecases, elementAnswerSerializer }) {
  const { passageId } = request.params;
  const { 'element-id': elementId, 'user-response': userResponse } = request.payload.data.attributes;
  const elementAnswer = await usecases.verifyAndSaveAnswer({ passageId, elementId, userResponse });
  const serializedElementAnswer = elementAnswerSerializer.serialize(elementAnswer);
  return h.response(serializedElementAnswer).created();
};

const terminate = async function (request, h, { usecases, passageSerializer }) { … };

const startEmbedLlmChat = async function (request, h, { usecases, llmChatSerializer }) {
  const { configId } = request.payload;
  const userId = request.auth.credentials.userId;
  const passageId = request.params.passageId;
  const startedChatDTO = await usecases.startEmbedLlmChat({ configId, userId, passageId });

  return h.response(llmChatSerializer.serialize(startedChatDTO)).code(201);
};

const promptToLLMChat = async function (request, h, { usecases }) { … };

const passageController = { create, verifyAndSaveAnswer, terminate, startEmbedLlmChat, promptToLLMChat };

export { passageController };
```

**Code.** Version corrigée de [`passage-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-controller.js#L1-L67).

Corrections apportées :

- `create` appelle un seul usecase, `startPassage`, au lieu de `createPassage` puis
  `recordPassageEvents`. La charge de l'événement `PASSAGE_STARTED` est fabriquée dans ce usecase.
  Ce usecase est hypothétique. `C1`, et `C2` pour la charge de l'événement.
- `startEmbedLlmChat` reçoit `llmChatSerializer` en paramètre au lieu de l'importer. Le sérialiseur
  s'ajoute à l'objet de dépendances de `handlerWithDependencies`, et l'import disparaît du fichier.
  `C3`.

`promptToLLMChat` renvoie un flux sans sérialiseur : c'est une exception légitime.

```js
// l'enregistrement — la route enveloppe la fonction, qui reçoit usecases et sérialiseurs (C3)
{
  method: 'POST',
  path: '/api/passages/{passageId}/answers',
  config: {
    auth: false,
    validate: { params: …, payload: … },
    handler: handlerWithDependencies(passageController.verifyAndSaveAnswer),
    notes: ["- Permet de vérifier la réponse d'un élément et de la stocker"],
    tags: ['api', 'passages', 'element', 'réponse'],
  },
},
```

**Code.** [`passage-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-route.js#L37-L62), simplifié : la validation est abrégée.

```js
// le test — unitaire, usecase et sérialiseur substitués, sans fixture métier
it('should call verifyAndSave use-case and return serialized element-answer', async function () {
  const passageId = Symbol('passage-id');
  const elementId = Symbol('element-id');
  const userResponse = Symbol('user-response');
  const createdElementAnswer = Symbol('created element-answer');
  const serializedElementAnswer = Symbol('serialized element-answer');

  const usecases = { verifyAndSaveAnswer: sinon.stub() };
  usecases.verifyAndSaveAnswer.withArgs({ passageId, elementId, userResponse }).resolves(createdElementAnswer);
  const elementAnswerSerializer = { serialize: sinon.stub() };
  elementAnswerSerializer.serialize.withArgs(createdElementAnswer).returns(serializedElementAnswer);
  const hStub = { response: sinon.stub() };
  hStub.response.withArgs(serializedElementAnswer).returns({ created: sinon.stub().returns(serializedElementAnswer) });

  const result = await passageController.verifyAndSaveAnswer(
    { params: { passageId }, payload: { data: { attributes: { 'element-id': elementId, 'user-response': userResponse } } } },
    hStub,
    { usecases, elementAnswerSerializer },
  );

  expect(result).to.equal(serializedElementAnswer);
});
```

**Code.** [`passage-controller_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/devcomp/unit/application/passages/passage-controller_test.js#L72-L115), simplifié : les commentaires et un champ inutile de la charge sont retirés.

La forme par défaut rend le test direct : les doublures passent en troisième argument, sans
substitution de module.

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Contrôleur | **unitaire**, usecase et sérialiseur substitués | que le bon usecase est appelé avec les bons paramètres, et que la réponse est sérialisée |

Rien d'autre. Les statuts et la sécurité se vérifient au niveau de la route, en acceptance. Voir
`../route/README.md`.

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites dans
[`../repository/outillage.md`](../repository/outillage.md#tests-attendus--par-le-même-script).

Un indice de diagnostic, avec sa limite :

- Un test de contrôleur qui demande des **fixtures métier** est le signe que `C1` ou `C2` est violé :
  le contrôleur décide de quelque chose qui dépend de l'état.
- Limite : un contrôleur qui renvoie un fichier peut demander un montage sans rien décider.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

```
[ ] [auto]    C4  Aucun accès aux repositories ; aucun usecase d'un autre contexte
[ ] [partiel] C1  Un seul usecase appelé
[ ] [partiel] C2  Aucune décision : ni règle métier, ni code d'erreur choisi ici
[ ] [humain]  C2  Aucune transaction ouverte ici : elle appartient au usecase
[ ] [humain]  C3  Les dépendances arrivent en paramètre ; l'enveloppe de la route pour un contrôleur neuf
[ ] [auto]    C5  Nom de fichier = ressource, nom de fonction = action, objet exporté
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du contrôleur
[ ] [humain]  Test unitaire avec usecase et sérialiseur substitués, sans fixture métier
[ ] [humain]  Aucun contrôle de droit ici : voir R2 de ../route/README.md
```

À terme, six lignes restent : deux `[partiel]` et quatre `[humain]`.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| La couche, et **C2** aucune décision | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » |
| **C1** un usecase par point d'entrée | ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? » |
| **C2** la transaction hors du contrôleur | ADR 25, « Précision sur les transactions et les événements métier », qui remplace l'ADR 9, « Transactions métier » |
| **C2** le mappeur d'erreurs | ADR 44, « Gestion des erreurs de l'API dans les clients (applications tierces, IHM, etc.) et références ». L'ADR 13 éclaire le raisonnement sans faire autorité : voir [`explication.md`](explication.md#le-contrat-du-front) |
| **C3** dépendances en paramètre | ADR 46, « Injecter les dépendances dans l'API » |
| **C4** aucun accès aux données | Martin, « The Clean Architecture », la règle de dépendance. ADR 55, « Communication "séquentielle" entre les contextes fonctionnels », pour la frontière entre contextes |
| **C5** nommage | convention de rangement, sans source |
