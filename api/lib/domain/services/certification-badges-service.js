const _ = require('lodash');
const bluebird = require('bluebird');
const certifiableBadgeAcquisitionRepository = require('../../infrastructure/repositories/certifiable-badge-acquisition-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const badgeForCalculationRepository = require('../../infrastructure/repositories/badge-for-calculation-repository');

module.exports = {
  async findStillValidBadgeAcquisitions({ userId, domainTransaction }) {
    const highestCertifiableBadgeAcquisitions = await certifiableBadgeAcquisitionRepository.findHighestCertifiable({
      userId,
      domainTransaction,
    });

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

    const badgeAcquisitions = await bluebird.mapSeries(
      highestCertifiableBadgeAcquisitions,
      async (certifiableBadgeAcquisition) => {
        const badgeForCalculation = await badgeForCalculationRepository.getByCertifiableBadgeAcquisition({
          certifiableBadgeAcquisition,
        });
        const isBadgeValid = badgeForCalculation.shouldBeObtained(knowledgeElements);
        return isBadgeValid ? certifiableBadgeAcquisition : null;
      }
    );

    return _.compact(badgeAcquisitions);
  },
};
