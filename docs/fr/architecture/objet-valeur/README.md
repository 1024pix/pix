# Value Object

Un Value Object est une valeur du métier : un statut, un seuil, la bonne réponse d'une question. Un
Value Object n'a pas d'identifiant. Deux Value Objects qui ont les mêmes valeurs sont interchangeables :
le code peut utiliser l'un à la place de l'autre, comme deux billets de 10 €. Les Value Objects sont dans le dossier `domain/models/`.

En bas de la page, la partie [référence des règles](#référence-des-règles) explique chaque règle avec
un bon exemple et un mauvais exemple.

## Les règles

| # | Règle | En pratique |
| --- | --- | --- |
| [V1](#v1-immuable) | Immuable | champs privés `#` ; aucune méthode ne modifie un champ |
| [V2](#v2-pas-didentifiant) | Pas d'identifiant | pas d'`id` à lui ; contenir l'`id` d'autre chose, comme un `challengeId`, est permis |
| [V3](#v3-valide-dès-la-construction) | Valide dès la construction | le constructeur lève une erreur du domaine sur une valeur invalide |
| [V4](#v4-aucune-io) | Aucune I/O | aucun import d'infrastructure ; la date du jour est passée en paramètre |
| [V5](#v5-contient-ses-règles) | Contient ses règles | une règle sur les données de l'objet est une méthode de l'objet |
| [V6](#v6-pas-de-repository) | Pas de [repository](../repository/README.md) | pas de repository, pas de table : le Value Object est enregistré avec l'objet qui le contient |
| [V7](#v7-lecture-seule-tableaux-compris) | Lecture seule, tableaux compris | un accesseur renvoie une copie : `[...this.#items]`, jamais `this.#items` |

Une erreur du domaine est une `DomainError`, ou une classe qui hérite de `DomainError`. `DomainError`
est dans le fichier `api/src/shared/domain/errors.js`.

## Exemple complet

La bonne réponse d'une question à choix multiples (QCM) : la liste des choix corrects. Inventé,
d'après [`Solution.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Solution.js#L6-L35).

```ts
// devcomp/domain/models/QcmSolution.ts
import type { ChallengeId } from '../../../shared/domain/Id.js';
import { InvalidQcmSolutionError } from '../errors.js';

export class QcmSolution {
  readonly challengeId: ChallengeId; // V2 : l'identifiant de la question, pas un identifiant à lui
  #correctChoiceIds: string[]; // V1 : champ privé, aucun code hors de la classe ne peut modifier le champ

  // V3 : une valeur invalide ne crée pas d'objet, le constructeur lève une erreur
  constructor({ challengeId, correctChoiceIds }: { challengeId: ChallengeId; correctChoiceIds: string[] }) {
    if (correctChoiceIds.length === 0) {
      throw new InvalidQcmSolutionError('A QCM needs at least one correct choice');
    }
    if (new Set(correctChoiceIds).size !== correctChoiceIds.length) {
      throw new InvalidQcmSolutionError('A correct choice appears twice');
    }
    this.challengeId = challengeId;
    this.#correctChoiceIds = [...correctChoiceIds]; // V7 : une copie du tableau reçu
  }

  // V7 : l'accesseur renvoie une copie du tableau
  get correctChoiceIds(): string[] {
    return [...this.#correctChoiceIds];
  }

  // V5 : la règle de correction est une méthode de la solution
  isCorrect(selectedChoiceIds: string[]): boolean {
    return (
      selectedChoiceIds.length === this.#correctChoiceIds.length &&
      selectedChoiceIds.every((choiceId) => this.#correctChoiceIds.includes(choiceId))
    );
  }

  // V2 : deux solutions sont égales quand leurs valeurs sont égales
  equals(other: QcmSolution): boolean {
    return other.challengeId === this.challengeId && other.isCorrect(this.#correctChoiceIds);
  }

  // V4 : aucun import d'infrastructure, aucun new Date()
  // V6 : aucun repository : la solution est enregistrée avec la question
}
```

## Comment tester

Un Value Object se teste avec un test unitaire. Le test n'utilise pas de base de données. Le test
ne remplace aucun module par un faux : pas de stub, pas de mock, pas de spy. Le test vérifie :

- la validation : une valeur invalide lève une erreur du domaine. Dans le test ci-dessous :
  `refuses a solution without correct choice` ;
- le comportement : chaque méthode qui porte une règle, cas limites compris. Dans le test ci-dessous :
  les trois tests de `isCorrect` ;
- l'immuabilité : modifier un tableau renvoyé ne modifie pas l'objet. Dans le test ci-dessous :
  `cannot change the solution through the returned array`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/devcomp/unit/domain/models/QcmSolution_test.ts
describe('Unit | Devcomp | Domain | Models | QcmSolution', function () {
  const challengeId = 'challenge-1' as ChallengeId;

  describe('constructor', function () {
    it('refuses a solution without correct choice', function () {
      expect(() => new QcmSolution({ challengeId, correctChoiceIds: [] })).to.throw(InvalidQcmSolutionError);
    });

    it('refuses a correct choice that appears twice', function () {
      expect(() => new QcmSolution({ challengeId, correctChoiceIds: ['a', 'a'] })).to.throw(InvalidQcmSolutionError);
    });
  });

  describe('#isCorrect', function () {
    const solution = new QcmSolution({ challengeId, correctChoiceIds: ['a', 'c'] });

    it('is correct when all the correct choices are selected, in any order', function () {
      expect(solution.isCorrect(['c', 'a'])).to.be.true;
    });

    it('is not correct when a correct choice is missing', function () {
      expect(solution.isCorrect(['a'])).to.be.false;
    });

    it('is not correct when a wrong choice is selected', function () {
      expect(solution.isCorrect(['a', 'b'])).to.be.false;
    });
  });

  describe('#correctChoiceIds', function () {
    it('cannot change the solution through the returned array', function () {
      const solution = new QcmSolution({ challengeId, correctChoiceIds: ['a'] });

      solution.correctChoiceIds.push('b');

      expect(solution.correctChoiceIds).to.deep.equal(['a']);
    });
  });
});
```

## Comment relire

La checklist suit cet ordre : d'abord les règles qui laissent entrer une valeur invalide, puis les
règles qui permettent de modifier l'objet, puis les règles qui lient l'objet à autre chose. Dans un commentaire de revue, écrire le numéro de la règle et ce qui ne respecte pas la
règle : « V7 : `get correctChoiceIds()` renvoie le tableau interne, le code qui appelle `get correctChoiceIds()` peut modifier la solution ».

```
Le Value Object contient-il ses règles ?
[ ] V3  Le constructeur rejette toute valeur invalide, avec une erreur du domaine
[ ] V5  La logique sur ses données est dans ses méthodes

Un code hors de la classe peut-il modifier l'objet ?
[ ] V1  Aucun champ public modifiable, aucune méthode qui modifie un champ
[ ] V7  Aucun tableau interne renvoyé tel quel

Le Value Object dépend-il d'autre chose que de ses propres données ?
[ ] V4  Aucun import d'infrastructure ; ni new Date(), ni Math.random(), ni configuration
[ ] V2  Aucun id à lui ; aucune clé construite pour le front
[ ] V6  Aucun repository

Les tests
[ ] Un test unitaire, sans stub, sans mock, sans spy
```

## Référence des règles

Les bons exemples sont des extraits de l'[exemple complet](#exemple-complet). Les mauvais exemples
montrent la même `QcmSolution` mal écrite.

### V1. Immuable

**La règle.** Après le constructeur, rien ne modifie l'objet. Les champs sont privés, ou en lecture
seule. Aucune méthode ne modifie un champ. Pour avoir une autre valeur, créer un autre objet.

**Bon exemple.**

```ts
readonly challengeId: ChallengeId; // en lecture seule
#correctChoiceIds: string[]; // privé
```

**Mauvais exemple.**

```ts
export class QcmSolution {
  challengeId: ChallengeId; // public : n'importe qui peut modifier le champ
  correctChoiceIds: string[]; // public : n'importe qui peut modifier le champ
}
```

**Ce que ça apporte.** Une même solution peut être passée à plusieurs fonctions, ou gardée en cache :
aucune fonction ne peut modifier la solution qu'une autre fonction utilise.

**Sans cette règle.** Une partie du code modifie la solution d'une question pendant qu'une autre
partie du code corrige une réponse avec cette solution. La réponse est corrigée avec une mauvaise
solution. Le bug ne se voit pas à l'endroit de la modification : seule la correction de la réponse
donne un résultat faux, et seulement quand les deux parties du code s'exécutent dans cet ordre.

**À savoir.** La règle vaut aussi pour la classe parente : les champs de la classe parente sont
privés, ou en lecture seule.

### V2. Pas d'identifiant

**La règle.** Un Value Object n'a pas d'identifiant à lui. Deux Value Objects qui ont les mêmes
valeurs sont la même chose. Un Value Object peut contenir l'identifiant d'autre chose, comme
`challengeId` : cet identifiant est une donnée comme les autres.

**Bon exemple.**

```ts
equals(other: QcmSolution): boolean {
  return other.challengeId === this.challengeId && other.isCorrect(this.#correctChoiceIds);
}
```

La comparaison utilise les valeurs. `challengeId` est l'identifiant de la question, pas un
identifiant de la solution.

**Mauvais exemple.**

```ts
export class QcmSolution {
  readonly id: number; // un identifiant à la solution, qu'aucune règle du domaine n'utilise
}
```

**Ce que ça apporte.** Deux solutions se comparent par leurs valeurs. Le code peut remplacer une
solution par une autre solution qui a les mêmes valeurs : le code qui reçoit l'une ou l'autre donne
le même résultat.

**Sans cette règle.** Avec un identifiant, un développeur ajoute une méthode pour retrouver l'objet par
son identifiant, puis un repository. L'objet devient une Entity, et aucune revue n'a décidé ce
changement.

**Exceptions.** Le front a souvent besoin d'une clé unique pour ranger les solutions dans son cache.
La clé ne va pas toujours au même endroit :

- le front ne renvoie jamais la clé au serveur : la clé est construite dans le
  **[sérialiseur](../serialiseur/README.md)** ;
- le front renvoie la clé, et le serveur découpe la clé pour retrouver ses parties : un Value Object
  construit la clé, découpe la clé et valide la clé ;
- l'objet a une identité métier faite de plusieurs champs : l'objet est une
  [Entity](../entite/README.md).

### V3. Valide dès la construction

**La règle.** Une valeur invalide ne crée pas d'objet. Le constructeur vérifie les valeurs reçues. Si
une valeur est invalide, le constructeur lève une erreur du domaine. Le code qui reçoit l'objet n'a
plus rien à vérifier.

**Bon exemple.**

```ts
constructor({ challengeId, correctChoiceIds }: { challengeId: ChallengeId; correctChoiceIds: string[] }) {
  if (correctChoiceIds.length === 0) {
    throw new InvalidQcmSolutionError('A QCM needs at least one correct choice');
  }
  …
}
```

**Mauvais exemple.**

```ts
constructor({ challengeId, correctChoiceIds }: { challengeId: ChallengeId; correctChoiceIds: string[] }) {
  // TODO: throw an error if the solution is invalid
  this.challengeId = challengeId; // n'importe quelle valeur est acceptée
  this.#correctChoiceIds = correctChoiceIds;
}
```

**Ce que ça apporte.** Aucun code ne peut créer un objet avec une valeur invalide : le constructeur
lève une erreur avant. Le code qui utilise l'objet n'a pas besoin de vérifier l'objet.

**Sans cette règle.** Une solution sans choix correct est créée. `isCorrect([])` répond `true`, et une
réponse vide est comptée juste.

**À savoir.**

- Toutes les validations du domaine lèvent une erreur du domaine. Sinon, le code qui appelle doit
  attraper plusieurs types d'erreurs.
- Un objet qui contient d'autres objets valide aussi les autres objets.

### V4. Aucune I/O

**La règle.** Un Value Object n'importe rien de l'infrastructure : ni base de données, ni log, ni
appel HTTP. Le Value Object n'appelle pas `new Date()`, pas `Math.random()`, et ne lit pas la
configuration : ces valeurs sont passées en paramètre.

**Bon exemple.**

```ts
isCorrect(selectedChoiceIds: string[]): boolean {
  return (
    selectedChoiceIds.length === this.#correctChoiceIds.length &&
    selectedChoiceIds.every((choiceId) => this.#correctChoiceIds.includes(choiceId))
  );
}
```

Le résultat dépend seulement du paramètre et des champs de l'objet.

**Mauvais exemple.**

```ts
import { logger } from '../../../shared/infrastructure/utils/logger.js';

isCorrect(selectedChoiceIds: string[]): boolean {
  const isCorrect = …;
  logger.info(`Answer checked for challenge ${this.challengeId}`); // l'objet écrit un log
  return isCorrect;
}
```

**Ce que ça apporte.** Le résultat dépend seulement des paramètres. Le test est rapide, et le test
n'a besoin d'aucun stub.

**Sans cette règle.** Le test doit simuler le log, l'heure ou la base de données. Un objet qui appelle
`new Date()` donne un résultat différent à chaque exécution du test.

### V5. Contient ses règles

**La règle.** Une règle sur les données du Value Object est une méthode du Value Object. Un objet
sans méthode laisse chaque appelant écrire la règle.

**Bon exemple.**

```ts
solution.isCorrect(answer.selectedChoiceIds); // la règle de correction est dans la solution
```

**Mauvais exemple.**

```ts
// dans un usecase : la règle de correction est écrite hors de la solution
const isCorrect =
  answer.selectedChoiceIds.length === solution.correctChoiceIds.length &&
  answer.selectedChoiceIds.every((choiceId) => solution.correctChoiceIds.includes(choiceId));
```

**Ce que ça apporte.** La règle est écrite une seule fois. Pour changer la règle de correction, un
seul fichier change : `QcmSolution.ts`.

**Sans cette règle.** La règle est copiée dans chaque [usecase](../usecase/README.md) qui corrige une
réponse. Un jour, une copie de la règle est différente des autres copies, et la même réponse est juste
dans un écran et fausse dans un autre.

**À savoir.** Un calcul pour l'affichage n'est pas une règle : le calcul ne décide rien. Par exemple,
le pourcentage de bonnes réponses arrondi pour un écran n'a pas sa place dans `QcmSolution`.

**Exceptions.** Un Value Object sans méthode est accepté quand son seul rôle est de typer une valeur :
une fonction qui attend une `QcmSolution` refuse une simple liste de chaînes à la compilation.

### V6. Pas de repository

**La règle.** Un Value Object n'a pas de repository. Un Value Object n'a pas de table à lui. Le Value
Object est enregistré avec l'objet qui le contient. Un objet qu'il faut retrouver seul est une
[Entity](../entite/README.md).

**Bon exemple.**

```ts
// la solution est chargée avec la question, par le repository des questions
const challenge = await challengeRepository.get(challengeId);
challenge.solution.isCorrect(answer.selectedChoiceIds);
```

**Mauvais exemple.**

```ts
// un repository pour retrouver une solution seule
const solution = await qcmSolutionRepository.get(solutionId);
```

**Ce que ça apporte.** La solution est toujours chargée avec sa question, en un seul appel au
repository des questions. Aucun code ne crée ni n'enregistre une solution seule.

**Sans cette règle.** Un repository a besoin d'un identifiant pour retrouver l'objet. L'objet reçoit
un identifiant, et l'objet devient une Entity sans qu'aucune revue ait décidé ce changement.

### V7. Lecture seule, tableaux compris

**La règle.** Aucun code hors de la classe ne peut modifier un champ, ni le contenu d'un tableau
interne. Un
accesseur qui renvoie un tableau renvoie une copie du tableau. Le constructeur garde aussi une copie
du tableau reçu.

**Bon exemple.**

```ts
get correctChoiceIds(): string[] {
  return [...this.#correctChoiceIds]; // une copie
}
```

**Mauvais exemple.**

```ts
get correctChoiceIds(): string[] {
  return this.#correctChoiceIds; // le tableau interne lui-même
}
```

**Ce que ça apporte.** Une fois créée, la solution ne change plus, même quand un appelant modifie le
tableau qu'il a reçu.

**Sans cette règle.** Le code qui appelle fait `solution.correctChoiceIds.push('b')`, et la solution de
la question change sans appel à une méthode de la solution.

**À savoir.** Certains fichiers appellent `Object.freeze(this)` pour empêcher les modifications.
`Object.freeze(this)` empêche de modifier les champs publics. `Object.freeze(this)` n'empêche pas de
modifier les champs privés `#`, et n'empêche pas `solution.correctChoiceIds.push('b')`. Seule la copie
empêche de modifier un tableau.
