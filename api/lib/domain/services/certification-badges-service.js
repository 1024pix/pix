const _ = require('lodash');
const bluebird = require('bluebird');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const badgeCriteriaService = require('../../domain/services/badge-criteria-service');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF, PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2 } =
  require('../../domain/models/Badge').keys;
const PixEdu2ndDegreBadgeAcquisitionOrderer = require('../models/PixEdu2ndDegreBadgeAcquisitionOrderer');
const PixEdu1erDegreBadgeAcquisitionOrderer = require('../models/PixEdu1erDegreBadgeAcquisitionOrderer');

module.exports = {
  async findStillValidBadgeAcquisitions({ userId, domainTransaction }) {
    const certifiableBadgeAcquisitions = await badgeAcquisitionRepository.findCertifiable({
      userId,
      domainTransaction,
    });
    const highestCertifiableBadgeAcquisitions = _keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

    const badgeAcquisitions = await bluebird.mapSeries(
      highestCertifiableBadgeAcquisitions,
      async (badgeAcquisition) => {
        const badge = badgeAcquisition.badge;
        const targetProfile = await targetProfileRepository.get(badge.targetProfileId, domainTransaction);
        const isBadgeValid = badgeCriteriaService.areBadgeCriteriaFulfilled({
          knowledgeElements,
          targetProfile,
          badge,
        });
        return isBadgeValid ? badgeAcquisition : null;
      }
    );

    return _.compact(badgeAcquisitions);
  },

  async hasStillValidCleaBadgeAcquisition({ userId }) {
    let cleaBadgeKey = PIX_EMPLOI_CLEA;
    const hasAcquiredCleaBadgeV1 = await badgeAcquisitionRepository.hasAcquiredBadge({
      badgeKey: PIX_EMPLOI_CLEA,
      userId,
    });
    if (!hasAcquiredCleaBadgeV1) {
      cleaBadgeKey = PIX_EMPLOI_CLEA_V2;
      const hasAcquiredCleaBadgeV2 = await badgeAcquisitionRepository.hasAcquiredBadge({
        badgeKey: PIX_EMPLOI_CLEA_V2,
        userId,
      });
      if (!hasAcquiredCleaBadgeV2) return false;
    }

    const badge = await badgeRepository.getByKey(cleaBadgeKey);
    const targetProfile = await targetProfileRepository.get(badge.targetProfileId);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

    return badgeCriteriaService.areBadgeCriteriaFulfilled({
      knowledgeElements,
      targetProfile,
      badge,
    });
  },
};

function _keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions) {
  let highestBadges = _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions);
  highestBadges = _keepHighestBadgeWithinEdu2ndDegreCertification(highestBadges);
  return _keepHighestBadgeWithinEdu1erDegreCertification(highestBadges);
}

function _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions) {
  const [pixDroitBadgeAcquisitions, nonPixDroitBadgeAcquisitions] = _.partition(
    certifiableBadgeAcquisitions,
    (badgeAcquisition) => badgeAcquisition.isPixDroit()
  );
  if (pixDroitBadgeAcquisitions.length === 0) return nonPixDroitBadgeAcquisitions;
  const expertBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: PIX_DROIT_EXPERT_CERTIF });
  const maitreBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: PIX_DROIT_MAITRE_CERTIF });
  return [...nonPixDroitBadgeAcquisitions, expertBadgeAcquisition || maitreBadgeAcquisition];
}

function _keepHighestBadgeWithinEdu2ndDegreCertification(certifiableBadgeAcquisitions) {
  const [pixEdu2ndDegreBadgeAcquisitions, nonPixEdu2ndDegreBadgeAcquisitions] = _.partition(
    certifiableBadgeAcquisitions,
    (badgeAcquisition) => badgeAcquisition.isPixEdu2ndDegre()
  );
  if (pixEdu2ndDegreBadgeAcquisitions.length === 0) return nonPixEdu2ndDegreBadgeAcquisitions;
  const pixEduBadgeAcquisitionOrderer = new PixEdu2ndDegreBadgeAcquisitionOrderer({
    badgesAcquisitions: pixEdu2ndDegreBadgeAcquisitions,
  });
  return [...nonPixEdu2ndDegreBadgeAcquisitions, pixEduBadgeAcquisitionOrderer.getHighestBadge()];
}

function _keepHighestBadgeWithinEdu1erDegreCertification(certifiableBadgeAcquisitions) {
  const [pixEdu1erDegreBadgeAcquisitions, nonPixEdu1erDegreBadgeAcquisitions] = _.partition(
    certifiableBadgeAcquisitions,
    (badgeAcquisition) => badgeAcquisition.isPixEdu1erDegre()
  );
  if (pixEdu1erDegreBadgeAcquisitions.length === 0) return nonPixEdu1erDegreBadgeAcquisitions;
  const pixEduBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({
    badgesAcquisitions: pixEdu1erDegreBadgeAcquisitions,
  });
  return [...nonPixEdu1erDegreBadgeAcquisitions, pixEduBadgeAcquisitionOrderer.getHighestBadge()];
}
