import { buildAnswer } from './build-answer.js';
import { buildAssessment } from './build-assessment.js';
import { recordSkillOutcome } from './knowledge-state-writer.js';
import { buildChallenge } from './learning-content/build-challenge.js';
import { buildSkill } from './learning-content/build-skill.js';

/**
 * Fait répondre un utilisateur à une question portant sur un acquis.
 *
 * Répondre écrit l'état de connaissance, comme le fait la production : la
 * réponse est enregistrée, et l'état du tube se resserre en conséquence.
 *
 * L'acquis et la question sont créés au besoin : passer `withSkill: false` quand
 * l'acquis existe déjà dans le référentiel du test, `withChallenge: false` quand
 * la question existe déjà.
 */
const buildAnsweredSkill = function ({
  userId,
  assessmentId,
  skillId,
  competenceId,
  challengeId = `challenge-${skillId}`,
  name,
  level = 1,
  tubeId,
  pixValue = 2,
  isOk = true,
  createdAt = new Date('2020-01-01'),
  withSkill = true,
  withChallenge = true,
} = {}) {
  assessmentId = assessmentId ?? buildAssessment({ userId, competenceId }).id;

  if (withSkill) {
    buildSkill({
      id: skillId,
      name: name ?? `@${tubeId ?? skillId}${level}`,
      level,
      pixValue,
      competenceId,
      tubeId: tubeId ?? `tube-${skillId}`,
      status: 'actif',
    });
  }
  if (withChallenge) {
    buildChallenge({ id: challengeId, skillId, competenceId });
  }

  const answer = buildAnswer({
    assessmentId,
    challengeId,
    result: isOk ? 'ok' : 'ko',
    createdAt,
  });

  recordSkillOutcome({ userId, skillId, isOk, createdAt });

  return answer;
};

export { buildAnsweredSkill };
