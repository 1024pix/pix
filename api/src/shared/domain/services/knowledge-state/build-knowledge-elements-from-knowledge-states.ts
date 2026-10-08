/**
 * Builds the knowledge elements a user's knowledge states describe, one per assessed skill.
 *
 * This is how the readers of knowledge elements keep working for a user whose
 * knowledge is stored as knowledge states: they receive knowledge elements that say the
 * same thing as the knowledge states, without being rows of the knowledge elements table.
 *
 * What a knowledge state cannot give back:
 *   - the answer and the assessment behind each knowledge element: they are null;
 *   - the date of each knowledge element: all those of a tube carry the date
 *     of the tube's last move;
 *   - the pix earned at the time of the answer: it is the skill's current value.
 */
import { KnowledgeElement } from '../../models/KnowledgeElement.js';
import { KnowledgeState } from '../../models/KnowledgeState.ts';
import { type Skill } from '../../models/Skill.js';
import { isAssessed, isDirect, isValidated } from './rules.ts';

export type KnowledgeElementFromKnowledgeState = KnowledgeElement & { createdAt: Date };

const buildKnowledgeElementOfSkill = (
  knowledgeState: KnowledgeState,
  skill: Skill,
): KnowledgeElementFromKnowledgeState => {
  const validated = isValidated(knowledgeState, skill.difficulty);

  return new KnowledgeElement({
    id: null,
    createdAt: knowledgeState.updatedAt,
    source: isDirect(knowledgeState, skill.difficulty) ? 'direct' : 'inferred',
    status: validated ? 'validated' : 'invalidated',
    earnedPix: validated ? skill.pixValue : 0,
    answerId: null,
    assessmentId: null,
    skillId: skill.id,
    userId: knowledgeState.userId,
    competenceId: skill.competenceId,
  }) as KnowledgeElementFromKnowledgeState;
};

const buildKnowledgeElementsOfTube = (
  knowledgeState: KnowledgeState,
  skills: Skill[],
): KnowledgeElementFromKnowledgeState[] => {
  const addKnowledgeElementOfAssessedSkill = (knowledgeElements: KnowledgeElementFromKnowledgeState[], skill: Skill) =>
    isAssessed(knowledgeState, skill.difficulty)
      ? [...knowledgeElements, buildKnowledgeElementOfSkill(knowledgeState, skill)]
      : knowledgeElements;

  return skills.reduce(addKnowledgeElementOfAssessedSkill, []);
};

/**
 * Gives one knowledge element per given skill whose level is assessed by the
 * knowledge state of its tube. The knowledge states may belong to several users.
 *
 * Every given skill of an assessed level gets a knowledge element: when the
 * learning content holds several versions of a skill, the caller chooses
 * which ones to pass, otherwise the level counts once per version.
 */
export const buildKnowledgeElementsFromKnowledgeStates = ({
  knowledgeStates,
  skills,
}: {
  knowledgeStates: KnowledgeState[];
  skills: Skill[];
}): KnowledgeElementFromKnowledgeState[] => {
  const skillsByTubeId = Map.groupBy(skills, (skill) => skill.tubeId);

  return knowledgeStates.flatMap((knowledgeState) =>
    buildKnowledgeElementsOfTube(knowledgeState, skillsByTubeId.get(knowledgeState.tubeId) ?? []),
  );
};
