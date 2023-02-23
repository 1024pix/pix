const { knex } = require('../../../db/knex-database-connection.js');
const ComplementaryCertificationCourseResult = require('../../domain/models/ComplementaryCertificationCourseResult.js');
const CertificationResult = require('../../domain/models/CertificationResult.js');
const isEmpty = require('lodash/isEmpty');

module.exports = {
  async findBySessionId({ sessionId }) {
    const certificationResultDTOs = await _selectCertificationResults()
      .where('certification-courses.sessionId', sessionId)
      .orderBy('certification-courses.lastName', 'ASC')
      .orderBy('certification-courses.firstName', 'ASC');

    const complementaryCertificationCourseResultsByCertificationCourseId =
      await _selectComplementaryCertificationCourseResultsBySessionId({
        sessionId,
      });

    return certificationResultDTOs.map((certificationResultDTO) => {
      certificationResultDTO.complementaryCertificationCourseResults =
        complementaryCertificationCourseResultsByCertificationCourseId.find(
          ({ certificationCourseId }) => certificationCourseId === certificationResultDTO.id
        )?.complementaryCertificationCourseResults;
      return _toDomain(certificationResultDTO);
    });
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

    let complementaryCertificationCourseResultsByCertificationCourseId = [];
    if (!isEmpty(certificationResultDTOs)) {
      complementaryCertificationCourseResultsByCertificationCourseId =
        await _selectComplementaryCertificationCourseResultsBySessionId({
          sessionId: certificationResultDTOs[0].sessionId,
        });
    }

    return certificationResultDTOs.map((certificationResultDTO) => {
      certificationResultDTO.complementaryCertificationCourseResults =
        complementaryCertificationCourseResultsByCertificationCourseId.find(
          ({ certificationCourseId }) => certificationCourseId === certificationResultDTO.id
        )?.complementaryCertificationCourseResults;
      return _toDomain(certificationResultDTO);
    });
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
      emitter: 'assessment-results.emitter',
    })
    .select(
      knex.raw(`
        json_agg("competence-marks".* ORDER BY "competence-marks"."competence_code" asc)  as "competenceMarks"`)
    )
    .from('certification-courses')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId'
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId'
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .groupBy('certification-courses.id', 'assessment-results.id')
    .where('certification-courses.isPublished', true);
}

function _selectComplementaryCertificationCourseResultsBySessionId({ sessionId }) {
  return knex('complementary-certification-course-results')
    .select({ certificationCourseId: 'certification-courses.id' })
    .select(
      knex.raw(`
        array_agg(json_build_object(
        'complementaryCertificationCourseId', "complementary-certification-course-results"."complementaryCertificationCourseId",
        'id', "complementary-certification-course-results"."id",
        'partnerKey', "complementary-certification-course-results"."partnerKey",
        'acquired', "complementary-certification-course-results"."acquired",
        'source', "complementary-certification-course-results"."source",
        'label', "complementary-certification-badges"."label",
        'order', "complementary-certifications".id
        ) order by "complementary-certifications".id, "complementary-certification-badges".level) as "complementaryCertificationCourseResults"
        `)
    )
    .join(
      'complementary-certification-courses',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId'
    )
    .join('badges', 'badges.key', 'complementary-certification-course-results.partnerKey')
    .join('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId'
    )
    .join(
      'certification-courses',
      'certification-courses.id',
      'complementary-certification-courses.certificationCourseId'
    )
    .where({ sessionId })
    .where('complementary-certification-course-results.source', ComplementaryCertificationCourseResult.sources.PIX)
    .groupBy('certification-courses.id');
}

function _toDomain(certificationResultDTO) {
  return CertificationResult.from({
    certificationResultDTO,
  });
}
