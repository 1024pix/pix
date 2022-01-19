const { checkEventTypes } = require('./check-event-types');
const bluebird = require('bluebird');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const PixPlusCertificationScoring = require('../models/PixPlusCertificationScoring');
const { ReproducibilityRate } = require('../models/ReproducibilityRate');
const AnswerCollectionForScoring = require('../models/AnswerCollectionForScoring');
const { PIX_PLUS_DROIT } = require('../models/ComplementaryCertification');
const { featureToggles } = require('../../config');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../models/Badge').keys;

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function _isAllowedToBeScored({
  certifiableBadgeKey,
  certificationCourseId,
  complementaryCertificationCourseRepository,
}) {
  if (featureToggles.isComplementaryCertificationSubscriptionEnabled) {
    if (certifiableBadgeKey === PIX_DROIT_MAITRE_CERTIF || certifiableBadgeKey === PIX_DROIT_EXPERT_CERTIF) {
      return await complementaryCertificationCourseRepository.hasComplementaryCertification({
        certificationCourseId,
        complementaryCertificationName: PIX_PLUS_DROIT,
      });
    } else if (
      certifiableBadgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE ||
      certifiableBadgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE ||
      certifiableBadgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE ||
      certifiableBadgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT ||
      certifiableBadgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR
    ) {
      return true;
    }

    return false;
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

async function handlePixPlusCertificationsScoring({
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
    const pixPlusCertificationScoring = _buildPixPlusCertificationScoring(
      certificationCourseId,
      pixPlusChallenges,
      pixPlusAnswers,
      certifiableBadgeKey,
      assessmentResult
    );
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: pixPlusCertificationScoring });
  }
}

function _buildPixPlusCertificationScoring(
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
  return new PixPlusCertificationScoring({
    certificationCourseId,
    reproducibilityRate,
    certifiableBadgeKey,
    hasAcquiredPixCertification: assessmentResult.isValidated(),
  });
}

handlePixPlusCertificationsScoring.eventTypes = eventTypes;
module.exports = handlePixPlusCertificationsScoring;
