# Entity

Une Entity est un objet que le produit suit dans le temps : un utilisateur, une campagne, la
certification passée par un candidat. Elle a un identifiant. Ses valeurs changent, mais elle reste la
même Entity. Les Entities se rangent dans `domain/models/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [E1](#e1-un-identifiant-qui-ne-change-pas) | Un identifiant qui ne change pas | aucune méthode ne modifie l'identifiant |
| [E2](#e2-comparer-par-identifiant) | Comparer par identifiant | on compare les `id`, pas les autres champs |
| [E3](#e3-toujours-valide) | Toujours valide | le constructeur et chaque méthode lèvent une `DomainError` si une règle n'est pas respectée |
| [E4](#e4-aucun-effet-de-bord-extérieur) | Aucun effet de bord extérieur | pas d'import d'infrastructure, pas de log ; la date du jour arrive en paramètre |
| [E5](#e5-rien-pour-la-base-de-données) | Rien pour la base de données | pas de `toDTO()` ni de `fromDTO()`, c'est le travail du repository |
| [E6](#e6-pas-de-setter) | Pas de setter | chaque changement a sa méthode métier : `endDueToFinalization()`, pas `set state()` |
| [E7](#e7-un-nom-du-métier) | Un nom du métier | un fichier par Entity, en PascalCase, nommé avec le mot du métier |
| [E8](#e8-pas-dautre-entity-dedans) | Pas d'autre Entity dedans | des id et des valeurs ; une Entity qui en contient d'autres est une Aggregate Root |

## Exemple complet

Une certification passée par un candidat, dans une session d'examen. Elle a un état (l'épreuve est
commencée, terminée, arrêtée…) et parfois un motif d'abandon. Exemple inventé, d'après
[`CertificationCourse.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/certification/session-management/domain/models/CertificationCourse.js#L5-L48).

```ts
// certification/session-management/domain/models/CertificationCourse.ts — E7 : un fichier, nommé avec le mot du métier
// E4 : aucun import d'infrastructure
import {
  CertificationCourseNotInProgressError,
  InvalidAbortReasonError,
  InvalidCertificationCourseStateError,
} from '../errors.js';

// as const plutôt qu'un enum : la configuration TypeScript de Pix (erasableSyntaxOnly) interdit les enum
export const CertificationCourseStates = [
  'started',
  'completed',
  'endedByInvigilator',
  'endedDueToFinalization',
  'endedDueToDurationExceeded',
] as const;
export type CertificationCourseState = (typeof CertificationCourseStates)[number];

export const AbortReasons = ['candidate', 'technical'] as const;
export type AbortReason = (typeof AbortReasons)[number];

export type CertificationCourseProps<Id> = {
  id: Id;
  userId: number;
  state: CertificationCourseState;
  abortReason: AbortReason | null;
};

// CertificationCourse<null> : une certification neuve, pas encore enregistrée
// CertificationCourse : une certification enregistrée, avec un id
export class CertificationCourse<Id extends number | null = number> {
  readonly id: Id; // E1 : en lecture seule
  readonly userId: number; // E8 : le candidat, gardé par son id
  #state: CertificationCourseState; // E6 : privé, seules les méthodes métier le modifient
  #abortReason: AbortReason | null; // E6 : privé

  // E3 : refuse une certification invalide
  constructor({ id, userId, state, abortReason }: CertificationCourseProps<Id>) {
    assertValidState(state);
    assertValidAbortReason(abortReason);
    this.id = id;
    this.userId = userId;
    this.#state = state;
    this.#abortReason = abortReason;
  }

  // le candidat démarre son épreuve : une certification neuve, sans id
  static start({ userId }: { userId: number }): CertificationCourse<null> {
    return new CertificationCourse({ id: null, userId, state: 'started', abortReason: null });
  }

  get state(): CertificationCourseState {
    return this.#state;
  }

  get abortReason(): AbortReason | null {
    return this.#abortReason;
  }

  get isInProgress(): boolean {
    return this.#state === 'started';
  }

  get isCompleted(): boolean {
    return this.#state === 'completed';
  }

  // E2 : on compare les id
  isSameAs(other: CertificationCourse): boolean {
    return this.id === other.id;
  }

  // E6 : un nom métier ; E3 : vérifier avant de modifier
  // le rapport donne un motif d'abandon, mais le candidat a terminé son épreuve : le motif est retiré
  finalize({ abortReason }: { abortReason: AbortReason | null }): void {
    assertValidAbortReason(abortReason);
    if (abortReason !== null && this.isCompleted) this.#abortReason = null;
  }

  // E6 : un nom métier ; E3 : seule une épreuve en cours peut être arrêtée
  // l'appelant vérifie isInProgress avant d'appeler cette méthode
  endDueToFinalization(): void {
    if (!this.isInProgress) throw new CertificationCourseNotInProgressError();
    this.#state = 'endedDueToFinalization'; // E4 : pas de log ici, le usecase l'écrit
  }

  // E5 : pas de toDTO(), la traduction vers la base est dans le repository
}

function assertValidState(state: string): void {
  if (!CertificationCourseStates.includes(state as CertificationCourseState)) {
    throw new InvalidCertificationCourseStateError(`Unknown state: ${state}`);
  }
}

function assertValidAbortReason(abortReason: string | null): void {
  if (abortReason !== null && !AbortReasons.includes(abortReason as AbortReason)) {
    throw new InvalidAbortReasonError(`Unknown abort reason: ${abortReason}`);
  }
}
```

