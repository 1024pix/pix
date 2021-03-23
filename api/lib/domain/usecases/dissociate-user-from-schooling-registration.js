const { ForbiddenAccess } = require('../errors');
const _ = require('lodash');

module.exports = async function dissociateUserFromSchoolingRegistrationData({
  schoolingRegistrationRepository,
  membershipRepository,
  userId,
  schoolingRegistrationId,
  userRepository,
}) {
  await _checkUserCanDissociateUserFromSchoolingRegistration(userId, schoolingRegistrationId, schoolingRegistrationRepository, membershipRepository, userRepository);

  await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistrationId);
};

async function _checkUserCanDissociateUserFromSchoolingRegistration(userId, schoolingRegistrationId, schoolingRegistrationRepository, membershipRepository, userRepository) {

  const userIsPixMaster = await userRepository.isPixMaster(userId);

  const schoolingRegistration = await schoolingRegistrationRepository.get(schoolingRegistrationId);
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId: schoolingRegistration.organizationId,
    includeOrganization: true,
  });

  if (!userIsPixMaster && !_.some(memberships, 'isAdmin')) {
    throw new ForbiddenAccess();
  }

}

