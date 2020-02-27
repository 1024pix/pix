import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['userOrgaSettings'];

export default JSONAPISerializer.extend({

  include: relationshipsToInclude,

  links(user) {
    return {
      'memberships': {
        related: `/api/users/${user.id}/memberships`
      }
    };
  }
});
