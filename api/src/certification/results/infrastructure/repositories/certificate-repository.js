import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { buildForV3 } from '../../domain/models/certificate-builder.ts';
import { CertificationAttestation } from '../../domain/models/CertificationAttestation.js';
import { PrivateCertificate } from '../../domain/models/PrivateCertificate.js';
import { ResultCompetenceTree } from '../../domain/models/ResultCompetenceTree.js';
import { ShareableCertificate } from '../../domain/models/ShareableCertificate.js';
import { Certificate } from '../../domain/models/v3/Certificate.js';
import { CertifiedBadge } from '../../domain/read-models/CertifiedBadge.js';
import * as competenceTreeRepository from './competence-tree-repository.js';

export async function findByDivisionForScoIsManagingStudentsOrganization({ organizationId, division, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCourseDTOs = await _selectCertificationCourseDTOs(knexConn)
    .select({ organizationLearnerId: 'view-active-organization-learners.id' })
    .innerJoin('certification-candidates', function () {
      this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' }).andOn({
        'certification-candidates.userId': 'certification-courses.userId',
      });
    })
    .innerJoin(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'certification-candidates.organizationLearnerId',
    )
    .innerJoin('organizations', 'organizations.id', 'view-active-organization-learners.organizationId')
    .where({
      'view-active-organization-learners.organizationId': organizationId,
      'view-active-organization-learners.isDisabled': false,
    })
    .whereRaw('LOWER("view-active-organization-learners"."division") = ?', division.toLowerCase())
    .whereRaw('"certification-candidates"."userId" = "certification-courses"."userId"')
    .whereRaw('"certification-candidates"."sessionId" = "certification-courses"."sessionId"')
    .modify(_checkOrganizationIsScoIsManagingStudents)
    .groupBy('view-active-organization-learners.id', 'certification-courses.id', 'sessions.id', 'assessment-results.id')
    .orderBy('certification-courses.createdAt', 'DESC');

  const competenceTree = await competenceTreeRepository.get({ locale });

  const mostRecentCertificationsPerOrganizationLearner =
    _filterMostRecentCertificationCoursePerOrganizationLearner(certificationCourseDTOs);

  return await Promise.all(
    mostRecentCertificationsPerOrganizationLearner
      .toSorted((a, b) => {
        const akey = a.lastName + a.firstName;
        const bkey = b.lastName + b.firstName;
        return akey > bkey ? 1 : bkey > akey ? -1 : 0;
      })
      .map((certificationCourseDTO) => {
        return _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges: [] });
      }),
  );
}

export async function getCertificate({ certificationCourseId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCourseDTO = await _selectCertificationCourseDTOs(knexConn)
    .where('certification-courses.id', '=', certificationCourseId)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .first();

  if (!certificationCourseDTO) {
    return null;
  }

  const competenceTree = await competenceTreeRepository.get({ locale });
  const certifiedBadges = await _getCertifiedBadges(knexConn, certificationCourseDTO.id);

  return _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges });
}

export async function getPrivateCertificate(id, { locale } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const certificationCourseDTO = await _selectPrivateCertificates(knexConn)
    .where('certification-courses.id', '=', id)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .where('certification-courses.isPublished', true)
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .first();

  if (!certificationCourseDTO) {
    throw new NotFoundError(`Certificate not found for ID ${id}`);
  }

  const certifiedBadges = await _getCertifiedBadges(knexConn, id);

  const competenceTree = await competenceTreeRepository.get({ locale });

  return _toDomainForPrivateCertificate({
    certificationCourseDTO,
    competenceTree,
    certifiedBadges,
  });
}

export async function getShareableCertificate({ certificationCourseId, locale }) {
  const knexConn = DomainTransaction.getConnection();
  const shareableCertificateDTO = await _selectShareableCertificates(knexConn)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .where('certification-courses.id', certificationCourseId)
    .first();

  if (!shareableCertificateDTO) {
    throw new NotFoundError(`There is no certification course with given certification course id`);
  }

  const competenceTree = await competenceTreeRepository.get({ locale });

  const certifiedBadges = await _getCertifiedBadges(knexConn, shareableCertificateDTO.id);

  return _toDomainForShareableCertificate({ shareableCertificateDTO, competenceTree, certifiedBadges });
}

