# Domain Service

Un Domain Service porte une règle du métier qui ne relève d'aucune [Entity](../entite/README.md) ni
d'aucun [Value Object](../objet-valeur/README.md). Il calcule à partir des objets qu'on lui donne, sans
rien charger ni enregistrer. Par exemple : trouver les paliers qu'une participation à une campagne
vient d'atteindre. Les Domain Services se rangent dans `domain/services/`, et ce dossier ne contient
qu'eux.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [D1](#d1-aucune-io) | Aucune I/O | aucun repository ni API en paramètre ; la date du jour arrive en paramètre |
| [D2](#d2-des-objets-du-domaine-en-entrée-et-en-sortie) | Des objets du domaine en entrée et en sortie | des Entities, des Value Objects ou des scalaires ; jamais une ligne de base ni un DTO |
| [D3](#d3-sans-état-sans-effet-sur-ses-entrées) | Sans état, sans effet sur ses entrées | une fonction exportée, qui ne modifie pas ce qu'elle reçoit |
| [D4](#d4-un-service-seulement-si-aucun-objet-ne-porte-la-règle) | Un service seulement si aucun objet ne porte la règle | une règle sur les données d'un seul objet est une méthode de cet objet |
| [D5](#d5-nommé-par-la-règle) | Nommé par la règle | `get-new-acquired-stages.ts`, pas `stage-service.ts` |

## Exemple complet

Les paliers qu'une participation vient d'atteindre. Un palier est une étape de progression d'un profil
cible. Il est défini par un seuil, en pourcentage de maîtrise, ou par un niveau. Les paliers
appartiennent au profil cible, et les paliers déjà acquis à la participation. La règle croise les deux
avec le résultat de la participation :

- un palier déjà acquis ne se gagne pas une seconde fois ;
- le palier zéro est toujours atteint ;
- le palier « premier acquis » est atteint dès qu'un acquis est validé ;
- les autres paliers sont atteints quand le pourcentage de maîtrise atteint leur seuil.

Exemple inventé, d'après [`get-new-acquired-stages-service.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/stages/domain/services/get-new-acquired-stages-service.js#L12-L19)
et [`Stage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/stages/domain/models/Stage.js#L38-L40).

```ts
// prescription/stages/domain/models/Stage.ts — raccourcie : on a retiré les titres et les messages
import type { StageId } from '../../../../shared/domain/Id.js';

export type StageProps = {
  id: StageId;
  threshold: number | null;
  level: number | null;
  isFirstSkill: boolean;
};

export class Stage {
  readonly id: StageId;
  readonly threshold: number | null;
  readonly level: number | null;
  readonly isFirstSkill: boolean;

  constructor({ id, threshold, level, isFirstSkill }: StageProps) {
    this.id = id;
    this.threshold = threshold;
    this.level = level;
    this.isFirstSkill = isFirstSkill;
  }

  // D4 : une règle sur les données d'un seul palier est une méthode du palier
  get isZeroStage(): boolean {
    return this.level === 0 || this.threshold === 0;
  }
}
```

```ts
// prescription/stages/domain/services/get-new-acquired-stages.ts — D5 : le nom dit la règle
import type { StageId } from '../../../../shared/domain/Id.js';
import type { Stage } from '../models/Stage.js';

type GetNewAcquiredStagesInput = {
  stages: Stage[];
  validatedSkillCount: number;
  masteryPercentage: number;
  alreadyAcquiredStageIds: StageId[];
};

// D1 : aucun repository ; tout arrive en paramètre, déjà chargé par le usecase
// D2 : des Stages et des scalaires en entrée, des Stages en sortie
// D3 : une fonction exportée, sans état ; filter renvoie un nouveau tableau
// D4 : la règle croise les paliers du profil cible et le résultat de la participation
export function getNewAcquiredStages({
  stages,
  validatedSkillCount,
  masteryPercentage,
  alreadyAcquiredStageIds,
}: GetNewAcquiredStagesInput): Stage[] {
  return stages.filter((stage) => {
    if (alreadyAcquiredStageIds.includes(stage.id)) return false;
    if (stage.isZeroStage) return true;
    if (stage.isFirstSkill) return validatedSkillCount >= 1;

    return stage.threshold !== null && stage.threshold <= masteryPercentage;
  });
}
```

```ts
// prescription/stages/domain/usecases/handle-stage-acquisition.ts — raccourci : le usecase a déjà
// chargé stages, et calculé validatedSkillCount et masteryPercentage
const alreadyAcquiredStageIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation({
  campaignParticipationId: campaignParticipation.id,
});

const stagesToStore = getNewAcquiredStages({ stages, validatedSkillCount, masteryPercentage, alreadyAcquiredStageIds });

await stageAcquisitionRepository.saveStages({ stages: stagesToStore, campaignParticipationId: campaignParticipation.id });
```

## Comment tester

Un Domain Service se teste avec un test unitaire, sans stub, mock ni spy. Si le test a besoin d'un
stub, le service fait des I/O, et c'est en fait un [usecase](../usecase/README.md). Le test couvre :

- chaque cas de la règle. Exemples : `gives the zero stage, even without any validated skill`,
  `gives the first-skill stage once a skill is validated` ;
- les cas limites. Exemples : `gives the stages whose threshold is reached, limit included`,
  `does not give a stage already acquired` ;
- le fait que les objets reçus n'ont pas changé. Exemple : `does not change the stages it receives`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/prescription/stages/unit/domain/services/get-new-acquired-stages_test.ts
import { expect } from 'chai';

import type { StageId } from '../../../../../../src/shared/domain/Id.js';
import { Stage, type StageProps } from '../../../../../../src/prescription/stages/domain/models/Stage.js';
import { getNewAcquiredStages } from '../../../../../../src/prescription/stages/domain/services/get-new-acquired-stages.js';

describe('Unit | Prescription | Stages | Domain | Services | get new acquired stages', function () {
  const buildStage = (props: Partial<StageProps> = {}) =>
    new Stage({ id: 1 as StageId, threshold: null, level: null, isFirstSkill: false, ...props });

  const zeroStage = buildStage({ id: 1 as StageId, threshold: 0 });
  const firstSkillStage = buildStage({ id: 2 as StageId, isFirstSkill: true });
  const stage20 = buildStage({ id: 3 as StageId, threshold: 20 });
  const stage34 = buildStage({ id: 4 as StageId, threshold: 34 });
  const stage40 = buildStage({ id: 5 as StageId, threshold: 40 });

  const noResult = { validatedSkillCount: 0, masteryPercentage: 0, alreadyAcquiredStageIds: [] };

  it('gives the zero stage, even without any validated skill', function () {
    const stages = getNewAcquiredStages({ ...noResult, stages: [zeroStage, stage20] });

    expect(stages).to.deep.equal([zeroStage]);
  });

  it('gives the first-skill stage once a skill is validated', function () {
    const stages = getNewAcquiredStages({ ...noResult, stages: [firstSkillStage], validatedSkillCount: 1 });

    expect(stages).to.deep.equal([firstSkillStage]);
  });

  it('does not give the first-skill stage without a validated skill', function () {
    const stages = getNewAcquiredStages({ ...noResult, stages: [firstSkillStage] });

    expect(stages).to.be.empty;
  });

  it('gives the stages whose threshold is reached, limit included', function () {
    const stages = getNewAcquiredStages({ ...noResult, stages: [stage20, stage34, stage40], masteryPercentage: 34 });

    expect(stages).to.deep.equal([stage20, stage34]);
  });

  it('does not give a stage already acquired', function () {
    const stages = getNewAcquiredStages({
      ...noResult,
      stages: [zeroStage, stage20],
      masteryPercentage: 50,
      alreadyAcquiredStageIds: [zeroStage.id],
    });

    expect(stages).to.deep.equal([stage20]);
  });

  it('does not change the stages it receives', function () {
    const stages = [stage40, zeroStage, stage20];

    getNewAcquiredStages({ ...noResult, stages, masteryPercentage: 50, alreadyAcquiredStageIds: [zeroStage.id] });

    expect(stages).to.deep.equal([stage40, zeroStage, stage20]);
  });
});
```

## Checklist de revue de code

```
Fait-il des I/O ?
[ ] D1  Aucun paramètre *Repository, *Api ou *Storage ; aucun import d'infrastructure
[ ] D1  Pas de log, pas de new Date(), Math.random() ni config lue : tout arrive en paramètre

Que reçoit-il, que renvoie-t-il ?
[ ] D2  Des objets du domaine du contexte ou des scalaires ; ni ligne de base, ni DTO, ni read-model
[ ] D3  Aucun champ ni variable du module ; aucun objet reçu n'est modifié (sort, splice, push, setter)

Avait-il sa place ici ?
[ ] D4  La règle ne pouvait aller ni sur un Value Object, ni sur une Entity, ni sur une Aggregate Root
[ ] D4  Un seul objet en entrée : la règle appartient-elle à cet objet ?
[ ] D5  Le nom du fichier dit la règle ; pas de nom de ressource suffixé -service

Comment est-il testé ?
[ ] Un test unitaire, sans stub, mock ni spy, cas limites compris
[ ] Un test vérifie que les objets reçus n'ont pas changé
```

## Référence des règles

### D1. Aucune I/O

**La règle.** Un Domain Service ne lit et n'écrit rien : pas de base de données, pas d'appel HTTP, pas
de fichier. Il ne reçoit ni repository, ni API interne, ni client de stockage. Un fichier qui charge
ou enregistre des données est un [usecase](../usecase/README.md), et il va dans `domain/usecases/`,
même s'il est appelé par plusieurs usecases.

**Bon exemple.**

```ts
// handle-stage-acquisition.ts : le usecase charge les paliers déjà acquis, puis les passe au service
const alreadyAcquiredStageIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation({
  campaignParticipationId: campaignParticipation.id,
});

const stagesToStore = getNewAcquiredStages({ stages, validatedSkillCount, masteryPercentage, alreadyAcquiredStageIds });
```

**Mauvais exemple.**

```ts
// get-new-acquired-stages.ts : le service reçoit un repository et charge lui-même les paliers déjà acquis
export async function getNewAcquiredStages({
  stages,
  campaignParticipationId,
  validatedSkillCount,
  masteryPercentage,
  stageAcquisitionRepository,
}: GetNewAcquiredStagesWithRepositoryInput): Promise<Stage[]> {
  const alreadyAcquiredStageIds = await stageAcquisitionRepository.getStageIdsByCampaignParticipation({
    campaignParticipationId,
  });
  // …
}
```

**Ce que ça apporte.** La règle des paliers se teste avec quelques `Stage` construits dans le test.
Le test n'a besoin ni de base ni de stub. Le usecase choisit comment charger les données : une
participation à la fois, ou toute une campagne en une requête.

**Sans cette règle.** Un second usecase recalcule les paliers de toutes les participations d'une
campagne, après un changement de seuils. Il appelle le service dans une boucle, et le service lance une
requête SQL à chaque appel. Pour une campagne de 10 000 participants, cela fait 10 000 requêtes. Avec
D1, le usecase charge les paliers déjà acquis de toute la campagne en une requête, puis appelle le
service en mémoire.

**À savoir.** La règle vise aussi ce qu'on oublie, et chaque cas a son problème :

- l'heure (`new Date()`) : le résultat dépend du jour où le test tourne ;
- l'aléatoire (`Math.random()`) : deux appels avec les mêmes paliers ne donnent pas le même résultat ;
- la configuration lue dans l'environnement : le test dépend de la machine qui le lance ;
- le log : le service importe le logger de l'infrastructure, et le test écrit dans la sortie.

Si le service a besoin d'une de ces valeurs, le usecase la lui passe en paramètre, comme `now` dans
une Entity. Une bibliothèque de calcul, comme `dayjs`, est permise : elle ne fait pas d'I/O.

**Exceptions.**

- Le fichier `index.js` de `domain/services/`, s'il existe, importe l'infrastructure pour câbler les
  dépendances. Il ne porte aucune règle, et D1 ne s'applique pas à lui.
- Une constante de configuration passée en paramètre est permise : c'est une donnée.

### D2. Des objets du domaine en entrée et en sortie

**La règle.** Le service reçoit et renvoie des Entities, des Value Objects ou des scalaires du
contexte. Il ne reçoit jamais une ligne de base, ni le DTO d'un autre contexte, et ne renvoie pas un
objet préparé pour l'affichage.

**Bon exemple.**

```ts
// get-new-acquired-stages.ts
type GetNewAcquiredStagesInput = {
  stages: Stage[];
  validatedSkillCount: number;
  masteryPercentage: number;
  alreadyAcquiredStageIds: StageId[];
};
```

Le service reçoit des `Stage`, et peut donc lire `stage.isZeroStage`.

**Mauvais exemple.**

```ts
// get-new-acquired-stages.ts : le service reçoit les lignes de la table stages, telles que la base les renvoie
export function getNewAcquiredStages({ stageRows, … }: { stageRows: StageRow[]; … }): StageRow[] {
  return stageRows.filter((row) => {
    if (row.level === 0 || row.threshold === 0) return true; // la règle de Stage.isZeroStage, réécrite
    if (row.is_first_skill) return validatedSkillCount >= 1;
    // …
  });
}
```

**Ce que ça apporte.** La règle ne dépend que du modèle du contexte. On peut changer une table, ou le
contrat d'un autre contexte, sans toucher au service.

**Sans cette règle.** Chaque cas interdit a son problème :

- une ligne de base : le service n'a pas les getters de `Stage`, et réécrit la règle du palier zéro
  sur les colonnes. Le jour où `Stage.isZeroStage` change, la copie du service ne suit pas, et le
  service donne un palier zéro que `Stage` ne reconnaît plus comme tel ;
- le DTO d'un autre contexte : quand cet autre contexte renomme un champ de son DTO, il faut modifier
  le service des paliers, alors que la règle des paliers n'a pas changé ;
- un objet préparé pour l'affichage, en sortie : le service mêle la règle et la mise en forme d'un écran, et un
  changement d'écran oblige à modifier la règle.

**À savoir.** Un objet assemblé pour un écran est un [read-model](../read-model/README.md). Le
construire n'est pas une règle du métier, et ce n'est pas le travail d'un Domain Service. D2 porte sur
le type de ce que le service reçoit. D4 porte sur l'objet qui contient la règle.

### D3. Sans état, sans effet sur ses entrées

**La règle.** Le service est une fonction exportée. Il ne garde rien d'un appel à l'autre, ni dans un
champ, ni dans une variable du module. Il ne modifie pas les objets qu'il reçoit : ni tri sur place,
ni `splice`, ni `push`, ni appel d'une méthode qui modifie. Il peut construire et modifier ses propres
objets, puis les renvoyer.

**Bon exemple.**

```ts
// get-new-acquired-stages.ts
export function getNewAcquiredStages({ … }: GetNewAcquiredStagesInput): Stage[] {
  return stages.filter((stage) => { … }); // filter renvoie un nouveau tableau
}
```

**Mauvais exemple.**

```ts
// get-new-acquired-stages.ts
export function getNewAcquiredStages({ … }: GetNewAcquiredStagesInput): Stage[] {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (alreadyAcquiredStageIds.includes(stages[i].id)) stages.splice(i, 1); // retire les paliers du tableau de l'appelant
  }
  return stages.filter((stage) => { … });
}
```

**Ce que ça apporte.** L'appelant retrouve ses paliers tels qu'il les a passés, et peut s'en servir
après l'appel. Deux appels avec les mêmes paramètres donnent le même résultat.

**Sans cette règle.** Chaque cas a son problème :

- le service modifie ses entrées : un usecase passe les 5 paliers du profil cible au service, puis
  affiche « palier 2 sur 5 » avec `stages.length`. Après l'appel, le tableau ne contient plus que les
  paliers non acquis, et l'écran affiche « palier 2 sur 3 » ;
- le service garde un état : une variable du module garde les paliers d'un appel. Le serveur traite
  les requêtes de tous les utilisateurs dans le même processus, et la participation suivante reçoit un
  résultat calculé avec les paliers de la précédente.

**À savoir.** Un test le vérifie : on garde une copie des objets passés, et on compare après l'appel.
Voir `does not change the stages it receives`.

**Exceptions.** Une classe sans champ est permise. La fonction exportée reste la forme attendue : une
classe permet d'ajouter un champ plus tard.

### D4. Un service seulement si aucun objet ne porte la règle

**La règle.** Avant de créer un Domain Service, le développeur cherche un objet où placer la règle :

- une règle sur les données d'un seul objet va sur ce Value Object ou cette Entity ;
- une règle qui relie les objets d'un même Aggregate va sur l'[Aggregate Root](../racine-agregat/README.md) ;
- une règle qui a besoin de charger ou d'enregistrer va dans un usecase (voir [D1](#d1-aucune-io)).

Le service ne reçoit que la règle qui reste : elle croise plusieurs objets, et aucun n'en est
propriétaire.

**Bon exemple.**

```ts
// Stage.ts — D4 : une règle sur les données d'un seul palier est une méthode du palier
get isZeroStage(): boolean {
  return this.level === 0 || this.threshold === 0;
}
```

Le service garde seulement ce qui croise les paliers du profil cible et le résultat de la
participation.

**Mauvais exemple.**

```ts
// prescription/stages/domain/services/is-zero-stage.ts — un seul palier en entrée
export function isZeroStage(stage: Stage): boolean {
  return stage.level === 0 || stage.threshold === 0;
}
```

**Ce que ça apporte.** La règle du palier zéro se trouve dans `Stage.ts`. Qui lit la classe y trouve
ce que fait un palier.

**Sans cette règle.** Chaque cas a son problème :

- une règle d'un seul objet dans un service : `Stage` ne contient plus que des champs. Un développeur
  qui ne connaît pas `is-zero-stage.ts` réécrit le test `threshold === 0` dans un usecase, sans le
  `level === 0`. Un palier zéro défini par un niveau n'est plus reconnu, et la participation ne le
  reçoit pas ;
- une règle d'Aggregate dans un service : par exemple « un profil cible a au plus un palier premier
  acquis ». Un usecase qui ajoute un palier sans appeler le service enregistre un second palier
  premier acquis. Sur l'Aggregate Root, la règle est vérifiée à chaque ajout, parce que l'ajout passe
  par elle ;
- une règle qui charge ou enregistre : c'est le problème décrit dans D1.

**À savoir.** Un service qui ne reçoit qu'un objet, ou qu'une liste d'objets du même type, est à
regarder de près. Sa règle appartient presque toujours à cet objet, ou à l'objet qu'il produit.

### D5. Nommé par la règle

**La règle.** Le nom du fichier dit ce que le service calcule ou décide : `get-new-acquired-stages.ts`.
Ce n'est pas le nom d'une ressource suffixé `-service`. Chaque fichier contient un seul service.

**Bon exemple.**

```ts
// prescription/stages/domain/services/get-new-acquired-stages.ts — D5 : le nom dit la règle
```

**Mauvais exemple.**

```ts
// prescription/stages/domain/services/stage-service.ts — le nom dit seulement « ça parle de paliers »
export function getNewAcquiredStages(…) { … }
export function convertLevelStagesIntoThresholds(…) { … }
export function compareStagesAndAcquisitions(…) { … }
```

**Ce que ça apporte.** La liste des fichiers de `domain/services/` donne la liste des règles du
contexte. Un ajout qui ne correspond pas au nom du fichier se repère à la relecture.

**Sans cette règle.** `stage-service.ts` accepte toute fonction qui touche aux paliers. Un jour, on y
ajoute `saveAcquiredStages`, avec un repository, et le fichier devient un usecase dans le dossier des
services.
