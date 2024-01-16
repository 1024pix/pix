import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(organization) {
    return {
      children: {
        related: `/api/admin/organizations/${organization.id}/children`,
      },
      organizationMemberships: {
        related: `/api/admin/organizations/${organization.id}/memberships`,
      },
      targetProfileSummaries: {
        related: `/api/admin/organizations/${organization.id}/target-profile-summaries`,
      },
    };
  },
});
