const _ = require('lodash');
const bluebird = require('bluebird');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const badgeCriteriaService = require('../../domain/services/badge-criteria-service');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF, PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2 } =
  require('../../domain/models/Badge').keys;
const PixEduBadgeAcquisitionOrderer = require('../../domain/models/PixEduBadgeAcquisitionOrderer');

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
  const highestBadgeWithinDroit = _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions);
  return _keepHighestBadgeWithinEduCertification(highestBadgeWithinDroit);
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

function _keepHighestBadgeWithinEduCertification(certifiableBadgeAcquisitions) {
  const [pixEduBadgeAcquisitions, nonPixEduBadgeAcquisitions] = _.partition(
    certifiableBadgeAcquisitions,
    (badgeAcquisition) => badgeAcquisition.isPixEdu()
  );
  if (pixEduBadgeAcquisitions.length === 0) return nonPixEduBadgeAcquisitions;
  const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({
    badgesAcquisitions: pixEduBadgeAcquisitions,
  });
  return [...nonPixEduBadgeAcquisitions, pixEduBadgeAcquisitionOrderer.getHighestBadge()];
}
