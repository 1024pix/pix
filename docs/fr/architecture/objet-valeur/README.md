# Value Object

Un Value Object représente une valeur du métier : un statut, un seuil, la bonne réponse d'une
question. Il n'a pas d'identifiant. Deux Value Objects avec les mêmes valeurs sont égaux, comme deux
billets de 10 €. Les Value Objects se rangent dans `domain/models/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [V1](#v1-immuable) | Immuable | les champs sont privés, et aucune méthode ne les modifie |
| [V2](#v2-pas-didentifiant) | Pas d'identifiant | pas d'`id` propre ; garder l'`id` d'autre chose, comme `challengeId`, est permis |
| [V3](#v3-valide-dès-la-construction) | Valide dès la construction | le constructeur lève une `DomainError` si une valeur est invalide |
| [V4](#v4-aucun-effet-de-bord-extérieur) | Aucun effet de bord extérieur | pas d'import d'infrastructure ; la date du jour est passée en paramètre |
| [V5](#v5-contient-ses-règles) | Contient ses règles | une règle sur ses données est une de ses méthodes |
| [V6](#v6-pas-de-repository) | Pas de [repository](../repository/README.md) | il est enregistré avec l'objet qui le contient |
| [V7](#v7-lecture-seule-tableaux-compris) | Lecture seule, tableaux compris | un getter renvoie une copie : `[...this.#items]`, pas `this.#items` |

## Exemple complet

La bonne réponse d'une question à choix multiples (QCM), c'est-à-dire la liste des choix corrects. Exemple inventé, d'après [`Solution.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Solution.js#L6-L35).

```ts
// devcomp/domain/models/QcmSolution.ts
import type { ChallengeId } from '../../../shared/domain/Id.js';
import { InvalidQcmSolutionError } from '../errors.js';

export class QcmSolution {
  readonly challengeId: ChallengeId; // V2 : l'identifiant de la question, pas celui de la solution
  #correctChoiceIds: string[]; // V1 : privé, personne ne peut le modifier hors de la classe

  // V3 : refuse une valeur invalide
  constructor({ challengeId, correctChoiceIds }: { challengeId: ChallengeId; correctChoiceIds: string[] }) {
    if (correctChoiceIds.length === 0) {
      throw new InvalidQcmSolutionError('A QCM needs at least one correct choice');
    }
    if (new Set(correctChoiceIds).size !== correctChoiceIds.length) {
      throw new InvalidQcmSolutionError('A correct choice appears twice');
    }
    this.challengeId = challengeId;
    this.#correctChoiceIds = [...correctChoiceIds]; // V7 : garde une copie du tableau reçu
  }

  // V7 : renvoie une copie du tableau
  get correctChoiceIds(): string[] {
    return [...this.#correctChoiceIds];
  }

  // V5 : la règle de correction est dans la solution
  isCorrect(selectedChoiceIds: string[]): boolean {
    return (
      selectedChoiceIds.length === this.#correctChoiceIds.length &&
      selectedChoiceIds.every((choiceId) => this.#correctChoiceIds.includes(choiceId))
    );
  }

  // V2 : deux solutions sont égales si leurs valeurs sont égales
  equals(other: QcmSolution): boolean {
    return other.challengeId === this.challengeId && other.isCorrect(this.#correctChoiceIds);
  }

  // V4 : pas d'import d'infrastructure, pas de new Date()
  // V6 : pas de repository, la solution est enregistrée avec la question
}
```

## Comment tester

Un Value Object se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- la validation : une valeur invalide lève une erreur. Exemple : `refuses a solution without correct choice` ;
- les règles : chaque méthode, cas limites compris. Exemples : les trois tests de `isCorrect` ;
- l'immuabilité : modifier un tableau renvoyé ne change pas l'objet. Exemple :
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

## Checklist de revue de code

```
Ses règles sont-elles dedans ?
[ ] V3  Le constructeur refuse une valeur invalide
[ ] V5  Les règles sur ses données sont des méthodes

Peut-on le modifier de l'extérieur ?
[ ] V1  Pas de champ public, pas de méthode qui modifie un champ
[ ] V7  Pas de tableau interne renvoyé tel quel

Dépend-il d'autre chose ?
[ ] V4  Pas d'import d'infrastructure, pas de new Date(), Math.random() ni config
[ ] V2  Pas d'id propre, pas de clé construite pour le front
[ ] V6  Pas de repository

Tests
[ ] Un test unitaire, sans stub, mock ni spy
```

## Référence des règles

### V1. Immuable

**La règle.** Une fois créé, l'objet ne change plus. Ses champs sont privés ou en lecture seule, et
aucune méthode ne les modifie. Pour une autre valeur, on crée un autre objet.

**Bon exemple.**

```ts
readonly challengeId: ChallengeId; // en lecture seule
#correctChoiceIds: string[]; // privé
```

**Mauvais exemple.**

```ts
export class QcmSolution {
  challengeId: ChallengeId; // public : modifiable de partout
  correctChoiceIds: string[]; // public : modifiable de partout
}
```

**Ce que ça apporte.** On peut passer la même solution à plusieurs fonctions, ou la garder en cache.
Aucune ne peut la modifier dans le dos des autres.

**Sans cette règle.** Un bout de code modifie la solution pendant qu'un autre s'en sert pour corriger
une réponse. La réponse est mal corrigée. Le bug apparaît loin de la modification, et seulement dans
un certain ordre d'exécution : il est difficile à trouver.

**À savoir.** La règle vaut aussi pour les champs hérités d'une classe parente.

### V2. Pas d'identifiant

**La règle.** Un Value Object n'a pas d'identifiant propre. Deux Value Objects avec les mêmes valeurs
sont égaux. Il peut garder l'identifiant d'autre chose, comme `challengeId` : c'est une donnée comme
une autre.

**Bon exemple.**

```ts
equals(other: QcmSolution): boolean {
  return other.challengeId === this.challengeId && other.isCorrect(this.#correctChoiceIds);
}
```

La comparaison porte sur les valeurs. `challengeId` identifie la question, pas la solution.

**Mauvais exemple.**

```ts
export class QcmSolution {
  readonly id: number; // un identifiant propre, qu'aucune règle n'utilise
}
```

**Ce que ça apporte.** On peut remplacer une solution par une autre qui a les mêmes valeurs, sans
rien changer au résultat.

**Sans cette règle.** Avec un identifiant, quelqu'un finit par ajouter une méthode pour retrouver
l'objet, puis un repository. L'objet devient une Entity sans que personne l'ait décidé.

**Exceptions.** Le front a souvent besoin d'une clé unique pour son cache. Où la construire ?

- si le front ne renvoie jamais la clé au serveur : dans le [sérialiseur](../serialiseur/README.md) ;
- si le front la renvoie et que le serveur la découpe : dans un Value Object, qui la construit, la
  découpe et la valide ;
- si l'objet a une vraie identité métier faite de plusieurs champs : c'est une
  [Entity](../entite/README.md).

### V3. Valide dès la construction

**La règle.** Le constructeur vérifie les valeurs reçues. Si une valeur est invalide, il lève une
erreur du domaine et l'objet n'est pas créé.

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
  this.challengeId = challengeId; // tout est accepté
  this.#correctChoiceIds = correctChoiceIds;
}
```

**Ce que ça apporte.** Un objet invalide ne peut pas exister. Le code qui reçoit l'objet n'a donc rien
à revérifier.

**Sans cette règle.** On peut créer une solution sans choix correct. `isCorrect([])` répond alors
`true`, et une réponse vide compte comme juste.

**À savoir.** Si le Value Object contient d'autres objets, il les valide aussi.

### V4. Aucun effet de bord extérieur

**La règle.** Un Value Object n'importe rien de l'infrastructure : pas de base de données, pas de log,
pas d'appel HTTP. Il n'appelle pas `new Date()` ni `Math.random()`, et ne lit pas la configuration. Si
ces valeurs sont nécessaires, elles arrivent en paramètre.

**Bon exemple.**

```ts
// la solution calcule, sans écrire de log
isCorrect(selectedChoiceIds: string[]): boolean {
  return …;
}

