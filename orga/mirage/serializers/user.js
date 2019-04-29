import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(user) {
    return {
      'memberships': {
        related: `/api/users/${user.id}/memberships`
      }
    };
  }
});
