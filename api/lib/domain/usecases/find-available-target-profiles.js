const _ = require('lodash');

module.exports = function findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository }) {

  return organizationRepository.get(organizationId)
    .then((organization) => {
      return Promise.all([
        targetProfileRepository.findTargetProfilesByOrganizationId(organizationId),
        _extractProfileSharedWithTheOrganization(organization),
        targetProfileRepository.findPublicTargetProfiles(),
      ]);
    })
    .then(([targetProfilesLinkedToOrganization, targetProfileSharedWithOrganization, publicTargetProfiles]) => {
      const allAvailableTargetProfiles = _.concat(targetProfilesLinkedToOrganization, targetProfileSharedWithOrganization, publicTargetProfiles);
      return _.uniqBy(allAvailableTargetProfiles, 'id');
    });
};

function _extractProfileSharedWithTheOrganization(organization) {
  return organization.targetProfileShared.map((targetProfileShared) => {
    return targetProfileShared.targetProfile;
  });
}
