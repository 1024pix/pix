const _ = require('lodash');
const bluebird = require('bluebird');
const certifiableBadgeAcquisitionRepository = require('../../infrastructure/repositories/certifiable-badge-acquisition-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const badgeCriteriaService = require('../../domain/services/badge-criteria-service');

module.exports = {
  async findStillValidBadgeAcquisitions({ userId, domainTransaction }) {
    const highestCertifiableBadgeAcquisitions = await certifiableBadgeAcquisitionRepository.findHighestCertifiable({
      userId,
      domainTransaction,
    });

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

    const badgeAcquisitions = await bluebird.mapSeries(
      highestCertifiableBadgeAcquisitions,
      async (badgeAcquisition) => {
        const badge = badgeAcquisition.badge;
        const skillIds = await campaignRepository.findSkillIds({
          campaignId: badgeAcquisition.campaignId,
          domainTransaction,
        });
        const isBadgeValid = badgeCriteriaService.areBadgeCriteriaFulfilled({
          knowledgeElements,
          skillIds,
          badge,
        });
        return isBadgeValid ? badgeAcquisition : null;
      }
    );

    return _.compact(badgeAcquisitions);
  },
};
