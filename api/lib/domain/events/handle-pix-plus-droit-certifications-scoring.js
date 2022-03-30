const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const PixPlusDroitCertificationScoring = require('../models/PixPlusDroitCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const { PIX_PLUS_DROIT } = require('../models/ComplementaryCertification');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } = require('../models/Badge').keys;

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function _isAllowedToBeScored(certifiableBadgeKey) {
  return [PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF].includes(certifiableBadgeKey);
}

async function _allowedToBeScoredBadgeKeys({ certifiableBadgeKeys }) {
  return certifiableBadgeKeys.filter(_isAllowedToBeScored);
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
  const complementaryCertificationCourseId =
    await complementaryCertificationCourseRepository.getComplementaryCertificationCourseId({
      certificationCourseId,
      complementaryCertificationName: PIX_PLUS_DROIT,
    });
  if (!complementaryCertificationCourseId) {
    return;
  }

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
      complementaryCertificationCourseId,
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
  complementaryCertificationCourseId,
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
    complementaryCertificationCourseId,
    certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusDroitCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusDroitCertificationsScoring;
