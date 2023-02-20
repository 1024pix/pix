import _ from 'lodash';
import bluebird from 'bluebird';
import certifiableBadgeAcquisitionRepository from '../../infrastructure/repositories/certifiable-badge-acquisition-repository';
import knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository';
import badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository';

export default {
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