## Comment tester

Une Entity se teste avec un test unitaire, sans stub, sans mock ni spy. Le test couvre :

- le constructeur : une Entity invalide n'est pas créée. Exemple : `refuses an unknown state` ;
- la création : une Entity neuve n'a pas d'`id`. Exemple : `starts a new certification, without id` ;
- chaque méthode qui modifie l'Entity : le cas qui marche, et le cas d'erreur. Après une erreur,
  l'Entity n'a pas changé. Exemples : `ends a started certification` et
  `refuses to end a certification not in progress, and changes nothing` ;
- les règles dans les méthodes, avec leurs cas limites. Exemple :
  `removes the abort reason when the candidate completed the exam`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/certification/session-management/unit/domain/models/CertificationCourse_test.ts
import { expect } from 'chai';

import {
  CertificationCourseNotInProgressError,
  InvalidAbortReasonError,
  InvalidCertificationCourseStateError,
} from '../../../../../../src/certification/session-management/domain/errors.js';
import {
  type AbortReason,
  CertificationCourse,
  type CertificationCourseProps,
  type CertificationCourseState,
} from '../../../../../../src/certification/session-management/domain/models/CertificationCourse.js';

describe('Unit | Certification | Session Management | Domain | Models | CertificationCourse', function () {
  const buildCertificationCourse = (props: Partial<CertificationCourseProps<number>> = {}) =>
    new CertificationCourse({
      id: 1,
      userId: 2,
      state: 'started',
      abortReason: null,
      ...props,
    });

  it('refuses an unknown state', function () {
    expect(() => buildCertificationCourse({ state: 'ended' as string as CertificationCourseState })).to.throw(
      InvalidCertificationCourseStateError,
    );
  });

  describe('.start', function () {
    it('starts a new certification, without id', function () {
      const certificationCourse = CertificationCourse.start({ userId: 2 });

      expect(certificationCourse.id).to.be.null;
      expect(certificationCourse.state).to.equal('started');
    });
  });

  describe('#finalize', function () {
    it('keeps the abort reason when the candidate did not complete the exam', function () {
      const certificationCourse = buildCertificationCourse({ state: 'started', abortReason: 'technical' });

      certificationCourse.finalize({ abortReason: 'technical' });

      expect(certificationCourse.abortReason).to.equal('technical');
    });

    it('removes the abort reason when the candidate completed the exam', function () {
      const certificationCourse = buildCertificationCourse({ state: 'completed', abortReason: 'candidate' });

      certificationCourse.finalize({ abortReason: 'candidate' });

      expect(certificationCourse.abortReason).to.be.null;
    });

    it('refuses an unknown abort reason, and changes nothing', function () {
      const certificationCourse = buildCertificationCourse({ abortReason: 'technical' });

      expect(() => certificationCourse.finalize({ abortReason: 'tired' as string as AbortReason })).to.throw(
        InvalidAbortReasonError,
      );
      expect(certificationCourse.abortReason).to.equal('technical');
    });
  });

  describe('#endDueToFinalization', function () {
    it('ends a started certification', function () {
      const certificationCourse = buildCertificationCourse({ state: 'started' });

      certificationCourse.endDueToFinalization();

      expect(certificationCourse.state).to.equal('endedDueToFinalization');
    });

    it('refuses to end a certification not in progress, and changes nothing', function () {
      const certificationCourse = buildCertificationCourse({ state: 'completed' });

      expect(() => certificationCourse.endDueToFinalization()).to.throw(CertificationCourseNotInProgressError);
      expect(certificationCourse.state).to.equal('completed');
    });
  });
});
```

## Checklist de revue de code

```
Peut-elle devenir invalide ?
[ ] E3  Le constructeur et chaque méthode refusent un état invalide
[ ] E6  Pas de setter ; chaque changement a sa méthode métier

