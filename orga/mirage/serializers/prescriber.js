import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['memberships', 'userOrgaSettings'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
