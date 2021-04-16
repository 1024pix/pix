const CertificationCourse = require('../models/CertificationCourse');
const Assessment = require('../models/Assessment');
const { UserNotAuthorizedToCertifyError, NotFoundError } = require('../errors');
const { features } = require('../../config');
const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = async function retrieveLastOrCreateCertificationCourse({
  domainTransaction,
  accessCode,
  sessionId,
  userId,
  assessmentRepository,
  badgeAcquisitionRepository,
  competenceRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationChallengesService,
  placementProfileService,
}) {
  const session = await sessionRepository.get(sessionId);
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }

  const existingCertificationCourse = await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
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
    assessmentRepository,
    badgeAcquisitionRepository,
    competenceRepository,
    certificationCandidateRepository,
    certificationCourseRepository,
    certificationChallengesService,
    placementProfileService,
  });
};

async function _startNewCertification({
  domainTransaction,
  sessionId,
  userId,
  assessmentRepository,
  badgeAcquisitionRepository,
  certificationCandidateRepository,
  certificationCourseRepository,
  certificationChallengesService,
  placementProfileService,
}) {
  const challengesForPixCertification = await _createPixCertification(placementProfileService, certificationChallengesService, userId);

  // Above operations are potentially slow so that two simultaneous calls of this function might overlap 😿
  // In case the simultaneous call finished earlier than the current one, we want to return its result
  const certificationCourseCreatedMeanwhile = await _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId, domainTransaction);
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  const challengesForPixPlusCertification = await _findChallengesFromPixPlus({ userId, badgeAcquisitionRepository, certificationChallengesService, domainTransaction });
  const challengesForCertification = challengesForPixCertification.concat(challengesForPixPlusCertification);

  return _createCertificationCourse({
    certificationCandidateRepository,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    sessionId,
    certificationChallenges: challengesForCertification,
    domainTransaction,
  });
}

async function _findChallengesFromPixPlus({ userId, badgeAcquisitionRepository, certificationChallengesService, domainTransaction }) {
  const certifiableBadgeAcquisitions = await badgeAcquisitionRepository.findCertifiable({ userId, domainTransaction });
  const highestCertifiableBadgeAcquisitions = _keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions);
  const challengesPixPlusByCertifiableBadges = await bluebird.mapSeries(highestCertifiableBadgeAcquisitions,
    ({ badge }) => certificationChallengesService.pickCertificationChallengesForPixPlus(badge, userId));
  return _.flatMap(challengesPixPlusByCertifiableBadges);
}

async function _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId, domainTransaction) {
  return certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
    domainTransaction,
  });
}

async function _createPixCertification(placementProfileService, certificationChallengesService, userId) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: new Date() });

  if (!placementProfile.isCertifiable()) {
    throw new UserNotAuthorizedToCertifyError();
  }

  return certificationChallengesService.pickCertificationChallenges(placementProfile);
}

async function _createCertificationCourse({ certificationCandidateRepository, certificationCourseRepository, assessmentRepository, userId, sessionId, certificationChallenges, domainTransaction }) {
  const certificationCandidate = await certificationCandidateRepository.getBySessionIdAndUserId({ userId, sessionId });
  const newCertificationCourse = CertificationCourse.from({ certificationCandidate, challenges: certificationChallenges, maxReachableLevelOnCertificationDate: features.maxReachableLevel });

  const savedCertificationCourse = await certificationCourseRepository.save({
    certificationCourse: newCertificationCourse,
    domainTransaction,
  });

  const newAssessment = Assessment.createForCertificationCourse({ userId, certificationCourseId: savedCertificationCourse.id });
  const savedAssessment = await assessmentRepository.save({ assessment: newAssessment, domainTransaction });

  savedCertificationCourse.assessment = savedAssessment;

  // FIXME : return CertificationCourseCreated or CertificationCourseRetrieved with only needed fields
  return {
    created: true,
    certificationCourse: savedCertificationCourse,
  };
}

function _keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions) {
  return _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions);
}

const pixDroitMaitre = 'PIX_DROIT_MAITRE_CERTIF';
const pixDroitExpert = 'PIX_DROIT_EXPERT_CERTIF';

function _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions) {
  const [pixDroitBadgeAcquisitions, nonPixDroitBadgeAcquisitions] = _.partition(certifiableBadgeAcquisitions, _isPixDroit);
  if (pixDroitBadgeAcquisitions.length === 0) return nonPixDroitBadgeAcquisitions;
  const expertBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: pixDroitExpert });
  const maitreBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: pixDroitMaitre });
  return [
    ...nonPixDroitBadgeAcquisitions,
    expertBadgeAcquisition || maitreBadgeAcquisition,
  ];
}

function _isPixDroit(badgeAcquisition) {
  return [pixDroitMaitre, pixDroitExpert].includes(badgeAcquisition.badgeKey);
}
