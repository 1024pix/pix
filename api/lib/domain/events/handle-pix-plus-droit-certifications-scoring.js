const { checkEventTypes } = require('./check-event-types');
const bluebird = require('bluebird');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const PixPlusDroitCertificationScoring = require('../models/PixPlusDroitCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const { PIX_PLUS_DROIT } = require('../models/ComplementaryCertification');
const { featureToggles } = require('../../config');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } = require('../models/Badge').keys;

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function _isAllowedToBeScored({
  certifiableBadgeKey,
  certificationCourseId,
  complementaryCertificationCourseRepository,
}) {
  if (![PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF].includes(certifiableBadgeKey)) {
    return false;
  }

  if (featureToggles.isComplementaryCertificationSubscriptionEnabled) {
    return await complementaryCertificationCourseRepository.hasComplementaryCertification({
      certificationCourseId,
      complementaryCertificationName: PIX_PLUS_DROIT,
    });
  }

  return true;
}

async function _allowedToBeScoredBadgeKeys({
  certifiableBadgeKeys,
  certificationCourseId,
  complementaryCertificationCourseRepository,
}) {
  return bluebird.filter(certifiableBadgeKeys, async (certifiableBadgeKey) =>
    _isAllowedToBeScored({
      certifiableBadgeKey,
      certificationCourseId,
      complementaryCertificationCourseRepository,
    })
  );
}

async function handlePixPlusDroitCertificationsScoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  partnerCertificationScoringRepository,
  complementaryCertificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const certificationCourseId = event.certificationCourseId;
  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();
  const allowedToBeScoredBadgeKeys = await _allowedToBeScoredBadgeKeys({
    certifiableBadgeKeys,
    certificationCourseId,
    complementaryCertificationCourseRepository,
  });
  for (const certifiableBadgeKey of allowedToBeScoredBadgeKeys) {
    const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
      certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
    const pixPlusDroitCertificationScoring = _buildPixPlusDroitCertificationScoring(
      certificationCourseId,
      pixPlusChallenges,
      pixPlusAnswers,
      certifiableBadgeKey,
      assessmentResult
    );
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusDroitCertificationScoring });
  }
}

function _buildPixPlusDroitCertificationScoring(
  certificationCourseId,
  challenges,
  answers,
  certifiableBadgeKey,
  assessmentResult
) {
  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges });
  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  return new PixPlusDroitCertificationScoring({
    certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusDroitCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusDroitCertificationsScoring;
