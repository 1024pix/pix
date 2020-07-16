const membershipRepository = require('../../infrastructure/repositories/membership-repository');
const Organisation = require('../../domain/models/Organization');

module.exports = {

  execute(userId, organizationId) {
    return membershipRepository.findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization: true })
      .then((memberships) => memberships.reduce((belongsToScoOrganization, membership) => {
        return belongsToScoOrganization || (membership.organization.isManagingStudents && Organisation.types.SCO === membership.organization.type);
      }, false));
  }
};
