// const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
// const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const cleaBadgeCreationHandler = {
  handle: async function(/*event*/) {
    // const badge = await badgeRepository.findOneByTargetProfileId();
    // await badgeAcquisitionRepository.create({ badgeId: badge.id, userId: event.userId });
  }
};

module.exports = {
  cleaBadgeCreationHandler,
};
