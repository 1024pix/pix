import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(organization) {
    return {
      organizationMemberships: {
        related: `/api/admin/organizations/${organization.id}/memberships`,
      },
      targetProfileSummaries: {
        related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
      },
    };
  },
});
