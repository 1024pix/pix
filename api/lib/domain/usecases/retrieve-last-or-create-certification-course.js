const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const ComplementaryCertificationCourse = require('../models/ComplementaryCertificationCourse');
const { PIX_PLUS_DROIT, CLEA } = require('../models/ComplementaryCertification');
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
  complementaryCertificationRepository,
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

  if (featureToggles.isEndTestScreenRemovalEnabled) {
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
    certificationCandidate,
    locale,
    assessmentRepository,
    competenceRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    certificationChallengesService,
    placementProfileService,
    verifyCertificateCodeService,
    complementaryCertificationRepository,
    certificationBadgesService,
  });
};

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
  complementaryCertificationRepository,
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

  const complementaryCertificationIds = [];

  const complementaryCertifications = await complementaryCertificationRepository.findAll();

  if (
    certificationCenter.isHabilitatedClea &&
    (!featureToggles.isComplementaryCertificationSubscriptionEnabled || certificationCandidate.isGrantedCleA())
  ) {
    if (await certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId })) {
      const cleAComplementaryCertification = complementaryCertifications.find((comp) => comp.name === CLEA);
      if (cleAComplementaryCertification) {
        complementaryCertificationIds.push(cleAComplementaryCertification.id);
      }
    }
  }

  if (
    certificationCenter.isHabilitatedPixPlusDroit &&
    (!featureToggles.isComplementaryCertificationSubscriptionEnabled || certificationCandidate.isGrantedPixPlusDroit())
  ) {
    const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId,
      domainTransaction,
    });

    if (highestCertifiableBadgeAcquisitions.length > 0) {
      const pixDroitComplementaryCertification = complementaryCertifications.find(
        (comp) => comp.name === PIX_PLUS_DROIT
      );
      if (pixDroitComplementaryCertification) {
        complementaryCertificationIds.push(pixDroitComplementaryCertification.id);
      }

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
    certificationCandidate,
    certificationCourseRepository,
    assessmentRepository,
    complementaryCertificationRepository,
    userId,
    certificationChallenges: challengesForCertification,
    domainTransaction,
    verifyCertificateCodeService,
    complementaryCertificationIds,
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
  certificationCandidate,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  certificationChallenges,
  complementaryCertificationIds,
  domainTransaction,
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourses = complementaryCertificationIds.map(
    ComplementaryCertificationCourse.fromComplementaryCertificationId
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
