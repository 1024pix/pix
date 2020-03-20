const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');

const cleaBadgeCreationHandler = {
  handle: async function(event) {
    if (event.targetProfileId != null) {
      const badge = await badgeRepository.findOneByTargetProfileId(event.targetProfileId);
      if (badge != null) {
        await badgeAcquisitionRepository.create({ badgeId: badge.id, userId: event.userId });
      }
    }
  }
};

module.exports = {
  cleaBadgeCreationHandler,
};
