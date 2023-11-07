import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import {
  PrivateCertificate,
  ShareableCertificate,
  ResultCompetenceTree,
  CompetenceMark,
  AssessmentResult,
} from '../../domain/models/index.js';
import { CertifiedBadge } from '../../../lib/domain/read-models/CertifiedBadge.js';
import { NotFoundError } from '../../../lib/domain/errors.js';
import * as competenceTreeRepository from './competence-tree-repository.js';

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

export { getPrivateCertificate, findPrivateCertificatesByUserId, getShareableCertificateByVerificationCode };

async function _getCertifiedBadges(certificationCourseId) {
  const complementaryCertificationCourseResults = await knex
    .select(
      'badges.key as partnerKey',
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
