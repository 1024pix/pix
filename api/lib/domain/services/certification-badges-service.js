const _ = require('lodash');
const bluebird = require('bluebird');
const certifiableBadgeAcquisitionRepository = require('../../infrastructure/repositories/certifiable-badge-acquisition-repository.js');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const badgeForCalculationRepository = require('../../infrastructure/repositories/badge-for-calculation-repository.js');

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
        if (!badgeForCalculation) return null;
        const isBadgeValid = badgeForCalculation.shouldBeObtained(knowledgeElements);
        return isBadgeValid ? certifiableBadgeAcquisition : null;
      }
    );

    return _.compact(badgeAcquisitions);
  },
};
