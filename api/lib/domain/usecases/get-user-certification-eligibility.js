const _ = require('lodash');
const CertificationEligibility = require('../read-models/CertificationEligibility');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../models/Badge').keys;

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
  const {
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
    pixPlusEduAutonomeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
    pixPlusEduFormateurCertificationEligible,
  } = await _computePixPlusCertificationEligibility({
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
    pixPlusEduAutonomeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
    pixPlusEduFormateurCertificationEligible,
  });
};

async function _computeCleaCertificationEligibility({ userId, pixCertificationEligible, certificationBadgesService }) {
  if (!pixCertificationEligible) return false;
  return certificationBadgesService.hasStillValidCleaBadgeAcquisition({ userId });
}

async function _computePixPlusCertificationEligibility({
  userId,
  pixCertificationEligible,
  certificationBadgesService,
}) {
  if (!pixCertificationEligible) {
    return {
      pixPlusDroitMaitreCertificationEligible: false,
      pixPlusDroitExpertCertificationEligible: false,
      pixPlusEduAutonomeCertificationEligible: false,
      pixPlusEduAvanceCertificationEligible: false,
      pixPlusEduExpertCertificationEligible: false,
      pixPlusEduFormateurCertificationEligible: false,
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
  const pixPlusEduAutonomeBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, {
    badgeKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  });
  const pixPlusEduAvanceBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, (badgeAcquisition) => {
    return (
      badgeAcquisition.badgeKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE ||
      badgeAcquisition.badgeKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    );
  });
  const pixPlusEduExpertBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, {
    badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  });
  const pixPlusEduFormateurBadgeAcquisition = _.find(stillValidCertifiableBadgeAcquisitions, {
    badgeKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
  });

  const pixPlusDroitMaitreCertificationEligible = Boolean(pixPlusDroitMaitreBadgeAcquisition);
  const pixPlusDroitExpertCertificationEligible = Boolean(pixPlusDroitExpertBadgeAcquisition);
  const pixPlusEduAutonomeCertificationEligible = Boolean(pixPlusEduAutonomeBadgeAcquisition);
  const pixPlusEduAvanceCertificationEligible = Boolean(pixPlusEduAvanceBadgeAcquisition);
  const pixPlusEduExpertCertificationEligible = Boolean(pixPlusEduExpertBadgeAcquisition);
  const pixPlusEduFormateurCertificationEligible = Boolean(pixPlusEduFormateurBadgeAcquisition);
  return {
    pixPlusDroitMaitreCertificationEligible,
    pixPlusDroitExpertCertificationEligible,
    pixPlusEduAutonomeCertificationEligible,
    pixPlusEduAvanceCertificationEligible,
    pixPlusEduExpertCertificationEligible,
    pixPlusEduFormateurCertificationEligible,
  };
}
