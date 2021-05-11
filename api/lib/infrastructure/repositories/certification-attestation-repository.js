const { knex } = require('../bookshelf');
const CertificationAttestation = require('../../domain/models/CertificationAttestation');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  async get(id) {
    const certificationCourseDTO = await _selectCertificationAttestations()
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`There is no certification course with id "${id}"`);
    }

    return new CertificationAttestation({
      ...certificationCourseDTO,
      cleaCertificationStatus: null,
    });
  },
};

function _selectCertificationAttestations() {
  return knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isPublished: 'certification-courses.isPublished',
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      deliveredAt: 'sessions.publishedAt',
      verificationCode: 'certification-courses.verificationCode',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
      status: 'assessment-results.status',
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .leftJoin({ 'newerAssessmentResults': 'assessment-results' }, function() {
      this.on('newerAssessmentResults.assessmentId', 'assessments.id')
        .andOn('assessment-results.createdAt', '<', knex.ref('newerAssessmentResults.createdAt'))
        .andOn('newerAssessmentResults.status', '=', knex.raw('?', [AssessmentResult.status.VALIDATED]));
    })
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .whereNull('newerAssessmentResults.id')
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}
