/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').UserRepository} UserRepository
 * @typedef {import('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import('./index.js').VerifyCertificateCodeService} VerifyCertificateCodeService
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../../src/shared/domain/models/CertificationCandidate.js').CertificationCandidate} CertificationCandidate
 */
import { config } from '../../../../shared/config.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { LanguageNotSupportedError } from '../../../../shared/domain/errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  NotFoundError,
  UnexpectedUserAccountError,
} from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { SessionNotAccessible } from '../../../session-management/domain/errors.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { assessmentRepository as injectedAssessmentRepository } from '../../../session-management/infrastructure/repositories/index.js';
import * as injectedSessionRepository from '../../../session-management/infrastructure/repositories/session-repository.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import * as injectedCertificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as injectedSharedCertificationCandidateRepository from '../../../shared/infrastructure/repositories/certification-candidate-repository.js';
import * as injectedCertificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';
import * as injectedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as injectedUserRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as injectedVerifyCertificateCodeService from '../services/verify-certificate-code-service.js';

const { features } = config;

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {CertificationCandidateRepository} params.sharedCertificationCandidateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {UserRepository} params.userRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
export const retrieveLastOrCreateCertificationCourse = async function ({
  accessCode,
  sessionId,
  userId,
  locale,
  assessmentRepository = injectedAssessmentRepository,
  sharedCertificationCandidateRepository = injectedSharedCertificationCandidateRepository,
  certificationCourseRepository = injectedCertificationCourseRepository,
  sessionRepository = injectedSessionRepository,
  certificationCenterRepository = injectedCertificationCenterRepository,
  userRepository = injectedUserRepository,
  certificationBadgesService = injectedCertificationBadgesService,
  verifyCertificateCodeService = injectedVerifyCertificateCodeService,
} = {}) {
  const session = await sessionRepository.get({ id: sessionId });

  _validateSessionAccess(session, accessCode);
  _validateSessionIsActive(session);

  const certificationCandidate = await sharedCertificationCandidateRepository.getBySessionIdAndUserId({
    userId,
    sessionId,
  });

  _validateUserIsCertificationCandidate(certificationCandidate);

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
    });

  _validateCandidateIsAuthorizedToStart(certificationCandidate, existingCertificationCourse);

  await _blockCandidateFromRestartingWithoutExplicitValidation(
    certificationCandidate,
    sharedCertificationCandidateRepository,
  );

  if (existingCertificationCourse) {
    existingCertificationCourse.adjustForAccessibility(certificationCandidate.accessibilityAdjustmentNeeded);

    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  return _startNewCertification({
    session,
    userId,
    certificationCandidate,
    locale,
    assessmentRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    userRepository,
    verifyCertificateCodeService,
    certificationBadgesService,
  });
};

function _validateUserLanguage(userLanguage) {
  const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(userLanguage);

  if (!isUserLanguageValid) {
    throw new LanguageNotSupportedError(userLanguage);
  }
}

function _validateSessionAccess(session, accessCode) {
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }
}

function _validateSessionIsActive(session) {
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }
}

function _validateUserIsCertificationCandidate(certificationCandidate) {
  if (!certificationCandidate) {
    throw new UnexpectedUserAccountError({});
  }
}

function _validateCandidateIsAuthorizedToStart(certificationCandidate, existingCertificationCourse) {
  if (!certificationCandidate.isAuthorizedToStart()) {
    if (existingCertificationCourse) {
      throw new CandidateNotAuthorizedToResumeCertificationTestError();
    } else {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}

async function _blockCandidateFromRestartingWithoutExplicitValidation(
  certificationCandidate,
  sharedCertificationCandidateRepository,
) {
  certificationCandidate.authorizedToStart = false;
  await sharedCertificationCandidateRepository.update(certificationCandidate);
}

/**
 * @param {Object} params
 * @param {Session} params.session
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {UserRepository} params.userRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _startNewCertification({
  session,
  userId,
  certificationCandidate,
  assessmentRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  userRepository,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const user = await userRepository.get({ id: userId });
  _validateUserLanguage(user.lang);

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId: session.id });

  let complementaryCertificationCourseData;

  if (certificationCandidate.isEnrolledToComplementaryOnly()) {
    if (!certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
      throw new CenterHabilitationError();
    }

    complementaryCertificationCourseData = {
      complementaryCertificationBadgeId: null,
      complementaryCertificationId: certificationCandidate.complementaryCertification.id,
    };
  }

  if (certificationCandidate.isEnrolledToDoubleCertification()) {
    if (!certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
      throw new CenterHabilitationError();
    }

    const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId,
    });

    const [doubleCertificationBadge] = highestCertifiableBadgeAcquisitions.filter(
      (acquiredBadge) => acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
    );

    if (doubleCertificationBadge) {
      const { complementaryCertificationId, complementaryCertificationBadgeId } = doubleCertificationBadge;
      complementaryCertificationCourseData = { complementaryCertificationBadgeId, complementaryCertificationId };
    }
  }

  // Above operations are potentially slow so that two simultaneous calls of this function might overlap 😿
  // In case the simultaneous call finished earlier than the current one, we want to return its result
  const certificationCourseCreatedMeanwhile = await _getCertificationCourseIfCreatedMeanwhile(
    certificationCourseRepository,
    userId,
    session.id,
  );
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  return _createCertificationCourse({
    certificationCandidate,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    verifyCertificateCodeService,
    complementaryCertificationCourseData,
    lang: user.lang,
  });
}

/**
 * @param {Object} params
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {UserId} params.userId
 * @param {SessionId} params.sessionId
 * @returns {Promise<CertificationCourse>}
 */
async function _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId) {
  return certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
  });
}

/**
 * @param {Object} params
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _createCertificationCourse({
  certificationCandidate,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  complementaryCertificationCourseData,
  lang,
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourse = complementaryCertificationCourseData
    ? new ComplementaryCertificationCourse({
        complementaryCertificationBadgeId: complementaryCertificationCourseData.complementaryCertificationBadgeId,
        complementaryCertificationId: complementaryCertificationCourseData.complementaryCertificationId,
      })
    : null;

  const newCertificationCourse = CertificationCourse.from({
    certificationCandidate,
    maxReachableLevelOnCertificationDate: features.maxReachableLevel,
    complementaryCertificationCourse,
    verificationCode,
    algorithmEngineVersion: AlgorithmEngineVersion.V3,
    lang,
  });

  return DomainTransaction.execute(async () => {
    const savedCertificationCourse = await certificationCourseRepository.save({
      certificationCourse: newCertificationCourse,
    });

    const newAssessment = Assessment.createForCertificationCourse({
      userId,
      certificationCourseId: savedCertificationCourse.getId(),
    });
    const savedAssessment = await assessmentRepository.save({ assessment: newAssessment });

    const certificationCourse = savedCertificationCourse.withAssessment(savedAssessment);

    // FIXME : return CertificationCourseCreated or CertificationCourseRetrieved with only needed fields
    return {
      created: true,
      certificationCourse,
    };
  });
}
