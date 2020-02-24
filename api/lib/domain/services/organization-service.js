const { uniqBy, concat, orderBy } = require('lodash');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');

function _extractProfilesSharedWithOrganization(organization) {
  const targetProfilesSharedNonOutdated = organization.targetProfileShares.filter((targetProfileShared) => {
    return !targetProfileShared.targetProfile.outdated;
  });

  return targetProfilesSharedNonOutdated.map((targetProfileSharedNonOutdated) => {
    return targetProfileSharedNonOutdated.targetProfile;
  });
}

module.exports = {

  async findAllTargetProfilesAvailableForOrganization(organizationId) {
    const organization = await organizationRepository.get(organizationId);
    const targetProfilesOrganizationCanUse = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(organizationId);
    const targetProfilesSharedWithOrganization = _extractProfilesSharedWithOrganization(organization);
    const allAvailableTargetProfiles = orderBy(concat(targetProfilesOrganizationCanUse, targetProfilesSharedWithOrganization), ['isPublic', 'name']);
    return uniqBy(allAvailableTargetProfiles, 'id');
  },

};
