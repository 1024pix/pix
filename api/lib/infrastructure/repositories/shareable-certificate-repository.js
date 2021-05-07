const { knex } = require('../bookshelf');
const ShareableCertificate = require('../../domain/models/ShareableCertificate');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  async getByVerificationCode({ verificationCode }) {
    const shareableCertificateDTO = await _selectShareableCertificates()
      .where({ verificationCode })
      .first();

    if (!shareableCertificateDTO) {
      throw new NotFoundError(`There is no certification course with verification code "${verificationCode}"`);
    }

    const cleaCertificationResult = await _getCleaCertificationResult(shareableCertificateDTO.id);

    return new ShareableCertificate({
      ...shareableCertificateDTO,
      cleaCertificationResult,
    });
  },
};

function _selectShareableCertificates() {
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
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
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

async function _getCleaCertificationResult(certificationCourseId) {
  const result = await knex
    .select('acquired')
    .from('partner-certifications')
    .where({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey })
    .first();

  if (!result) {
    return CleaCertificationResult.buildNotTaken();
  }
  return CleaCertificationResult.buildFrom(result);
}
