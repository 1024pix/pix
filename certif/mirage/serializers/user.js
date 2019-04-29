import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(user) {
    return {
      'certificationCenterMemberships': {
        related: `/api/users/${user.id}/certification-center-memberships`
      }
    };
  }
});