Dépend-elle d'autre chose ?
[ ] E4  Pas d'import d'infrastructure, pas de new Date(), Math.random() ni config
[ ] E5  Pas de méthode utilisée seulement par le repository
[ ] E8  Aucune autre Entity dedans, seulement des id et des valeurs

Son identité est-elle fixe ?
[ ] E1  Aucune méthode ne modifie l'identifiant
[ ] E2  Les comparaisons se font sur l'id
[ ] E7  Un fichier en PascalCase, nommé avec le mot du métier

Tests
[ ] Chaque méthode qui modifie l'Entity a un test du cas d'erreur
```

## Référence des règles

### E1. Un identifiant qui ne change pas

**La règle.** L'identifiant est un champ de l'Entity, souvent nommé `id`. Aucune méthode ne le
modifie.

L'identifiant n'est pas forcément un nombre. En DDD, il vient de la façon dont le métier reconnaît
l'objet. Dans Pix, il prend plusieurs formes :

- un entier créé par la base de données, le cas le plus courant : `CertificationCourse` ;
- une chaîne venue du référentiel : `skillId`, `tubeId`, `challengeId` ;
- un UUID : les modules, les chats ;
- une valeur du métier : le `code` d'une campagne, le `slug` d'un module.

**Exemple de code correct.**

```ts
// CertificationCourse
  readonly id: Id; // E1 : en lecture seule
```

**Exemple de code incorrect.**

```ts
export class CertificationCourse {
  id: number; // public : modifiable de partout
}
```

**Ce que ça apporte.** Une Entity se compare et se retrouve par son seul identifiant.

**Sans cette règle.** Si du code change l'`id` d'une certification, le repository écrase les données
d'une autre certification avec les siennes.

**À savoir.** La base de données crée l'`id` à l'enregistrement, donc une Entity neuve n'en a pas
encore. Le type le dit : `CertificationCourse<null>` pour une certification neuve,
`CertificationCourse` pour une certification enregistrée.

```ts
interface CertificationCourseRepository {
  add({ certificationCourse }: { certificationCourse: CertificationCourse<null> }): Promise<CertificationCourse>; // la base crée l'id
  get({ id }: { id: number }): Promise<CertificationCourse>;
  update({ certificationCourse }: { certificationCourse: CertificationCourse }): Promise<void>;
}
```

Chaque usecase dit quelle forme il attend :

```ts
// usecases raccourcis : la transaction est montrée dans la fiche usecase

// création : le usecase crée une certification neuve
const startCertification = async ({
  userId,
  certificationCourseRepository,
}: {
  userId: number;
  certificationCourseRepository: CertificationCourseRepository;
}): Promise<CertificationCourse> => {
  const certificationCourse = CertificationCourse.start({ userId });
  return certificationCourseRepository.add({ certificationCourse });
};