// le usecase écrit le log, s'il en a besoin
const isCorrect = solution.isCorrect(answer.selectedChoiceIds);
logger.info(`Answer checked for challenge ${solution.challengeId}`);
```

C'est le même log que dans le mauvais exemple, mais écrit par le usecase.

**Mauvais exemple.**

```ts
import { logger } from '../../../shared/infrastructure/utils/logger.js';

isCorrect(selectedChoiceIds: string[]): boolean {
  const isCorrect = …;
  logger.info(`Answer checked for challenge ${this.challengeId}`); // la solution écrit un log
  return isCorrect;
}
```

**Ce que ça apporte.** Le résultat ne dépend que des paramètres. Le test est rapide et n'a besoin
d'aucun stub.

**Sans cette règle.** Le test doit simuler le log, l'heure ou la base de données. Et un objet qui
appelle `new Date()` ne donne pas le même résultat d'un lancement à l'autre.

### V5. Contient ses règles

**La règle.** Une règle qui porte sur les données du Value Object est une de ses méthodes. Sinon,
chaque appelant réécrit la règle.

**Bon exemple.**

```ts
solution.isCorrect(answer.selectedChoiceIds); // la règle de correction est dans la solution
```

**Mauvais exemple.**

```ts
// dans un usecase : la règle de correction est réécrite à la main
const isCorrect =
  answer.selectedChoiceIds.length === solution.correctChoiceIds.length &&
  answer.selectedChoiceIds.every((choiceId) => solution.correctChoiceIds.includes(choiceId));
