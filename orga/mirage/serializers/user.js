import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(user) {
    return {
      'memberships': {
        related: `/users/${user.id}/memberships`
      }
    };
  }
});
