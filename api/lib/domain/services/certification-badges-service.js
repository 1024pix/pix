const _ = require('lodash');
const bluebird = require('bluebird');

const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const badgeCriteriaService = require('../../domain/services/badge-criteria-service');

const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } = require('../../domain/models/Badge').keys;

module.exports = {
  async findStillValidBadgeAcquisitions({ userId, domainTransaction }) {
    const certifiableBadgeAcquisitions = await badgeAcquisitionRepository.findCertifiable({ userId, domainTransaction });
    const highestCertifiableBadgeAcquisitions = this._keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

    const badgeAcquisitions = await bluebird.mapSeries(highestCertifiableBadgeAcquisitions, async (badgeAcquisition) => {
      const badge = badgeAcquisition.badge;
      const targetProfile = await targetProfileRepository.get(badge.targetProfileId);
      const isBadgeValid = badgeCriteriaService.areBadgeCriteriaFulfilled({
        knowledgeElements,
        targetProfile,
        badge,
      });
      return isBadgeValid ? badgeAcquisition : null;
    });

    return _.compact(badgeAcquisitions);
  },

  _keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions) {
    return this._keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions);
  },

  _keepHighestBadgeWithinDroitCertification(certifiableBadgeAcquisitions) {
    const [pixDroitBadgeAcquisitions, nonPixDroitBadgeAcquisitions] = _.partition(certifiableBadgeAcquisitions, this._isPixDroit);
    if (pixDroitBadgeAcquisitions.length === 0) return nonPixDroitBadgeAcquisitions;
    const expertBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: PIX_DROIT_EXPERT_CERTIF });
    const maitreBadgeAcquisition = _.find(certifiableBadgeAcquisitions, { badgeKey: PIX_DROIT_MAITRE_CERTIF });
    return [
      ...nonPixDroitBadgeAcquisitions,
      expertBadgeAcquisition || maitreBadgeAcquisition,
    ];
  },

  _isPixDroit(badgeAcquisition) {
    return [PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF].includes(badgeAcquisition.badgeKey);
  },
};

