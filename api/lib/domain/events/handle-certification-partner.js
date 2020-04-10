const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');
const Promise = require('bluebird');
const { MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED, MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED } = require('../constants');

const CERTIF_GREEN_ZONE = 'green_zone';
const CERTIF_RED_ZONE = 'red_zone';

async function handleCertificationAcquisitionForPartner({
  assessmentCompletedEvent,
  certificationScoringEvent,
  domainTransaction,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (!assessmentCompletedEvent.isCertification) {
    return;
  }

  const partnerCertifications = await _getAcquiredPartnerCertifications({
    badgeAcquisitionRepository,
    userId: assessmentCompletedEvent.userId,
    certificationCourseId: certificationScoringEvent.certificationCourseId,
    percentageCorrectAnswers: certificationScoringEvent.percentageCorrectAnswers,
  });

  await _saveResult({
    partnerCertifications,
    domainTransaction,
    certificationPartnerAcquisitionRepository,
  });
}

async function _saveResult({
  partnerCertifications,
  domainTransaction,
  certificationPartnerAcquisitionRepository,
}) {
  return await Promise.map(partnerCertifications, (partnerCertification) => {
    return certificationPartnerAcquisitionRepository.save(partnerCertification, domainTransaction);
  });
}

async function _getAcquiredPartnerCertifications({ badgeAcquisitionRepository, userId, certificationCourseId, percentageCorrectAnswers }) {
  const partnerCertifications = [];
  const hasAcquiredBadgeClea = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId
  });

  if (_checkCriteriaFullfilledClea(hasAcquiredBadgeClea, percentageCorrectAnswers)) {
    partnerCertifications.push(new CertificationPartnerAcquisition({
      certificationCourseId,
      partnerKey: Badge.keys.PIX_EMPLOI_CLEA
    }));
  }

  return partnerCertifications;
}

function _checkCriteriaFullfilledClea(userHasBadgeClea, percentageCorrectAnswers) {
  if (!userHasBadgeClea) return false;

  switch (_getPartnerCertificationObtentionArea(percentageCorrectAnswers)) {
    case CERTIF_GREEN_ZONE:
      return true;
    case CERTIF_RED_ZONE:
      return false;
  }
}

function _getPartnerCertificationObtentionArea(percentageCorrectAnswers) {
  if (percentageCorrectAnswers >= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_TRUSTED) {
    return CERTIF_GREEN_ZONE;
  } else if (percentageCorrectAnswers <= MINIMUM_REPRODUCTIBILITY_RATE_TO_BE_CERTIFIED) {
    return CERTIF_RED_ZONE;
  }

  return null;
}

module.exports = handleCertificationAcquisitionForPartner;
