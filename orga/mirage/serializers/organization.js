import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(organization) {
    return {
      'campaigns': {
        related: `/api/organizations/${organization.id}/campaigns`
      },
      'targetProfiles': {
        related: `/api/organizations/${organization.id}/target-profiles`
      },
      'memberships': {
        related: `/api/organizations/${organization.id}/memberships`
      },
      'students': {
        related: `/api/organizations/${organization.id}/students`
      }
    };
  }
});