```

**Ce que ça apporte.** La règle existe à un seul endroit. Pour la changer, on modifie seulement
`QcmSolution.ts`.

**Sans cette règle.** La règle est copiée dans chaque [usecase](../usecase/README.md) qui corrige une
réponse. Un jour, une copie diverge, et la même réponse est juste sur un écran et fausse sur un autre.

**À savoir.** Un calcul pour l'affichage n'est pas une règle, car il ne décide rien. Le pourcentage de
bonnes réponses arrondi pour un écran n'a pas sa place dans `QcmSolution`.

**Exceptions.** Un Value Object sans méthode est accepté s'il sert seulement à typer une valeur. Une
fonction qui attend une `QcmSolution` refuse alors une simple liste de chaînes.

### V6. Pas de repository

**La règle.** Un Value Object n'a ni repository ni table à lui. Il est enregistré avec l'objet qui le
contient. Un objet qu'il faut retrouver seul est une [Entity](../entite/README.md).

**Bon exemple.**

```ts
// la solution arrive avec la question, par le repository des questions
const challenge = await challengeRepository.get(challengeId);
challenge.solution.isCorrect(answer.selectedChoiceIds);
```

**Mauvais exemple.**

```ts
// un repository rien que pour les solutions
const solution = await qcmSolutionRepository.get(solutionId);
```

**Ce que ça apporte.** La solution arrive toujours avec sa question, en un seul appel. Elle n'est
jamais créée ni enregistrée seule.

**Sans cette règle.** Pour retrouver l'objet, le repository a besoin d'un identifiant. L'objet en
reçoit un, et devient une Entity sans que personne l'ait décidé.

### V7. Lecture seule, tableaux compris

**La règle.** On ne peut rien modifier depuis l'extérieur, pas même le contenu d'un tableau. Un getter
qui renvoie un tableau renvoie une copie, et le constructeur garde une copie du tableau reçu.

**Bon exemple.**

```ts
get correctChoiceIds(): string[] {
  return [...this.#correctChoiceIds]; // une copie
}
```

**Mauvais exemple.**

```ts
get correctChoiceIds(): string[] {
  return this.#correctChoiceIds; // le tableau interne, modifiable par l'appelant
}
```

**Ce que ça apporte.** La solution ne change plus après sa création, même si l'appelant modifie le
tableau qu'il a reçu.

**Sans cette règle.** Un appel à `solution.correctChoiceIds.push('b')` change la solution, sans passer
par aucune de ses méthodes.

**À savoir.** `Object.freeze(this)` ne suffit pas. Il bloque les champs publics, mais pas les champs
privés `#`, ni le contenu des tableaux. Pour un tableau, seule la copie protège.
