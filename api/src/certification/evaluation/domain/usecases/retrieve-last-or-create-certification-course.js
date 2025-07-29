/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').UserRepository} UserRepository
 * @typedef {import('./index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import('./index.js').CertificationChallengesService} CertificationChallengesService
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
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';

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
 * @param {CertificationChallengesService} params.certificationChallengesService
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
export const retrieveLastOrCreateCertificationCourse = async function ({
  accessCode,
  sessionId,
  userId,
  locale,
  assessmentRepository,
  sharedCertificationCandidateRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationCenterRepository,
  userRepository,
  certificationChallengesService,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
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
    certificationChallengesService,
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
 * @param {CertificationChallengesService} params.certificationChallengesService
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _startNewCertification({
  session,
  userId,
  certificationCandidate,
  locale,
  assessmentRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  userRepository,
  certificationChallengesService,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const user = await userRepository.get({ id: userId });
  _validateUserLanguage(user.lang);

  const challengesForCertification = [];

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId: session.id });

  const complementaryCertificationCourseData = [];

  const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
  });

  for (const highestCertifiableBadgeAcquisition of highestCertifiableBadgeAcquisitions) {
    const {
      complementaryCertificationKey,
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      campaignId,
      badgeKey,
    } = highestCertifiableBadgeAcquisition;

    if (
      certificationCenter.isHabilitated(complementaryCertificationKey) &&
      certificationCandidate.isGranted(complementaryCertificationKey)
    ) {
      complementaryCertificationCourseData.push({ complementaryCertificationBadgeId, complementaryCertificationId });
      const certificationChallenges = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        campaignId,
        badgeKey,
        userId,
        locale,
      );
      challengesForCertification.push(...certificationChallenges);
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
    certificationChallenges: challengesForCertification,
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
  certificationChallenges,
  complementaryCertificationCourseData,
  lang,
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourses = complementaryCertificationCourseData.map(
    ({ complementaryCertificationBadgeId, complementaryCertificationId }) =>
      new ComplementaryCertificationCourse({ complementaryCertificationBadgeId, complementaryCertificationId }),
  );

  const newCertificationCourse = CertificationCourse.from({
    certificationCandidate,
    challenges: certificationChallenges,
    maxReachableLevelOnCertificationDate: features.maxReachableLevel,
    complementaryCertificationCourses,
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
