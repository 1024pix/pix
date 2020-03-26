const AssessmentResult = require('../models/AssessmentResult');
const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');
const CompetenceMark = require('../models/CompetenceMark');
const Promise = require('bluebird');
const { MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED, UNCERTIFIED_LEVEL } = require('../constants');
const {
  CertificationComputeError,
} = require('../errors');

const handleCertificationScoring = async function({
  assessmentCompletedEvent,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
  assessmentRepository,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (assessmentCompletedEvent.isCertification) {
    await _calculateCertificationScore({ assessmentId:assessmentCompletedEvent.assessmentId, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService, assessmentRepository, badgeAcquisitionRepository, certificationPartnerAcquisitionRepository, });
  }
};

async function _calculateCertificationScore({
  assessmentId,
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
  assessmentResultRepository,
  certificationCourseRepository,
  certificationPartnerAcquisitionRepository,
  competenceMarkRepository,
}) {
  const assessmentResult = await _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository });

  await Promise.map(assessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({ ...competenceMark, ...{ assessmentResultId: assessmentResult.id } });
    return competenceMarkRepository.save(competenceMarkDomain);
  });

  await Promise.map(partnerCertifications, (partnerCertification) => {
    return certificationPartnerAcquisitionRepository.save(partnerCertification);
  });

  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}

function _checkCriteriaFullfilledClea(hasBadgeClea, percentageCorrectAnswers) {
  if (hasBadgeClea) {
    // Green zone
    return percentageCorrectAnswers >= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED;
  }
  return false;
}

function _createAssessmentResult({ assessment, assessmentScore, assessmentResultRepository }) {
  const assessmentStatus = _getAssessmentStatus(assessmentScore);
  const assessmentResult = AssessmentResult.BuildStandardAssessmentResult(assessmentScore.level, assessmentScore.nbPix, assessmentStatus, assessment.id);
  return assessmentResultRepository.save(assessmentResult);
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
  assessmentResultRepository,
  certificationCourseRepository,
  certificationComputeError,
}) {
  const assessmentResult = AssessmentResult.BuildAlgoErrorResult(certificationComputeError, assessment.id);
  await assessmentResultRepository.save(assessmentResult);
  return certificationCourseRepository.changeCompletionDate(assessment.certificationCourseId, new Date());
}

async function _getAcquiredPartnerCertifications({ badgeAcquisitionRepository, assessment, assessmentScore }) {
  const partnerCertifications = [];
  const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.CLEA,
    userId: assessment.userId
  });

  if (_checkCriteriaFullfilledClea(hasAcquiredBadgeClea, assessmentScore.percentageCorrectAnswers)) {
    partnerCertifications.push(new CertificationPartnerAcquisition({
      certificationCourseId: assessment.certificationCourseId,
      partnerKey: Badge.keys.CLEA
    }));
  }

  return partnerCertifications;
}

module.exports = handleCertificationScoring;
