# Value Object

Un Value Object est une valeur du métier : un statut, un seuil, une période. Un Value Object n'a pas
d'identifiant. Deux Value Objects qui ont les mêmes valeurs sont la même chose pour le métier, comme deux
billets de 10 €. Les Value Objects sont dans le dossier `domain/models/`.

En bas de la page, la partie [référence des règles](#référence-des-règles) explique chaque règle avec
un bon exemple et un mauvais exemple.

## Les règles

| # | Règle | En pratique |
| --- | --- | --- |
| [V1](#v1-immuable-après-construction) | Immuable | champs privés `#` ; aucune méthode ne modifie un champ |
| [V2](#v2-aucune-identité-égalité-par-valeur) | Pas d'identifiant | pas d'`id` à lui ; contenir l'`id` d'autre chose, comme un `userId`, est permis |
| [V3](#v3-validation-à-la-construction) | Valide dès la construction | le constructeur lève une erreur du domaine sur une valeur invalide |
| [V4](#v4-aucune-io-aucune-dépendance-à-linfrastructure) | Aucune I/O | aucun import d'infrastructure ; la date du jour est passée en paramètre |
| [V5](#v5-porte-le-comportement-lié-à-ses-données) | Contient ses règles | une règle sur les données de l'objet est une méthode de l'objet |
| [V6](#v6-aucun-cycle-de-vie-propre) | Pas de [repository](../repository/README.md) | pas de repository, pas de table : le Value Object est enregistré avec l'objet qui le contient |
| [V7](#v7-exposition-en-lecture-seule-tableaux-compris) | Lecture seule, tableaux compris | un accesseur renvoie une copie : `[...this.#items]`, jamais `this.#items` |

Une erreur du domaine est une `DomainError`, ou une classe qui hérite de `DomainError`. `DomainError`
est dans le fichier `api/src/shared/domain/errors.js`.

## Exemple complet

Version corrigée du fichier [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L10-L85).
`AnswerStatus` est le résultat d'une réponse à une question.

```js
import { DomainError } from '../errors.js';

const statuses = {
  OK: 'ok',
  KO: 'ko',
  SKIPPED: 'aband',
  TIMEDOUT: 'timedout',
  FOCUSEDOUT: 'focusedOut',
  UNIMPLEMENTED: 'unimplemented',
};

class AnswerStatus {
  #status; // V1 : champ privé, personne ne peut modifier le champ

  constructor({ status } = {}) {
    // V3 : une valeur invalide ne crée pas d'objet, le constructeur lève une erreur
    if (!Object.values(statuses).includes(status)) {
      throw new DomainError(`Invalid answer status: ${status}`);
    }
    this.#status = status;
  }

  get status() {
    return this.#status;
  }

  // V5 : les règles sur le statut sont des méthodes du statut
  isFailed() {
    return this.#status !== statuses.OK;
  }

  isOK() {
    return this.#status === statuses.OK;
  }

  // isKO(), isSKIPPED(), isTIMEDOUT()… s'écrivent comme isOK()

  // AnswerStatus.OK se lit mieux que new AnswerStatus({ status: 'ok' })
  static get OK() {
    return new AnswerStatus({ status: statuses.OK });
  }

  // AnswerStatus.KO, AnswerStatus.SKIPPED… s'écrivent comme AnswerStatus.OK
}

export { AnswerStatus };
```

Le test vérifie le comportement, la validation et l'immuabilité :

```js
describe('Unit | Domain | Models | AnswerStatus', function () {
  it('is OK for an OK status only', function () {
    expect(AnswerStatus.OK.isOK()).to.be.true;
    expect(AnswerStatus.KO.isOK()).to.be.false;
  });

  it('throws a DomainError when the status is unknown', function () {
    expect(() => new AnswerStatus({ status: 'unknown' })).to.throw(DomainError);
  });

  it('cannot be reassigned', function () {
    const answerStatus = AnswerStatus.OK;

    // status n'a pas de setter : l'affectation lève une TypeError
    expect(() => {
      answerStatus.status = 'ko';
    }).to.throw(TypeError);
  });
});
```

## Comment tester

Un Value Object se teste avec un test unitaire. Le test n'utilise pas de base de données. Le test
n'utilise pas de **double** : pas de stub, pas de mock, pas de spy. Le test vérifie :

- la validation : une valeur invalide lève une erreur du domaine ;
- le comportement : chaque méthode qui porte une règle, cas limites compris ;
- l'immuabilité : modifier un champ échoue, et modifier un tableau renvoyé ne modifie pas l'objet.

Un signe d'un problème, pendant l'écriture du test : **le test a besoin d'un double**. L'objet dépend
de l'infrastructure : l'objet ne respecte pas [V4](#v4-aucune-io-aucune-dépendance-à-linfrastructure).

## Comment relire

La checklist suit l'ordre de relecture : les questions les plus utiles sont en premier. Dans un
commentaire de revue, écrire le numéro de la règle et ce qui ne respecte pas la règle : « V7 : `get skills()` renvoie le tableau interne, l'appelant
peut le modifier ».

```
Porte-t-il ses règles ?
[ ] V3  Le constructeur rejette toute valeur invalide, avec une erreur du domaine
[ ] V5  La logique sur ses données est dans ses méthodes

Peut-on le modifier de l'extérieur ?
[ ] V1  Aucun champ public, aucune méthode qui modifie un champ
[ ] V7  Aucun tableau interne renvoyé tel quel

Dépend-il de quelque chose ?
[ ] V4  Aucun import d'infrastructure ; ni new Date(), ni Math.random(), ni configuration
[ ] V2  Aucun id propre ; aucune clé construite pour le front
[ ] V6  Aucun repository

Les tests
[ ] Un test unitaire, sans double
```

## Référence des règles

Les exemples viennent du code de Pix. Quand un exemple est corrigé ou inventé, c'est écrit sous
l'exemple.

### V1. Immuable après construction

**La règle.** Après le constructeur, rien ne modifie l'objet. Les champs sont privés. Aucune méthode
ne modifie un champ. Pour avoir une autre valeur, créer un autre objet.

**Bon exemple.**

```js
class AnswerStatus {
  #status; // privé

  static get OK() {
    return new AnswerStatus({ status: statuses.OK }); // un nouvel objet à chaque fois
  }
}
```

Extrait de l'[exemple complet](#exemple-complet).

**Mauvais exemple.**

```js
class CombinedCourseStatistics {
  constructor({ participationsCount, completedParticipationsCount }) {
    this.participationsCount = participationsCount; // champ public : n'importe qui peut modifier le champ
    this.completedParticipationsCount = completedParticipationsCount;
  }
}
```

[`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L1-L7), simplifié.

**Ce que ça apporte.** Plusieurs parties du code peuvent utiliser le même objet sans risque :
personne ne peut modifier l'objet.

**Sans cette règle.** Une partie du code modifie un objet qu'une autre partie du code utilise encore.
Le bug apparaît loin de sa cause. Le bug est difficile à reproduire.

**À savoir.** La règle vaut aussi pour la classe parente : les champs de la classe parente sont
privés.

### V2. Aucune identité, égalité par valeur

**La règle.** Un Value Object n'a pas d'identifiant à lui. Deux Value Objects qui ont les mêmes
valeurs sont la même chose. Un Value Object peut contenir l'identifiant d'autre chose, comme un
`userId` : cet identifiant est une donnée comme les autres.

**Bon exemple.**

```js
const first = AnswerStatus.OK;
const second = AnswerStatus.OK;

first === second; // false : deux objets différents en mémoire
first.status === second.status; // true : la même valeur, donc le même statut pour le métier
```

Inventé, d'après l'[exemple complet](#exemple-complet).

**Mauvais exemple.**

```js
class CombinedCourseStatistics {
  constructor({ id, participationsCount, completedParticipationsCount }) {
    this.id = id; // un identifiant qu'aucune règle du domaine n'utilise
    …
  }
}
```

[`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L2-L3), simplifié.

**Ce que ça apporte.** La différence avec une [Entity](../entite/README.md) est claire : une Entity a
un identifiant, un Value Object n'a pas d'identifiant.

**Sans cette règle.** Avec un identifiant, le code finit par retrouver l'objet, modifier l'objet,
créer un repository pour l'objet. L'objet devient une Entity, sans que personne l'ait décidé.

**Exceptions.** Le front a souvent besoin d'une clé unique pour ranger les objets dans son cache. La
clé ne va pas toujours au même endroit :

- le front ne renvoie jamais la clé au serveur : la clé est construite dans le **[sérialiseur](../serialiseur/README.md)** ;
- le front renvoie la clé, et le serveur découpe la clé pour retrouver ses parties : un Value Object
  construit la clé, découpe la clé et valide la clé ;
- l'objet a une identité métier faite de plusieurs champs : l'objet est une
  [Entity](../entite/README.md).

### V3. Validation à la construction

**La règle.** Une valeur invalide ne crée pas d'objet. Le constructeur vérifie les valeurs reçues. Si
une valeur est invalide, le constructeur lève une erreur du domaine. Le code qui reçoit l'objet n'a
plus rien à vérifier.

**Bon exemple.**

```js
constructor({ status } = {}) {
  if (!Object.values(statuses).includes(status)) {
    throw new DomainError(`Invalid answer status: ${status}`);
  }
  this.#status = status;
}
```

Extrait de l'[exemple complet](#exemple-complet).

**Mauvais exemple.**

```js
constructor({ status } = {}) {
  // TODO: throw a BadAnswerStatus error if the status is bad + adapt the tests
  this.status = status; // n'importe quelle chaîne est acceptée
}
```

[`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L11-L14), avant la correction.

**Ce que ça apporte.** Un objet invalide n'existe pas. Le code qui utilise l'objet n'a pas besoin de
vérifier l'objet.

**Sans cette règle.** Chaque partie du code doit vérifier la valeur. La vérification est copiée
partout, et un jour une partie du code oublie la vérification.

**À savoir.**

- Toutes les validations du domaine lèvent une erreur du domaine. Sinon, le code qui appelle doit
  attraper plusieurs types d'erreurs.
- Un objet qui contient d'autres objets valide aussi les autres objets.

### V4. Aucune I/O, aucune dépendance à l'infrastructure

**La règle.** Un Value Object n'importe rien de l'infrastructure : ni base de données, ni journal, ni
appel HTTP. Le Value Object n'appelle pas `new Date()`, pas `Math.random()`, et ne lit pas la configuration :
ces valeurs sont passées en paramètre.

**Bon exemple.**

```js
getDeletableOrganizationLearners(organizationLearnerIdsToDelete) {
  if (this.organizationLearners.length !== organizationLearnerIdsToDelete.length) {
    throw new CouldNotDeleteLearnersError(); // le code qui appelle écrit le log, si besoin
  }
  return this.organizationLearners;
}
```

Version corrigée du mauvais exemple ci-dessous.

**Mauvais exemple.**

```js
import { logger } from '…/shared/infrastructure/utils/logger.js';

getDeletableOrganizationLearners(organizationLearnerIdsToDelete, userId) {
  if (this.organizationLearners.length !== organizationLearnerIdsToDelete.length) {
    logger.error(`User id ${userId} could not delete organization learners because …`);
    throw new CouldNotDeleteLearnersError();
  }
  return this.organizationLearners;
}
```

[`OrganizationLearnerList.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/learner-management/domain/models/OrganizationLearnerList.js#L1-L19), simplifié.

**Ce que ça apporte.** Le résultat dépend seulement des paramètres. Le test est rapide, et le test
n'a pas besoin de double.

**Sans cette règle.** Le test doit simuler le log, l'heure ou la base de données. Un objet qui appelle
`new Date()` donne un résultat différent à chaque exécution du test.

### V5. Porte le comportement lié à ses données

**La règle.** Une règle sur les données du Value Object est une méthode du Value Object. Un objet
sans méthode n'apporte rien de plus qu'un objet simple `{ … }`.

**Bon exemple.**

```js
class TrainingTrigger {
  isFulfilled({ knowledgeElements, skills } = {}) {
    …
    if (this.type === types.GOAL) {
      return validatedKnowledgeElementsPercentage <= this.threshold;
    }
    return validatedKnowledgeElementsPercentage >= this.threshold;
  }
}
```

[`TrainingTrigger.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/TrainingTrigger.js#L18-L29),
simplifié. La règle du seuil est dans l'objet qui contient le seuil. Cet exemple est bon pour V5
seulement : `threshold` est un champ public, et V1 interdit les champs publics.

**Mauvais exemple.**

```js
class CombinedCourseStatistics {
  constructor({ id, participationsCount, completedParticipationsCount }) { … }
  // aucune méthode
}
```

[`CombinedCourseStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.js#L1-L7).

**Ce que ça apporte.** La règle est écrite une seule fois, dans l'objet qui contient les données.

**Sans cette règle.** La règle est copiée dans chaque [usecase](../usecase/README.md) qui a besoin de la règle. Un jour, une
copie de la règle est différente des autres copies.

**À savoir.** Un calcul pour l'affichage, comme un pourcentage arrondi, n'est pas une règle : le calcul ne
décide rien.

**Exceptions.** Un Value Object sans méthode est accepté quand son seul rôle est de donner un nom
clair à une valeur, par exemple pour rendre la signature d'une fonction plus claire qu'avec une
simple chaîne.

### V6. Aucun cycle de vie propre

**La règle.** Un Value Object n'a pas de repository. Un Value Object n'a pas de table à lui. Le Value
Object est enregistré avec l'objet qui le contient. Un objet qu'il faut retrouver seul est une
[Entity](../entite/README.md).

**Bon exemple.**

```js
class Answer {
  constructor({ id, result, … } = {}) {
    this.id = id;
    this.result = AnswerStatus.from(result); // le statut fait partie de la réponse
    …
  }
}
```

[`Answer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/models/Answer.js#L19-L22),
simplifié. Le statut est enregistré avec la réponse, dans la même ligne de la table.

**Mauvais exemple.**

```js
const answerStatusRepository = {
  get(id) { … }, // retrouver un statut seul
};
```

Inventé.

**Ce que ça apporte.** La différence avec une Entity reste claire.

**Sans cette règle.** Un repository a besoin d'un identifiant pour retrouver l'objet. L'objet reçoit
un identifiant, et l'objet devient une Entity sans que personne l'ait décidé.

### V7. Exposition en lecture seule, tableaux compris

**La règle.** Le code extérieur ne peut rien modifier, même pas le contenu d'un tableau interne. Un
accesseur qui renvoie un tableau renvoie une copie du tableau.

**Bon exemple.**

```js
get attachments() {
  return this.#coreChallenge.attachments ? [...this.#coreChallenge.attachments] : null; // une copie
}
```

[`BaseChallenge.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/domain/models/BaseChallenge.js#L214-L216).

**Mauvais exemple.**

```js
get levelsPerTube() {
  return this.#tubesWithLevels; // le tableau interne lui-même
}
```

[`CampaignResultLevelsPerTubesAndCompetences.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/domain/models/CampaignResultLevelsPerTubesAndCompetences.js#L29-L31).
Le champ est privé, mais le code qui appelle reçoit le tableau et peut modifier le tableau.

**Ce que ça apporte.** V1 est vraiment respectée : l'objet ne change pas, le contenu de l'objet ne
change pas.

**Sans cette règle.** Le code qui appelle fait `levelsPerTube.push(…)`, et l'objet change sans appel
à une méthode de l'objet.

**À savoir.** Certains fichiers appellent `Object.freeze(this)` pour protéger l'objet. `Object.freeze(this)`
empêche de modifier les champs publics. `Object.freeze(this)` ne protège pas les champs privés `#`, et
ne protège pas le contenu des tableaux. Seule la copie protège un tableau.
