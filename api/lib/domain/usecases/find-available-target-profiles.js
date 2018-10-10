const _ = require('lodash');

module.exports = function findAvailableTargetProfiles({ organizationId, targetProfileRepository, organizationRepository }) {

  return organizationRepository.get(organizationId)
    .then((organization) => {
      return Promise.all([
        targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId),
        _extractProfilesSharedWithOrganization(organization),
        targetProfileRepository.findPublicTargetProfiles(),
      ]);
    })
    .then(([targetProfilesOwnedByOrganization, targetProfileSharesWithOrganization, publicTargetProfiles]) => {
      const allAvailableTargetProfiles = _.concat(targetProfilesOwnedByOrganization, targetProfileSharesWithOrganization, publicTargetProfiles);
      return _.uniqBy(allAvailableTargetProfiles, 'id');
    });
};

function _extractProfilesSharedWithOrganization(organization) {
  return organization.targetProfileShares.map((targetProfileShare) => {
    return targetProfileShare.targetProfile;
  });
}
