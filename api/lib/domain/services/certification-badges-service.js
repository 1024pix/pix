const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const _ = require('lodash');
const { PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } = require('../../domain/models/Badge').keys;

module.exports = {
  async findStillAcquiredBadgeAcquisitions({ userId, domainTransaction }) {
    const certifiableBadgeAcquisitions = await badgeAcquisitionRepository.findCertifiable({ userId, domainTransaction });
    const highestCertifiableBadgeAcquisitions = this._keepHighestBadgeWithinPlusCertifications(certifiableBadgeAcquisitions);
    return highestCertifiableBadgeAcquisitions;
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

