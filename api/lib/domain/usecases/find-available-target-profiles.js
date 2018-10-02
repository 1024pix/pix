const _ = require('lodash');

module.exports = function findAvailableTargetProfiles({ organizationId, targetProfileRepository }) {
  return Promise.all([
    targetProfileRepository.findTargetProfilesByOrganizationId(organizationId),
    targetProfileRepository.findTargetProfilesSharedWithOrganization(organizationId),
    targetProfileRepository.findPublicTargetProfiles(),
  ])
    .then(([targetProfilesLinkedToOrganization, targetProfileSharedWithOrganization, publicTargetProfiles]) => {
      const allAvailableTargetProfiles = _.concat(targetProfilesLinkedToOrganization,publicTargetProfiles,targetProfileSharedWithOrganization);
      return _.uniqBy(allAvailableTargetProfiles, 'id');
    });
};
