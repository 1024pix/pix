const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
} = require('../errors');
const { features, featureToggles } = require('../../config');
const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = async function retrieveLastOrCreateCertificationCourse({
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

  if (featureToggles.isEndTestScreenRemovalEnabled) {
    const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({
      userId,
      sessionId,
    });
    if (!certificationCandidate.isAuthorizedToStart()) {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
    certificationCandidate.authorizedToStart = false;
    certificationCandidateRepository.update(certificationCandidate);
  }

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
      domainTransaction,
    });
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
    locale,
    assessmentRepository,
    competenceRepository,
    certificationCandidateRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    certificationChallengesService,
    certificationBadgesService,
    placementProfileService,
    verifyCertificateCodeService,
  });
};

async function _startNewCertification({
  domainTransaction,
  sessionId,
  userId,
  locale,
  assessmentRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  certificationChallengesService,
  placementProfileService,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const challengesForCertification = [];

  const challengesForPixCertification = await _createPixCertification(
    placementProfileService,
    certificationChallengesService,
    userId,
    locale
  );
  challengesForCertification.push(...challengesForPixCertification);

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
  if (certificationCenter.isAccreditedPixPlusDroit) {
    const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId,
      domainTransaction,
    });

    if (highestCertifiableBadgeAcquisitions.length > 0) {
      const challengesForPixPlusCertification = await _findChallengesFromPixPlus({
        userId,
        highestCertifiableBadgeAcquisitions,
        certificationBadgesService,
        certificationChallengesService,
        locale,
      });
      challengesForCertification.push(...challengesForPixPlusCertification);
    }
  }

  return _createCertificationCourse({
    certificationCandidateRepository,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    sessionId,
    certificationChallenges: challengesForCertification,
    domainTransaction,
    verifyCertificateCodeService,
  });
}

async function _findChallengesFromPixPlus({
  userId,
  highestCertifiableBadgeAcquisitions,
  certificationChallengesService,
  locale,
}) {
  const challengesPixPlusByCertifiableBadges = await bluebird.mapSeries(
    highestCertifiableBadgeAcquisitions,
    ({ badge }) => certificationChallengesService.pickCertificationChallengesForPixPlus(badge, userId, locale)
  );
  return _.flatMap(challengesPixPlusByCertifiableBadges);
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

async function _createPixCertification(placementProfileService, certificationChallengesService, userId, locale) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: new Date() });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  return certificationChallengesService.pickCertificationChallenges(placementProfile, locale);
}

async function _createCertificationCourse({
  certificationCandidateRepository,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  sessionId,
  certificationChallenges,
  domainTransaction,
}) {
  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ userId, sessionId });
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const newCertificationCourse = CertificationCourse.from({
    certificationCandidate,
    challenges: certificationChallenges,
    maxReachableLevelOnCertificationDate: features.maxReachableLevel,
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
