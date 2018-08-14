import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(organization) {
    return {
      'campaigns': {
        related: `/organizations/${organization.id}/campaigns`
      }
    }
  }
});
