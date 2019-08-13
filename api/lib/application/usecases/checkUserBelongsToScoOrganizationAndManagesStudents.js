const membershipRepository = require('../../infrastructure/repositories/membership-repository');

module.exports = {

  execute(userId, organizationId) {
    return membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true })
      .then((memberships) => memberships.reduce((belongsToScoOrganization, membership) => {
        return belongsToScoOrganization || (membership.organization.isManagingStudents && membership.organization.type === 'SCO');
      }, false));
  }
};
