/**
 * The pix of a user per competence, for a user whose knowledge is stored as
 * knowledge states.
 *
 * A knowledge element keeps the pix earned at the time of the answer. A
 * knowledge state does not: its pix come from the current value of the
 * skills, and would move with the learning content. The score of each
 * competence is therefore stored apart, and only changes when the knowledge
 * states of the user change.
 */
import { KnowledgeElement } from '../../models/KnowledgeElement.js';
import { KnowledgeState } from '../../models/KnowledgeState.ts';
import { type Skill } from '../../models/Skill.js';
import { buildKnowledgeElementsFromKnowledgeStates } from './build-knowledge-elements-from-knowledge-states.ts';
import { keepOneSkillPerLevel } from './skills.ts';

// The bound of the `pix` column of user_competence_scores, eight levels of
// eight pix: a score is stored within it. The product cap of a competence,
// MAX_REACHABLE_PIX_BY_COMPETENCE, applies when a score is shown, not here.
const STORED_PIX_BOUND = 64;
const TOLERANCE = 1e-6;

const withinBound = (pix: number): number => Math.min(STORED_PIX_BOUND, Math.max(0, pix));

/**
 * Gives the pix of each competence from the current value of the skills, each
 * validated level counting once.
 */
export const computePixByCompetenceId = (knowledgeStates: KnowledgeState[], skills: Skill[]): Map<string, number> => {
  const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({
    knowledgeStates,
    skills: keepOneSkillPerLevel(skills),
  });
  const pixByCompetenceId = new Map<string, number>();

  for (const { competenceId, earnedPix } of knowledgeElements) {
    pixByCompetenceId.set(competenceId, (pixByCompetenceId.get(competenceId) ?? 0) + earnedPix);
  }

  return pixByCompetenceId;
};

/**
 * Gives the scores to store after the knowledge states of a user changed.
 *
 * Each impacted competence gains what its knowledge states gained, so that
 * what the user earned before is kept as it was.
 *
 * A score never goes down on an answer, even when a failure lowers the
 * knowledge states. Only a reset lowers it: a reset competence is scored
 * again from what remains, at the current value of the skills, so that pix
 * earned at another value are not subtracted at the current one. It goes
 * back to zero when no knowledge is left.
 */
export const updateCompetenceScores = (
  storedPixByCompetenceId: Map<string, number>,
  knowledgeStatesBefore: KnowledgeState[],
  knowledgeStatesAfter: KnowledgeState[],
  impactedCompetenceIds: string[],
  resetCompetenceIds: string[],
  skills: Skill[],
): Map<string, number> => {
  const pixBefore = computePixByCompetenceId(knowledgeStatesBefore, skills);
  const pixAfter = computePixByCompetenceId(knowledgeStatesAfter, skills);

  // A reset competence is impacted, whether or not the caller listed it as such.
  const competenceIds = [...new Set([...impactedCompetenceIds, ...resetCompetenceIds])];

  return new Map(
    competenceIds.map((competenceId) => {
      const before = pixBefore.get(competenceId) ?? 0;
      const after = pixAfter.get(competenceId) ?? 0;
      const stored = storedPixByCompetenceId.get(competenceId) ?? before;

      if (resetCompetenceIds.includes(competenceId)) {
        return [competenceId, withinBound(after)];
      }
      return [competenceId, withinBound(Math.max(stored, stored + after - before))];
    }),
  );
};

/**
 * Gives the knowledge elements the pix of the stored scores: the earned pix
 * of each competence are scaled so that the whole competence sums to its
 * stored score. Nothing changes when the stored score is the current one.
 *
 * `currentPixByCompetenceId` is the pix of all the knowledge of the user, as
 * given by computePixByCompetenceId, even when `knowledgeElements` is only a
 * part of it.
 */
export const applyStoredScores = <BuiltKnowledgeElement extends KnowledgeElement>(
  knowledgeElements: BuiltKnowledgeElement[],
  currentPixByCompetenceId: Map<string, number>,
  storedPixByCompetenceId: Map<string, number>,
): BuiltKnowledgeElement[] =>
  knowledgeElements.map((knowledgeElement) => {
    const current = currentPixByCompetenceId.get(knowledgeElement.competenceId) ?? 0;
    const stored = storedPixByCompetenceId.get(knowledgeElement.competenceId) ?? current;

    if (current === 0 || Math.abs(stored - current) < TOLERANCE) {
      return knowledgeElement;
    }

    return new KnowledgeElement({
      ...knowledgeElement,
      earnedPix: (knowledgeElement.earnedPix * stored) / current,
    }) as BuiltKnowledgeElement;
  });
