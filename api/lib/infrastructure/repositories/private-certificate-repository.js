const _ = require('lodash');
const { knex } = require('../bookshelf');
const PrivateCertificate = require('../../domain/models/PrivateCertificate');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  async get(id) {
    const certificationCourseDTO = await knex
      .select({
        id: 'certification-courses.id',
        firstName: 'certification-courses.firstName',
        lastName: 'certification-courses.lastName',
        birthdate: 'certification-courses.birthdate',
        birthplace: 'certification-courses.birthplace',
        isPublished: 'certification-courses.isPublished',
        isCancelled: 'certification-courses.isCancelled',
        userId: 'certification-courses.userId',
        date: 'certification-courses.createdAt',
        verificationCode: 'certification-courses.verificationCode',
        deliveredAt: 'sessions.publishedAt',
        certificationCenter: 'sessions.certificationCenter',
        maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
        pixScore: 'assessment-results.pixScore',
        commentForCandidate: 'assessment-results.commentForCandidate',
        assessmentResultStatus: 'assessment-results.status',
      })
      .from('certification-courses')
      .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .leftJoin({ 'newerAssessmentResults': 'assessment-results' }, function() {
        this.on('newerAssessmentResults.assessmentId', 'assessments.id')
          .andOn('assessment-results.createdAt', '<', knex.ref('newerAssessmentResults.createdAt'));
      })
      .join('sessions', 'sessions.id', 'certification-courses.sessionId')
      .whereNull('newerAssessmentResults.id')
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`Certificate not found for ID ${id}`);
    }

    return PrivateCertificate.buildFrom({
      ...certificationCourseDTO,
      cleaCertificationStatus: null,
    });
  },

  async findByUserId({ userId }) {
    const results = await knex
      .select({
        id: 'certification-courses.id',
        firstName: 'certification-courses.firstName',
        lastName: 'certification-courses.lastName',
        birthdate: 'certification-courses.birthdate',
        birthplace: 'certification-courses.birthplace',
        isPublished: 'certification-courses.isPublished',
        isCancelled: 'certification-courses.isCancelled',
        userId: 'certification-courses.userId',
        date: 'certification-courses.createdAt',
        verificationCode: 'certification-courses.verificationCode',
        deliveredAt: 'sessions.publishedAt',
        certificationCenter: 'sessions.certificationCenter',
        maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
        pixScore: 'assessment-results.pixScore',
        commentForCandidate: 'assessment-results.commentForCandidate',
        assessmentResultStatus: 'assessment-results.status',
      })
      .from('certification-courses')
      .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .leftJoin({ 'newerAssessmentResults': 'assessment-results' }, function() {
        this.on('newerAssessmentResults.assessmentId', 'assessments.id')
          .andOn('assessment-results.createdAt', '<', knex.ref('newerAssessmentResults.createdAt'));
      })
      .join('sessions', 'sessions.id', 'certification-courses.sessionId')
      .whereNull('newerAssessmentResults.id')
      .where('certification-courses.userId', '=', userId)
      .orderBy('certification-courses.createdAt', 'DESC');

    return _.map(results, (result) => PrivateCertificate.buildFrom({
      ...result,
      cleaCertificationStatus: null,
    }));
  },
};
