const _ = require('lodash');
const CertificationEligibility = require('../read-models/CertificationEligibility');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } = require('../models/Badge').keys;

module.exports = async function getUserCertificationEligibility({
  userId,
  placementProfileService,
  certificationBadgesService,
}) {
  const now = new Date();
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: now });
  const pixCertificationEligible = placementProfile.isCertifiable();
  const cleaCertificationEligible = await _computeCleaCertificationEligibility({
    userId,
    pixCertificationEligible,
    certificationBadgesService,
  });
  const { pixPlusDroitMaitreCertificationEligible, pixPlusDroitExpertCertificationEligible } =
    await _computePixPlusCertificationEligibility({
      userId,
      pixCertificationEligible,
      certificationBadgesService,
    });

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    cleaCertificationEligible,
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  });
};

async function _computeCleaCertificationEligibility({ userId, pixCertificationEligible, certificationBadgesService }) {
  if (!pixCertificationEligible) return false;
  return certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId });
}

async function _computePixPlusDroitCertificationEligibility({
  userId,
  pixCertificationEligible,
  certificationBadgesService,
}) {
  if (!pixCertificationEligible) {
    return {
      pixPlusDroitMaitreCertificationEligible: false,
      pixPlusDroitExpertCertificationEligible: false,
    };
  }
  const stillValidCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
    userId,
  });
  const pixPlusDroitMaitreBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, {
    badgeKey: PIX_DROIT_MAITRE_CERTIF,
  });
  const pixPlusDroitExpertBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, {
    badgeKey: PIX_DROIT_EXPERT_CERTIF,
  });
  const pixPlusDroitMaitreCertificationEligible = Boolean(pixPlusDroitMaitreBadgeAcquisition);
  const pixPlusDroitExpertCertificationEligible = Boolean(pixPlusDroitExpertBadgeAcquisition);
  return {
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
  };
}
