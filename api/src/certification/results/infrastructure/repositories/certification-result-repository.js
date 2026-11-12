import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { CertificationResult } from '../../domain/models/CertificationResult.js';

export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationResultDTOs = await _selectCertificationResults()
    .where('certification-courses.sessionId', sessionId)
    .orderBy('certification-courses.lastName', 'ASC')
    .orderBy('certification-courses.firstName', 'ASC');

  const complementaryCertificationCourseResultsByCertificationCourseId =
    await _selectComplementaryCertificationCourseResultsBySessionId({
      knexConn,
      sessionId,
    });

  return certificationResultDTOs.map((certificationResultDTO) =>
    _toDomain({ certificationResultDTO, complementaryCertificationCourseResultsByCertificationCourseId }),
  );
}

export async function findByCertificationCandidateIds({ certificationCandidateIds }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationResultDTOs = await _selectCertificationResults()
    .join('certification-candidates', function () {
      this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' }).andOn({
        'certification-candidates.userId': 'certification-courses.userId',
      });
    })
    .whereIn('certification-candidates.id', certificationCandidateIds)
    .orderBy('certification-courses.lastName', 'ASC')
    .orderBy('certification-courses.firstName', 'ASC');

  if (!certificationResultDTOs.length) {
    return [];
  }

  const complementaryCertificationCourseResultsByCertificationCourseId =
    await _selectComplementaryCertificationCourseResultsBySessionId({
      knexConn,
      sessionId: certificationResultDTOs[0].sessionId,
    });

  return certificationResultDTOs.map((certificationResultDTO) =>
    _toDomain({ certificationResultDTO, complementaryCertificationCourseResultsByCertificationCourseId }),
  );
}

function _selectCertificationResults() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      externalId: 'certification-courses.externalId',
      createdAt: 'certification-courses.createdAt',
      sessionId: 'certification-courses.sessionId',
      framework: 'certification-courses.framework',
      version: 'certification-courses.version',
      pixScore: 'assessment-results.pixScore',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      assessmentResultStatus: 'assessment-results.status',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      commentForOrganization: 'assessment-results.commentForOrganization',
    })
    .select(
      knexConn.raw(`
        json_agg("competence-marks".* ORDER BY "competence-marks"."competence_code" asc)  as "competenceMarks"`),
    )
    .from('certification-courses')
    .leftJoin(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .leftJoin(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .groupBy('certification-courses.id', 'assessment-results.id')
    .where('certification-courses.isPublished', true);
}

function _selectComplementaryCertificationCourseResultsBySessionId({ knexConn, sessionId }) {
  return knexConn('complementary-certification-course-results')
    .select({
      certificationCourseId: 'certification-courses.id',
      complementaryCertificationCourseId:
        'complementary-certification-course-results.complementaryCertificationCourseId',
      id: 'complementary-certification-course-results.id',
      complementaryCertificationBadgeId: 'complementary-certification-course-results.complementaryCertificationBadgeId',
      acquired: 'complementary-certification-course-results.acquired',
      source: 'complementary-certification-course-results.source',
      label: 'complementary-certification-badges.label',
    })
    .join(
      'complementary-certification-courses',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId',
    )
    .join(
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-course-results.complementaryCertificationBadgeId',
    )
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .join(
      'certification-courses',
      'certification-courses.id',
      'complementary-certification-courses.certificationCourseId',
    )
    .where({
      sessionId,
      'complementary-certification-course-results.source': ComplementaryCertificationCourseResult.sources.PIX,
    });
}

function _toDomain({ certificationResultDTO, complementaryCertificationCourseResultsByCertificationCourseId }) {
  const complementaryCertificationCourseResult = complementaryCertificationCourseResultsByCertificationCourseId.find(
    (results) => results.certificationCourseId === certificationResultDTO.id,
  );
  return CertificationResult.from({
    certificationResultDTO: {
      ...certificationResultDTO,
      complementaryCertificationCourseResults: [complementaryCertificationCourseResult],
    },
  });
}
