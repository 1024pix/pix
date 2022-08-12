const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const ComplementaryCertificationCourse = require('../models/ComplementaryCertificationCourse');
const {
  UserNotAuthorizedToCertifyError,
  NotFoundError,
  SessionNotAccessible,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
} = require('../errors');
const { features } = require('../../config');

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
  endTestScreenRemovalService,
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

  const isEndTestRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
    session.id
  );

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
      domainTransaction,
    });

  if (isEndTestRemovalEnabled && !certificationCandidate.isAuthorizedToStart()) {
    if (existingCertificationCourse) {
      throw new CandidateNotAuthorizedToResumeCertificationTestError();
    } else {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }

  if (isEndTestRemovalEnabled) {
    certificationCandidate.authorizedToStart = false;
    certificationCandidateRepository.update(certificationCandidate);
  }

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

  const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
    domainTransaction,
  });

  if (certificationCenter.isHabilitatedClea && certificationCandidate.isGrantedCleA()) {
    const cleaBadgeAcquisition = highestCertifiableBadgeAcquisitions.find((badgeAcquisition) =>
      badgeAcquisition.isClea()
    );
    if (cleaBadgeAcquisition) {
      const cleAComplementaryCertification = complementaryCertifications.find((comp) => comp.isClea());
      if (cleAComplementaryCertification) {
        complementaryCertificationIds.push(cleAComplementaryCertification.id);
      }
    }
  }

  if (certificationCenter.isHabilitatedPixPlusDroit && certificationCandidate.isGrantedPixPlusDroit()) {
    const pixDroitBadgeAcquisition = highestCertifiableBadgeAcquisitions.find((badgeAcquisition) =>
      badgeAcquisition.isPixDroit()
    );
    if (pixDroitBadgeAcquisition) {
      const pixDroitComplementaryCertification = complementaryCertifications.find((comp) => comp.isPixPlusDroit());
      if (pixDroitComplementaryCertification) {
        complementaryCertificationIds.push(pixDroitComplementaryCertification.id);
      }

      const certificationChallengesForPixDroit =
        await certificationChallengesService.pickCertificationChallengesForPixPlus(
          pixDroitBadgeAcquisition.badge,
          userId,
          locale
        );
      challengesForCertification.push(...certificationChallengesForPixDroit);
    }
  }

  if (certificationCenter.isHabilitatedPixPlusEdu2ndDegre && certificationCandidate.isGrantedPixPlusEdu2ndDegre()) {
    const pixEdu2ndDegreBadgeAcquisition = highestCertifiableBadgeAcquisitions.find((badgeAcquisition) =>
      badgeAcquisition.isPixEdu2ndDegre()
    );
    if (pixEdu2ndDegreBadgeAcquisition) {
      const certificationChallengesForPixEdu =
        await certificationChallengesService.pickCertificationChallengesForPixPlus(
          pixEdu2ndDegreBadgeAcquisition.badge,
          userId,
          locale
        );
      challengesForCertification.push(...certificationChallengesForPixEdu);
      if (certificationChallengesForPixEdu.length > 0) {
        const pixEduComplementaryCertification = complementaryCertifications.find((comp) =>
          comp.isPixPlusEdu2ndDegre()
        );
        if (pixEduComplementaryCertification) {
          complementaryCertificationIds.push(pixEduComplementaryCertification.id);
        }
      }
    }
  }

  if (certificationCenter.isHabilitatedPixPlusEdu1erDegre && certificationCandidate.isGrantedPixPlusEdu1erDegre()) {
    const pixEdu1erDegreBadgeAcquisition = highestCertifiableBadgeAcquisitions.find((badgeAcquisition) =>
      badgeAcquisition.isPixEdu1erDegre()
    );
    if (pixEdu1erDegreBadgeAcquisition) {
      const certificationChallengesForPixEdu =
        await certificationChallengesService.pickCertificationChallengesForPixPlus(
          pixEdu1erDegreBadgeAcquisition.badge,
          userId,
          locale
        );
      challengesForCertification.push(...certificationChallengesForPixEdu);
      if (certificationChallengesForPixEdu.length > 0) {
        const pixEduComplementaryCertification = complementaryCertifications.find((comp) =>
          comp.isPixPlusEdu1erDegre()
        );
        if (pixEduComplementaryCertification) {
          complementaryCertificationIds.push(pixEduComplementaryCertification.id);
        }
      }
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
