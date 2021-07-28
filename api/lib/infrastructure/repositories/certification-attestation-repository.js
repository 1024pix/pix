const { knex } = require('../../../db/knex-database-connection');
const CertificationAttestation = require('../../domain/models/CertificationAttestation');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const _ = require('lodash');

const macaronCleaPath = `${__dirname}/../utils/pdf/files/macaron_clea.png`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/../utils/pdf/files/macaron_maitre.png`;
const macaronPixPlusDroitExpertPath = `${__dirname}/../utils/pdf/files/macaron_expert.png`;

module.exports = {
  macaronCleaPath,
  macaronPixPlusDroitMaitrePath,
  macaronPixPlusDroitExpertPath,

  async get(id) {
    const certificationCourseDTO = await _selectCertificationAttestations()
      .where('certification-courses.id', '=', id)
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`There is no certification course with id "${id}"`);
    }

    const cleaCertificationImagePath = await _getCleaCertificationImagePath(certificationCourseDTO.id);
    const pixPlusDroitCertificationImagePath = await _getPixPlusDroitCertificationImagePath(certificationCourseDTO.id);
    return new CertificationAttestation({
      ...certificationCourseDTO,
      cleaCertificationImagePath,
      pixPlusDroitCertificationImagePath,
    });
  },

  async getByOrganizationIdAndDivision({ organizationId, division }) {
    const certificationCourseDTOs = await _selectCertificationAttestations()
      .innerJoin('schooling-registrations', 'schooling-registrations.userId', 'certification-courses.userId')
      .where('schooling-registrations.organizationId', '=', organizationId)
      .whereRaw('LOWER("schooling-registrations"."division") LIKE ?', `${division.toLowerCase()}`)
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    if (_.isEmpty(certificationCourseDTOs)) {
      throw new NotFoundError(`There is no certification course for organization "${organizationId}" and division "${division}"`);
    }

    // const cleaCertificationImagePath = await _getCleaCertificationImagePath(certificationCourseDTO.id);
    // const pixPlusDroitCertificationImagePath = await _getPixPlusDroitCertificationImagePath(certificationCourseDTO.id);
    return new CertificationAttestation({
      ...certificationCourseDTOs,
    //  cleaCertificationImagePath,
    //  pixPlusDroitCertificationImagePath,
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
    })
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .whereNotExists(
      knex.select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .where('last-assessment-results.status', AssessmentResult.status.VALIDATED)
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"'),
    )
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}

async function _getCleaCertificationImagePath(certificationCourseId) {
  const result = await knex
    .select('partnerKey')
    .from('partner-certifications')
    .where({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey, acquired: true })
    .first();

  if (!result) return null;
  return macaronCleaPath;
}

async function _getPixPlusDroitCertificationImagePath(certificationCourseId) {
  const handledBadgeKeys = [pixPlusDroitExpertBadgeKey, pixPlusDroitMaitreBadgeKey];
  const result = await knex
    .select('partnerKey')
    .from('partner-certifications')
    .where({ certificationCourseId, acquired: true })
    .whereIn('partnerKey', handledBadgeKeys)
    .first();

  if (!result) return null;
  if (result.partnerKey === pixPlusDroitMaitreBadgeKey) return macaronPixPlusDroitMaitrePath;
  if (result.partnerKey === pixPlusDroitExpertBadgeKey) return macaronPixPlusDroitExpertPath;
}
