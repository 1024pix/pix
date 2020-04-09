const AssessmentResult = require('../models/AssessmentResult');
const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');
const CompetenceMark = require('../models/CompetenceMark');
const bluebird = require('bluebird');
const { MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED, UNCERTIFIED_LEVEL } = require('../constants');
const {
  CertificationComputeError,
} = require('../errors');

const CERTIF_GREEN_ZONE = 'green_zone';
const CERTIF_RED_ZONE = 'red_zone';

const handleCertificationScoring = async function({
  assessmentCompletedEvent,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (assessmentCompletedEvent.isCertification) {
    await _calculateCertificationScore({ assessmentId: assessmentCompletedEvent.assessmentId, domainTransaction, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService, assessmentRepository, badgeAcquisitionRepository, certificationPartnerAcquisitionRepository, });
  }
};

async function _calculateCertificationScore({
  assessmentId,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  try {
    const assessmentScore = await scoringCertificationService.calculateAssessmentScore(assessment);
    const partnerCertifications = await _getAcquiredPartnerCertifications({ badgeAcquisitionRepository, assessment, assessmentScore });
    await _saveResult({
      assessment,
      assessmentScore,
      partnerCertifications,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      badgeAcquisitionRepository,
      certificationPartnerAcquisitionRepository,
    });
  }
  catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      assessment,
      domainTransaction,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
    });
  }
}

async function _saveResult({
  assessment,
  assessmentScore,
  partnerCertifications,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationPartnerAcquisitionRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository, domainTransaction });

  await bluebird.mapSeries(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain, domainTransaction);
  });

  await bluebird.mapSeries(partnerCertifications, (partnerCertification) => {
    return certificationPartnerAcquisitionRepository.save(partnerCertification, domainTransaction);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date(), domainTransaction);
}

function _checkCriteriaFullfilledClea(hasBadgeClea, percentageCorrectAnswers) {
  if (hasBadgeClea) {
    switch (_getPartnerCertificationObtentionZone(percentageCorrectAnswers)) {
      case CERTIF_GREEN_ZONE:
        return true;
      case CERTIF_RED_ZONE:
        return false;
    }
  }

  return false;
}

function _getPartnerCertificationObtentionZone(percentageCorrectAnswers) {
  if (percentageCorrectAnswers >= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED) {
    return CERTIF_GREEN_ZONE;
  } else if (percentageCorrectAnswers <= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED) {
    return CERTIF_RED_ZONE;
  }

  return null;
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository, domainTransaction }) {
  const assessmentStatus = _getAssessmentStatus(assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);
  return assessmentResultRepository.save(assessmentResult, domainTransaction);
}

function _getAssessmentStatus(assessmentScore) {
  if (assessmentScore.nbPix === 0) {
    assessmentScore.level = UNCERTIFIED_LEVEL;
    return AssessmentResult.status.REJECTED;
  } else {
    return AssessmentResult.status.VALIDATED;
  }
}

async function _saveResultAfterCertificationComputeError({
  assessment,
  domainTransaction,
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, assessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date(), domainTransaction);
}

async function _getAcquiredPartnerCertifications({ badgeAcquisitionRepository, assessment, assessmentScore }) {
  const partnerCertifications = [];
  const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId: assessment.userId
  });

  if (_checkCriteriaFullfilledClea(hasAcquiredBadgeClea, assessmentScore.percentageCorrectAnswers)) {
    partnerCertifications.push(new CertificationPartnerAcquisition({
      certificationCourseId: assessment.certificationCourseId,
      partnerKey: Badge.keys.PIX_EMPLOI_CLEA
    }));
  }

  return partnerCertifications;
}

module.exports = handleCertificationScoring;