// modification : le usecase reçoit l'id, charge l'Entity puis appelle sa méthode
const endCertificationDueToFinalization = async ({
  certificationCourseId,
  certificationCourseRepository,
}: {
  certificationCourseId: number;
  certificationCourseRepository: CertificationCourseRepository;
}): Promise<CertificationCourse> => {
  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });
  if (certificationCourse.isInProgress) certificationCourse.endDueToFinalization();
  await certificationCourseRepository.update({ certificationCourse });
  return certificationCourse;
};
```

Le compilateur vérifie que `add()` ne reçoit pas une certification déjà enregistrée, et que `update()`
ne reçoit pas une certification neuve. Une `CertificationCourse`, sans `<null>`, a toujours un `id`.

### E2. Comparer par identifiant

**La règle.** Deux objets avec le même `id` sont la même Entity, même si leurs autres champs
diffèrent. Deux objets avec des `id` différents sont deux Entities, même si tout le reste est égal.

**Exemple de code correct.**

```ts
// CertificationCourse
isSameAs(other: CertificationCourse): boolean {
  return this.id === other.id;
}
```

**Exemple de code incorrect.**

```ts
// CertificationCourse
isSameAs(other: CertificationCourse): boolean {
  return this.userId === other.userId; // compare le candidat, pas l'id
}
```

**Ce que ça apporte.** La même Entity, chargée à deux moments différents, est bien reconnue comme la
même, même si son état a changé entre-temps.

**Sans cette règle.** Un candidat qui passe deux certifications a deux certifications avec le même
`userId`. La comparaison les confond, et on finalise la mauvaise.

### E3. Toujours valide

**La règle.** Une Entity invalide n'est jamais créée, et aucune méthode ne peut la rendre invalide.
Chaque méthode vérifie d'abord la règle. Si la règle n'est pas respectée, elle lève une erreur du
domaine et ne modifie rien.

**Exemple de code correct.**

```ts
// CertificationCourse
endDueToFinalization(): void {
  if (!this.isInProgress) throw new CertificationCourseNotInProgressError(); // vérifier d'abord
  this.#state = 'endedDueToFinalization'; // modifier ensuite
}
```

**Exemple de code incorrect.**

```ts
// CertificationCourse
constructor({ id, userId, state, abortReason }: CertificationCourseProps<Id>) {
  this.id = id;
  this.#state = state; // aucune vérification au constructeur
  …
}

validate(): void { … } // une méthode à part, que l'appelant doit penser à appeler
```

**Ce que ça apporte.** Quand on reçoit une certification, on sait que son état existe. Il n'y a rien à
revérifier, et la règle n'est écrite qu'une fois, dans l'Entity.

**Sans cette règle.** L'état est vérifié par une méthode à part. Un usecase oublie de l'appeler, et on
enregistre une certification avec l'état `ended`, que le reste du code ne connaît pas.

**À savoir.** Si une méthode modifie plusieurs champs, elle vérifie tout avant de modifier le premier.
Sinon, une erreur en cours de route laisse l'Entity à moitié modifiée.

### E4. Aucun effet de bord extérieur

**La règle.** Une Entity n'importe rien de l'infrastructure : pas de base de données, pas de log, pas
d'appel HTTP. Elle n'appelle pas `new Date()` ni `Math.random()`, et ne lit pas la configuration. Ces
valeurs arrivent en paramètre. Si une règle a besoin d'une donnée que l'Entity n'a pas, le usecase la
charge et la passe en paramètre.

**Exemple de code correct.**

```ts
// CertificationCourse
endDueToFinalization(): void {
  if (!this.isInProgress) throw new CertificationCourseNotInProgressError();
  this.#state = 'endedDueToFinalization'; // E4 : pas de log ici, le usecase l'écrit
}
```

**Exemple de code incorrect.**

```ts
// CertificationCourse
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

endDueToFinalization(): void {
  if (!this.isInProgress) throw new CertificationCourseNotInProgressError();
  this.#state = 'endedDueToFinalization';
  logger.info({ certificationCourseId: this.id }, 'certification ended'); // l'Entity écrit un log
}
```

**Ce que ça apporte.** Le résultat ne dépend que des champs de l'Entity et des paramètres. Le test
appelle la méthode et vérifie le résultat, sans rien simuler.

**Sans cette règle.** Le test de l'Entity charge le logger de l'infrastructure, et doit le simuler
pour vérifier le log. Pour une date, c'est pareil : une Entity qui appelle `new Date()` ne donne pas
le même résultat d'un lancement à l'autre, et le test doit figer l'heure.

**À savoir.** Un import d'infrastructure ne se voit pas toujours. Un utilitaire importé depuis un
dossier `infrastructure/`, même pour formater une date, en est un.

### E5. Rien pour la base de données

**La règle.** Traduire une Entity vers la base de données, ou l'inverse, c'est le travail du
repository. L'Entity n'a pas de méthode que seul le repository utilise, comme `toDTO()` ou
`fromDTO()`.

**Exemple de code correct.**

```ts
// certification/session-management/infrastructure/repositories/certification-course-repository.ts
const toCertificationCourseRow = (certificationCourse: CertificationCourse) => ({
  id: certificationCourse.id,
  abortReason: certificationCourse.abortReason,
});

