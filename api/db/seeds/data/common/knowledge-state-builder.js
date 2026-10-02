import { REAL_PIX_SUPER_ADMIN_ID } from './constants.js';

export function knowledgeStateBuilder({ databaseBuilder }) {
  const userId = REAL_PIX_SUPER_ADMIN_ID;
  const updatedAt = new Date('2026-01-15');

  const tubeStates = [
    // A tube validated up to level 3, nothing invalidated yet.
    { tubeId: 'tubeId2', floor: 4, ceiling: null, directLevels: [4] },
    // A tube bounded on both sides: level 2 validated, level 4 failed.
    { tubeId: 'tubeId3', floor: 3, ceiling: 5, directLevels: [3, 5] },
    // A tube where only a failure was recorded.
    { tubeId: 'tubeId4', floor: 1, ceiling: 3, directLevels: [3] },
    // A tube answered twice, the second answer raised the floor.
    { tubeId: 'tubeId5', floor: 4, ceiling: null, directLevels: [2, 4] },
  ];
  for (const tubeState of tubeStates) {
    databaseBuilder.factory.buildKnowledgeState({ userId, updatedAt, ...tubeState });
  }

  const competenceScores = [
    { competenceId: 'competence1', pix: 12.5 },
    { competenceId: 'competence2', pix: 8 },
    { competenceId: 'competence3', pix: 0 },
  ];
  for (const competenceScore of competenceScores) {
    databaseBuilder.factory.buildCompetenceScore({ userId, updatedAt, ...competenceScore });
  }
}
