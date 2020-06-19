const { ForbiddenAccess } = require('../errors');
const _ = require('lodash');

module.exports = async function dissociateUserFromSchoolingRegistrationData({
  schoolingRegistrationRepository,
  membershipRepository,
  userId,
  schoolingRegistrationId
}) {
  await _checkUserCanDissociateUserFromSchoolingRegistration(userId, schoolingRegistrationId, schoolingRegistrationRepository, membershipRepository);

  await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistrationId);
};

async function _checkUserCanDissociateUserFromSchoolingRegistration(userId, schoolingRegistrationId, schoolingRegistrationRepository, membershipRepository) {
  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId: schoolingRegistration.organizationId, includeOrganization: true });

  if (!_.some(memberships, 'isAdmin')) {
    throw new ForbiddenAccess();
  }

}