export async function findCertificationsIdAndVersion({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select({ id: 'certification-courses.id', version: 'certification-courses.version' })
    .from('certification-courses')
    .where({ sessionId, isPublished: true })
    .orderBy('certification-courses.id');
}

export async function buildCertificateV3(certificationId) {
  const knexConn = DomainTransaction.getConnection();
  const certificationData = await knexConn
    .select({
      id: 'certification-courses.id',
      algorithmEngineVersion: 'certification-courses.version',
      userId: 'certification-courses.userId',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      verificationCode: 'certification-courses.verificationCode',
      certificationCenter: 'certification-centers.name',
      startedAt: 'certification-courses.createdAt',
      deliveredAt: 'sessions.publishedAt',
      status: 'assessment-results.status',
      versionId: 'certification-courses.versionId',
      framework: 'certification-courses.framework',
      maxReachableLevel: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      eduV3ExternalJuryResult: 'assessment-results.eduV3ExternalJuryResult',
      commentByAutoJury: 'assessment-results.commentByAutoJury',
      commentByJury: 'assessment-results.commentByJury',
      commentForCandidate: 'assessment-results.commentForCandidate',
      commentForOrganization: 'assessment-results.commentForOrganization',
      competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('level', "competence-marks".level, 'competenceId', "competence-marks"."competenceId")
          ORDER BY "competence-marks"."competenceId" asc
        )`),
      organizationLearnerId: 'certification-candidates.organizationLearnerId',
    })
    .where('certification-courses.id', certificationId)
    .where('certification-courses.version', AlgorithmEngineVersion.V3)
    .where('certification-courses.isPublished', true)
    .from('certification-courses')
    .join('certification-candidates', 'certification-candidates.id', 'certification-courses.candidateId')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .join(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .groupBy(
      'certification-courses.id',
      'sessions.id',
      'assessment-results.id',
      'certification-centers.id',
      'certification-candidates.id',
    )
    .first();
  if (!certificationData) {
    return null;
  }

  let learnerData = null;
  if (certificationData.organizationLearnerId) {
    learnerData = await knexConn
      .select({
        middleName: 'middleName',
        thirdName: 'thirdName',
        externalId: 'nationalStudentId',
      })
      .from('organization-learners')
      .where({ id: certificationData.organizationLearnerId })
      .first();
  }

  let cleaData = null;
  if (certificationData.framework === Frameworks.CLEA) {
    cleaData = await knexConn
      .select(
        'complementary-certification-course-results.acquired',
        'complementary-certification-course-results.complementaryCertificationBadgeId',
      )
      .from('complementary-certification-course-results')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.id',
        'complementary-certification-course-results.complementaryCertificationCourseId',
      )
      .where({ certificationCourseId: certificationId })
      .first();
  }

  return buildForV3(certificationData, learnerData, cleaData);
}

function _selectCertificationCourseDTOs(knexConn) {
  return _getCertificateQuery(knexConn)
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
      version: 'sessions.version',
      verificationCode: 'certification-courses.verificationCode',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      algorithmEngineVersion: 'certification-courses.version',
      certificationFramework: 'certification-courses.framework',
      pixScore: 'assessment-results.pixScore',
      reachedMeshIndex: 'assessment-results.reachedMeshIndex',
      eduV3ExternalJuryResult: 'assessment-results.eduV3ExternalJuryResult',
      assessmentResultId: 'assessment-results.id',
      competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true);
}

function _selectPrivateCertificates(knexConn) {
  return _getCertificateQuery(knexConn).select({
    id: 'certification-courses.id',
    firstName: 'certification-courses.firstName',
    lastName: 'certification-courses.lastName',
    birthdate: 'certification-courses.birthdate',
    birthplace: 'certification-courses.birthplace',
    isPublished: 'certification-courses.isPublished',
    userId: 'certification-courses.userId',
    date: 'certification-courses.createdAt',
    verificationCode: 'certification-courses.verificationCode',
    algorithmEngineVersion: 'certification-courses.version',
    deliveredAt: 'sessions.publishedAt',
    certificationCenter: 'sessions.certificationCenter',
    maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
    pixScore: 'assessment-results.pixScore',
    commentForCandidate: 'assessment-results.commentForCandidate',
    commentByAutoJury: 'assessment-results.commentByAutoJury',
    assessmentResultStatus: 'assessment-results.status',
    assessmentResultId: 'assessment-results.id',
    competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    version: 'sessions.version',
  });
}

function _selectShareableCertificates(knexConn) {
  return _getCertificateQuery(knexConn)
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
      assessmentResultId: 'assessment-results.id',
      version: 'sessions.version',
      competenceMarks: knexConn.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true);
}

function _getCertificateQuery(knexConn) {
  return knexConn
    .from('certification-courses')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .join(
      'certification-courses-last-assessment-results',
      'certification-courses.id',
      'certification-courses-last-assessment-results.certificationCourseId',
    )
    .join(
      'assessment-results',
      'assessment-results.id',
      'certification-courses-last-assessment-results.lastAssessmentResultId',
    )
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id');
}

function _checkOrganizationIsScoIsManagingStudents(qb) {
  return qb.where('organizations.type', 'SCO').where('organizations.isManagingStudents', true);
}

function _filterMostRecentCertificationCoursePerOrganizationLearner(DTOs) {
  const groupedByOrganizationLearner = Object.groupBy(DTOs, (DTO) => DTO.organizationLearnerId);

  const mostRecent = [];
  for (const certificationsForOneOrganizationLearner of Object.values(groupedByOrganizationLearner)) {
    mostRecent.push(certificationsForOneOrganizationLearner[0]);
  }
  return mostRecent;
}

async function _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges }) {
  const competenceMarks = certificationCourseDTO.competenceMarks
    .filter(Boolean)
    .map((competenceMark) => new CompetenceMark({ ...competenceMark }));

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
    certificationId: certificationCourseDTO.id,
    assessmentResultId: certificationCourseDTO.assessmentResultId,
  });

  if (AlgorithmEngineVersion.isV3(certificationCourseDTO.version)) {
    return new Certificate({
      ...certificationCourseDTO,
      certificationDate: certificationCourseDTO.date,
      resultCompetenceTree,
      acquiredComplementaryCertification: certifiedBadges.length ? certifiedBadges[0] : null,
    });
  }

  return new CertificationAttestation({
    ...certificationCourseDTO,
    resultCompetenceTree,
    certifiedBadges,
  });
}

function _toDomainForPrivateCertificate({ certificationCourseDTO, competenceTree, certifiedBadges = [] }) {
  let resultCompetenceTree = null;

  if (competenceTree) {
    const competenceMarks = certificationCourseDTO.competenceMarks
      .filter(Boolean)
      .map((competenceMark) => new CompetenceMark({ ...competenceMark }));

    resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
      certificationId: certificationCourseDTO.id,
      assessmentResultId: certificationCourseDTO.assessmentResultId,
    });
  }

  return PrivateCertificate.buildFrom({
    ...certificationCourseDTO,
    resultCompetenceTree,
    certifiedBadgeImages: certifiedBadges,
  });
}

function _toDomainForShareableCertificate({ shareableCertificateDTO, competenceTree, certifiedBadges }) {
  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks: shareableCertificateDTO.competenceMarks.filter(Boolean),
    certificationId: shareableCertificateDTO.id,
    assessmentResultId: shareableCertificateDTO.assessmentResultId,
  });

  return new ShareableCertificate({
    ...shareableCertificateDTO,
    resultCompetenceTree,
    certifiedBadgeImages: certifiedBadges,
  });
}

async function _getCertifiedBadges(knexConn, certificationCourseId) {
  const complementaryCertificationCourseResults = await knexConn
    .select(
      'complementary-certification-course-results.source',
      'complementary-certification-course-results.acquired',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-badges.imageUrl',
      'complementary-certification-badges.stickerUrl',
      'complementary-certification-badges.label',
      'complementary-certification-badges.level',
      'complementary-certification-badges.certificateMessage',
      'complementary-certification-badges.temporaryCertificateMessage',
      'complementary-certifications.hasExternalJury',
    )
    .from('complementary-certification-course-results')
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.id',
      'complementary-certification-course-results.complementaryCertificationCourseId',
    )
    .innerJoin(
      'complementary-certification-badges',
      'complementary-certification-badges.id',
      'complementary-certification-course-results.complementaryCertificationBadgeId',
    )
    .innerJoin('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-badges.complementaryCertificationId',
    )
    .where({ certificationCourseId })
    .orderBy('badges.key');

  return CertifiedBadge.fromComplementaryCertificationCourseResults(complementaryCertificationCourseResults);
}
