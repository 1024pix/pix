const some = require('lodash/some');
const { ForbiddenAccess } = require('../errors');

module.exports = async function dissociateUserFromSchoolingRegistrationData({
  schoolingRegistrationId,
  userId,
  membershipRepository,
  schoolingRegistrationRepository,
  userRepository,
}) {
  await _checkUserCanDissociateUserFromSchoolingRegistration({
    schoolingRegistrationId,
    userId,
    membershipRepository,
    schoolingRegistrationRepository,
    userRepository,
  });

  await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistrationId);
};

async function _checkUserCanDissociateUserFromSchoolingRegistration({
  schoolingRegistrationId,
  userId,
  membershipRepository,
  schoolingRegistrationRepository,
  userRepository,
}) {
  const userIsPixMaster = await userRepository.isPixMaster(userId);

  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId: schoolingRegistration.organizationId,
    includeOrganization: true,
  });

  if (!userIsPixMaster && !some(memberships, 'isAdmin')) {
    throw new ForbiddenAccess();
  }
}
