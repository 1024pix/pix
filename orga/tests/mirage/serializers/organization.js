import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(organization) {
    let divisionUrl = `/api/organizations/${organization.id}/divisions`;
    if (organization.type === 'SCO-1D') {
      divisionUrl = `/api/pix1d/schools/${organization.id}/divisions`;
    }

    return {
      combinedCourseBlueprints: {
        related: `/api/organizations/${organization.id}/combined-course-blueprints`,
      },
      memberships: {
        related: `/api/organizations/${organization.id}/memberships`,
      },
      organizationInvitations: {
        related: `/api/organizations/${organization.id}/invitations`,
      },
      groups: {
        related: `/api/organizations/${organization.id}/groups`,
      },
      divisions: {
        related: divisionUrl,
      },
      participationStatistics: {
        related: `/api/organizations/${organization.id}/participation-statistics`,
      },
    };
  },
});
