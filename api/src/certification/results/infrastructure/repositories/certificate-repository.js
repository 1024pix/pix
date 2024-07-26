import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import {
  AssessmentResult,
  CompetenceMark,
  PrivateCertificate,
  ResultCompetenceTree,
  ShareableCertificate,
} from '../../../../shared/domain/models/index.js';
import { CertificationAttestation } from '../../domain/models/CertificationAttestation.js';
import { CertifiedBadge } from '../../domain/read-models/CertifiedBadge.js';
import * as competenceTreeRepository from './competence-tree-repository.js';

const findByDivisionForScoIsManagingStudentsOrganization = async function ({ organizationId, division }) {
  const certificationCourseDTOs = await _selectCertificationAttestations()
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

  const competenceTree = await competenceTreeRepository.get();

  const mostRecentCertificationsPerOrganizationLearner =
    _filterMostRecentCertificationCoursePerOrganizationLearner(certificationCourseDTOs);
  return _(mostRecentCertificationsPerOrganizationLearner)
    .orderBy(['lastName', 'firstName'], ['asc', 'asc'])
    .map((certificationCourseDTO) => {
      return _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges: [] });
    })
    .value();
};

const getCertificationAttestation = async function ({ certificationCourseId }) {
  const certificationCourseDTO = await _selectCertificationAttestations()
    .where('certification-courses.id', '=', certificationCourseId)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .first();

  if (!certificationCourseDTO) {
    throw new NotFoundError(`There is no certification course with id "${certificationCourseId}"`);
  }

  const competenceTree = await competenceTreeRepository.get();
  const certifiedBadges = await _getCertifiedBadges(certificationCourseDTO.id);

  return _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges });
};

const findPrivateCertificatesByUserId = async function ({ userId }) {
  const certificationCourseDTOs = await _selectPrivateCertificates()
    .where('certification-courses.userId', '=', userId)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .orderBy('certification-courses.createdAt', 'DESC');

  const privateCertificates = certificationCourseDTOs.map((certificationCourseDTO) =>
    _toDomainForPrivateCertificate({
      certificationCourseDTO,
    }),
  );
  return privateCertificates;
};

const getPrivateCertificate = async function (id, { locale } = {}) {
  const certificationCourseDTO = await _selectPrivateCertificates()
    .where('certification-courses.id', '=', id)
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false)
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .first();

  if (!certificationCourseDTO) {
    throw new NotFoundError(`Certificate not found for ID ${id}`);
  }

  const certifiedBadges = await _getCertifiedBadges(id);

  const competenceTree = await competenceTreeRepository.get({ locale });

  return _toDomainForPrivateCertificate({
    certificationCourseDTO,
    competenceTree,
    certifiedBadges,
  });
};

const getShareableCertificateByVerificationCode = async function (verificationCode, { locale } = {}) {
  const shareableCertificateDTO = await _selectShareableCertificates()
    .groupBy('certification-courses.id', 'sessions.id', 'assessment-results.id')
    .where({ verificationCode })
    .first();

  if (!shareableCertificateDTO) {
    throw new NotFoundError(`There is no certification course with verification code "${verificationCode}"`);
  }

  const competenceTree = await competenceTreeRepository.get({ locale });

  const certifiedBadges = await _getCertifiedBadges(shareableCertificateDTO.id);

  return _toDomainForShareableCertificate({ shareableCertificateDTO, competenceTree, certifiedBadges });
};

export {
  findByDivisionForScoIsManagingStudentsOrganization,
  findPrivateCertificatesByUserId,
  getCertificationAttestation,
  getPrivateCertificate,
  getShareableCertificateByVerificationCode,
};

function _selectCertificationAttestations() {
  return _getCertificateQuery()
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
      assessmentResultId: 'assessment-results.id',
      competenceMarks: knex.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })
    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}

function _selectPrivateCertificates() {
  return _getCertificateQuery().select({
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
    commentByAutoJury: 'assessment-results.commentByAutoJury',
    assessmentResultStatus: 'assessment-results.status',
    assessmentResultId: 'assessment-results.id',
    competenceMarks: knex.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
  });
}

function _selectShareableCertificates() {
  return _getCertificateQuery()
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
      competenceMarks: knex.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })

    .where('assessment-results.status', AssessmentResult.status.VALIDATED)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}

function _getCertificateQuery() {
  return knex
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
  const groupedByOrganizationLearner = _.groupBy(DTOs, 'organizationLearnerId');

  const mostRecent = [];
  for (const certificationsForOneOrganizationLearner of Object.values(groupedByOrganizationLearner)) {
    mostRecent.push(certificationsForOneOrganizationLearner[0]);
  }
  return mostRecent;
}

function _toDomainForCertificationAttestation({ certificationCourseDTO, competenceTree, certifiedBadges }) {
  const competenceMarks = _.compact(certificationCourseDTO.competenceMarks).map(
    (competenceMark) => new CompetenceMark({ ...competenceMark }),
  );

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
    certificationId: certificationCourseDTO.id,
    assessmentResultId: certificationCourseDTO.assessmentResultId,
  });

  return new CertificationAttestation({
    ...certificationCourseDTO,
    resultCompetenceTree,
    certifiedBadges,
  });
}

function _toDomainForPrivateCertificate({ certificationCourseDTO, competenceTree, certifiedBadges = [] }) {
  if (competenceTree) {
    const competenceMarks = _.compact(certificationCourseDTO.competenceMarks).map(
      (competenceMark) => new CompetenceMark({ ...competenceMark }),
    );

    const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
      certificationId: certificationCourseDTO.id,
      assessmentResultId: certificationCourseDTO.assessmentResultId,
    });

    return PrivateCertificate.buildFrom({
      ...certificationCourseDTO,
      resultCompetenceTree,
      certifiedBadgeImages: certifiedBadges,
    });
  }

  return PrivateCertificate.buildFrom({
    ...certificationCourseDTO,
    certifiedBadgeImages: certifiedBadges,
  });
}

function _toDomainForShareableCertificate({ shareableCertificateDTO, competenceTree, certifiedBadges }) {
  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks: _.compact(shareableCertificateDTO.competenceMarks),
    certificationId: shareableCertificateDTO.id,
    assessmentResultId: shareableCertificateDTO.assessmentResultId,
  });

  return new ShareableCertificate({
    ...shareableCertificateDTO,
    resultCompetenceTree,
    certifiedBadgeImages: certifiedBadges,
  });
}

async function _getCertifiedBadges(certificationCourseId) {
  const complementaryCertificationCourseResults = await knex
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
