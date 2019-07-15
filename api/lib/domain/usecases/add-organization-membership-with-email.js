const { roles } = require('../models/Membership');
const { AlreadyExistingMembershipError } = require('../../domain/errors');

module.exports = async function addOrganizationMembershipWithEmail({ membershipRepository, userRepository, organizationId, email }) {

  const userForGivenEmail = await userRepository.findByEmail(email);
  const memberships = await membershipRepository.findByOrganizationId({ organizationId });

  const isAlreadyMember = memberships.find((membership) => membership.user.id === userForGivenEmail.id);
  if (isAlreadyMember) {
    throw new AlreadyExistingMembershipError(`User is already member of organisation ${organizationId}`);
  }

  const organizationRole =  memberships.length ? roles.MEMBER : roles.OWNER;

  return membershipRepository.create(userForGivenEmail.id, organizationId, organizationRole);
};
