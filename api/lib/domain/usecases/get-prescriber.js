const { UserNotMemberOfOrganizationError } = require('../errors');
const _ = require('lodash');

module.exports = async function getPrescriber({ userId, prescriberRepository, membershipRepository, userOrgaSettingsRepository }) {

  const memberships = await membershipRepository.findByUserId({ userId });
  if (_.isEmpty(memberships)) {
    throw new UserNotMemberOfOrganizationError(`L’utilisateur ${userId} n’est membre d’aucune organisation.`);
  }

  const userOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(userId);

  if (_.isEmpty(userOrgaSettings)) {
    const currentOrganization = memberships[0].organization;
    await userOrgaSettingsRepository.create(userId, currentOrganization.id);
  }

  return prescriberRepository.getPrescriber(userId);
};
