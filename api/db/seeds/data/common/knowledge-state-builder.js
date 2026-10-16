import { REAL_PIX_SUPER_ADMIN_ID } from './constants.js';

export function knowledgeStateBuilder({ databaseBuilder }) {
  const userId = REAL_PIX_SUPER_ADMIN_ID;
  const updatedAt = new Date('2026-01-15');
  // Failures older than the last move of their tube: validated since, below the ceiling.
  const ceilingAt = new Date('2025-12-01');

  const tubeStates = [
    { tubeId: 'tubeId2', floor: 4, ceiling: null, directLevels: [4] },
    { tubeId: 'tubeId3', floor: 3, ceiling: 5, ceilingAt, directLevels: [3, 5] },
    { tubeId: 'tubeId4', floor: 1, ceiling: 3, ceilingAt, directLevels: [3] },
    { tubeId: 'tubeId5', floor: 4, ceiling: null, directLevels: [2, 4] },
  ];
  for (const tubeState of tubeStates) {
    databaseBuilder.factory.buildKnowledgeState({ userId, updatedAt, ...tubeState });
  }

  const userCompetenceScores = [
    { competenceId: 'competence1', pix: 12.5 },
    { competenceId: 'competence2', pix: 8 },
    { competenceId: 'competence3', pix: 0 },
  ];
  for (const userCompetenceScore of userCompetenceScores) {
    databaseBuilder.factory.buildUserCompetenceScore({ userId, updatedAt, ...userCompetenceScore });
  }
}
