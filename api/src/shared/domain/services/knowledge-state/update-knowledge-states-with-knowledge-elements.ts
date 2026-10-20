import { KnowledgeElement, type KnowledgeElementStatus } from '../../models/KnowledgeElement.js';
import { KnowledgeState } from '../../models/KnowledgeState.ts';
import { type Skill } from '../../models/Skill.js';
import { buildKnowledgeElementsFromKnowledgeStates } from './build-knowledge-elements-from-knowledge-states.ts';
import { buildKnowledgeStatesFromKnowledgeElements } from './build-knowledge-states-from-knowledge-elements.ts';
import { UnknownSkillsError } from './errors.ts';
import { statusOf } from './rules.ts';

type SkillOf = (knowledgeElement: KnowledgeElement) => Skill;

const assertSkillsExist = (knowledgeElements: KnowledgeElement[], skillById: Map<string, Skill>): void => {
  const addUnknownSkillId = (skillIds: string[], { skillId }: KnowledgeElement): string[] =>
    skillById.has(skillId) || skillIds.includes(skillId) ? skillIds : [...skillIds, skillId];

  const unknownSkillIds = knowledgeElements.reduce(addUnknownSkillId, []);

  if (unknownSkillIds.length > 0) {
    throw new UnknownSkillsError(unknownSkillIds);
  }
};

/**
 * An inferred knowledge element that gives a level the status its knowledge
 * state already gives it adds nothing, and would turn a level the user
 * answered directly into an inferred one.
 */
const dropRedundantInferences = ({
  knowledgeElements,
  knowledgeStates,
  skillOf,
}: {
  knowledgeElements: KnowledgeElement[];
  knowledgeStates: KnowledgeState[];
  skillOf: SkillOf;
}): KnowledgeElement[] => {
  const knowledgeStateByTubeId = new Map(
    knowledgeStates.map((knowledgeState) => [knowledgeState.tubeId, knowledgeState]),
  );
  /** The status the knowledge states give a level, or null on a tube the user knows nothing of. */
  const statusGivenTo = (tubeId: string, level: number): KnowledgeElementStatus | null => {
    const knowledgeState = knowledgeStateByTubeId.get(tubeId);
    return knowledgeState ? statusOf(knowledgeState, level) : null;
  };

  const isRedundantInference = (knowledgeElement: KnowledgeElement): boolean => {
    const { tubeId, difficulty } = skillOf(knowledgeElement);
    return knowledgeElement.source === 'inferred' && statusGivenTo(tubeId, difficulty) === knowledgeElement.status;
  };
  return knowledgeElements.filter((knowledgeElement) => !isRedundantInference(knowledgeElement));
};

const dateKnowledgeElements = (knowledgeElements: KnowledgeElement[], at: Date): KnowledgeElement[] =>
  knowledgeElements.map(
    (knowledgeElement) => new KnowledgeElement({ ...knowledgeElement, createdAt: knowledgeElement.createdAt ?? at }),
  );

const buildKnowledgeElementsToKeep = ({
  knowledgeStates,
  skills,
  skillsToAddByTubeId,
}: {
  knowledgeStates: KnowledgeState[];
  skills: Skill[];
  skillsToAddByTubeId: Map<string, Skill[]>;
}): KnowledgeElement[] => {
  const isLevelToAdd = ({ tubeId, difficulty }: Skill): boolean =>
    (skillsToAddByTubeId.get(tubeId) ?? []).some((skill) => skill.difficulty === difficulty);

  return buildKnowledgeElementsFromKnowledgeStates({
    knowledgeStates,
    skills: skills.filter((skill) => !isLevelToAdd(skill)),
  });
};

const findForgottenTubeIds = (
  impactedKnowledgeStates: KnowledgeState[],
  newKnowledgeStates: KnowledgeState[],
): string[] => {
  const newTubeIds = new Set(newKnowledgeStates.map(({ tubeId }) => tubeId));
  const addForgottenTubeId = (tubeIds: string[], { tubeId }: KnowledgeState): string[] =>
    newTubeIds.has(tubeId) ? tubeIds : [...tubeIds, tubeId];
  return impactedKnowledgeStates.reduce(addForgottenTubeId, []);
};

/**
 * Updates a user's knowledge states with the knowledge elements today's code
 * creates for them, after an answer or a reset. For a user whose knowledge is
 * stored as knowledge states, those knowledge elements are not inserted: this
 * function says how the knowledge states must change instead.
 * Nothing is saved here: the caller does it.
 *
 * It takes the current knowledge states of the user and the created knowledge
 * elements, and returns:
 *   - `knowledgeStates`: the knowledge states to save, one per impacted tube,
 *     that is a tube holding a skill of the created knowledge elements;
 *   - `forgottenTubeIds`: the impacted tubes whose knowledge state must be
 *     deleted, because the user has no knowledge left on them after a reset.
 * The knowledge states of the other tubes do not change and are not returned.
 *
 * For each impacted tube:
 *   1. the knowledge elements its current knowledge state describes are built,
 *      except those at a level of the created knowledge elements;
 *   2. the created knowledge elements are added to them;
 *   3. the new knowledge state is built from the result.
 *
 * Example: the user has a floor of 2 on a tube whose highest level is 5, and
 * fails level 4. The created knowledge elements invalidate levels 4 and 5, and
 * the knowledge state to save has a floor of 2 and a ceiling of 4.
 *
 * An inferred knowledge element that only repeats what the knowledge state
 * already says is ignored, and a created knowledge element without
 * `createdAt` is dated by `at`.
 *
 * Throws `UnknownSkillsError` when a created knowledge element points to a
 * skill absent from the given skills.
 *
 * Limit: a knowledge state has no hole. Resetting level 2 alone while level 3
 * stays validated changes nothing, level 2 is still validated.
 */
export const updateKnowledgeStatesWithKnowledgeElements = ({
  userId,
  knowledgeStates,
  knowledgeElements,
  skills,
  at = new Date(),
}: {
  userId: number;
  knowledgeStates: KnowledgeState[];
  knowledgeElements: KnowledgeElement[];
  skills: Skill[];
  at?: Date;
}): { knowledgeStates: KnowledgeState[]; forgottenTubeIds: string[] } => {
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  assertSkillsExist(knowledgeElements, skillById);
  const skillOf: SkillOf = ({ skillId }) => skillById.get(skillId) as Skill;

  const knowledgeElementsToAdd = dateKnowledgeElements(
    dropRedundantInferences({ knowledgeElements, knowledgeStates, skillOf }),
    at,
  );
  const skillsToAddByTubeId = Map.groupBy(knowledgeElementsToAdd.map(skillOf), ({ tubeId }) => tubeId);
  const impactedKnowledgeStates = knowledgeStates.filter(({ tubeId }) => skillsToAddByTubeId.has(tubeId));

  const keptKnowledgeElements = buildKnowledgeElementsToKeep({
    knowledgeStates: impactedKnowledgeStates,
    skills,
    skillsToAddByTubeId,
  });
  const newKnowledgeStates = buildKnowledgeStatesFromKnowledgeElements({
    userId,
    knowledgeElements: [...keptKnowledgeElements, ...knowledgeElementsToAdd],
    skills,
  });

  return {
    knowledgeStates: newKnowledgeStates,
    forgottenTubeIds: findForgottenTubeIds(impactedKnowledgeStates, newKnowledgeStates),
  };
};
