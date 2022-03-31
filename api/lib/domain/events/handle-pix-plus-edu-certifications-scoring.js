const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const PixPlusEduCertificationScoring = require('../models/PixPlusEduCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../models/Badge').keys;
const { PIX_PLUS_EDU } = require('../models/ComplementaryCertification');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

function _isAllowedToBeScored(certifiableBadgeKey) {
  return [
    PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
    PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  ].includes(certifiableBadgeKey);
}

function _allowedToBeScoredBadgeKeys({ certifiableBadgeKeys }) {
  return certifiableBadgeKeys.filter(_isAllowedToBeScored);
}

async function handlePixPlusEduCertificationsScoring({
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
      complementaryCertificationName: PIX_PLUS_EDU,
    });
  if (!complementaryCertificationCourseId) {
    return;
  }

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId,
  });
  const certifiableBadgeKeys = certificationAssessment.listCertifiableBadgePixPlusKeysTaken();
  const allowedToBeScoredBadgeKeys = _allowedToBeScoredBadgeKeys({
    certifiableBadgeKeys,
  });

  for (const certifiableBadgeKey of allowedToBeScoredBadgeKeys) {
    const { certificationChallenges: pixPlusChallenges, certificationAnswers: pixPlusAnswers } =
      certificationAssessment.findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey);
    const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
    const pixPlusEduCertificationScoring = _buildPixPlusEduCertificationScoring(
      complementaryCertificationCourseId,
      pixPlusChallenges,
      pixPlusAnswers,
      certifiableBadgeKey,
      assessmentResult
    );
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusEduCertificationScoring });
  }
}

function _buildPixPlusEduCertificationScoring(
  complementaryCertificationCourseId,
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
  return new PixPlusEduCertificationScoring({
    complementaryCertificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusEduCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusEduCertificationsScoring;
