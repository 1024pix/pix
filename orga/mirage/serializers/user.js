import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(user) {
    return {
      'organizationAccesses': {
        related: `/users/${user.id}/organization-accesses`
      }
    }
  }
});
