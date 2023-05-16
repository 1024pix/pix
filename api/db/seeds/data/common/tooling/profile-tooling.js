const _ = require('lodash');
const learningContent = require('./learning-content');
const generic = require('./generic');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CompetenceEvaluation = require('../../../../../lib/domain/models/CompetenceEvaluation');
const { PIX_COUNT_BY_LEVEL } = require('../../../../../lib/domain/constants');

module.exports = {
  createCertifiableProfile,
  createPerfectProfile,
};

/**
 * Fonction générique pour créer un profil ayant 5 compétences Pix au niveau 1
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function createCertifiableProfile({
  databaseBuilder,
  userId,
}) {
  const pixCompetences = await learningContent.getCoreCompetences();
  const fiveRandomCompetences = generic.pickRandomAmong(pixCompetences, 5);
  _makeUserReachPixScoreForCompetences({
    databaseBuilder,
    userId,
    competences: fiveRandomCompetences,
    pixScoreByCompetence: PIX_COUNT_BY_LEVEL,
  });
}

/**
 * Fonction générique pour créer un profil ayant toutes les compétences Pix au niveau maximum
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} userId
 * @returns {Promise<void>}
 */
async function createPerfectProfile({
  databaseBuilder,
  userId,
}) {
  const UNREACHABLE_PIX_SCORE = 99999999;
  const pixCompetences = await learningContent.getCoreCompetences();
  _makeUserReachPixScoreForCompetences({
    databaseBuilder,
    userId,
    competences: pixCompetences,
    pixScoreByCompetence: UNREACHABLE_PIX_SCORE,
  });
}

function _makeCompetenceEvaluation({
  databaseBuilder,
  userId,
  competenceId,
}) {
  const assessmentId = databaseBuilder.factory.buildAssessment({
    userId,
    competenceId,
    type: Assessment.types.COMPETENCE_EVALUATION,
    state: Assessment.states.COMPLETED,
  }).id;
  databaseBuilder.factory.buildCompetenceEvaluation({
    userId,
    competenceId,
    assessmentId,
    status: CompetenceEvaluation.statuses.STARTED,
  },
  );
  return assessmentId;
}

async function _makeUserReachPixScoreForCompetences({
  databaseBuilder,
  userId,
  competences,
  pixScoreByCompetence,
}) {
  for (const competence of competences) {
    const assessmentId = _makeCompetenceEvaluation({ databaseBuilder, userId, competenceId: competence.id });

    const skills = await learningContent.findActiveSkillsByCompetenceId(competence.id);
    const orderedSkills = _.sortBy(skills, 'level');
    let currentPixScore = 0;
    for (const skill of orderedSkills) {
      const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
      const answerId = databaseBuilder.factory.buildAnswer({
        value: 'dummy value',
        result: 'ok',
        assessmentId,
        challengeId: challenge.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeout: null,
        resultDetails: 'dummy value',
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        source: 'direct',
        status: 'validated',
        answerId,
        assessmentId,
        skillId: skill.id,
        createdAt: new Date(),
        earnedPix: skill.pixValue,
        userId,
        competenceId: skill.competenceId,
      });

      currentPixScore += skill.pixValue;
      if (currentPixScore >= pixScoreByCompetence) {
        break;
      }
    }
  }
}
