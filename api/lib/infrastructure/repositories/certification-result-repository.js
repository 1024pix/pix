const { knex } = require('../../../db/knex-database-connection');
const CertificationResult = require('../../domain/models/CertificationResult');
const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('../../domain/models/Badge').keys;
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const PixPlusDroitMaitreCertificationResult = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const PixPlusDroitExpertCertificationResult = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

module.exports = {
  async findBySessionId({ sessionId }) {
    const certificationResultDTOs = await _selectCertificationResults()
      .where('certification-courses.sessionId', sessionId)
      .orderBy('certification-courses.lastName', 'ASC')
      .orderBy('certification-courses.firstName', 'ASC');

    return _toDomainArrayWithComplementaryCertifications(certificationResultDTOs);
  },

  async findByCertificationCandidateIds({ certificationCandidateIds }) {
    const certificationResultDTOs = await _selectCertificationResults()
      .join('certification-candidates', function () {
        this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' }).andOn({
          'certification-candidates.userId': 'certification-courses.userId',
        });
      })
      .whereIn('certification-candidates.id', certificationCandidateIds)
      .orderBy('certification-courses.lastName', 'ASC')
      .orderBy('certification-courses.firstName', 'ASC');

    return _toDomainArrayWithComplementaryCertifications(certificationResultDTOs);
  },
};

function _selectCertificationResults() {
  return knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isCancelled: 'certification-courses.isCancelled',
      externalId: 'certification-courses.externalId',
      createdAt: 'certification-courses.createdAt',
      sessionId: 'certification-courses.sessionId',
      pixScore: 'assessment-results.pixScore',
      assessmentResultStatus: 'assessment-results.status',
      commentForOrganization: 'assessment-results.commentForOrganization',
    })
    .select(
      knex.raw(`
        json_agg("competence-marks".* ORDER BY "competence-marks"."competence_code" asc)  as "competenceMarks"`)
    )
    .select(
      knex.raw(`
        COALESCE(json_agg("partner-certifications".*) filter (where "partner-certifications"."partnerKey" is not null), '[]') as "partnerCertifications"`)
    )
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .leftJoin('partner-certifications', function () {
      this.on('partner-certifications.certificationCourseId', '=', 'certification-courses.id').onIn(
        'partner-certifications.partnerKey',
        [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF]
      );
    })
    .groupBy('certification-courses.id', 'assessments.id', 'assessment-results.id')
    .where('certification-courses.isPublished', true);
}

function _filterMostRecentAssessmentResult(qb) {
  return qb.whereNotExists(
    knex
      .select(1)
      .from({ 'last-assessment-results': 'assessment-results' })
      .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
      .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
  );
}

async function _toDomainArrayWithComplementaryCertifications(certificationResultDTOs) {
  return certificationResultDTOs.map((certificationResultDTO) => {
    const cleaComplementaryCertification = certificationResultDTO.partnerCertifications.find(
      (complementaryCertification) =>
        [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(complementaryCertification.partnerKey)
    );
    const cleaCertificationResult = cleaComplementaryCertification
      ? CleaCertificationResult.buildFrom(cleaComplementaryCertification)
      : CleaCertificationResult.buildNotTaken();

    const pixPlusDroitMaitreComplementaryCertification = certificationResultDTO.partnerCertifications.find(
      (complementaryCertification) => complementaryCertification.partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
    const pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreComplementaryCertification
      ? PixPlusDroitMaitreCertificationResult.buildFrom(pixPlusDroitMaitreComplementaryCertification)
      : PixPlusDroitMaitreCertificationResult.buildNotTaken();

    const pixPlusDroitExpertComplementaryCertification = certificationResultDTO.partnerCertifications.find(
      (complementaryCertification) => complementaryCertification.partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
    const pixPlusDroitExpertCertificationResult = pixPlusDroitExpertComplementaryCertification
      ? PixPlusDroitExpertCertificationResult.buildFrom(pixPlusDroitExpertComplementaryCertification)
      : PixPlusDroitExpertCertificationResult.buildNotTaken();

    return _toDomain({
      certificationResultDTO,
      cleaCertificationResult,
      pixPlusDroitMaitreCertificationResult,
      pixPlusDroitExpertCertificationResult,
    });
  });
}

function _toDomain({
  certificationResultDTO,
  cleaCertificationResult,
  pixPlusDroitMaitreCertificationResult,
  pixPlusDroitExpertCertificationResult,
}) {
  return CertificationResult.from({
    certificationResultDTO,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
}
