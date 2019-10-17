const { sampleSize, random, uniqBy, concat, orderBy } = require('lodash');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sampleSize(letters, count).join('');
}

function _extractProfilesSharedWithOrganization(organization) {
  return organization.targetProfileShares.map((targetProfileShare) => {
    return targetProfileShare.targetProfile;
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
    const targetProfilesOwnedByOrganization = await targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId);
    const targetProfileSharesWithOrganization = _extractProfilesSharedWithOrganization(organization);
    const publicTargetProfiles = await targetProfileRepository.findPublicTargetProfiles();
    const orderedPrivateProfile = orderBy(concat(targetProfilesOwnedByOrganization, targetProfileSharesWithOrganization), 'name');
    const orderedPublicProfile = orderBy(publicTargetProfiles, 'name');
    const allAvailableTargetProfiles = concat(orderedPrivateProfile, orderedPublicProfile);
    return uniqBy(allAvailableTargetProfiles, 'id');
  },

};
