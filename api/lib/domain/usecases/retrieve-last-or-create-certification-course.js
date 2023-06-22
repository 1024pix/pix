import { CertificationCourse } from '../models/CertificationCourse.js';
import { Assessment } from '../models/Assessment.js';
import { ComplementaryCertificationCourse } from '../models/ComplementaryCertificationCourse.js';

import {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  UnexpectedUserAccountError,
} from '../errors.js';

import { config } from '../../config.js';
import bluebird from 'bluebird';
import { CertificationVersion } from '../models/CertificationVersion.js';

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
  certificationChallengesService,
  placementProfileService,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const session = await sessionRepository.get(sessionId);

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
    certificationCandidateRepository
  );

  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  const { version } = session;

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
  });
};

export { retrieveLastOrCreateCertificationCourse };

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
  certificationCandidateRepository
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
    domainTransaction
  );
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

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
          locale
        );
        challengesForCertification.push(...certificationChallenges);
      }
    }
  );

  let challengesForPixCertification = [];
  if (version !== CertificationVersion.V3) {
    challengesForPixCertification = await certificationChallengesService.pickCertificationChallenges(
      placementProfile,
      locale
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
  });
}

async function _getCertificationCourseIfCreatedMeanwhile(
  certificationCourseRepository,
  userId,
  sessionId,
  domainTransaction
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
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourses = complementaryCertificationCourseData.map(
    ({ complementaryCertificationBadgeId, complementaryCertificationId }) =>
      new ComplementaryCertificationCourse({ complementaryCertificationBadgeId, complementaryCertificationId })
  );
  const newCertificationCourse = CertificationCourse.from({
    certificationCandidate,
    challenges: certificationChallenges,
    maxReachableLevelOnCertificationDate: features.maxReachableLevel,
    complementaryCertificationCourses,
    verificationCode,
    version,
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
