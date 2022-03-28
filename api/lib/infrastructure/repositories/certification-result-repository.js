const { knex } = require('../../../db/knex-database-connection');
const CertificationResult = require('../../domain/models/CertificationResult');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../../domain/models/Badge').keys;

module.exports = {
  async findBySessionId({ sessionId }) {
    const certificationResultDTOs = await _selectCertificationResults()
      .where('certification-courses.sessionId', sessionId)
      .orderBy('certification-courses.lastName', 'ASC')
      .orderBy('certification-courses.firstName', 'ASC');

    return certificationResultDTOs.map(_toDomain);
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

    return certificationResultDTOs.map(_toDomain);
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
        json_agg("complementary-certification-course-results".*) as "complementaryCertificationCourseResults"`)
    )
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .leftJoin('complementary-certification-course-results', function () {
      this.on('complementary-certification-course-results.certificationCourseId', '=', 'certification-courses.id').onIn(
        'complementary-certification-course-results.partnerKey',
        [
          PIX_EMPLOI_CLEA,
          PIX_EMPLOI_CLEA_V2,
          PIX_DROIT_MAITRE_CERTIF,
          PIX_DROIT_EXPERT_CERTIF,
          PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
          PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
          PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
          PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
          PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        ]
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

function _toDomain(certificationResultDTO) {
  return CertificationResult.from({
    certificationResultDTO,
  });
}
