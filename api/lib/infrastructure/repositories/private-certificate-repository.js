const { knex } = require('../bookshelf');
const PrivateCertificate = require('../../domain/models/PrivateCertificate');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { NotFoundError } = require('../../../lib/domain/errors');

module.exports = {

  async get(id) {
    const certificationCourseDTO = await _selectPrivateCertificates()
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`Certificate not found for ID ${id}`);
    }

    const cleaCertificationResult = await _getCleaCertificationResult(id);
    const certifiedBadgeImages = await _getCertifiedBadgeImages(id);

    return PrivateCertificate.buildFrom({
      ...certificationCourseDTO,
      cleaCertificationResult,
      certifiedBadgeImages,
    });
  },

  async findByUserId({ userId }) {
    const results = await _selectPrivateCertificates()
      .where('certification-courses.userId', '=', userId)
      .orderBy('certification-courses.createdAt', 'DESC');

    const privateCertificates = [];
    for (const result of results) {
      const cleaCertificationResult = await _getCleaCertificationResult(result.id);
      const certifiedBadgeImages = await _getCertifiedBadgeImages(result.id);
      const privateCertificate = PrivateCertificate.buildFrom({
        ...result,
        cleaCertificationResult,
        certifiedBadgeImages,
      });
      privateCertificates.push(privateCertificate);
    }
    return privateCertificates;
  },
};

function _selectPrivateCertificates() {
  return knex
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
    .whereNull('newerAssessmentResults.id');
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

async function _getCertifiedBadgeImages(certificationCourseId) {
  const handledBadgeKeys = [pixPlusDroitExpertBadgeKey, pixPlusDroitMaitreBadgeKey];
  const results = await knex
    .select('badges.certifiedImageUrl')
    .from('partner-certifications')
    .join('badges', 'badges.key', 'partner-certifications.partnerKey')
    .where({ certificationCourseId, acquired: true, isCertifiable: true })
    .whereIn('partner-certifications.partnerKey', handledBadgeKeys);

  return results.map((result) => result.certifiedImageUrl);
}
