const { sampleSize, random, uniqBy, concat, orderBy } = require('lodash');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sampleSize(letters, count).join('');
}

function _extractProfilesSharedWithOrganization(organization) {
  const targetProfilesSharedNonOutdated = organization.targetProfileShares.filter((targetProfileShared) => {
    return !targetProfileShared.targetProfile.outdated;
  });

  return targetProfilesSharedNonOutdated.map((targetProfileSharedNonOutdated) => {
    return targetProfileSharedNonOutdated.targetProfile;
  });
}

function _generateOrganizationCode() {
  let code = _randomLetters(4);
  code += random(0, 9) + '' + random(0, 9);
  return code;
}

module.exports = {

  generateUniqueOrganizationCode({ organizationRepository }) {
    const code = _generateOrganizationCode();
    return organizationRepository.isCodeAvailable(code)
      .then(() => code)
      .catch(() => this.generateUniqueOrganizationCode({ organizationRepository }));
  },

  async findAllTargetProfilesAvailableForOrganization(organizationId) {
    const organization = await organizationRepository.get(organizationId);
    const targetProfilesOrganizationCanUse = await targetProfileRepository.findAllTargetProfilesOrganizationCanUse(organizationId);
    const targetProfilesSharedWithOrganization = _extractProfilesSharedWithOrganization(organization);
    const allAvailableTargetProfiles = orderBy(concat(targetProfilesOrganizationCanUse, targetProfilesSharedWithOrganization), ['isPublic', 'name']);
    return uniqBy(allAvailableTargetProfiles, 'id');
  },

};
