import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['organization', 'user'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
