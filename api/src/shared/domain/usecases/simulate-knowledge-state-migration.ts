/**
 * Gives what the migration would store for a user whose knowledge elements
 * are given as is, without reading or writing any user data: a tool for Pix
 * Admin. The user is not known, so the result carries no user id.
 *
 * The rows are reduced as the migration reads them: the latest knowledge
 * element per skill, resets left out.
 *
 * Each competence carries its stored score, the sum of the pix earned on its
 * knowledge elements, and the pix its knowledge states are worth at today's
 * skill values. The profile shows a competence rounded down and capped at the
 * product maximum: today from the knowledge elements, after the migration
 * from the stored score, which the read path applies to the knowledge states
 * of the competence, and so loses when they are worth nothing.
 */
import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../constants.js';
import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../models/KnowledgeElement.js';
import { type Skill } from '../models/Skill.js';
import { computePixByCompetenceId } from '../services/knowledge-state/competence-scores.ts';
import { translateKnowledgeElements } from '../services/knowledge-state/translate-knowledge-elements.ts';

const SIMULATED_USER_ID = 0;

export type KnowledgeElementToSimulate = {
  skillId: string;
  competenceId: string;
  status: KnowledgeElementStatus;
  source: KnowledgeElementSource;
  earnedPix: number;
  createdAt: Date;
};

export type KnowledgeStateSimulation = {
  knowledgeElementCount: number;
  knowledgeStateCount: number;
  knowledgeStates: {
    tubeId: string;
    floor: number;
    ceiling: number | null;
    ceilingAt: Date | null;
    directLevels: number[];
    updatedAt: Date;
  }[];
  userCompetenceScores: {
    competenceId: string;
    pix: number;
    pixFromKnowledgeStates: number;
    displayedPix: number;
    displayedPixAfterMigration: number;
  }[];
  pixScore: number;
  pixScoreAfterMigration: number;
  unknownSkillIds: string[];
};

const displayed = (pix: number): number => Math.min(Math.floor(pix), MAX_REACHABLE_PIX_BY_COMPETENCE);

export const simulateKnowledgeStateMigration = async ({
  knowledgeElements,
  skillRepository,
}: {
  knowledgeElements: KnowledgeElementToSimulate[];
  skillRepository: { list: () => Promise<Skill[]> };
}): Promise<KnowledgeStateSimulation> => {
  const skills = await skillRepository.list();

  const latestKnowledgeElements: KnowledgeElement[] = KnowledgeElement.toLatestUniqNonResetCollection(
    knowledgeElements.map((knowledgeElement) => ({
      ...knowledgeElement,
      userId: SIMULATED_USER_ID,
      answerId: null,
      assessmentId: null,
    })),
  );

  const { knowledgeStates, userCompetenceScores, unknownSkillIds } = translateKnowledgeElements(
    SIMULATED_USER_ID,
    latestKnowledgeElements,
    skills,
  );

  const pixByCompetenceIdFromKnowledgeStates = computePixByCompetenceId(knowledgeStates, skills);
  const competenceScores = userCompetenceScores.map(({ competenceId, pix }) => {
    const pixFromKnowledgeStates = pixByCompetenceIdFromKnowledgeStates.get(competenceId) ?? 0;
    return {
      competenceId,
      pix,
      pixFromKnowledgeStates,
      displayedPix: displayed(pix),
      displayedPixAfterMigration: displayed(pixFromKnowledgeStates > 0 ? pix : 0),
    };
  });

  return {
    knowledgeElementCount: latestKnowledgeElements.length,
    knowledgeStateCount: knowledgeStates.length,
    knowledgeStates: knowledgeStates.map(({ tubeId, floor, ceiling, ceilingAt, directLevels, updatedAt }) => ({
      tubeId,
      floor,
      ceiling,
      ceilingAt,
      directLevels,
      updatedAt,
    })),
    userCompetenceScores: competenceScores,
    pixScore: competenceScores.reduce((score, { displayedPix }) => score + displayedPix, 0),
    pixScoreAfterMigration: competenceScores.reduce(
      (score, { displayedPixAfterMigration }) => score + displayedPixAfterMigration,
      0,
    ),
    unknownSkillIds,
  };
};
