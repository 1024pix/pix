/**
 * Translates the knowledge of a user from knowledge elements to what the
 * migration stores: knowledge states, one per tube, and the pix earned per
 * competence.
 *
 * The knowledge states are built from the latest knowledge elements on skills
 * the learning content knows. The score keeps every pix the user earned, even
 * on skills the learning content no longer knows: the score must not move
 * with the migration. The unknown skills are reported, not thrown: that is
 * broken data, and the caller decides what to do with it.
 */
import { type KnowledgeElement } from '../../models/KnowledgeElement.js';
import { type KnowledgeState } from '../../models/KnowledgeState.ts';
import { type Skill } from '../../models/Skill.js';
import { UserCompetenceScore } from '../../models/UserCompetenceScore.ts';
import { buildKnowledgeStatesFromKnowledgeElements } from './build-knowledge-states-from-knowledge-elements.ts';
import { withinBound } from './competence-scores.ts';

export type KnowledgeElementTranslation = {
  knowledgeStates: KnowledgeState[];
  userCompetenceScores: UserCompetenceScore[];
  unknownSkillIds: string[];
};

export const translateKnowledgeElements = (
  userId: number,
  knowledgeElements: KnowledgeElement[],
  skills: Skill[],
): KnowledgeElementTranslation => {
  const knownSkillIds = new Set(skills.map(({ id }) => id));

  const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({
    userId,
    knowledgeElements: knowledgeElements.filter(({ skillId }) => knownSkillIds.has(skillId)),
    skills,
  });

  const knowledgeElementsByCompetenceId = Map.groupBy(knowledgeElements, ({ competenceId }) => competenceId);
  const userCompetenceScores = [...knowledgeElementsByCompetenceId].map(
    ([competenceId, competenceKnowledgeElements]) =>
      new UserCompetenceScore({
        userId,
        competenceId,
        pix: withinBound(competenceKnowledgeElements.reduce((pix, { earnedPix }) => pix + earnedPix, 0)),
      }),
  );

  const unknownSkillIds = [
    ...new Set(knowledgeElements.map(({ skillId }) => skillId).filter((skillId) => !knownSkillIds.has(skillId))),
  ];

  return { knowledgeStates, userCompetenceScores, unknownSkillIds };
};
