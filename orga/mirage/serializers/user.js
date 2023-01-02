import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['userOrgaSettings'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude,
});
