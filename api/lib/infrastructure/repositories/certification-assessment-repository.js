const _ = require('lodash');
const CertificationAssessment = require('../../domain/models/CertificationAssessment');
const CertificationChallenge = require('../../domain/models/CertificationChallenge');
const Answer = require('../../domain/models/Answer');
const answerStatusDatabaseAdapter = require('../adapters/answer-status-database-adapter');
const { knex } = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');

async function _getCertificationChallenges(certificationCourseId) {
  const certificationChallengeRows = await knex('certification-challenges')
    .where({ courseId: certificationCourseId });

  return _.map(certificationChallengeRows, (certificationChallengeRow) => new CertificationChallenge({
    ...certificationChallengeRow,
    associatedSkillName: certificationChallengeRow.associatedSkill,
  }));
}

async function _getCertificationAnswersByDate(certificationAssessmentId) {
  const answerRows = await knex('answers')
    .where({ assessmentId: certificationAssessmentId })
    .orderBy('createdAt');

  return _.map(answerRows, (answerRow) => new Answer({
    ...answerRow,
    result: answerStatusDatabaseAdapter.fromSQLString(answerRow.result),
  }));
}

module.exports = {

  async get(id) {
    const certificationAssessmentRows = await knex('assessments')
      .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
      .select({
        id: 'assessments.id',
        userId: 'assessments.userId',
        certificationCourseId: 'certification-courses.id',
        createdAt: 'certification-courses.createdAt',
        completedAt: 'certification-courses.completedAt',
        isV2Certification: 'certification-courses.isV2Certification',
        state: 'assessments.state',
      })
      .where('assessments.id', '=', id)
      .limit(1);
    if (!certificationAssessmentRows[0]) {
      throw new NotFoundError(`L'assessment de certification ${id} n'existe pas ou son accès est restreint`);
    }
    const certificationChallenges = await _getCertificationChallenges(certificationAssessmentRows[0].certificationCourseId);
    const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRows[0].id);

    return new CertificationAssessment({
      ...certificationAssessmentRows[0],
      certificationChallenges,
      certificationAnswersByDate,
    });
  },

  async getByCertificationCourseId(certificationCourseId) {
    const certificationAssessmentRows = await knex('assessments')
      .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
      .select({
        id: 'assessments.id',
        userId: 'assessments.userId',
        certificationCourseId: 'certification-courses.id',
        createdAt: 'certification-courses.createdAt',
        completedAt: 'certification-courses.completedAt',
        isV2Certification: 'certification-courses.isV2Certification',
        state: 'assessments.state',
      })
      .where('assessments.certificationCourseId', '=', certificationCourseId)
      .limit(1);
    if (!certificationAssessmentRows[0]) {
      throw new NotFoundError(`L'assessment de certification avec un certificationCourseId de ${certificationCourseId} n'existe pas ou son accès est restreint`);
    }
    const certificationChallenges = await _getCertificationChallenges(certificationAssessmentRows[0].certificationCourseId);
    const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRows[0].id);

    return new CertificationAssessment({
      ...certificationAssessmentRows[0],
      certificationChallenges,
      certificationAnswersByDate,
    });
  },

};
