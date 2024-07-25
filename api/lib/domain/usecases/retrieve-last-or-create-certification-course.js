import bluebird from 'bluebird';

import { SessionNotAccessible } from '../../../src/certification/session-management/domain/errors.js';
import { ComplementaryCertificationCourse } from '../../../src/certification/session-management/domain/models/ComplementaryCertificationCourse.js';
import { CertificationCourse } from '../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../src/shared/config.js';
import { LanguageNotSupportedError } from '../../../src/shared/domain/errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  NotFoundError,
  UnexpectedUserAccountError,
  UserNotAuthorizedToCertifyError,
} from '../../../src/shared/domain/errors.js';
import { Assessment } from '../../../src/shared/domain/models/Assessment.js';

const { features } = config;

const retrieveLastOrCreateCertificationCourse = async function ({
  domainTransaction,
  accessCode,
  sessionId,
  userId,
  locale,
  assessmentRepository,
  competenceRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationCenterRepository,
  userRepository,
  certificationChallengesService,
  placementProfileService,
  certificationBadgesService,
  verifyCertificateCodeService,
  languageService,
}) {
  const session = await sessionRepository.get({ id: sessionId });

  _validateSessionAccess(session, accessCode);
  _validateSessionIsActive(session);

  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({
    userId,
    sessionId,
  });

  _validateUserIsCertificationCandidate(certificationCandidate);

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
      domainTransaction,
    });

  _validateCandidateIsAuthorizedToStart(certificationCandidate, existingCertificationCourse);

  await _blockCandidateFromRestartingWithoutExplicitValidation(
    certificationCandidate,
    certificationCandidateRepository,
  );

  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  const { version } = session;

  let lang;
  if (CertificationVersion.isV3(version)) {
    const user = await userRepository.get(userId);
    const isUserLanguageValid = _validateUserLanguage(languageService, user.lang);

    if (!isUserLanguageValid) {
      throw new LanguageNotSupportedError(user.lang);
    }

    lang = user.lang;
  }

  return _startNewCertification({
    domainTransaction,
    sessionId,
    userId,
    certificationCandidate,
    locale,
    assessmentRepository,
    competenceRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    certificationChallengesService,
    placementProfileService,
    verifyCertificateCodeService,
    certificationBadgesService,
    version,
    lang,
  });
};

export { retrieveLastOrCreateCertificationCourse };

function _validateUserLanguage(languageService, userLanguage) {
  return CertificationCourse.isLanguageAvailableForV3Certification(languageService, userLanguage);
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
  certificationCandidateRepository,
) {
  certificationCandidate.authorizedToStart = false;
  await certificationCandidateRepository.update(certificationCandidate);
}

async function _startNewCertification({
  domainTransaction,
  sessionId,
  userId,
  certificationCandidate,
  locale,
  assessmentRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  certificationChallengesService,
  placementProfileService,
  certificationBadgesService,
  verifyCertificateCodeService,
  version,
  lang,
}) {
  const challengesForCertification = [];

  const placementProfile = await placementProfileService.getPlacementProfile({
    userId,
    limitDate: new Date(),
    version,
  });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  // Above operations are potentially slow so that two simultaneous calls of this function might overlap 😿
  // In case the simultaneous call finished earlier than the current one, we want to return its result
  const certificationCourseCreatedMeanwhile = await _getCertificationCourseIfCreatedMeanwhile(
    certificationCourseRepository,
    userId,
    sessionId,
    domainTransaction,
  );
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId });

  const complementaryCertificationCourseData = [];

  const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
    domainTransaction,
  });

  await bluebird.each(
    highestCertifiableBadgeAcquisitions,
    async ({
      complementaryCertificationKey,
      complementaryCertificationId,
      complementaryCertificationBadgeId,
      campaignId,
      badgeKey,
    }) => {
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
    },
  );

  let challengesForPixCertification = [];
  if (!CertificationVersion.isV3(version)) {
    challengesForPixCertification = await certificationChallengesService.pickCertificationChallenges(
      placementProfile,
      locale,
    );
    challengesForCertification.push(...challengesForPixCertification);
  }

  return _createCertificationCourse({
    certificationCandidate,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    certificationChallenges: challengesForCertification,
    domainTransaction,
    verifyCertificateCodeService,
    complementaryCertificationCourseData,
    version,
    lang,
  });
}

async function _getCertificationCourseIfCreatedMeanwhile(
  certificationCourseRepository,
  userId,
  sessionId,
  domainTransaction,
) {
  return certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
    domainTransaction,
  });
}

async function _createCertificationCourse({
  certificationCandidate,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  certificationChallenges,
  complementaryCertificationCourseData,
  domainTransaction,
  version,
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
    version,
    lang,
  });

  const savedCertificationCourse = await certificationCourseRepository.save({
    certificationCourse: newCertificationCourse,
    domainTransaction,
  });

  const newAssessment = Assessment.createForCertificationCourse({
    userId,
    certificationCourseId: savedCertificationCourse.getId(),
  });
  const savedAssessment = await assessmentRepository.save({ assessment: newAssessment, domainTransaction });

  const certificationCourse = savedCertificationCourse.withAssessment(savedAssessment);

  // FIXME : return CertificationCourseCreated or CertificationCourseRetrieved with only needed fields
  return {
    created: true,
    certificationCourse,
  };
}