const toAssessmentRow = (certificationCourse: CertificationCourse) => ({
  certificationCourseId: certificationCourse.id,
  state: certificationCourse.state,
});
```

La certification est écrite dans deux tables, `certification-courses` et `assessments`. Les deux
traductions sont des fonctions du repository, pas des méthodes de l'Entity.

**Exemple de code incorrect.**

```ts
export class CertificationCourse {
  toDTO() {
    // seul le repository appelle cette méthode
    return { id: this.id, abortReason: this.abortReason, 'assessments.state': this.state };
  }
}
```

**Ce que ça apporte.** L'Entity ne contient aucun nom de table ni de colonne. Un changement dans la
base de données ne touche que le repository.

**Sans cette règle.** Déplacer l'état de l'épreuve de la table `assessments` vers la table
`certification-courses` oblige à modifier l'Entity.

### E6. Pas de setter

**La règle.** Chaque changement passe par une méthode au nom métier, comme `finalize()` ou
`endDueToFinalization()`. Pas de setter public, et pas de champ modifié depuis l'extérieur : un usecase
qui écrit `certificationCourse.state = 'endedDueToFinalization'` ne respecte pas la règle.

**Exemple de code correct.**

```ts
// CertificationCourse
#state: CertificationCourseState; // E6 : privé, seules les méthodes métier le modifient

endDueToFinalization(): void {
  …
}
```

**Exemple de code incorrect.**

```ts
// CertificationCourse
#state: CertificationCourseState;

set state(value: CertificationCourseState) {
  this.#state = value; // tout le monde peut changer l'état, sans vérification
}
```

**Ce que ça apporte.** Chaque changement passe par une seule méthode, qui vérifie la règle (E3). Et le
nom de la méthode dit ce qui se passe côté métier.

**Sans cette règle.** Un setter modifie le champ sans rien vérifier. `certificationCourse.state =
'endedDueToFinalization'` sur une épreuve terminée la fait repasser à l'état arrêté, sans erreur.

**À savoir.** Une certification remplie par `setUserId(…)` puis `setState(…)` est invalide entre les
deux appels : elle a un candidat, mais pas d'état. Les valeurs de départ passent toutes par le
constructeur.

**Exceptions.** Une Entity sans méthode de modification est permise : certaines Entities ne changent
jamais.

### E7. Un nom du métier

**La règle.** Un fichier par Entity, dans `domain/models/`. Le fichier porte le nom métier de l'Entity,
en PascalCase.

**Exemple de code correct.** `certification/session-management/domain/models/CertificationCourse.ts`.

**Exemple de code incorrect.** `certification/session-management/domain/models/course-model.ts`.

**Ce que ça apporte.** En cherchant le mot du métier, par exemple « CertificationCourse », on trouve le
fichier.

**Sans cette règle.** On ne retrouve pas le fichier en cherchant le mot du métier, et il faut l'ouvrir
pour savoir ce qu'il contient.

**Exceptions.** Deux dossiers de `src/`, comme `certification/shared` et
`certification/session-management`, peuvent avoir chacun une Entity du même nom, ici
`CertificationCourse`, avec un sens différent. Le chemin de l'import montre de quel dossier elle
vient.

### E8. Pas d'autre Entity dedans

**La règle.** Une Entity ne contient pas d'autre Entity. Elle contient des identifiants et des
valeurs, comme un état ou un Value Object. Une Entity qui contient d'autres Entities et les modifie
est une Aggregate Root : voir la fiche Aggregate Root.

**Exemple de code correct.**

```ts
// CertificationCourse
  readonly userId: number; // E8 : le candidat, gardé par son id
```

**Exemple de code incorrect.**

```ts
// CertificationCourse
  readonly candidate: Candidate; // une autre Entity, gardée entière
```

**Ce que ça apporte.** En lisant une Entity, on sait qu'elle ne modifie qu'elle-même. Quand un objet
doit en modifier d'autres, on le voit tout de suite : c'est une Aggregate Root, avec ses propres
règles.

**Sans cette règle.** La certification garde le candidat entier. Le repository charge le candidat
avec chaque certification, et on peut modifier le candidat en passant par la certification.
