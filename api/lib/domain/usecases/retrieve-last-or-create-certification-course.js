import CertificationCourse from '../models/CertificationCourse';
import Assessment from '../models/Assessment';
import ComplementaryCertificationCourse from '../models/ComplementaryCertificationCourse';

import {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
} from '../errors';

import { features } from '../../config';
import bluebird from 'bluebird';

export default async function retrieveLastOrCreateCertificationCourse({
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
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }
  if (!session.isAccessible()) {
    throw new SessionNotAccessible();
  }

  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({
    userId,
    sessionId,
  });

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
      domainTransaction,
    });

  if (!certificationCandidate.isAuthorizedToStart()) {
    if (existingCertificationCourse) {
      throw new CandidateNotAuthorizedToResumeCertificationTestError();
    } else {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }

  certificationCandidate.authorizedToStart = false;
  certificationCandidateRepository.update(certificationCandidate);

  if (existingCertificationCourse) {
    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
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
  });
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
}) {
  const challengesForCertification = [];

  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: new Date() });

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

  const challengesForPixCertification = await certificationChallengesService.pickCertificationChallenges(
    placementProfile,
    locale
  );
  challengesForCertification.push(...challengesForPixCertification);

  return _createCertificationCourse({
    certificationCandidate,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    certificationChallenges: challengesForCertification,
    domainTransaction,
    verifyCertificateCodeService,
    complementaryCertificationCourseData,
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
