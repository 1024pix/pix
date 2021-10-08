const { knex } = require('../../../db/knex-database-connection');
const CertificationResult = require('../../domain/models/CertificationResult');
const cleaCertificationResultRepository = require('./clea-certification-result-repository');
const pixPlusDroitMaitreCertificationResultRepository = require('./pix-plus-droit-maitre-certification-result-repository');
const pixPlusDroitExpertCertificationResultRepository = require('./pix-plus-droit-expert-certification-result-repository');

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
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
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
  const certificationResults = [];
  for (const certificationResultDTO of certificationResultDTOs) {
    const cleaCertificationResult = await cleaCertificationResultRepository.get({
      certificationCourseId: certificationResultDTO.id,
    });
    const pixPlusDroitMaitreCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({
      certificationCourseId: certificationResultDTO.id,
    });
    const pixPlusDroitExpertCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({
      certificationCourseId: certificationResultDTO.id,
    });
    const certificationResult = _toDomain({
      certificationResultDTO,
      cleaCertificationResult,
      pixPlusDroitMaitreCertificationResult,
      pixPlusDroitExpertCertificationResult,
    });
    certificationResults.push(certificationResult);
  }
  return certificationResults;
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
